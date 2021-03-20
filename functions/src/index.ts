import * as geofirestore from 'geofirestore';
// import { Client } from 'africastalking-ts';
import { sendOneSignalNotification } from './sendNotification';
import { TripType, TripStatus, DBCollection } from './types';
import { onPaymentCreated } from './handles/payments'
import { onTripRequested, onTripStatusChanged, saveNotificationInDb } from './handles/trips'
// import { admin, functions, db } from './handles/config'
import { admin, functions, db } from './api/helpers/utils/config'
import app from './api/app'

// const smsCredentials = {
//     apiKey: '06926817c0e41f78d757f50d1a5b0525dafe5089829746c2c92e25c6ee08dcb8',  // use your sandbox app API key for development in the test environment
//     username: 'sandbox',      // use 'sandbox' for development in the test environment
// };
// const client = new Client(smsCredentials);
const GeoFirestore = geofirestore.initializeApp(db);
const geocollection = GeoFirestore.collection(DBCollection.stations);
const maxRadius = 250;

// functions..

export const onPaymentMade = onPaymentCreated

export const onScheduledTripCreate = functions.firestore.document('/Trips/{documentId}')
    .onCreate((snap, context) => {
        // Grab the current value of what was written to Cloud Firestore.
        const data = snap.data();
        const originLat = data.origin.lat as number;
        const originLng = data.origin.lng as number;
        const tripType = data.type as Number;
        var _radius = 100 as number;
        onTripRequested(snap)
        if (tripType === TripType.scheduledCargo || tripType === TripType.scheduledPassenger) {
            // Access the parameter `{documentId}` with `context.params`
            functions.logger.log('Adding Origins', context.params.documentId,);
            return addingStationDrivers(originLat, originLng, _radius, data, snap);
        } else {
            return functions.logger.log('Trip recieved',)
        }

    });

export const onScheduledTripDriverSubscribeUnSubscribe = functions.firestore.document('/Trips/{documentId}')
    .onUpdate((snap, _context) => {
        /// Send notification to dashboard on trip Changes
        onTripStatusChanged(snap.after, snap.before)

        // Grab the current value of what was written to Cloud Firestore.
        // const oldData = snap.before.data();
        const tripOldData = snap.before.data();
        const tripNewData = snap.after.data();
        const originLat = tripNewData.origin.lat;
        const originLng = tripNewData.origin.lng;
        const tripType = tripNewData.type as Number;// This Trip type [0 => InstantPassenger, 1 => InstantCargo,2 => ScheduledPassenger,3 => ScheduledCargo,]
        const newTripState = tripNewData.status as Number;// current Trip state [0 => open, ]
        var _radius: number = 100;
        if (tripType === TripType.scheduledCargo || tripType === TripType.scheduledPassenger) {
            /////////////  Driver subscribing to trip /////////
            // On DriverAccepted trip, set TripDrivers to empty such that no other drivers can subscribe to the same trip
            if (newTripState === TripStatus.DriverAccepted) {
                functions.logger.log('Driver Subscribed');
                sendOneSignalNotification({ message: 'Driver found for your trip', user_ids: [tripNewData.passenger.oneSignalPlayerID] })
                saveNotificationInDb({
                    trip: tripNewData, userid: tripNewData.passenger.id,
                    title: 'Trip Accepted', message: `${tripNewData.origin.name} to ${tripNewData.destination.name},  on ${tripNewData.dates[0].startDate} `
                })
                saveNotificationInDb({
                    trip: tripNewData, userid: tripNewData.driver.id,
                    title: 'Subscribe to trip', message: `${tripNewData.origin.name} to ${tripNewData.destination.name},  on ${tripNewData.dates[0].startDate}`
                })
                // TripDrivers {List for Drivers with grabled Stations} this is for sending notifications to Drivers
                return snap.after.ref.set({ 'TripDrivers': [] }, { merge: true })
            }
            else if (newTripState === TripStatus.DriverPath) {
                // Driver triggered Scheduled trip to go to pickup point
                sendOneSignalNotification({
                    message: `Driver is coming for trip from ${tripNewData.origin.name} to ${tripNewData.destination.name}`,
                    user_ids: [tripNewData.passenger.oneSignalPlayerID]
                })
                saveNotificationInDb({
                    trip: tripNewData, userid: tripNewData.passenger.id,
                    title: 'Driver is coming', message: 'Driver is coming to the pickup point'
                })
            }
            // On Driver UnSubscribe to trip, set trip drivers to TripDrivers based on their Stations 
            //&& tripData.id == context.params.documentId
            else if (tripOldData.status === TripStatus.DriverPath && newTripState === TripStatus.Open
                && (tripNewData.driver.id !== null || tripNewData.driver.id !== '')) {
                functions.logger.log('Driver UnSubscribed');
                saveNotificationInDb({
                    trip: tripNewData, userid: tripNewData.driver.id,
                    title: 'UnSubscribed from trip', message: `from ${tripNewData.origin.name} to ${tripNewData.destination.name}, on ${tripNewData.dates[0].startDate}`
                })
                return addingStationDrivers(originLat, originLng, _radius, tripNewData, snap.after);
                // Access the parameter `{documentId}` with `context.params`
            } else {
                return functions.logger.log('Trip Already Changed',)
            }
        } else {
            return functions.logger.log('Trip Changed',)
        }

    });

