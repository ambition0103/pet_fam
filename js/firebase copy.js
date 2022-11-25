// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";

// 아래 데이터는 본인의 Firebase 프로젝트 설정에서 확인할 수 있습니다.

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASZjiEQQSZIniGUN0Ck-eOPyS88oLh1do",
  authDomain: "petfam-bb16d.firebaseapp.com",
  projectId: "petfam-bb16d",
  storageBucket: "petfam-bb16d.appspot.com",
  messagingSenderId: "1043207003251",
  appId: "1:1043207003251:web:12f97f32d0e6d1610fde06",
  measurementId: "G-HTWLWMMQCF",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const dbService = getFirestore(app);
export const authService = getAuth(app);
export const storageService = getStorage(app);
