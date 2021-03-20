import mult, { diskStorage } from "multer";

var storage = diskStorage({
    destination: function (req, file, cb) {
        /* { uploads } folder where store files on the server */ 
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
export const upload = mult({ storage: storage }).single('file');
export const multer = mult
