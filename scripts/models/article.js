define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
], 

function($, _, Backbone, Parse){
    
    var Article = Backbone.Model.extend({
        headline: '',
        story: '',
        tags: '',
        image: '',
        lineChart:[],
        table: [[]],
        date: null,
        parseId: null,
        
        initialize: function(headline, story, tags, image, lineChart, table, date, imageUrl, parseId) {
          this.headline = headline;
          this.story = story;
          this.tags = tags;
          this.image = image;
          this.table = table;
          this.lineChart = lineChart;
          this.table = table;
          this.date = date;
          this.imageUrl = imageUrl;
          this.parseId = parseId;
        },
        
        // upload to parse 
        uploadToParse: function(callbacks) {
          var Story = Parse.Object.extend("Story");
          var story = new Story();

          story.set("headline", this.headline);
          story.set("article", this.story);
          for(var i = 0; i < this.tags.length; i++)
          {
            story.add("tags", this.tags[i]);
          }
          
          // if image exists
          if (this.image) {
            // convert to correct format, upload
            var parseFile = new Parse.File(this.headline + "-image.png", this.image);
            story.set("imageFile", parseFile);
          } else {
            story.set("imageFile", null);
          }
          
          // if lineChart exists
          if (this.lineChart) {
            story.set("lineChart", this.lineChart);
          } else {
            story.set("lineChart", null);
          }

          // if chart exists
          if (this.table) {
            story.set("chart", this.table);
          } else {
            story.set("chart", null);
          }
          
          // initialize to be unedited
          story.set("isEdited", true);

          // upload to parse DB
          story.save(null, {
            success: function(gameScore) {
              // return true, ie success
              callbacks.successCallback();
              return;
              
            },
            error: function(gameScore, error) {
              // return false, ie failure
              console.log("failure");
              callbacks.errorCallback();
              return;
            }
          });
        },
        
        uploadToMainSite: function(callbacks) {
          // Create a pointer to an object of class Point with id dlkj83d
          var Story = Parse.Object.extend("Story");
          var story = new Story();
          
          story.id = this.parseId;
   
          // Set a new value on quantity
          story.set("isEdited", true);
          
          // Save
          story.save(null, {
            success: function(story) {
              // Saved successfully.
              console.log("updated");
              callbacks.success();
            },
            error: function(point, error) {
              // The save failed.
              console.log("failed");
              callbacks.failure();
            }
          });
          
        }
  
    },
      
    // static properties
    {
      // turns an array into a 2D array
      convertRowsAndHeaderToTable: function(tableHeaders, tableRows) {
        // if the rows and headers exist and are of equal length 
          if (tableHeaders && tableRows && Article.areRowsAndHeadersEqualLength(tableHeaders, tableRows)) {
            // combine the headers and the rows into 1
            tableRows.unshift(tableHeaders);
            this.table = tableRows;
            
          } else {
            // otherwise we have invalid chart, do not add
            this.table = null;
          }
        
      },
      
      // check if rows and headers are of equal length
      areRowsAndHeadersEqualLength: function(headers, rows) {
        // loop through the entire array of rows, check that each array matches  
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].length !== headers.length) {
            return false;
          }
        }
          return true;
        },
      
      // checks if required inputs are sumbitted
      requiredInputsValid: function(headline, story, tag) {
        if (headline == '') {
          return {isValid: false, errorId:'headline'};
        } 
        else if (story == '')  {
          return {isValid: false, errorId:'story'};
        }
        else if (tag == '') {
          return {isValid: false, errorId:'tag'};
        }
        else {
          return {isValid: true, errorId:null};
        }
      },
    }); 
      
    return Article;
});
