// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  getDocs,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAn_yGzHHjIjNUIIzQeI1zldMS3e1HNsf0",
  authDomain: "data-1e44e.firebaseapp.com",
  projectId: "data-1e44e",
  storageBucket: "data-1e44e.firebasestorage.app",
  messagingSenderId: "822204090936",
  appId: "1:822204090936:web:6636822c6c87578c9d34cd",
  measurementId: "G-SW3YDDLS45"
};

// 앱 초기화
const app = initializeApp(firebaseConfig);

// ? React Native용 Auth 초기화 (AsyncStorage persistence)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore
const db = getFirestore(app);

// ? 필요한 것들 전부 export
export {
  app,
  auth,
  db,
  // Firestore helpers
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  getDocs,
  // Auth helpers
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
};