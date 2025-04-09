// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyKtZT1rHQO7dxuxzh_pUxDuaB-qiKLbE",
  authDomain: "catch-up-slot.firebaseapp.com",
  projectId: "catch-up-slot",
  storageBucket: "catch-up-slot.firebasestorage.app",
  messagingSenderId: "219617964131",
  appId: "1:219617964131:web:5bf430c7fd7b81088d0856"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };