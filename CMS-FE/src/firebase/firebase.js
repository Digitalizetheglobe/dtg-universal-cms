// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCx3dBe4G2I-A9zADmZMwW354dEfvO4nV8",
  authDomain: "cader-management-system.firebaseapp.com",
  projectId: "cader-management-system",
  storageBucket: "cader-management-system.firebasestorage.app",
  messagingSenderId: "814150813877",
  appId: "1:814150813877:web:92fa4e017439882274d6fc",
  measurementId: "G-GB9RMRCCBB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };