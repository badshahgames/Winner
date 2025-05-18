import { 
  auth, 
  db, 
  signOut,
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  onSnapshot,
  collection,
  addDoc
} from "./firebase-config.js";

// Game State
let userRef;
let gameActive = false;
let countdownInterval;

// Initialize
auth.onAuthStateChanged(user => {
  if (!user) window.location.href = '/';
  
  userRef = doc(db, "users", user.uid);
  
  // Real-time balance updates
  onSnapshot(userRef, (doc) => {
    document.getElementById('balance').textContent = doc.data().balance || 0;
  });

  // Setup event listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Color selection
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', function() {
      if (gameActive) return;
      document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Bet placement
  document.getElementById('placeBet').addEventListener('click', startGame);
  
  // Withdrawal
  document.getElementById('withdrawBtn').addEventListener('click', requestWithdrawal);
  
  // Logout
  document.getElementById('logout').addEventListener('click', () => signOut(auth));
}

async function startGame() {
  if (gameActive) return;
  
  const selectedColor = document.querySelector('.color-option.active');
  if (!selectedColor) return showMessage("Please select a color first", "error");
  
  const color = selectedColor.dataset.color;
  const userDoc = await getDoc(userRef);
  if (userDoc.data().balance < 7) return showMessage("Insufficient balance", "error");

  // Start game
  gameActive = true;
  document.getElementById('placeBet').disabled = true;
  
  // 10-second countdown
  let secondsLeft = 10;
  const countdownEl = document.getElementById('countdown');
  const resultEl = document.getElementById('result');
  
  countdownInterval = setInterval(() => {
    countdownEl.textContent = `Result in ${secondsLeft}s...`;
    secondsLeft--;
    
    if (secondsLeft < 0) {
      clearInterval(countdownInterval);
      finishGame(color, userDoc);
    }
  }, 1000);
}

async function finishGame(color, userDoc) {
  const resultEl = document.getElementById('result');
  const multipliers = { red: 2, green: 3, blue: 1.5 };
  
  // 30% chance to win (house keeps 70%)
  const isWin = Math.random() < 0.3;
  const winAmount = isWin ? Math.floor(7 * multipliers[color]) : 0;
  
  // Update balance
  await updateDoc(userRef, {
    balance: userDoc.data().balance - 7 + winAmount,
    transactions: arrayUnion({
      type: isWin ? 'win' : 'loss',
      amount: isWin ? winAmount : -7,
      color: color,
      timestamp: new Date()
    })
  });
  
  // Show result
  if (isWin) {
    resultEl.textContent = `You won ₹${winAmount}!`;
    resultEl.classList.add('win-animation');
  } else {
    resultEl.textContent = "Better luck next time!";
  }
  
  // Reset game
  setTimeout(() => {
    document.querySelector('.color-option.active')?.classList.remove('active');
    document.getElementById('countdown').textContent = '';
    document.getElementById('placeBet').disabled = false;
    gameActive = false;
    resultEl.classList.remove('win-animation');
  }, 3000);
}

async function requestWithdrawal() {
  const upiId = document.getElementById('upiId').value.trim();
  if (!upiId.includes('@')) return showMessage("Enter valid UPI ID", "error");
  
  const userDoc = await getDoc(userRef);
  if (userDoc.data().balance < 500) return showMessage("Minimum ₹500 required to withdraw", "error");

  try {
    await addDoc(collection(db, "withdrawals"), {
      userId: auth.currentUser.uid,
      amount: 500,
      upiId: upiId,
      status: 'pending',
      timestamp: new Date()
    });
    showMessage("Withdrawal request submitted!", "success");
    document.getElementById('upiId').value = '';
  } catch (error) {
    showMessage("Withdrawal failed. Try again.", "error");
  }
}

function showMessage(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}
