define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
  'views/feed',
  'models/article',
  'text!templates/editorHeaderTemplate.html',
  'text!templates/showMoreTemplate.html'
], 

function($, _, Backbone, Parse, FeedView, Article, editorHeaderTemplate, ShowMoreTemplate){
    
    var EditorView = Backbone.View.extend({
        tagName: "div",
        id: "editor-view",
        events: {
            "click #signout-desktop":"signOut",
            "click #signout-mobile":"signOut",
            "click #show-more-button": "showMoreButtonPressed",
         },
         
        initialize: function() {
            // add this to the html
            $("body").html(this.el);
            
            // create a feed view with no filters, not edited
            this.subViews = [new FeedView(null, false)];
            
            this.render();
        },
        
        // renders the html of the page
        render: function() {
            // render the header
            this.$el.html(editorHeaderTemplate);
            
            // render the feed of stories to be edited
            this.$el.append(this.subViews[0].el);
            
            // render the show more bar
            this.$el.append(ShowMoreTemplate);
        },
        
        // closes the subviews
        close: function() {
            // removes all the subviews
            _.each(this.subViews, function(subView) {
                // if the subview has its own close method
                if (subView.close) {
                    subView.close(); 
                } else {
                    subView.remove();
                }
            });
        this.subViews = [];
        
        // removes this view
        this.undelegateEvents();
        this.remove();
      },
      
      // signout button event handler
      signOut: function() {
        Parse.User.logOut();
        Backbone.history.navigate("login", {trigger:true});
      },
      
      showMoreButtonPressed: function(e) {
        e.preventDefault();
        this.subViews[0].getMoreArticles(this.filter, false);
      },
    });
    
    return EditorView;

});
      