document.addEventListener('DOMContentLoaded', function() {
  const googleLoginBtn = document.getElementById('googleLogin');
  
  if (!googleLoginBtn) {
    console.error("Login button not found!");
    return;
  }

  googleLoginBtn.addEventListener('click', handleGoogleLogin);
});

async function handleGoogleLogin() {
  const googleLoginBtn = document.getElementById('googleLogin');
  
  try {
    // Show loading state
    googleLoginBtn.disabled = true;
    googleLoginBtn.innerHTML = `
      <div class="spinner"></div>
      <span>Signing in...</span>
    `;

    // Sign in with Google
    const result = await firebase.auth().signInWithPopup(googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userRef = db.collection('users').doc(user.uid);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      // Create new user document
      await userRef.set({
        name: user.displayName || `User${Math.floor(1000 + Math.random() * 9000)}`,
        email: user.email,
        balance: 10,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        photoURL: user.photoURL || null
      });
      showToast("Welcome! ₹10 bonus added to your account.", false);
    } else {
      // Update existing user
      await userRef.update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Redirect after successful login
    setTimeout(() => {
      window.location.href = 'game.html';
    }, 1500);
    
  } catch (error) {
    console.error("Login error:", error);
    
    let errorMessage = "Login failed. Please try again.";
    switch(error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = "Login popup was closed before completing.";
        break;
      case 'auth/network-request-failed':
        errorMessage = "Network error. Please check your internet connection.";
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = "Login process was cancelled.";
        break;
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

function showToast(message, isError = true) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}
