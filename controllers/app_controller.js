// Dependencies
var express = require("express");
var mongoose = require("mongoose"); // may not need
var app = express.Router();
// Requiring our Note and Article models aka tables
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise; // may not need

// Routes
// ======

// A GET request to scrape the echojs website. Saving web contents to an array scrapedArticles
app.get("/scrape", function(req, res) {

  var scrapedArticles = [];
  // First, we grab the body of the html with request
  request("http://www.echojs.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link). Saving scraped data to article table
      var entry = new Article(result);

      if (result.title && result.link){
        scrapedArticles.push(entry);
        // console.log(scrapedArticles);
      }

    });
    // console.log(scrapedArticles);
    res.json(scrapedArticles);
  });
  // Tell the browser that we finished scraping the text
  // res.send("Scrape Complete");
});

// when save button clicked 
app.post("/save", function(req, res) {
  var newArticleObject = {};
  newArticleObject.title = req.body.title;
  newArticleObject.link = req.body.link;

  // Using our Article model, create a new entry
  // This effectively passes the result object to the entry (and the title and link). Saving scraped data to article table
  var entry = new Article(newArticleObject);
  console.log("We can save the article: " + entry);

  // Save that entry to the db
  entry.save(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or log the doc
    else {
      console.log(doc);
    }
  });
});

app.get("/delete/:id", function(req, res) {
  console.log("ID is getting read for delete" + req.params.id);

  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log("Cant delete:" + err);
    } else {
      console.log("Can delete");
    }
  });

});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });

});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});

// Export routes for server.js to use.
module.exports = app;

