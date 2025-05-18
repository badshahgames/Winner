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

// Utility function for showing toast messages
function showToast(message, isError = true) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function handleGoogleLogin() {
  if (!googleLoginBtn) {
    console.error("Login button not found!");
    return;
  }

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
        lastLogin: new Date(),
        photoURL: user.photoURL || null
      });
      showToast("Welcome! ₹10 bonus added to your account.", false);
    } else {
      // Update last login for existing user
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
    }
    
    // Redirect to game page after short delay
    setTimeout(() => {
      window.location.href = 'game.html';
    }, 1500);
    
  } catch (error) {
    console.error("Login error:", {
      code: error.code,
      message: error.message,
      fullError: error
    });

    // Show appropriate error messages
    let errorMessage = "Login failed. Please try again.";
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "Login popup was closed. Please try again.";
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = "Network error. Please check your connection.";
    }

    showToast(errorMessage);
    
    // Reset button
    googleLoginBtn.disabled = false;
    googleLoginBtn.innerHTML = `
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
      <span>Continue with Google</span>
    `;
  }
}

// Initialize login button
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', handleGoogleLogin);
} else {
  console.error("Google login button not found in the DOM");
}
