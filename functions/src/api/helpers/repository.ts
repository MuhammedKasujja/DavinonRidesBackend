import { db, admin, firestore } from './utils/config'
import {
    COLLECTION_DRIVERS, COLLECTION_VEHICLES, COLLECTION_TRIPS,
    COLLECTION_USERS, COLLECTION_PAYMENTS, COLLECTION_VEHICLE_TYPES
} from "./utils/CollectionTypes"
import { TRIP_STATUS_OPEN } from "./utils/Constants"
import { GeoFirestore } from 'geofirestore'

const addTruck = function (req: any) {
    const geofirestore = new GeoFirestore(db)
    const geocollection = geofirestore.collection(COLLECTION_VEHICLES)
    geocollection.add({
        //id: ref.id,
        name: req.body.name,
        plate_number: req.body.plate_number,
        category: req.body.category,
        available: true,
        coordinates: new firestore.GeoPoint(parseFloat(req.body.lat), parseFloat(req.body.lng))
    }).then(doc => {
        console.log("Truck added:" + doc.id)
        const query = geocollection.near({ center: new firestore.GeoPoint(parseFloat(req.body.lat), parseFloat(req.body.lng)), radius: 100 })
        query.get().then((data) => {
            //console.log(data.docs)
            data.docs.forEach(element => {
                console.log(element.data())
            });
        })

    }).catch(e => {
        console.log("Error adding data: " + e)
    })
}

const addVehicleType = (data: any) => {
    console.log(data)
    //Getting the next document ID
    var ref = db.collection(COLLECTION_VEHICLE_TYPES).doc();
    data.id = ref.id;
    ref.set(data).then(() => {
        console.log("Vehicle added")
    }).catch(e => {
        console.log("Error adding data: " + e)
    })
}


export const getFirebaseData = function getFirebaseData() {
    return db.collection(COLLECTION_TRIPS).get().then((snapshot) => {
        snapshot.docs.forEach(() => {

        });
        return snapshot.docs;
    });
}

 const fetchData = (collection: string) => {
    return getData(collection);
}

function getData(collection: string) {
    return db.collection(collection).get().then((snapshot) => {
        var snaps: any = []
        snapshot.forEach(doc => {
            snaps.push(doc.data())
        });
        return snaps;
    });
}

const getGrandTotalPayments = async () => {
    const snapshot = await db.collection(COLLECTION_PAYMENTS).select('amount').get()
    var total = 0
    snapshot.forEach(doc => {
        total += doc.data()['amount']
        console.log({ 'Doc': doc.data(), 'Total': total })
    })
    return total
}

const attachVehicleToDriver = (data: any) => {
    const ref = db.collection(COLLECTION_VEHICLES).doc(data.truckId)
    return ref.set({ driverId: data.driverId }, { merge: true }).then(() => {
        console.log({ 'Updated': "Yes Yes Yes" })
    });
}

const postData = async (collection: string, data: any) => {
    console.log(data)
    var ref;
    if (data.id === null || data.id === undefined) {
        ref = db.collection(collection).doc();
        data.id = ref.id;
        data.createdOn = new Date().toISOString();
    } else {
        ref = db.collection(collection).doc(data.id);
    }
    data.updatedOn = new Date().toISOString();

    return ref.set(data).then(doc => {
        console.log({ "Data added": doc })
        return { message: "successfull" }
    }).catch(e => {
        return { error: `Could not save data ${e}` }
    })
}

const addBrandModel = async (data: any) => {
    //console.log(data)
    //Getting the next document ID
    console.log({ 'id': data['id'], 'model': data['models'][0] })
    var ref;
    // if (data['id'] === null || data['id'] === undefined) {
    //     ref = db.collection("Brands").doc();
    //     data['id'] = ref.id;
    // } else {
    ref = db.collection("Brands").doc(data['id']);
    // }
    data.createdOn = new Date().toISOString()
    try {
        const doc = await ref.set({ 'models': firestore.FieldValue.arrayUnion(data['models'][0]) }, { merge: true })
        console.log({ "Data added": doc })
        return { "message": "successfull" }
    } catch (e) {
        return { 'error': `Could not save data ${e}` }
    }

}

const streamTrips = (res: any, date: any) => {
    res.writeHead(200, {
        'Connection': "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
    });
    res.write('\n');
    db.collection(COLLECTION_TRIPS).where('createdOn', '>=', date)
        .onSnapshot(querySnapshot => {
            querySnapshot.docChanges().forEach(change => {
                // var total = querySnapshot.size.toString()
                if (change.type === 'added') {
                    //console.log('New Driver Add: ', change.doc.data().email);
                    var total = querySnapshot.docs.filter(function (doc) {
                        return doc.data().status === TRIP_STATUS_OPEN;
                    });
                    // console.log(`${JSON.stringify(change.doc.data())}`)
                    // type = "Driver Added"
                    const trip = JSON.stringify(change.doc.data())
                    res.write("event: tripStateAdded\n");
                    res.write('data: {"type": "Added", "trip":' + `${trip}` + ' , "total":' + `${total.length}` + ', "message":"A new trip order"}')
                    res.write("\n\n");
                    // return;
                }
                if (change.type === 'modified') {
                    //console.log('Modified Driver: ', change.doc.data().email);
                    const trip = JSON.stringify(change.doc.data())//change.doc.data().id
                    //type = "Driver Modified"
                    res.write("event: tripStateModified\n");
                    res.write('data: {"type": "Modified", "trip":' + `${trip}` + ', "message": "trip modified"}')
                    res.write("\n\n");
                    //  return; 
                }
                if (change.type === 'removed') {
                    //console.log('Removed Driver: ', change.doc.data().total);
                    //type = "Driver removed"
                    const trip = JSON.stringify(change.doc.data())
                    res.write("event: tripStateRemoved\n");
                    res.write('data: {"type": "Removed", "trip":' + `${trip}` + ', "message":"A trip has been removed"}')
                    res.write("\n\n");
                    //return;
                }
                //res.json(type)
            });
        }, err => {
            console.log(`Encountered error: ${err}`);
            res.write('data: {"flight": "no", "state": "non"}')
            res.write("\n\n");
        });

    // res.on('close', () => {
    //     if (!res.finished) {
    //         console.log("CLOSED");
    //         res.writeHead(404);
    //     }
    // });

}

