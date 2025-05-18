import { auth, db, provider, signInWithPopup, doc, setDoc, getDoc } from "./firebase-config.js";

const googleLoginBtn = document.getElementById('googleLogin');

if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, "users", result.user.uid);
      
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          name: result.user.displayName,
          balance: 10,
          createdAt: new Date()
        });
      }
      window.location.href = 'game.html';
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  });
}
