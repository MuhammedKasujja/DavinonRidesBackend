// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
// import * as geofirestore from 'geofirestore';
// import { Client } from 'africastalking-ts';
// const credentials = {
//     apiKey: '06926817c0e41f78d757f50d1a5b0525dafe5089829746c2c92e25c6ee08dcb8',  // use your sandbox app API key for development in the test environment
//     username: 'sandbox',      // use 'sandbox' for development in the test environment
// };
// const client = new Client(credentials);
// admin.initializeApp();
// const GeoFirestore = geofirestore.initializeApp(admin.firestore());
// const geocollection = GeoFirestore.collection('Stations');
// const maxRadius = 250;

// export const onScheduledTripCreate = functions.firestore.document('/Trips/{documentId}')
//     .onCreate((snap, context) => {
//         // Grab the current value of what was written to Cloud Firestore.
//         const data = snap.data();
//         const originLat = data.origin.lat as number;
//         const originLng = data.origin.lng as number;
//         const tripType = data.type as Number;
//         var _radius = 100 as number;
//         if (tripType == 2 || tripType == 3) {
//             // Access the parameter `{documentId}` with `context.params`
//             functions.logger.log('Adding Origins', context.params.documentId,);
//             return addingStationDrivers(originLat, originLng, _radius, data, snap);
//         } else {
//             return functions.logger.log('Trip recieved',)
//         }

//     });

// export const onScheduledTripDriverSubscribeUnSubscribe = functions.firestore.document('/Trips/{documentId}')
//     .onUpdate((snap, context) => {
//         // Grab the current value of what was written to Cloud Firestore.
//         // const oldData = snap.before.data();
//         const newData = snap.after.data();
//         const originLat = newData.origin.lat;
//         const originLng = newData.origin.lng;
//         const tripType = newData.type as Number;// This Trip type [0 => InstantPassenger, 1 => InstantCargo,2 => ScheduledPassenger,3 => ScheduledCargo,]
//         const newTripState = newData.status as Number;// current Trip state [0 => open, ]
//         var _radius = 100 as number;
//         if (tripType == 2 || tripType == 3) {
//             /////////////  Driver subscribing to trip /////////
//             // On DriverAccepted trip, set TripDrivers to empty such that no other drivers can subscribe to the same trip
//             if (newTripState == 1) {
//                 functions.logger.log('Driver Subscribed');

//                 return snap.after.ref.set({ 'TripDrivers': [] }, { merge: true })
//             }
//             // On Driver UnSubscribe to trip, set trip drivers to TripDrivers based on their Stations 
//             //&& newData.id == context.params.documentId
//             else if (newTripState == 0 && (newData.driver.id != null || newData.driver.id != '')) {
//                 functions.logger.log('Driver UnSubscribed');
//                 return addingStationDrivers(originLat, originLng, _radius, newData, snap.after);
//                 // Access the parameter `{documentId}` with `context.params`
//                 functions.logger.log('Adding Origins', context.params.documentId,);
//                 // Getting nearby stations based on trip origin
//                 const query = geocollection.near({ center: new admin.firestore.GeoPoint(originLat, originLng), radius: _radius });
//                 return query.onSnapshot(snapshots => {
//                     functions.logger.log('Stations Got', snapshots.docs);

//                     if (snapshots.docs === null || snapshots.docs.length === 0) {
//                         _radius = _radius + 10;
//                         return functions.logger.log('NewRadius', _radius);
//                     } else {
//                         let driverIds: string[] = [];
//                         snapshots.docs.forEach(doc => {
//                             functions.logger.log('StationData', doc.data());
//                             // doc.distance
//                             driverIds.push(doc.data().driverId)
//                         });
//                         //Storing DriverIDs to make sure drivers receive only the trips in thier stations
//                         return snap.after.ref.set({ 'TripDrivers': driverIds }, { merge: true })
//                     }
//                 })
//             } else {
//                 return functions.logger.log('Trip Already Changed',)
//             }
//         } else {
//             return functions.logger.log('Trip Changed',)
//         }

//     });

// export const onStationCreate = functions.firestore.document('/Stations/{documentId}')
//     .onCreate((snap, context) => {
//         // Grab the current value of what was written to Cloud Firestore.
//         // create a geopoint to be used when a scheduled trip is created to find nearby stations
//         const data = snap.data();
//         const originLat = data.latitude;
//         const originLng = data.longitude;
//         return geocollection.doc(`${context.params.documentId}`).set({
//             coordinates: new admin.firestore.GeoPoint(originLat, originLng)
//         }, { merge: true })

//     });
// // function _saveTripDrivers(lat:number, lng:number){

// // }


// // "predeploy": [
// //   "npm --prefix \"$RESOURCE_DIR\" run lint",
// //   "npm --prefix \"$RESOURCE_DIR\" run build"
// // ]
// interface StationDriver {
//     driverId: string;
//     stationId: number;
// }

// function addingStationDrivers(originLat: number, originLng: number, radius: number, trip: FirebaseFirestore.DocumentData,
//     snap: functions.firestore.QueryDocumentSnapshot) {

//     const query = geocollection.near({ center: new admin.firestore.GeoPoint(originLat, originLng), radius: radius });
//     return query.onSnapshot(snapshots => {
//         functions.logger.log('Stations Got', snapshots.docs);

//         if (snapshots.docs == null || snapshots.docs.length == 0) {
//             radius = radius + 10;
//             if (radius <= maxRadius) {
//                 functions.logger.log('NewRadius', radius);
//                 addingStationDrivers(originLat, originLng, radius, trip, snap);
//             } else {
//                 return functions.logger.log('No Trips Found', ' MaximumRadiusReached', radius);
//             }

//         } else {
//             functions.logger.log('StationFound', { 'Radius': radius });
//             let driverIds: string[] = [];
//             let stationDrivers: StationDriver[] = [];
//             snapshots.docs.forEach(doc => {
//                 functions.logger.log('StationData', doc.data());
//                 // doc.distance
//                 driverIds.push(doc.data().driverId)
//                 stationDrivers.push({ driverId: doc.data().driverId, stationId: doc.data().id });
//             });
//             //Storing DriverIDs to make sure drivers receive only the trips in thier stations
//             const options = {
//                 to: ['+256774262923', '+256755375682', '+256705613444'],
//                 message: `There is a new trip from ${trip.origin.name} to ${trip.destination.name} on ${trip.dates[0].startDate}`
//             }

//             // Send message and capture the response or error
//             client.sendSms(options)
//                 .then(response => {
//                     functions.logger.log('MessageSent', response);
//                 })
//                 .catch(error => {
//                     functions.logger.log('MessageError', error);
//                 });
//             return snap.ref.set({ 'TripDrivers': driverIds }, { merge: true })
//         }
//     })
// }