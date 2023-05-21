// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
    GoogleAuthProvider,
    browserSessionPersistence,
    getAuth,
    setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUtc-QK6N5BM3ZWvgL5yMCe3EdU1YfLwM",
    authDomain: "personal-ai-fe3c0.firebaseapp.com",
    projectId: "personal-ai-fe3c0",
    storageBucket: "personal-ai-fe3c0.appspot.com",
    messagingSenderId: "494036650886",
    appId: "1:494036650886:web:8f06f0f8575c90ef8bfa07",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);

setPersistence(auth, browserSessionPersistence);
