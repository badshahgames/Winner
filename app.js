import { 
    getAuth, 
    signOut,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import { 
    getFirestore,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

// Initialize
const auth = getAuth();
const db = getFirestore();
let userData = {};
let gameActive = false;

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
    if (!user) window.location.href = 'index.html';
    else await loadUserData(user.uid);
});

async function loadUserData(uid) {
    const userRef = doc(db, 'users', uid);
    
    // Real-time updates
    onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
            userData = doc.data();
            updateUI();
        }
    });
}

// Game Logic
document.querySelectorAll('.color-card').forEach(card => {
    card.addEventListener('click', async () => {
        if (gameActive) return;
        
        const betAmount = parseInt(document.getElementById('currentBet').textContent.replace('₹', ''));
        const multiplier = parseFloat(card.dataset.multiplier);
        
        if (betAmount > userData.balance) {
            showToast('Insufficient balance', 'error');
            return;
        }
        
        gameActive = true;
        const color = card.classList.contains('red') ? 'red' : 
                     card.classList.contains('green') ? 'green' : 'blue';
        
        try {
            // Deduct balance
            await updateDoc(userRef, {
                balance: userData.balance - betAmount,
                transactions: arrayUnion({
                    type: 'bet',
                    amount: -betAmount,
                    color: color,
                    timestamp: new Date()
                })
            });
            
            // Animate game
            startGameAnimation(color, betAmount, multiplier);
            
        } catch (error) {
            showToast('Transaction failed', 'error');
            gameActive = false;
        }
    });
});

function startGameAnimation(color, betAmount, multiplier) {
    // Show loading state
    document.getElementById('placeBetBtn').disabled = true;
    
    // Simulate game processing (3 sec)
    setTimeout(async () => {
        const winAmount = Math.floor(betAmount * multiplier);
        const won = Math.random() < 0.45; // 45% win chance (house edge)
        
        try {
            await updateDoc(userRef, {
                balance: userData.balance + (won ? winAmount : 0),
                transactions: arrayUnion({
                    type: won ? 'win' : 'loss',
                    amount: won ? winAmount : 0,
                    color: color,
                    timestamp: new Date()
                })
            });
            
            // Update history
            updateGameHistory(color, won, winAmount);
            
            // Show result
            showToast(won ? `You won ₹${winAmount}!` : 'Better luck next time', 
                    won ? 'success' : 'info');
                    
        } catch (error) {
            showToast('Result processing failed', 'error');
        } finally {
            gameActive = false;
            document.getElementById('placeBetBtn').disabled = false;
        }
    }, 3000);
}
