// import { db } from './database';
// import { COLLECTION_PAYMENTS } from './utils/CollectionTypes';

export const streamNewPayments = (res:any) => {
    res.writeHead(200, {
        'Connection': "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
    });
    res.write('\n');
    // db.collection(COLLECTION_PAYMENTS)
    //     .onSnapshot(querySnapshot => {
    //         querySnapshot.docChanges().forEach(change => {
    //             if (change.type === 'added') {
    //                 const payments = JSON.stringify(querySnapshot.docs.entries())
    //                 // console.log( drivers)
    //                 res.write("event: NewPayment\n");
    //                 res.write('data: {"payments":' + `${payments}` + ', "message":"Cool Again"}')
    //                 res.write("\n\n");
    //             }
    //         })
    //     }, (err) => {
    //         console.log(`Encountered error: ${err}`);
    //         res.write('data: {"flight": "no", "state": "non"}')
    //         res.write("\n\n");
    //     });
}