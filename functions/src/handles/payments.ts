// import { db, functions } from './config'
import { db, functions } from '../api/helpers/utils/config'
import { DBCollection } from '../types'

const collection = DBCollection.payments;

export const onPaymentCreated = functions.firestore.document(`/${collection}/{documentId}`)
    .onCreate((snap, context) => {
        const data = snap.data();
        const doc = db.collection(DBCollection.paymentNotifications).doc()
        doc.set({
            id: doc.id,
            paymentId: context.params.documentId,
            amount: data.amount,
            tripCode: data.tripCode,
            createdAt: new Date().toISOString(),
            paymentMethod: data.paymentMethod,
            seers: [] // [users] how have seen this PaymentNotification {Populated when a query is made by the user}
        })
    })