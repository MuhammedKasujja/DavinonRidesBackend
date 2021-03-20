import admin from "firebase-admin";

const serviceAccount = require("../davinon-rides-firebase-adminsdk.json")

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore()

db.collection("Drivers").get().then(querySnapshots => {
    console.log('geting data')
    querySnapshots.forEach(doc => {
        console.log("Doc_ID: " + doc.id)
    });

}).catch(e => {
    console.log("Error getting data " + e)
})