import { auth, db, provider, signInWithPopup, doc, setDoc, getDoc } from "./firebase-config.js";

document.getElementById('googleLogin').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const userRef = doc(db, "users", result.user.uid);
        
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
            await setDoc(userRef, {
                name: result.user.displayName,
                balance: 10, // ₹10 signup bonus
                createdAt: new Date()
            });
        }
        window.location.href = 'game.html';
    } catch (error) {
        alert("Login failed: " + error.message);
    }
});
