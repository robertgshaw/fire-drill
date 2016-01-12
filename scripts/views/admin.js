define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
  'bootstrap',
  'text!templates/adminHomeTemplate.html',
  'views/home',
  'models/article'
], 

function($, _, Backbone, Parse, Bootstrap, AdminHomeTemplate, HomeView, Article){
    
    var AdminView = Backbone.View.extend({
      
      /*
       *
       ************************** BACKBONE METHODS ********************************
       *
       */
      
      tagName: "div",
	    id: "admin-view",
       
      // events defined here
      events: {
            // form submit event
            "submit #article-form":"submitFormButtonPressed",
            // signout button pressed event
            "click #signout-mobile":"signOutButtonPressed",
            "click #signout-desktop":"signOutButtonPressed",
            // homepage button pressed event
            "click #homepage":"homepageButtonPressed",
            // add chart radio button pressed event 
            "click #add-chart" : "addChartButtonPressed",
            // remove chart radio button pressed event
            "click #remove-chart" : "removeChartButtonPressed",
            // close file alert button pressed event
            "click #close-file-alert" : "closeFileAlertButtonPressed",
            // image uploaded event 
            "change #image" : "imageFileSubmitted",
            // remove image button pressed event
            "click #remove-file-button" : "removeFileButtonPressed",
            // column number submitted event
            "change #add-chart-column-number" : "columnNumberSubmitted",
            // add/remove row button pressed event 
            "click #add-row-button" : "addRowButtonPressed",
            "click #remove-row-button" : "removeRowButtonPressed"
      },

      // intitializes table to have 0 rows at the start 
      tableRows : 0,
      
      initialize: function() {
        // add this to the html
        $("body").html(this.el);
      
        // render the views together
		    this.render();
      },
      
      // render the template
      render: function() {
        // if not an admin, dont allow to this page
        if (!Parse.User.current().get("isAdmin")) {
          // updates the url
          Backbone.history.navigate('home', {trigger:true});
          
        } else {
          // renders template 
          this.$el.html(AdminHomeTemplate);
        }
      },
      
      /*
       *
       *  ****************** EVENT HANDLERS ************************
       *
       */
       
      submitFormButtonPressed: function(e) {
        e.preventDefault();
        
        // remove the error markings from the missing inputs
        $(".has-error").removeClass("has-error");
        
        // generate an object to pass to article model
        var object = this.parseFormInputs($( "#add-chart-column-number option:selected" ).val(), this.tableRows);
        
        // ensure object is not null, ie all required input is there
        if(object) {
          
          // initializes article, creates article model based of parsed form inputs
          var article = new Article(object.getHeadline(), 
                                    object.getStory(), 
                                    object.getTags(), 
                                    object.getImage(),
                                    object.getLineChart(),
                                    Article.convertRowsAndHeaderToTable(object.getTableHeaders(), object.getTableRows()),
                                    // date, parse auto sets this
                                    null,
                                    // image url, parse sets this 
                                    null,
                                    // origianlly unedited
                                    false);
          
          // upload to parse, returns true if successful, false otherwise
          article.uploadToParse({
            successCallback: function() {
              Backbone.history.navigate("home", {trigger:true});
            },
            errorCallback: function() {
              alert("Error callback evoked, please call Rob (781-987-4237) or Dev (781-987-4863)"); 
            }
          });
          
        } else {
          // i.e don't submit the form
          return false;
        }
      },
       
      // logout event handler 
      signOutButtonPressed: function() {
        Parse.User.logOut();
        Backbone.history.navigate('login', {trigger:true});
      },
      
      // go home event handler
      homepageButtonPressed: function() {
        Backbone.history.navigate('home', {trigger:true});
      },
       
      // event handler for a file being submitted
      imageFileSubmitted: function() {
        // remove the remove file button, in order to prevent 2 from appearing
        $("#remove-file-button").remove();
        // if there is something updated
        if ($("#image").val()) {
          // add button to remove the file
          var removeFileButton = '<button style="margin-top: 5px;" class="btn btn-default" id="remove-file-button" type="button">Remove File</button>'
          $("#image").after(removeFileButton);
          
          // check if the file is a png
          if($("#image").val().substring($("#image").val().lastIndexOf('.') + 1).toLowerCase() === 'png') {
            // show the user that the file upload is successful
            $("#upload-image").addClass("has-success");
          // alter user that the file type is incorrect
          } else {
            // prepare alert html
            var alertHtml = 
              '<div class="form-group" id="file-alert">'
              + '<div class="col-xs-2"></div>'
              + '<div class="alert alert-danger col-xs-9">'
                + '<a class="close" data-dismiss="alert" aria-label="close" id="close-file-alert">&times;</a>'
                + '<strong>Error!</strong> You must submit a .png file.'
              + '</div>'
              + '<div class="col-xs-1"></div>'
            + '</div>';
            
            // remove the file from the input, alert the user of incompatibility
            this.removeFile();
            $("#upload-image").addClass("has-error");
            $("#upload-image").after(alertHtml);
            
          }
        }

      },
      
      // event handler for the remove file button 
      removeFileButtonPressed: function() { 
        this.removeFile();
      },
      
      // event handler for close file alert
      closeFileAlertButtonPressed: function() {
        $("#file-alert").remove();
        $(".has-error").removeClass("has-error");
      },
       
      // on add chart button pressed, add the add chart-column-number display
      addChartButtonPressed: function() { 
        var columnHtml = 
          '<div class="form-group chart-added-html" id="add-chart-column-number">'
				    +'<label for="column-number" class="col-xs-2 control-label">Number of Columns</label>'
				      +'<div class="col-xs-9">'
					      +'<select class="form-control">'
                  +'<option>1</option>'
                  +'<option>2</option>'
                  +'<option>3</option>'
                  +'<option>4</option>'
                  +'<option>5</option>'
                +'</select>'
				      +'</div>'
				      +'<div class="col-xs-1"></div>'
				    +'</div>';
				  
        $("#add-chart-radio").after( columnHtml );
      },
      
      // event handler for removing the entire chart
      removeChartButtonPressed: function() {
        // remove all of the added html related to the chart, when we want to remove the chart
        $(".chart-added-html").remove();
        // set number of rows to be 0
        this.tableRows = 0;
      },

      // when the column number is changed, display the correct form
      columnNumberSubmitted: function() {
          // clear the current headers, clear all the rows, reset rows to 0
          this.removeTableHeaders();
          this.removeTableRows();
          this.removeAddRemoveRowButtons();
          
          // extract number of columns to add
          var columnNumber = $( "#add-chart-column-number option:selected" ).val();
          
          // create label and space fillers
          var headersHtmlStart  = '<div class="form-group chart-added-html" id="column-headers">'
                                    + '<label for="columnHeaders" class="col-xs-2 control-label">Column Headers</label>'
                                    + '<div class="col-xs-9">';
                                      
          var headersHtmlEnd    =     '</div>'
                                    + '<div class ="col-xs-1"></div>'
                                  + '</div>'
                                  + '<div class="form-group chart-added-html" id="add-remove-row-buttons">'
                                    + '<div class="col-xs-6 centered">'
                                      + '<button type="button" id="add-row-button" class="btn btn-default">Add Row</button>'
                                    + '</div>'
                                    + '<div class="col-xs-6 centered">'
                                      + '<button type="button" id="remove-row-button" class="btn btn-default">Remove Row</button>'
                                    + '</div>'
                                  + '</div>';
          
          // find the width of the columns of the headers, using floor to ensure we have whole numbers
          var columnWidth = Math.floor(12 / columnNumber);
          
          // generate Html, and add to the DOM
          var headersHtml = headersHtmlStart + this.inputHtmlGenerator(columnNumber, columnWidth, columnNumber, 0) + headersHtmlEnd;

          $("#add-chart-column-number").after( headersHtml );
          
      },
      
      // event handler for adding a row
      addRowButtonPressed : function() {
          
          // limits the increase of rows to 8
          if (this.tableRows >= 8) {
            alert("Sorry, You cant add any more rows.");
          } else {
            // increments tableRows by 1, adjusts property to reflect number of rows
            var numberOfRows = this.tableRows + 1;
            this.tableRows = numberOfRows;
            
            // finds number of columns based on input
            var columnNumber = $( "#add-chart-column-number option:selected" ).val();
            
            // generate start of the html, end of html
            var rowHtmlStart =  '<div id="row' + numberOfRows + '" class="form-group chart-added-html table-row">'
                                  + '<div class="col-xs-2">'
                                    + '<div class="col-xs-3"></div>'
                                    + '<div class="col-xs-9">'
  		      		                      + '<input type="text" class="form-control" id="row' + numberOfRows + '-column0" placeholder="Row ' + numberOfRows + ' Margin">'
  		      		                    + '</div>'
  		      		                  + '</div>'
  		      		                  + '<div class="col-xs-9">';
  		      		    
  		      var rowHtmlEnd =        '</div>'
                                  + '<div class="col-xs-1"></div>';  
                                  
            // find the width of the columns of the headers, using floor to ensure we have whole numbers
            var columnWidth = Math.floor(12 / columnNumber);
            
            // generate html               
            var rowHtml = rowHtmlStart + this.inputHtmlGenerator(columnNumber, columnWidth, columnNumber, numberOfRows) + rowHtmlEnd;
            
            // if it is the first row, add after the column header
            if (numberOfRows <= 1) {
                $("#column-headers").after(rowHtml);
            // otherwise add after most recently added row
            } else {
                $('#row' + (numberOfRows - 1)).after(rowHtml);
            }
          }
      },
      
      // event handler for removing a row
      removeRowButtonPressed: function() {
        // remove the most recent table rows
        this.removeMostRecentTableRow();
      },
          
      /*
       *
       *  ****************** HELPER FUNCTIONS ************************
       *
       */
      
      // parses the form to get the input into JSON form
      parseFormInputs: function(tableColumns, tableRows) {
        // required inputs returns an object {isValid: bool, errorId: string}
        var requiredInputs = Article.requiredInputsValid($("#headline").val(), $("#story").val(), $( "#tag option:selected" ).val());
        // if required inputs valid, return this inputs object
        if (requiredInputs.isValid) {
          var inputsObject = {

            getHeadline : function() {
              return $("#headline").val();
            },
            
            getStory : function() {
              return $("#story").val();
            },
            
            getTags : function() {
              if ($("#tag-input").val())
              {
                // get input
                var tagString = $("#tag-input").val();
                // remove spaces
                tagString = tagString.replace(/\s+/g, '');
                // separate tags into array
                var separatedTags = tagString.split(',');
                return separatedTags;
              }
              else
              {
                return null;
              }
            },
            
            // validate image file, return null pointer or a file
            getImage : function() {
              
              // if an image is uploaded, is .png, return a file
              if ($("#image").val() && ($("#image").val().substring($("#image").val().lastIndexOf('.') + 1).toLowerCase() === 'png')) {
                var imageFileInput = $("#image")[0];
                if(imageFileInput.files.length > 0) {
                  var file = imageFileInput.files[0];
                  return file;
                }
              } else {
                return null;
              }
            },
            
            // getter for the line chart array
            getLineChart : function() {
              if ($('#ticker').val() && $('#from-date').val()) {
                // return an object with the data to construct the chart
                return {  ticker:    $('#ticker').val(),
                          fromDate: $('#from-date').val() };
              } else {
                return null;
              }
            },
            
            // getter for the table headers array
            getTableHeaders: function() {
              if (tableRows > 0) {
                // the first element of the table headers will be an empty spot
                // there is no margin for the column headers
                var array = [''];
                
                // iterate through the inputs and add to the array 
                for (var i = 1; i <= tableColumns; i++) {
                  var header = $("#row0-column" + i).val();
                  array.push(header);
                }
                return array;
                
              } else {
                return null;
              }
              
            },
            
            // creates a 2D array of the chart based on number of columns and number of rows
            getTableRows: function() {
              // check if there are rows, columns
              if (tableRows >= 1 && tableColumns >= 1) {
                var rows = [];
                // iterate through the rows and columns and create a 2D array
                for (var i = 1; i <= tableRows; i++) {
                  var row = [];
                  for (var j = 0; j <= tableColumns; j++) {
                    row.push($("#row" + i + "-column" + j).val());
                  }
                  rows.push(row);
                }
                return rows;
              
              // return null if there are any errors  
              } else {
                return null;
              }
            }
          };
          return inputsObject; 
          
        // if required inputs are not correctly formatted
        } else {
          // scroll to error and notify user
          $('.' +  requiredInputs.errorId).addClass("has-error");
          this.scrollToError(requiredInputs.errorId);
          // return an empty object
          return null;
        }
      },
    
      // scroll to error
      scrollToError: function(id) {
        $('html,body').animate({
          scrollTop: $("#"+id).offset().top - 100}, 'slow');
      },
  
      // remove the file uploaded to the image input box
      removeFile: function() {
        // clear the image file input
        $("#image").val('');
        // remove the remove file button
        $("#remove-file-button").remove();
        // remove the file alert div
        $("#file-alert").remove();
        // remove the upload color
        $(".has-success").removeClass("has-success");
      },
      
      // (creates the html for the inputs)
      inputHtmlGenerator: function(columnNumber, columnWidth, numberOfColumns, rowNumber) {
        // base case, once we have iteratred through stop the loop
        if (columnNumber <= 0 ) {
          return '';
        // otherwise create a div to get the data
        } else {
          // reverses number so ids increase left to right on display
          var currentColumn = numberOfColumns - columnNumber + 1;
          var html =  '<div style="padding-left:0px" class="col-xs-' + columnWidth  + '">'
                      + '<input ' 
                      +         'id="row'+ rowNumber + '-column' + currentColumn + '" '
                      +         'placeholder="Row '+ rowNumber + ' Column ' + currentColumn + '" '
                      +         'name="row'+ rowNumber + '-column' + currentColumn + '" ' 
                      +         'type="text" class="form-control">'
                    +'</div>' 
                    + this.inputHtmlGenerator(columnNumber - 1, columnWidth, numberOfColumns, rowNumber);
          return html;
        }
      },
      
      // helper function to remove all the rows
      removeTableRows: function() {
          $(".table-row").remove();
          this.tableRows = 0;
      },
      
      // helper function to remove most recent table row
      removeMostRecentTableRow: function() {
          // only decrement if there are no more rows
          if(this.tableRows > 0) {
            // remove row from the DOM
            $("#row" + this.tableRows).remove();
          
            // decrement the row property
            this.tableRows = this.tableRows - 1;
          }
      },
      
      // helper function to remove add-remove button from chart
      removeAddRemoveRowButtons : function() {
        $("#add-remove-row-buttons").remove();
      },
      
      // helper function to remove table headers
      removeTableHeaders : function() {
          $("#column-headers").remove();
          this.removeAddRemoveRowButtons();
      },
      
    });
    
    return AdminView;
});
