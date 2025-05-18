import { auth, db, doc, updateDoc, arrayUnion } from './firebase-config.js';

export class ColorTradoGame {
  static BASE_BET = 7;
  static MIN_WITHDRAWAL = 500;
  
  static async placeBet(userId, color) {
    const userRef = doc(db, "users", userId);
    
    // Game logic with 35% win probability
    const isWin = Math.random() < 0.35;
    const payout = isWin ? this.calculatePayout(color) : 0;
    
    await updateDoc(userRef, {
      balance: firebase.firestore.FieldValue.increment(-this.BASE_BET + payout),
      transactions: arrayUnion({
        type: isWin ? "win" : "loss",
        amount: isWin ? payout : -this.BASE_BET,
        color: color,
        timestamp: new Date()
      })
    });
    
    return { won: isWin, amount: payout };
  }

  static calculatePayout(color) {
    const multipliers = { red: 1.8, green: 2.7, blue: 1.3 }; // Adjusted for house edge
    return Math.floor(this.BASE_BET * multipliers[color]);
  }
}
