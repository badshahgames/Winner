import { 
  auth, 
  provider, 
  db, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  signInWithPopup 
} from "./firebase-config.js";

const googleLoginBtn = document.getElementById('googleLogin');

async function handleGoogleLogin() {
  try {
    // Show loading state
    googleLoginBtn.disabled = true;
    googleLoginBtn.innerHTML = `
      <div class="spinner"></div>
      <span>Signing in...</span>
    `;

    // Sign in with popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user with ₹10 bonus
      await setDoc(userRef, {
        name: user.displayName || `Player${Math.floor(1000 + Math.random() * 9000)}`,
        email: user.email,
        balance: 10,
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      // Update last login for existing user
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
    }
    
    // Redirect to game page
    window.location.href = 'game.html';
    
  } catch (error) {
    console.error("Login error:", error);
    
    // Show error message
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Login failed. Please try again.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    
    // Reset button
    googleLoginBtn.disabled = false;
    googleLoginBtn.innerHTML = `
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
      <span>Continue with Google</span>
    `;
  }
}

// Add click event listener
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', handleGoogleLogin);
}
