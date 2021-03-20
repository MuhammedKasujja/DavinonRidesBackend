import { COLLECTION_USERS } from './utils/CollectionTypes';
import { db, auth } from './utils/config';

export function createUser(req: any, res: any) {
    // console.error(req.body)
    let userId: any;
    let _token: any;
    const { email, password, username } = req.body
    auth.createUserWithEmailAndPassword(email, password).then(userDetails => {
        if (userDetails.user) {
            userId = userDetails.user.uid
            return userDetails.user.getIdToken().then(token => {
                _token = token;
                const doc = db.collection(COLLECTION_USERS).doc(userId)
                return doc.set({
                    email,
                    username,
                    role: 'member',
                    userId,
                    photoUrl: 'http://www.example.com/12345678/photo.png',
                    createdOn: new Date().toISOString(),
                    enabled: true
                }).then(() => {
                    return res.status(201).json({ token: _token })
                })
            })
        } else {
            return res.status(400).json({ error: 'Could not create user' })
        }
    }).catch(err => {
        console.error(err)
        if (err.code === 'auth/email-already-in-use') {
            return res.status(400).json({ error: 'Email is already in use' })
        }
        if (err.code === "auth/network-request-failed") {
            return res.status(400).json({ error: 'No network' })
        }
        return res.status(500).json({ error: err.code })
    });
}


export function login(req: any, res: any) {
    const { email, password } = req.body
    let uid: string, lastSignInTime: string | undefined;
    auth.signInWithEmailAndPassword(email, password).then(data => {
        if (data.user) {
            lastSignInTime = data.user.metadata.lastSignInTime
            uid = data.user.uid
            return data.user.getIdToken().then(token => {
                return res.status(201).json({ token, lastSignInTime, uid })
            });
        } else {
            return res.status(404).json({ message: 'User does not exists' })
        }
    }).catch(err => {
        console.error(err)
        if (err.code === 'auth/wrong-password') {
            return res.status(403).json({ message: 'Wrong credentials, please try again' })
        }
        else if (err.code === 'auth/network-request-failed') {
            return res.status(403).json({ message: 'No internet connection' })
        }
        else if (err.code === 'auth/user-not-found') {
            return res.status(404).json({ message: 'User does not exists' })
        } else
            return res.status(500).json({ error: err.code })
    });
}


export function fetchUsers(req: any, res: any) {
    db.collection(COLLECTION_USERS).get().then((data) => {
        let users: any[] = []
        if (data.docs.length > 0) {

            data.docs.forEach(doc => {
                // const data = doc.data()
                // console.info({ data })
                // admin.auth().getUser(data.userId).then((user) => {
                //     data.lastSignInTime = user.metadata.lastSignInTime
                //     users.push(data)
                //     console.info({ data })
                // });
            })
            /// how to push users in array before printing this
            console.log({ 'fetching data': 'I dont know' })
            return res.status(200).json({ users })
        }
        else
            return res.status(403).json({ message: 'No data found', users })
    })
}