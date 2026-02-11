import { db } from '../config/firebase.js';
import { validateAndThrow } from '../helpers/firestore-schema.helpers.js';

const collection = db.collection('wallets');

export const WalletModel = {
  async credit(driverId, amount) {
    const reference = collection.doc(driverId);

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      const current = snapshot.exists
        ? snapshot.data()
        : { balance: 0, totalEarnings: 0, updatedAt: new Date().toISOString() };

      const updatedPayload = {
        balance: current.balance + amount,
        totalEarnings: current.totalEarnings + amount,
        updatedAt: new Date().toISOString()
      };

      validateAndThrow('wallets', updatedPayload);
      transaction.set(reference, updatedPayload, { merge: true });
    });

    return reference.get();
  }
};
