import { db } from './utils/config'
import { COLLECTION_PAYMENTS } from './utils/CollectionTypes'

export const streamNewPayments = (res:any) => {
    res.writeHead(200, {
        'Connection': "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
    });
    res.write('\n');
    db.collection(COLLECTION_PAYMENTS)
        .onSnapshot(querySnapshot => {
            // var data = []
            // querySnapshot.docs.forEach(doc => {
            //     data.push(doc.data())
            // })
            // const drivers = JSON.stringify(data)
            // res.write("event: ActiveDrivers\n");
            // res.write('data: {"drivers":' + `${drivers}` + ', "message":"Cool Again"}')
            // res.write("\n\n");
            querySnapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const payments = JSON.stringify(querySnapshot.docs.entries())
                    // console.log( drivers)
                    res.write("event: NewPayment\n");
                    res.write('data: {"payments":' + `${payments}` + ', "message":"Cool Again"}')
                    res.write("\n\n");
                }
            })
            //console.log(querySnapshot.docs.entries())
            // querySnapshot.docChanges().forEach(change => {
            //     if (change.type === 'added') {
            //         const drivers = JSON.stringify(querySnapshot.docs.entries())
            //        // console.log( drivers)
            //         res.write("event: ActiveDrivers\n");
            //         res.write('data: {"drivers":'+`${drivers}`+', "message":"Cool Again"}')
            //         res.write("\n\n");
            //     }
            //     if (change.type === 'modified') {
            //         res.write("event: ModifiedDrivers\n");
            //         res.write('data: {"drivers": "Modified",  "message":"driver status changed"}')
            //         res.write("\n\n");
            //     }
            //     if (change.type === 'removed') {
            //         res.write("event: RemovedDrivers\n");
            //         res.write('data: {"drivers": "Removed", "message":"A driver has been removed"}')
            //         res.write("\n\n");
            //     }
            // });
        }, (err: any) => {
            console.log(`Encountered error: ${err}`);
            res.write('data: {"flight": "no", "state": "non"}')
            res.write("\n\n");
        });
}