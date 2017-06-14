/* Showing Mongoose's "Populated" Method (18.3.8)
 * INSTRUCTOR ONLY
 * =============================================== */

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Import routes and give the server access to them.
var routes = require("./controllers/app_controller.js");
app.use("/", routes);

// Heroku addon mLab MongoDB
var databaseUri = 'mongodb://localhost/scrapeTheNews';
//var MONGODB_URI = 'mongodb://heroku_qf292kjk:heroku_1f292kj@ds031531.mlab.com:31531/heroku_1f292kjk';
if (process.env.MONGODB_URI) {
  // this executes if being executed in Heroku App
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseUri);
}

// Database configuration with mongoose. when it runs a database is created
//mongoose.connect("mongodb://localhost/scrapeTheNews");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});




// Listen on port 3000
var port = process.env.PORT || 8080; // trying this for heroku
app.listen(port, function() {
  console.log("App running on port 8080!");
});
