import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink
} from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';

const auth = getAuth(initializeApp(firebaseConfig));

// Google Auth
document.getElementById('googleAuth').addEventListener('click', async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await handleNewUser(result.user);
        window.location.href = 'app.html';
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// Email Magic Link
document.getElementById('emailAuth').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    if (!validateEmail(email)) {
        showToast('Please enter a valid email', 'warning');
        return;
    }

    try {
        const actionCodeSettings = {
            url: window.location.href,
            handleCodeInApp: true
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        localStorage.setItem('emailForSignIn', email);
        showToast('Login link sent to your email!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// Handle email link authentication
if (isSignInWithEmailLink(auth, window.location.href)) {
    const email = localStorage.getItem('emailForSignIn');
    if (email) {
        try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            localStorage.removeItem('emailForSignIn');
            await handleNewUser(result.user);
            window.location.href = 'app.html';
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

async function handleNewUser(user) {
    const userRef = firebase.firestore().collection('users').doc(user.uid);
    const doc = await userRef.get();
    
    if (!doc.exists) {
        await userRef.set({
            name: user.displayName || `Player${Math.floor(1000 + Math.random() * 9000)}`,
            balance: 20,
            email: user.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('₹20 bonus credited!', 'success');
    } else {
        await userRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}
