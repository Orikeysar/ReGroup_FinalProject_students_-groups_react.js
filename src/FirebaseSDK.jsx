// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"
import firebase from "firebase/compat/app";
import "firebase/compat/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_u-ckmdMVbyVfWxSwQLQy7f8OVdSFFqQ",
  authDomain: "regroup-a4654.firebaseapp.com",
  databaseURL: "https://regroup-a4654-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "regroup-a4654",
  storageBucket: "regroup-a4654.appspot.com",
  messagingSenderId: "88302389135",
  appId: "1:88302389135:web:c6f541f2e7db86e2bcedfa",
  measurementId: "G-Z8J1Y1SEMN",
  facebookAppId: "1306808449930839",
  facebookAppSecret: "b36c888388e8752681aa4f629870c1cd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);
export const db = getFirestore(app);
// Get a reference to your Cloud Function
export const onButtonClick = firebase.functions().httpsCallable('onButtonClick');