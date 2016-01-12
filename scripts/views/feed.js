define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
  'text!templates/feedTemplate.html',
  'models/chart',
  'collections/articleCollection',
  'views/articleView'
], 

function($, _, Backbone, Parse, feedTemplate, Chart, ArticleCollection, ArticleView){
    
    var FeedView = Backbone.View.extend({
      tagName: "div",
      id: "feed-view",
      articleCollection: null,
      subViews: [],
      filter: null,
      editorMode: false,
      
      events: {
        "click #request-data":"requestData"
      },
      
      initialize: function(filter, isEdited) {
        // reset subviews
        this.subViews = [];
        this.filter = filter;
        
        // fetches articles from parse, generates article subviews, renders the page
        this.fetchArticles(filter, isEdited);
      },
      
      // renders each subview
      render: function() {
        // insert feed template
        this.$el.html(feedTemplate);
        
        // appends each article view
        for(var i = 0; i < this.articleCollection.length; i++) {
          $(".feed-container").append(this.subViews[i].el);
        }
        this.renderCharts(0);
      },
      
      // custom close method
      close: function() {
        // removes all the subviews
        this.closeSubViews();
        
        // removes this view
        this.undelegateEvents();
        this.remove();
      },
      
      // closes the subviews
      closeSubViews: function() {
        // closes each subview
        _.each(this.subViews, function(subView) {
          // if the subview has its own close method
          if (subView.close) {
            subView.close(); 
          } else {
            subView.remove();
          }
        });
        
        // removes from subviews array
        this.subViews = [];
      },
      
      /*
       *
       *
       ******************* QUERY METHODS *****************
       *
       *
       */
       
      // fetches articles from parse DB 
      fetchArticles: function(filter, isEdited) {
        this.articleCollection = new ArticleCollection();
        this.articleCollection.articles = this.articleCollection.populateFromParse(this.queryCallbacks(isEdited), filter, isEdited);
      },
      
      // download the next 10 articles from parse DB
      getMoreArticles: function(filter, isEdited) {
        this.articleCollection.populateFromParse(this.queryCallbacksForGetMoreArticles(isEdited), filter, isEdited);
      },
      
      // callbacks for fetch articles
      queryCallbacks: function(isEdited) {
        var that = this;
        return {
                success: function() {
                  that.generateArticleViews(0, isEdited);
                  that.render();
                 },
                failure: function() {
                  console.log("query callbacks failure");
                }
              };
      },
      
      // callbacks for fetch articles
      queryCallbacksForGetMoreArticles: function(isEdited) {
        var startingIndex = this.articleCollection.models.length;
        var that = this;
        return {
                success: function() {
                  // generates 10 more article views
                  that.generateArticleViews(startingIndex, isEdited);
                  
                  // appends each newly added article view 
                  for(var i = startingIndex; i < that.articleCollection.length; i++) {
                    $(".feed-container").append(that.subViews[i].el);
                  }
                },
                failure: function() {
                  console.log("query callbacks failure");
                }
              };
      },
      
      // generate article views
      generateArticleViews: function(startingIndex, isEdited) {
        for (var i = startingIndex; i < this.articleCollection.models.length; i++) {
          // generate the new article views
          var articleView = new ArticleView(this.articleCollection.models[i], i, isEdited);
          this.subViews.push(articleView);
          
        }
      },
          
      // request data for charts asynchronously
      renderCharts: function(i) {
        // iterate until you hit an article with a chart, top down
        while(!this.subViews[i].article.lineChart) 
        {
          i++;
        }
        // if end of feed, return
        if (i === this.subViews.length)
        {
          return;
        }
        // else begin recursive chart generation
        else
        {
          var id = this.subViews[i].$el.find(".chart")[0].id;
          new Chart(document.getElementById(id), this.subViews[i].article.lineChart.ticker, this.subViews[i].article.lineChart.fromDate, this.renderChartsCallbacks(i), i);
        }
      },
      
      renderChartsCallbacks: function(i) {
        var that = this;
        return {
          success: function() {
            i++;
            that.renderCharts(i);
          },
          failure: function() {
            console.log("query callbacks failure");
          }
        };
      }
    
    });
    return FeedView;
});
