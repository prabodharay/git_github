const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const round2 = (value) => Number(Number(value).toFixed(2));

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeSlabs = (rawSlabs = []) => {
  if (!Array.isArray(rawSlabs)) return [];

  return rawSlabs
    .map((slab) => ({
      upToKm: slab.upToKm === null || slab.upToKm === undefined ? null : toNumber(slab.upToKm),
      perKmRate: toNumber(slab.perKmRate)
    }))
    .filter((slab) => slab.perKmRate >= 0 && (slab.upToKm === null || slab.upToKm > 0))
    .sort((a, b) => {
      if (a.upToKm === null) return 1;
      if (b.upToKm === null) return -1;
      return a.upToKm - b.upToKm;
    });
};

const computeSlabDistanceFare = (distanceKm, slabs, defaultPerKmRate) => {
  const effectiveSlabs = slabs.length
    ? slabs
    : [{ upToKm: null, perKmRate: toNumber(defaultPerKmRate) }];

  let remaining = distanceKm;
  let previousCap = 0;
  let slabDistanceFare = 0;
  const slabBreakdown = [];

  for (const slab of effectiveSlabs) {
    if (remaining <= 0) break;

    const slabCap = slab.upToKm;
    const span = slabCap === null ? remaining : Math.max(slabCap - previousCap, 0);
    const kmInSlab = Math.min(remaining, span);

    if (kmInSlab <= 0) {
      previousCap = slabCap === null ? previousCap : slabCap;
      continue;
    }

    const slabFare = round2(kmInSlab * slab.perKmRate);
    slabDistanceFare += slabFare;

    slabBreakdown.push({
      fromKm: previousCap,
      toKm: slabCap,
      km: round2(kmInSlab),
      perKmRate: slab.perKmRate,
      fare: slabFare
    });

    remaining -= kmInSlab;
    if (slabCap !== null) previousCap = slabCap;
  }

  return {
    slabDistanceFare: round2(slabDistanceFare),
    slabBreakdown
  };
};

const calculateFare = ({ pricingRule, distanceKm, surgeMultiplier }) => {
  const baseFare = toNumber(pricingRule.baseFare);
  const platformFee = toNumber(pricingRule.platformFee);
  const defaultPerKmRate = toNumber(pricingRule.perKmRate);
  const ruleSurge = toNumber(pricingRule.surgeMultiplier, 1);

  const normalizedSlabs = normalizeSlabs(pricingRule.distanceSlabs);
  const { slabDistanceFare, slabBreakdown } = computeSlabDistanceFare(
    distanceKm,
    normalizedSlabs,
    defaultPerKmRate
  );

  const subTotalBeforeSurge = round2(baseFare + platformFee + slabDistanceFare);
  const appliedSurgeMultiplier = toNumber(surgeMultiplier, 0) > 0 ? toNumber(surgeMultiplier) : ruleSurge || 1;
  const surgeAmount = round2(subTotalBeforeSurge * (appliedSurgeMultiplier - 1));
  const totalFare = round2(subTotalBeforeSurge + surgeAmount);

  return {
    baseFare,
    platformFee,
    distanceKm,
    slabDistanceFare,
    slabBreakdown,
    subTotalBeforeSurge,
    appliedSurgeMultiplier,
    surgeAmount,
    totalFare
  };
};

exports.calculateFare = onRequest({ cors: true, region: 'asia-south1' }, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Use POST.'
      });
    }

    const { vehicleType, distanceKm, surgeMultiplier } = req.body || {};

    if (!vehicleType || !distanceKm) {
      return res.status(400).json({
        success: false,
        error: 'vehicleType and distanceKm are required'
      });
    }

    const parsedDistanceKm = toNumber(distanceKm);
    if (parsedDistanceKm <= 0) {
      return res.status(400).json({
        success: false,
        error: 'distanceKm must be greater than 0'
      });
    }

    const pricingDoc = await db.collection('pricing_rules').doc(String(vehicleType)).get();

    if (!pricingDoc.exists) {
      return res.status(404).json({
        success: false,
        error: `Pricing rule not found for vehicleType: ${vehicleType}`
      });
    }

    const pricingRule = pricingDoc.data();
    const fareBreakdown = calculateFare({
      pricingRule,
      distanceKm: parsedDistanceKm,
      surgeMultiplier
    });

    return res.status(200).json({
      success: true,
      data: {
        vehicleType,
        currency: pricingRule.currency || 'INR',
        pricingRuleRef: pricingDoc.id,
        ...fareBreakdown
      }
    });
  } catch (error) {
    logger.error('calculateFare failed', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});
