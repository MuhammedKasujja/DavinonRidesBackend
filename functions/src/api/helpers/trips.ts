import { COLLECTION_TRIP_NOTIFICATIONS } from './utils/CollectionTypes';
import { db, admin } from '../helpers/utils/config';

export const streamTripNotifications = (req:any, res:any) => {
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
    db.collection(COLLECTION_TRIP_NOTIFICATIONS).where('createdAt', '>=', date)  //.where('seers', 'not-in', ['ZZ1XBw5nQKOTBTNA6oPCTonapvA3'])
        .onSnapshot(querySnapshot => {
            querySnapshot.docChanges().forEach(change => {

                if (change.type === 'added') {
                    let nots:any = [];
                    querySnapshot.docs.forEach(doc => {
                        nots.push(doc.data())
                    })
                    // get only notis where user is not included in the list of [seers]
                    const newNots = nots.filter((not: { seers: string | any[]; }) => !not.seers.includes(uid)); // user id
                    const notifications = JSON.stringify(newNots)
                    res.write("event: NewNotification\n");
                    res.write('data: {"notifications":' + `${notifications}` + ',"total":' + `${newNots.length}` + ', "message":"Cool Again"}')
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

export const markTripNotificationsAsRead = (req:any, res:any) => {
    // console.log({ Notifications: req.body })
    const batch = db.batch()
    // notificationId [List of notification Ids]
    req.body.forEach((notificationId: any) => {
        const notification = db.doc(`/${COLLECTION_TRIP_NOTIFICATIONS}/${notificationId}`)
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