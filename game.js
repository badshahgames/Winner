import { auth, db, doc, getDoc, updateDoc, arrayUnion, onSnapshot, signOut } from "./firebase-config.js";

// Initialize
let userRef;
auth.onAuthStateChanged(user => {
    if (!user) window.location.href = 'index.html';
    userRef = doc(db, "users", user.uid);
    
    // Real-time balance updates
    onSnapshot(userRef, (doc) => {
        document.getElementById('balance').textContent = doc.data().balance;
    });
});

// Place ₹7 bet
document.getElementById('placeBet').addEventListener('click', async () => {
    const color = document.querySelector('.color-btn.active')?.dataset.color;
    if (!color) return alert("Select a color");
    
    const userDoc = await getDoc(userRef);
    if (userDoc.data().balance < 7) return alert("Insufficient balance");
    
    // 30% chance to win (admin keeps 70%)
    const isWin = Math.random() < 0.3;
    const multipliers = { red: 2, green: 3, blue: 1.5 };
    const winAmount = isWin ? Math.floor(7 * multipliers[color]) : 0;
    
    await updateDoc(userRef, {
        balance: userDoc.data().balance - 7 + winAmount,
        transactions: arrayUnion({
            type: isWin ? 'win' : 'loss',
            amount: isWin ? winAmount : -7,
            color: color,
            timestamp: new Date()
        })
    });
    
    document.getElementById('result').textContent = 
        isWin ? `You won ₹${winAmount}!` : "Try again!";
});

// Withdraw ₹500
document.getElementById('withdrawBtn').addEventListener('click', async () => {
    const upiId = document.getElementById('upiId').value;
    if (!upiId.includes('@')) return alert("Invalid UPI");
    
    const userDoc = await getDoc(userRef);
    if (userDoc.data().balance < 500) return alert("Minimum ₹500 required");
    
    await db.collection('withdrawals').add({
        userId: auth.currentUser.uid,
        amount: 500,
        upiId: upiId,
        status: 'pending',
        timestamp: new Date()
    });
    alert("Withdrawal requested!");
});

// Logout
document.getElementById('logout').addEventListener('click', () => signOut(auth));
