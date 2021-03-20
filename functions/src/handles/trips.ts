import { db, functions } from '../api/helpers/utils/config'
import { DBCollection, TripStatus } from '../types'

// On user requests trip, send notification to dashboard
export const onTripRequested =
    ((snap: functions.firestore.QueryDocumentSnapshot) => {
        const trip = snap.data()
        const doc = db.collection(DBCollection.tripNotifications).doc()

        return doc.set({
            id: doc.id,
            type: TripStatus.Open,
            amount: trip.estimatedCost,
            tripCode: trip.code,
            createdAt: new Date().toISOString(),
            paymentMethod: trip.paymentMethod,
            originAddress: trip.originAddress,
            destinationAddress: trip.destinationAddress,
            seers: [] // [users] how have seen this PaymentNotification {Populated when a query is made by the user}
        })
    })


export const onTripStatusChanged =
    ((newSnap: functions.firestore.QueryDocumentSnapshot, oldSnap: functions.firestore.QueryDocumentSnapshot) => {
        const oldTripData = oldSnap.data()
        const newTripData = newSnap.data()
        const doc = db.collection(DBCollection.tripNotifications).doc()
        const newTripStatus: number = newTripData.status;
        const oldTripStatus: number = oldTripData.status;

        let notification = {}

        if (oldTripStatus === TripStatus.Open && newTripStatus === TripStatus.AwaitingDriver) {
            notification = {
                message: 'User Waiting for Driver',
                tripCode: newTripData.code,
                createdAt: new Date().toISOString(),
                seers: [],
                type: newTripStatus
            }
        }
        else if (oldTripStatus === TripStatus.AwaitingDriver && newTripStatus === TripStatus.DriverAccepted) {
            notification = {
                message: 'Driver Accepted Trip',
                tripCode: newTripData.code,
                createdAt: new Date().toISOString(),
                driverId: newTripData.driver.id,
                passengerId: newTripData.passenger.id,
                seers: [],
                type: newTripStatus
            }
            // if (trip.type === TripType.scheduledCargo || trip.type === TripType.scheduledPassenger) {
            //     sendOneSignalNotification({ message: '', user_ids: [trip.passenger.oneSignalPlayerID] })
            // }
        }
        else if (oldTripStatus === TripStatus.DriverAccepted && newTripStatus === TripStatus.DriverPath) {
            notification = {
                message: 'Driver going to meet client',
                tripCode: newTripData.code,
                createdAt: new Date().toISOString(),
                driverId: newTripData.driver.id,
                passengerId: newTripData.passenger.id,
                seers: [],
                type: newTripStatus
            }
        }
        else if (oldTripStatus === TripStatus.DriverPath && newTripStatus === TripStatus.Started) {
            notification = {
                message: 'Driver Started Trip',
                tripCode: newTripData.code,
                createdAt: new Date().toISOString(),
                driverId: newTripData.driver.id,
                passengerId: newTripData.passenger.id,
                seers: [],
                type: newTripStatus
            }
        }
        else if (oldTripStatus === TripStatus.Started && newTripStatus === TripStatus.Finished) {
            notification = {
                message: 'Trip finished Successfully',
                tripCode: newTripData.code,
                createdAt: new Date().toISOString(),
                driverId: newTripData.driver.id,
                passengerId: newTripData.passenger.id,
                seers: [],
                type: newTripStatus
            }
        }
        else if (oldTripStatus === TripStatus.Open && newTripStatus === TripStatus.Canceled) {
            notification = {
                message: 'Client canceled Trip',
                tripCode: newTripData.code,
                createdAt: new Date().toISOString(),
                passengerId: newTripData.passenger.id,
                seers: [],
                type: newTripStatus
            }
        }
        else if (oldTripStatus === TripStatus.AwaitingDriver && newTripStatus === TripStatus.DriverCanceled) {
            notification = {
                message: 'Driver cancelled Trip',
                tripCode: newTripData.code,
                createdAt: new Date().toISOString(),
                driverId: newTripData.driver.id,
                passengerId: newTripData.passenger.id,
                seers: [],
                type: newTripStatus
            }
        }
        else {
            notification = {}
        }

        return doc.set(notification)
    })

export interface NotificationForUserProps {
    trip: FirebaseFirestore.DocumentData,
    userid: string,
    title: string,
    message: string
}
export const saveNotificationInDb =
    (({ trip, userid, title, message }: NotificationForUserProps) => {
        const doc = db.collection(DBCollection.notifications).doc()
        return doc.set({
            id: doc.id,
            tripCode: trip.code,
            title: title,
            message: message,
            userid: userid,
            createdOn: new Date().toISOString(),
            read: false
        })
    })