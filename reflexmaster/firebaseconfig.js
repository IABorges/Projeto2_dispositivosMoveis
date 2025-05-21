// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBg5KhvEq_dlYdNs1cAwydc6AACuWn0h88",
  authDomain: "reflexmaster-cb94e.firebaseapp.com",
  projectId: "reflexmaster-cb94e",
  storageBucket: "reflexmaster-cb94e.firebasestorage.app",
  messagingSenderId: "330068710611",
  appId: "1:330068710611:web:181642378c92355bc37026",
  measurementId: "G-CBVD1E6YJS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);