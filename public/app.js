// Whenever someone clicks a scrape button
$(document).on("click", "#scrapeBtn", function() {
  $("#articles").html("");
  $("#notes").html("");

  $.get('scrape', {}, function (result) {
      console.log("Scraping Results");
      console.log(result);
      alert("Scraping completed.  Found " + result.length  + " new article(s)." );

      result.forEach(function(element) {
          var $a = $('<a/>', {
              "target" : "_blank",
              "href" : element.link,
              "text" : element.title
          });
          var $button = $('<button/>', {
                  text: 'SAVE',
                  class: 'btn'
              });
           $("#articles").prepend("<div>" + $button.get(0).outerHTML + "&nbsp&nbsp&nbsp" + $a.get(0).outerHTML + "</div>");
      }, this);
    })
  
});

// save button. Save an individual article based on html tag attributes from scrapeBtn action
$(document).on("click", "#articles .btn", function() {
  $.ajax({
    method: "POST",
    url: "/save",
    data: {
      // Value taken from title input
      title: $(this).next("a").text(),
      // Value taken from note textarea
      link: $(this).next("a").attr("href")
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      //$("#notes").empty();
    });
    $(this).parent().remove();
});

// Grab the articles as a json when click saved articles button
$(document).on("click", "#savedArticlesBtn", function() {
  console.log("savedArticlesBtn");
  $("#articles").html("");

  $.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) { // For each one
      // Display the apropos information on the page
      $("#articles").append("<div> <button class='deleteBtn' data-id='"+ data[i]._id + "'>Delete</button>" + "<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p> </div>");
    }
  });

});

// delete button. Delete an individual article base on html tag attributes
$(document).on("click", "#articles .deleteBtn", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "GET",
    url: "/delete/" + thisId
  })
    // With that done
    .done(function(data) {
      console.log(data);
    });
    $(this).parent().remove();
});


// Whenever someone clicks a p tag user can create note
$(document).on("click", "#articles p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// savenote button. The button is created everytime a P tag is clicked
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Runs a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
