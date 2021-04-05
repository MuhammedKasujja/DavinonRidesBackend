import { admin, config } from './config';
import path from 'path';
import os from 'os';
import fs from 'fs';
import  uuid = require('uuid');

// Node.js doesn't have a built-in multipart/form-data parsing library.
// Instead, we can use the 'busboy' library from NPM to parse these requests.
import Busboy from 'busboy';

export const uploadFile = (req: any, res: any) => {
    if (req.method !== 'POST') {
        // Return a "method not allowed" error
        return res.status(405).end();
    }
    const busboy = new Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();

    // This object will accumulate all the fields, keyed by their name
    const fields: any = {};

    // This object will accumulate all the uploaded files, keyed by their name.
    const uploads: any = {};

    // This code will process each non-file field in the form.
    busboy.on('field', (fieldname, val) => {
        /**
         *  TODO(developer): Process submitted field values here
         */
        console.log(`Processed field ${fieldname}: ${val}.`);
        fields[fieldname] = val;
    });

    const fileWrites: any = [];

    // This code will process each file uploaded.
    busboy.on('file', (fieldname, file, filename) => {
        // Note: os.tmpdir() points to an in-memory file system on GCF
        // Thus, any files in it must fit in the instance's memory.
        console.log(`Processed file ${filename}`);
        const filepath = path.join(tmpdir, filename);
        uploads[fieldname] = filepath;

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);

        // File was processed by Busboy; wait for it to be written.
        // Note: GCF may not persist saved files across invocations.
        // Persistent files must be kept in other locations
        // (such as Cloud Storage buckets).
        const promise = new Promise((resolve, reject) => {
            file.on('end', () => {
                writeStream.end();
            });
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        fileWrites.push(promise);
    });

    // Triggered once all uploaded files are processed by Busboy.
    // We still need to wait for the disk writes (saves) to complete.
    busboy.on('finish', async () => {
        await Promise.all(fileWrites);

        /**
         * TODO(developer): Process saved files here
         */
        for (const file in uploads) {
            console.log({ file })
            fs.unlinkSync(uploads[file]);
        }
        res.json({ message: 'Files Uploaded' });
    });

    busboy.end(req.rawBody);
}


export const uploadImage = (req: any, res: any) => {
    if (req.method !== 'POST') {
        // Return a "method not allowed" error
        return res.status(405).end();
    }
    console.log('Upload starting.....')
    const busboy = new Busboy({ headers: req.headers });
    let imageFilename: string;
    let imageToBeUploaded: any = {}
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype != 'image/png' && mimetype != 'image/jpeg') {
            return res.status(400).json({ error: 'Wrong file type submitted' })
        }
        console.log({ fieldname, filename })
        const imageExtention = filename.split('.')[filename.split('.').length - 1];
        imageFilename = `${Math.round(Math.random() * 100000000000)}.${imageExtention}`;
        const filepath = path.join(os.tmpdir(), imageFilename);
        console.log({ filepath })
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath))
    })
    busboy.on('finish', () => {
        
        console.log({ UploadFilepath: imageToBeUploaded.filepath })
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
            destination: `users/${imageFilename}`,
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype,
                    firebaseStorageDownloadTokens: uuid.v4()
                }
            }
        }).then(() => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/users/${imageFilename}?alt=media`;
            // return db.doc('/users/kasujja').set({ imageUrl })
            return imageUrl;
        }).then(() => {
            return res.json({ message: 'Image uploaded successfully' });
        }).catch((err) => {
            console.log(err)
            return res.status(500).json({ error: err })
        })
    })
    busboy.end(req.rawBody)
}