import { db } from '../config/firebase.js';

const collection = db.collection('wallets');

export const WalletModel = {
  async credit(driverId, amount) {
    const reference = collection.doc(driverId);

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      const current = snapshot.exists
        ? snapshot.data()
        : { balance: 0, totalEarnings: 0 };

      transaction.set(
        reference,
        {
          balance: current.balance + amount,
          totalEarnings: current.totalEarnings + amount,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    });

    return reference.get();
  }
};
