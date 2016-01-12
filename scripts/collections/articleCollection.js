define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
  'models/article'
], 

function($, _, Backbone, Parse, Article){
    
    var articleCollection = Backbone.Collection.extend({ 
      model: Article,
      
      populateFromParse: function(callbacks, tag, isEdited) {
        // get all the stories
        var query = new Parse.Query("Story");
        
        // if there is a tag to limit the query
        if (tag) {
          query.equalTo("tags", tag);
        }
        
        // distinct between editor and home modes
        query.equalTo("isEdited", isEdited);

        // sort chronologically and only get the first 10
        query.descending("createdAt");
        
        // only get 10 of the stories at a time
        query.limit(10);
  
        // skip however many have already been downloaded
        query.skip(this.models.length);
        
        // scope for inside callbacks
        var that = this;
        
        // query executed
        query.find({
          success: function(stories) {
            for(var i = 0; i < stories.length; i++)
            {
              // creates a model out of the parse data
              var article = new Article(stories[i].get("headline"),
                                        // article
                                        stories[i].get("article"),
                                        // tags
                                        stories[i].get("tags"),
                                        // image data
                                        null,
                                        // line chart
                                        stories[i].get("lineChart"),
                                        // regular chart
                                        stories[i].get("chart"),
                                        // date
                                        stories[i].get("createdAt"),
                                        // parse image file
                                        ((stories[i].get("imageFile")) ? stories[i].get("imageFile").url() : null),
                                        // parse ID
                                        stories[i].id
                                        );
              
              // adds each model to the collection  
              that.push(article);
            }
            
            // calls functions from views for rendering html
            callbacks.success();
          },
          error: function(object, error) {
            console.log("error loading collection");
            callbacks.failure();
          }
        });
      },
    });
    
    return articleCollection;
})