const streamActiveDrivers = (res: any) => {
    res.writeHead(200, {
        'Connection': "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
    });
    res.write('\n');
    db.collection(COLLECTION_DRIVERS).where('status', ">", 0) //getting active drivers
        .onSnapshot(querySnapshot => {
            var data: any = []
            querySnapshot.docs.forEach(doc => {
                data.push(doc.data())
            })
            const drivers = JSON.stringify(data)
            res.write("event: ActiveDrivers\n");
            res.write('data: {"drivers":' + `${drivers}` + ', "message":"Cool Again"}')
            res.write("\n\n");
        }, err => {
            console.log(`Encountered error: ${err}`);
            res.write('data: {"flight": "no", "state": "non"}')
            res.write("\n\n");
        });
}

//// Firebase joining collections /////
const joinsCollectionsHandler = async () => {
    const binsRef = await db.collection(COLLECTION_DRIVERS).get();
    const binData = binsRef.docs.map(doc => doc.data());

    const binsInfoRef = await db.collection(COLLECTION_VEHICLES).get();
    const binInfoData = binsInfoRef.docs.map(doc => doc.data());

    const data = binData.map(bin => {
        const { id } = bin;
        const trucks = binInfoData.filter(
            doc => doc.driverId === id
        );
        return { ...bin, trucks };
    });
    return data;
    // res.json(data)
}
// Creates a client
export const uploadedFile = (bucketName: any, filename: any) => {
    const storage = admin.storage()
    async function uploadFile() {
        // Uploads a local file to the bucket
        await storage.bucket(bucketName).upload(filename, {
            // Support for HTTP requests made with `Accept-Encoding: gzip`
            gzip: true,
            // By setting the option `destination`, you can change the name of the
            // object you are uploading to a bucket.
            metadata: {
                // Enable long-lived HTTP caching headers
                // Use only if the contents of the file will never change
                // (If the contents will change, use cacheControl: 'no-cache')
                cacheControl: 'public, max-age=31536000',
            },
        }).then(uploadedFile => {
            console.log({ UploadedFilePath: `${uploadedFile[0].baseUrl}` });
        });

        console.log(`${filename} uploaded to ${bucketName}.`);
    }

    uploadFile().catch(console.error);
}

// export const fileUpload = (file) => {
//     auth.uploadFile(file)
// }

const login = async (email: any, password: any) => {
    const snapshot = await db.collection(COLLECTION_USERS)
        .where('email', '==', email)
        .where('password', '==', password)
        .limit(1)
        .get()
    // var snaps = []
    // snapshot.forEach(doc => {
    //     snaps.push(doc.data()) 
    // })
    // snapshot.docs[0]
    return !snapshot.empty ? snapshot.docs[0].data() : null

}

const streamNewPayments = (res: any, uid: any) => {
    res.writeHead(200, {
        'Connection': "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
    });
    res.write('\n');
    // db.collection(COLLECTION_PAYMENTS).where('createdOn', '>=', date)
    // db.collection('PaymentNotifications').where('seers', 'not-in', [uid])
    db.collection('PaymentNotifications')
        .onSnapshot(querySnapshot => {
            querySnapshot.docChanges().forEach(change => {
                var data = []
                querySnapshot.docs.forEach(doc => {
                    data.push(doc.data())
                })
                if (change.type === 'added') {
                    // const payments = JSON.stringify(querySnapshot.docs.entries())
                    // console.log( drivers)

                    const payments = JSON.stringify(change.doc.data())
                    res.write("event: NewPayment\n");
                    res.write('data: {"payments":' + `${payments}` + ', "message":"Cool Again"}')
                    res.write("\n\n");
                } else {
                    console.log(`Encountered error:`);
                    res.write('data: {"flight": "no", "state": "non"}')
                    res.write("\n\n");
                }
            })
        }, (err) => {
            console.log(`Encountered error: ${err}`);
            res.write('data: {"flight": "no", "state": "non"}')
            res.write("\n\n");
        });
}


const repo = {
    fetchData,
    joinsCollectionsHandler,
    postData,
    addBrandModel,
    addVehicleType,
    streamTrips,
    streamActiveDrivers,
    streamNewPayments,
    attachVehicleToDriver,
    login,
    getGrandTotalPayments,
    addTruck
    // fetchVehicleTypes
}

export default repo