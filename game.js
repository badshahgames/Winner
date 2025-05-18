import { auth, db, doc, getDoc, updateDoc, arrayUnion, onSnapshot, signOut } from "./firebase-config.js";

// Game state
let gameActive = false;
let countdownInterval;
let userRef;

// Initialize
auth.onAuthStateChanged(user => {
  if (!user) window.location.href = 'index.html';
  
  userRef = doc(db, "users", user.uid);
  
  // Real-time balance
  onSnapshot(userRef, (doc) => {
    document.getElementById('balance').textContent = doc.data().balance || 0;
  });

  // Color selection
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (gameActive) return;
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Bet placement
  document.getElementById('placeBet').addEventListener('click', startGame);
  
  // Withdrawal
  document.getElementById('withdrawBtn').addEventListener('click', requestWithdrawal);
  
  // Logout
  document.getElementById('logout').addEventListener('click', () => signOut(auth));
});

async function startGame() {
  if (gameActive) return;
  
  const colorBtn = document.querySelector('.color-btn.active');
  if (!colorBtn) return alert("Please select a color");
  
  const color = colorBtn.dataset.color;
  const userDoc = await getDoc(userRef);
  if (userDoc.data().balance < 7) return alert("Insufficient balance");

  // Start countdown
  gameActive = true;
  let countdown = 10;
  const resultDisplay = document.getElementById('result');
  
  countdownInterval = setInterval(() => {
    resultDisplay.textContent = `Result in ${countdown}s...`;
    countdown--;
    
    if (countdown < 0) {
      clearInterval(countdownInterval);
      declareResult(color, userDoc);
      gameActive = false;
    }
  }, 1000);
}

async function declareResult(color, userDoc) {
  const resultDisplay = document.getElementById('result');
  const multipliers = { red: 2, green: 3, blue: 1.5 };
  
  // 30% chance to win (house edge)
  const isWin = Math.random() < 0.3;
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
  
  if (isWin) {
    resultDisplay.textContent = `You won ₹${winAmount}!`;
    resultDisplay.classList.add('win-animation');
    setTimeout(() => resultDisplay.classList.remove('win-animation'), 2000);
  } else {
    resultDisplay.textContent = "Better luck next time!";
  }
}

async function requestWithdrawal() {
  const upiId = document.getElementById('upiId').value.trim();
  if (!upiId.includes('@')) return alert("Enter valid UPI ID");
  
  const userDoc = await getDoc(userRef);
  if (userDoc.data().balance < 500) return alert("Minimum ₹500 required");
  
  await db.collection('withdrawals').add({
    userId: auth.currentUser.uid,
    amount: 500,
    upiId: upiId,
    status: 'pending',
    timestamp: new Date()
  });
  
  alert("Withdrawal request submitted!");
}
