import { COLLECTION_PAYMENT_NOTIFICATIONS } from "./utils/CollectionTypes";
import { db, admin } from "./utils/config";


export function streamPayments(req:any, res:any) {
    // console.log({uid: req.user.id}) // when using Auth token
    const { uid, lastLoginDate } = req.params
    const date = new Date(lastLoginDate).toISOString()
    res.writeHead(200, {
        'Connection': "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
    });
    res.write('\n');
    db.collection(COLLECTION_PAYMENT_NOTIFICATIONS).where('createdAt', '>=', date)  //.where('seers', 'not-in', ['ZZ1XBw5nQKOTBTNA6oPCTonapvA3'])
        .onSnapshot(querySnapshot => {
            querySnapshot.docChanges().forEach(change => {

                if (change.type === 'added') {
                    let nots:any[] = [];
                    querySnapshot.docs.forEach(doc => {
                        nots.push(doc.data())
                    })
                    const newNots = nots.filter(not => !not.seers.includes(uid)); // user id
                    const payments = JSON.stringify(newNots)
                    res.write("event: NewPayment\n");
                    res.write('data: {"payments":' + `${payments}` + ',"total":' + `${newNots.length}` + ', "message":"Cool Again"}')
                    res.write("\n\n");
                } else {
                    console.log(`Data Modified`);
                    res.write('data: {"nodata": "empty", "state": "non"}')
                    res.write("\n\n");
                }
            })
        }, (err) => {
            console.log(`Encountered error: ${err}`);
            res.write('data: {"flight": "no", "state": "non"}')
            res.write("\n\n");
        });
}

export function paymentsNots(req:any, res:any) {
    // Remove all items in array where is [not-in] array
    db.collection(COLLECTION_PAYMENT_NOTIFICATIONS)
        // .where(`seers.uid`, 'array-contains', ['Kadir'])
        .get().then(data => {
            console.log({ data })
            let nots:any[] = [];
            data.docs.forEach(doc => {
                nots.push(doc.data())
            })
            const payment = nots.filter(not => !not.seers.includes('Kadir'));
            return res.json({ payment })
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ error: err })
        })
}

//
// when user opens the notification dialog, mark all current notifications as read
//
export function markCurrentUserPaymentNotificationsAsRead(req:any, res:any) {
    console.log({ Notifications: req.body })
    const batch = db.batch()
    req.body.forEach((notificationId: any) => {
        const notification = db.doc(`/${COLLECTION_PAYMENT_NOTIFICATIONS}/${notificationId}`)
        batch.update(notification, { seers: admin.firestore.FieldValue.arrayUnion(req.user.uid) })
    })
    batch.commit().then(() => {
        const message = 'Notifications Read';
        console.info({ message })
        return res.json({ message })
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ error: err })
    })
}