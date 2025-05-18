// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBci1YLe6TGuv9NHFRf1ljBnLH-ULj8jWs",
  authDomain: "color-trado.firebaseapp.com",
  projectId: "color-trado",
  storageBucket: "color-trado.appspot.com",
  messagingSenderId: "960118997572",
  appId: "1:960118997572:web:4d533860f2daa609b3b211",
  measurementId: "G-F3QLVXY0NW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Configure Google provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

// Set auth persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Export what we need
export { auth, provider, db, signInWithPopup };
