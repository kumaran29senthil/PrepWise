// Import the functions you need from the SDKs you need
import { initializeApp , getApp , getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZaU7wj4Ri9jQEY7KxH-mKE0HmHXVaq18",
  authDomain: "prepwise-11b68.firebaseapp.com",
  projectId: "prepwise-11b68",
  storageBucket: "prepwise-11b68.firebasestorage.app",
  messagingSenderId: "324153935693",
  appId: "1:324153935693:web:730ba94edf843711bcd904",
  measurementId: "G-74CKEPCFKL"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