export const onStationCreate = functions.firestore.document('/Stations/{documentId}')
    .onCreate((snap, context) => {
        // Grab the current value of what was written to Cloud Firestore.
        // create a geopoint to be used when a scheduled trip is created to find nearby Drivers' stations
        const data = snap.data();
        const originLat = data.latitude;
        const originLng = data.longitude;
        return geocollection.doc(`${context.params.documentId}`).set({
            coordinates: new admin.firestore.GeoPoint(originLat, originLng)
        }, { merge: true })

    });

// "predeploy": [
//   "npm --prefix \"$RESOURCE_DIR\" run lint",
//   "npm --prefix \"$RESOURCE_DIR\" run build"
// ]
interface StationDriver {
    driverId: string;
    stationId: number;
}

async function addingStationDrivers(originLat: number, originLng: number, radius: number, trip: FirebaseFirestore.DocumentData,
    snap: functions.firestore.QueryDocumentSnapshot) {

    // await sendOneSignalNotification({ message: 'I love this trush', user_ids: ['d4177c41-b46a-4783-b55a-f0089ab63043'] })
    const query = geocollection.near({ center: new admin.firestore.GeoPoint(originLat, originLng), radius: radius });
    return query.onSnapshot(snapshots => {
        functions.logger.log('Stations Got', snapshots.docs);

        if (snapshots.docs === null || snapshots.docs.length === 0) {
            radius = radius + 10;
            if (radius <= maxRadius) {
                functions.logger.log('NewRadius', radius);
                addingStationDrivers(originLat, originLng, radius, trip, snap);
            } else {
                sendOneSignalNotification({
                    message: 'Sorry, We cannot find Driver for your trip, we will get back to you soon',
                    user_ids: [trip.passenger.oneSignalPlayerID]
                })
                return functions.logger.log('No Trips Found', ' MaximumRadius Reached', radius);
            }

        } else {
            functions.logger.log('StationFound', { 'Radius': radius });
            let driverIds: string[] = [];
            let stationDriversContactList: string[] = [];
            let stationDrivers: StationDriver[] = [];
            var listDriversOnesignalIDs: string[] = []
            snapshots.docs.forEach(doc => {
                const station = doc.data();
                functions.logger.log('StationData', station);
                // doc.distance
                driverIds.push(station.driverId)
                stationDriversContactList.push(station.telephone)
                stationDrivers.push({ driverId: station.driverId, stationId: station.id });
                listDriversOnesignalIDs.push(station.oneSignalPlayerID)
                // store notification for 
                saveNotificationInDb({
                    trip: trip, userid: station.driverId,
                    title: `New Trip Found`,
                    message: `${trip.origin.name} to ${trip.destination.name}, at at ${station.name}, on ${trip.dates[0].startDate}`
                })
            });
            //Storing DriverIDs to make sure drivers receive only the trips in thier stations
            // Make sure numbers include country codes
            // to: ['+256774262923', '+256755375682', '+256705613444'],
            // const options = {
            //     to: stationDriversContactList,
            //     message: `There is a new trip from ${trip.origin.name} to ${trip.destination.name}, on ${trip.dates[0].startDate}`
            // }

            sendOneSignalNotification({
                message: `There is a new trip from ${trip.origin.name} to ${trip.destination.name}, on ${trip.dates[0].startDate}`,
                user_ids: listDriversOnesignalIDs
            })

            // Send message and capture the response or error [+256774262923]

            // client.sendSms(options)
            //     .then(response => {
            //         functions.logger.log('MessageSent', response);
            //     })
            //     .catch(error => {
            //         functions.logger.log('MessageError', error);
            //     });

            return snap.ref.set({ 'TripDrivers': driverIds }, { merge: true })
        }
    })
}

// Expose Express API as a single Cloud Function:
export const api = functions.https.onRequest(app)