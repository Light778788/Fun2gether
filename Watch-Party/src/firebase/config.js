import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBtb-BsUZx7NagpJID63q4KppR10happLM",
    authDomain: "watchparty-49284.firebaseapp.com",
    projectId: "watchparty-49284",
    storageBucket: "watchparty-49284.firebasestorage.app",
    messagingSenderId: "686390906479",
    appId: "1:686390906479:web:71d018c9be150e0645479a"
  };


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);