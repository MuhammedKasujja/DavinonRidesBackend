import createError from 'http-errors';
import express from 'express'
// import path from 'path'
import cookieParser from 'cookie-parser';
import logger from 'morgan'
import cors  from 'cors'
import routes from './routes/index';

var app = express()

app.use(cors())
app.use(logger('dev'))
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
// Define the static file path
app.use(express.static(__dirname+'/Uploads'));
app.use('/api', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
// app.use(function (err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};

//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });

// Serve static assets if in production
// if (process.env.NODE_ENV === 'production') {
//     // Set static folder
//     app.use(express.static('client/build'));
  
//     app.get('*', (req, res) => {
//       res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//     });
//   }

  export default app