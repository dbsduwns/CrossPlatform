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
  apiKey: "AIzaSyBgvvCRzYtkZSaEZ5wJQqtV86If2G37Wnk",
  authDomain: "todo-a46f0.firebaseapp.com",
  projectId: "todo-a46f0",
  storageBucket: "todo-a46f0.firebasestorage.app",
  messagingSenderId: "456488177620",
  appId: "1:456488177620:web:afb16007832b2d08ec9041",
  measurementId: "G-GF8ZJ4QMJ0"
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