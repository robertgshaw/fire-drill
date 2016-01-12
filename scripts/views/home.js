define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
  'views/feed',
  'views/quotebar',
  'models/quote',
  'text!templates/headerTemplate.html',
  'text!templates/showMoreTemplate.html'
], 

function($, _, Backbone, Parse, FeedView, QuoteBarView, Quote, headerTemplate, ShowMoreTemplate){
    
    var HomeView = Backbone.View.extend({
      
      // BACKBONE PROPERTIES
      tagName: "div",
	    id: "home-view",
	    filter: null,
	    
      events: {
        "click #signout-desktop":"signOut",
        "click #signout-mobile":"signOut",
        "click #back-to-admin":"backToAdminPressed",
        "submit #quote":"getQuote",
        "click .tag":"tagButtonPressed",
        "click #remove-filter":"removeFilterButtonPressed",
        "click .feedfilter": "feedFilterButtonPressed",
        "click #show-more-button": "showMoreButtonPressed",
      },
      
      initialize: function(filter) {
        // add filter property
        this.filter = filter;
        
        // add this to the html
        $("body").html(this.el);
        
        // add the feed and quotebar as subview, feed may be filtered or not, not Editor Mode
        this.subViews = [new QuoteBarView(), new FeedView(filter, true)];
        
        // render the views together
		    this.render();
		    
		    this.fixCategoryHeader();
		  
      },
      
      /*
       *
       *************** RENDER AND CLOSE METHODS ********************
       *
       */
      
      // renders the header and the feed
      render: function() {
        // render the quotebar 
        this.$el.append(this.subViews[0].el);
        
        // render the header
        this.$el.append(headerTemplate);
        if(Parse.User.current().get("isAdmin") === true){
          $("#back-to-admin").toggle();
        }
        
        // add a filter bar if filtered feed
        this.updateFilterDisplayBar(this.filter);
        
        // render the welcome
        var username = Parse.User.current().get("username");
        $("#welcome").append("Welcome, " + username + ' ' + "<button class=btn id=signout-desktop>Log Out</button>");
        
        // render the subviews feedView
        this.$el.append(this.subViews[1].el);
        
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
      
      /*
       *
       ************** FILTER METHODS ********************
       *
       */
      
      // tag filters
      filterForTag: function(tag) {
        this.filter = tag;
        
        // remove the show more bar
        $(".show-more-template").remove();
        
        // toggles filter display bar
        this.updateFilterDisplayBar(tag);
        
        // close the feed view, remove it as a subview
        this.subViews[1].close();
        this.subViews.splice(1,1);
        
        // generate new feed view, add to subview array
        this.subViews.push(new FeedView(tag, true));
        
        // update the DOM
        this.$el.append(this.subViews[1].el);
        
        // add back the show more bar
        this.$el.append(ShowMoreTemplate);
        
        // update the url, but don't reload page
        if (tag) {
          Backbone.history.navigate('home/' + tag, {trigger: false});
        } else {
          Backbone.history.navigate('home', {trigger: false});
        }
      },
      
      // toggles the filter display bar 
      updateFilterDisplayBar: function(tag) {
        // if there is a tag, show filter
        if (tag) {
          $('#filter-display').show();
          $('#filter-container').html("<h5>Stories about: " + ' ' + "<button id=category class=btn>"+ tag + "</button><button id=remove-filter><img id=remove-img src=images/remove.png></img></button></h5>");
        // if there is no tag, (ie we are showing an unflitered feed), clear html and hide 
        } else {
          $('#filter-container').html('');
          $('#filter-display').hide();
        }
      },
      
      /* 
       *
       *
       ****************** EVENT HANDLERS ***********************
       *
       *
       */
       
      // event handler for navigating to admin
      backToAdminPressed: function() {
        Backbone.history.navigate("admin", {trigger:true});
      },
       
      // event handler for nav bar filter links
      feedFilterButtonPressed: function(ev) {
        this.addFilter(ev);
      },
      
      // event handler for tab buttons near stories 
      tagButtonPressed: function(ev) {
        this.addFilter(ev);
      },
      
      // helper method for event handlers above 
      addFilter: function(ev) {
        var tag = $(ev.currentTarget).val();
        this.filterForTag(tag);
      },
      
      // remove the filtered display, re-render the normal display
      removeFilterButtonPressed: function() {
        // create a feed with no filter
        this.filterForTag(null);
      },
      
      // get quote button pressed event handler
      getQuote: function (e) {
        e.preventDefault();
        var ticker = $('#quote-input').val();
        var quote = new Quote(ticker);
      },
      
      // signout button event handler
      signOut: function() {
        Parse.User.logOut();
        Backbone.history.navigate("login", {trigger:true});
      },
      
      // show more button
      showMoreButtonPressed: function(e) {
        e.preventDefault();
        console.log("show more button");
        // this.subViews[1] is feed view
        this.subViews[1].getMoreArticles(this.filter, true);
      },
      
      /*
       *
       ************* HELPER METHODS ***********************
       *
       */
       
       // helper method to keep category header at the top of the screen
       fixCategoryHeader: function() {
         $(window).scroll(function () {
  		      if ($(window).width() <= 768)
  		      {
  		        if ($(window).scrollTop() > 140) {
  		          $('#filter-display').addClass('fixed');
  		        } else {
  		          $('#filter-display').removeClass('fixed');
  		        }
  		      }
  		      else
  		      {
  		        if ($(window).scrollTop() > 135){
  		          $('#filter-display').addClass('fixed');
  		        } else {
  		          $('#filter-display').removeClass('fixed');
  		        }
  		      }
  		    });
       },
    });
    
    return HomeView;
});
