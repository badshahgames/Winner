import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBci1YLe6TGuv9NHFRf1ljBnLH-ULj8jWs",
  authDomain: "color-trado.firebaseapp.com",
  projectId: "color-trado",
  storageBucket: "color-trado.firebasestorage.app",
  messagingSenderId: "960118997572",
  appId: "1:960118997572:web:4d533860f2daa609b3b211"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
