// firebaseconfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBg5KhvEq_dlYdNs1cAwydc6AACuWn0h88",
  authDomain: "reflexmaster-cb94e.firebaseapp.com",
  databaseURL: "https://reflexmaster-cb94e-default-rtdb.firebaseio.com", 
  projectId: "reflexmaster-cb94e",
  storageBucket: "reflexmaster-cb94e.appspot.com", 
  messagingSenderId: "330068710611",
  appId: "1:330068710611:web:181642378c92355bc37026",
  measurementId: "G-CBVD1E6YJS"
};

// Inicializa o app
const app = initializeApp(firebaseConfig);

//Inicializa e exporta o banco de dados
const database = getDatabase(app);

export { database };
