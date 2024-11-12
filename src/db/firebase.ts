// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWzerE_VYm1zEmlrCe_5Wk2BrCJHncAW8",
  authDomain: "construbank-control.firebaseapp.com",
  projectId: "construbank-control",
  storageBucket: "construbank-control.firebasestorage.app",
  messagingSenderId: "685523289429",
  appId: "1:685523289429:web:27ba702c212b303e761bdc",
  measurementId: "G-4YW8RG9JYJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };