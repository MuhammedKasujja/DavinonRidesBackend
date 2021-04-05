import admin from "firebase-admin";
import * as functions from 'firebase-functions';
import firebase from "firebase/app";
require("firebase/auth");

// const serviceAccount = require("../../davinon-rides-firebase-adminsdk.json")

// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
admin.initializeApp()

const config = {
    apiKey: "AIzaSyB9ovqOW4giP8fdohQzBc9A225OYBh-Snw",
    authDomain: "davinonrides.firebaseapp.com",
    databaseURL: "https://davinonrides-default-rtdb.firebaseio.com",
    projectId: "davinonrides",
    storageBucket: "davinonrides.appspot.com",
    messagingSenderId: "796907075869",
    appId: "1:796907075869:web:1c5e22b2fad92f245f89f4",
    measurementId: "G-E2QX4PM2ZX"
}

firebase.initializeApp(config);

const auth = firebase.auth()
const db = admin.firestore()
const firestore = admin.firestore;

export  {
    db, admin, auth, firestore, functions, config
}