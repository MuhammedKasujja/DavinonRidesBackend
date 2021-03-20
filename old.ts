// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
// import * as geofirestore from 'geofirestore';
// import * as twilio from "twilio";
// admin.initializeApp();
// const accountSid = functions.config().twilio.sid;
// const authToken = functions.config().twilio.token;
// const client = twilio(accountSid, authToken);
// const twilioNumber = '+17205945962'; // live Account
// // const twilioNumber ='+15005550006';
// const GeoFirestore = geofirestore.initializeApp(admin.firestore());

// // export const onTripOrderCreate = functions.firestore.document('/Trips/{documentId}')
// //     .onCreate((snap, context) => {
// //         // Grab the current value of what was written to Cloud Firestore.
// //         const original = snap.data();

// //         // Access the parameter `{documentId}` with `context.params`
// //         functions.logger.log('Uppercasing', context.params.documentId, original);

// //         const uppercase = original.toUpperCase();

// //         // You must return a Promise when performing asynchronous tasks inside a Functions such as
// //         // writing to Cloud Firestore.
// //         // Setting an 'uppercase' field in Cloud Firestore document returns a Promise.
// //         return snap.ref.set({ uppercase }, { merge: true });
// //     });
// export const onScheduledTripCreate = functions.firestore.document('/Trips/{documentId}')
//     .onCreate((snap, context) => {
//         // Grab the current value of what was written to Cloud Firestore.
//         const data = snap.data();
//         const originLat = data.origin.lat;
//         const originLng = data.origin.lng;
//         // Access the parameter `{documentId}` with `context.params`
//         const geocollection = GeoFirestore.collection('Origins');

//         functions.logger.log('Adding Origins', context.params.documentId, data);
//         // geocollection.doc().set({},);
//         // Add a GeoDocument to a GeoCollection
//         return geocollection.add({
//             name: data.origin.name,
//             score: 100,
//             // The coordinates field must be a GeoPoint!
//             coordinates: new admin.firestore.GeoPoint(originLat, originLng)
//         }).then((origin) => {
//             const phoneNumber = '+256774262923';
//             const textMsg = {
//                 body: `Hello, Trip details have been recieved, from ${data.origin.name} to ${data.destination.name}`,
//                 to: phoneNumber,
//                 from: twilioNumber
//             }
//             return client.messages.create(textMsg).then((msg) => {
//                 functions.logger.log('MessageSent', msg);
//             }).catch((err) => {
//                 functions.logger.log('MessageError', err);
//             })

//         });
//     });

// export const onStationCreate = functions.firestore.document('/Stations/{documentId}')
//     .onCreate((snap, context) => {
//         // Grab the current value of what was written to Cloud Firestore.
//         const data = snap.data();
//         const originLat = data.latitude;
//         const originLng = data.longitude;
//         const geocollection = GeoFirestore.collection('Stations');
//        return geocollection.doc(`${context.params.documentId}`).set({
//             coordinates: new admin.firestore.GeoPoint(originLat, originLng)
//         }, { merge: true })
        
//     });
// // export const makeUppercase = functions.firestore.document('/messages/{documentId}')
// //     .onCreate((snap, context) => {
// //       // Grab the current value of what was written to Cloud Firestore.
// //       const original = snap.data().original;

// //       // Access the parameter `{documentId}` with `context.params`
// //       functions.logger.log('Uppercasing', context.params.documentId, original);

// //       const uppercase = original.toUpperCase();

// //       // You must return a Promise when performing asynchronous tasks inside a Functions such as
// //       // writing to Cloud Firestore.
// //       // Setting an 'uppercase' field in Cloud Firestore document returns a Promise.
// //       return snap.ref.set({uppercase}, {merge: true});
// //     });

//  // "predeploy": [
//     //   "npm --prefix \"$RESOURCE_DIR\" run lint",
//     //   "npm --prefix \"$RESOURCE_DIR\" run build"
//     // ]