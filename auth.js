import { auth, db, provider, signInWithPopup, doc, setDoc, getDoc } from "./firebase-config.js";

const googleLoginBtn = document.getElementById('googleLogin');

async function handleLogin() {
  try {
    googleLoginBtn.disabled = true;
    googleLoginBtn.innerHTML = '<div class="spinner"></div> Signing in...';
    
    const result = await signInWithPopup(auth, provider);
    const userRef = doc(db, "users", result.user.uid);
    
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        name: result.user.displayName || `Player${Math.floor(1000 + Math.random() * 9000)}`,
        balance: 10, // ₹10 signup bonus
        email: result.user.email,
        createdAt: new Date(),
        lastLogin: new Date()
      });
    }
    window.location.href = 'game.html';
  } catch (error) {
    console.error("Login error:", error);
    showToast("Login failed. Please try again.", "error");
    googleLoginBtn.disabled = false;
    googleLoginBtn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"> Continue with Google';
  }
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', handleLogin);
}

function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}
