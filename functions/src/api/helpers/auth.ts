import { auth } from './utils/config';

exports.createUserWithEmailAndPassword = (email:any, password:any) => {
    auth
        .createUserWithEmailAndPassword(email, password)
        .catch((error:any) => {

        });
        
    // admin.auth().generateEmailVerificationLink('al.kasmud.2@gmail.com')
}
// Linking accounts

// exports.linkAccount = (user, email) => {
//     var provider = new auth.GoogleAuthProvider();
//     auth.createUserWithEmailAndPassword('kfjdf', 'jkghfgif').then((details)=>{
//         return details.user.getIdToken();
//     }).then((token)=>{

//     })
//     auth.signInWithEmailAndPassword(email, 'kasmud.2').then(data => {
//         data.user.linkWithRedirect(provider).then(() => {
//             auth.getRedirectResult().then(function (result) {
//                 if (result.credential) {
//                     // Accounts successfully linked.
//                     var credential = result.credential;
//                     var user = result.user;
//                     console.log({ "user": user.toJSON(), "Details": credential.toJSON() })
//                 }
//             }).catch(function (error) {
//                 // Handle Errors here.
//                 // ...
//             });

//         }).catch(error => {
//             console.log({ ErrorLinkingAccount: error })
//         });

//     });

//     exports.uploadFile = (file) => {
//         const storageRef = firebase.storage().ref()
//         const uploadTask = storageRef.child(`images/${file.name}`)
//             .put(file, { contentType: 'image/jpeg; charset=utf-8' })
//         uploadTask.on('state_changed', function (snapshot) {

//         }, function (error) {
//             console.error("Something nasty happened", error);
//         }, function () {
//             var downloadURL = uploadTask.snapshot.ref.getDownloadURL;
//             console.log("Done. Enjoy.", downloadURL);
//         });
//     }

    // var user = firebase.auth().currentUser;
    // user.linkWithPopup(provider).then(result => {
    //     console.log({ user: result.user })
    //   var data= await  firebase.auth().signInWithEmailAndPassword(email, 'kasmud.2');

    // }).catch(error => {
    //     console.log({ ErrorLinkingAccount: error })
    // });

// admin.auth().createUser({
//     email: 'al.kasmud.2@gmail.com',
//     emailVerified: false,
//     phoneNumber: '+256774262923',
//     password: 'kato123',
//     displayName: 'John Doe',
//     photoURL: 'http://www.example.com/12345678/photo.png',
//     disabled: false
// })