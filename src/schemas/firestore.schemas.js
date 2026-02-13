export const firestoreSchemas = {
  users: {
    collection: 'users',
    required: ['uid', 'phone', 'role', 'status', 'createdAt', 'updatedAt'],
    properties: {
      uid: { type: 'string', minLength: 1 },
      phone: { type: 'string', pattern: '^\\+[1-9]\\d{7,14}$' },
      role: { type: 'string', enum: ['customer', 'driver', 'admin'] },
      status: { type: 'string', enum: ['active', 'suspended', 'blocked'] },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
      lastLoginAt: { type: 'string', optional: true }
    }
  },
  drivers: {
    collection: 'drivers',
    required: [
      'name',
      'phone',
      'vehicleType',
      'status',
      'availability',
      'location',
      'createdAt',
      'updatedAt'
    ],
    properties: {
      name: { type: 'string', minLength: 2 },
      phone: { type: 'string', pattern: '^\\+[1-9]\\d{7,14}$' },
      vehicleType: { type: 'string', enum: ['mini_truck', 'pickup', 'tempo', 'truck'] },
      status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'suspended'] },
      availability: { type: 'string', enum: ['available', 'busy', 'offline'] },
      location: {
        type: 'object',
        required: ['lat', 'lng'],
        properties: {
          lat: { type: 'number', min: -90, max: 90 },
          lng: { type: 'number', min: -180, max: 180 }
        }
      },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' }
    }
  },
  bookings: {
    collection: 'bookings',
    required: [
      'customerId',
      'pickupLocation',
      'dropLocation',
      'distanceKm',
      'vehicleType',
      'fare',
      'status',
      'createdAt',
      'updatedAt'
    ],
    properties: {
      customerId: { type: 'string', minLength: 1 },
      driverId: { type: 'string', optional: true },
      pickupLocation: {
        type: 'object',
        required: ['lat', 'lng'],
        properties: {
          lat: { type: 'number', min: -90, max: 90 },
          lng: { type: 'number', min: -180, max: 180 },
          address: { type: 'string', optional: true }
        }
      },
      dropLocation: {
        type: 'object',
        required: ['lat', 'lng'],
        properties: {
          lat: { type: 'number', min: -90, max: 90 },
          lng: { type: 'number', min: -180, max: 180 },
          address: { type: 'string', optional: true }
        }
      },
      distanceKm: { type: 'number', min: 0.1 },
      vehicleType: { type: 'string', enum: ['mini_truck', 'pickup', 'tempo', 'truck'] },
      fare: { type: 'number', min: 0 },
      status: {
        type: 'string',
        enum: ['pending', 'accepted', 'arrived', 'started', 'completed', 'cancelled']
      },
      loadDescription: { type: 'string', optional: true },
      loadPhotos: { type: 'array', optional: true, items: { type: 'string' } },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' }
    }
  },
  pricing_rules: {
    collection: 'pricing_rules',
    required: ['baseFare', 'perKmRate', 'surgeMultiplier', 'updatedAt'],
    properties: {
      baseFare: { type: 'number', min: 0 },
      perKmRate: { type: 'number', min: 0 },
      surgeMultiplier: { type: 'number', min: 1 },
      updatedAt: { type: 'string' },
      updatedBy: { type: 'string', optional: true }
    }
  },
  wallets: {
    collection: 'wallets',
    required: ['balance', 'totalEarnings', 'updatedAt'],
    properties: {
      balance: { type: 'number' },
      totalEarnings: { type: 'number', min: 0 },
      updatedAt: { type: 'string' }
    }
  },
  transactions: {
    collection: 'transactions',
    required: ['driverId', 'bookingId', 'amount', 'type', 'createdAt'],
    properties: {
      driverId: { type: 'string', minLength: 1 },
      bookingId: { type: 'string', minLength: 1 },
      amount: { type: 'number', min: 0 },
      type: { type: 'string', enum: ['credit', 'debit'] },
      note: { type: 'string', optional: true },
      createdAt: { type: 'string' }
    }
  }
};

export const firestoreSampleDocs = {
  users: {
    uid: 'user_001',
    phone: '+919876543210',
    role: 'customer',
    status: 'active',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z'
  },
  drivers: {
    name: 'Ravi Kumar',
    phone: '+919811111111',
    vehicleType: 'mini_truck',
    status: 'approved',
    availability: 'available',
    location: { lat: 19.076, lng: 72.8777 },
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z'
  },
  bookings: {
    customerId: 'user_001',
    driverId: 'driver_004',
    pickupLocation: { lat: 19.1, lng: 72.9, address: 'Andheri East, Mumbai' },
    dropLocation: { lat: 19.2, lng: 73.0, address: 'Thane West, Thane' },
    distanceKm: 14.2,
    vehicleType: 'mini_truck',
    fare: 534,
    status: 'accepted',
    loadDescription: 'Furniture boxes',
    loadPhotos: ['https://storage.googleapis.com/load-photo-1.jpg'],
    createdAt: '2026-01-10T10:05:00.000Z',
    updatedAt: '2026-01-10T10:06:00.000Z'
  },
  pricing_rules: {
    baseFare: 200,
    perKmRate: 18,
    surgeMultiplier: 1.2,
    updatedAt: '2026-01-10T09:00:00.000Z',
    updatedBy: 'admin_01'
  },
  wallets: {
    balance: 1200,
    totalEarnings: 5400,
    updatedAt: '2026-01-10T11:00:00.000Z'
  },
  transactions: {
    driverId: 'driver_004',
    bookingId: 'booking_101',
    amount: 450,
    type: 'credit',
    note: 'Trip earnings credited',
    createdAt: '2026-01-10T11:01:00.000Z'
  }
};
