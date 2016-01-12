define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
  'models/article',
  'text!templates/articleTemplate.html',
  'models/chart'
], 

function($, _, Backbone, Parse, Article, ArticleTemplate, Chart){
    
    var ArticleView = Backbone.View.extend({
    
        article: null,
        tagName: "div",
        className: "story",
        isEdited: false,
        
        events: {
            "click .approve":"approveArticleButtonPressed",
            "click .deny":"denyArticleButtonPressed",
            "click .confirm-approve":"confirmApproveButtonPressed",
            "click .unconfirm-approve":"unconfirmButtonPressed",
            "click .confirm-deny":"confirmDenyButtonPressed",
            "click .unconfirm-deny":"unconfirmButtonPressed"
            
        },
    
        initialize: function(article, articleIndex, isEdited, delegate) {
            this.el.id = articleIndex;
            this.article = article;
            this.isEdited = isEdited;
            this.render(isEdited);
        },

        render: function(isEdited){
            // adds the article template
            this.$el.html(ArticleTemplate);
            
            // adds the headline
            this.$el.find(".title").text(this.article.headline);
            
            // adds the time
            var date = this.article.date;
            this.$el.find(".date").text(date.toString().substr(4,11));
            
            // // loads the image, if it exists
            if (this.article.imageUrl) {
                // generate parse file form image
                this.$el.find(".story-image").attr({
                    src: this.article.imageUrl,
                    alt: "Article_Image"
                });
            } else {
                // otherwise remove the image html element
                this.$el.find(".image").remove();
            }
            
            // loads line chart, if it exists
            if (this.article.lineChart) {
               $(this.$el.find(".chart").attr("id", this.article.parseId));
            }
            else {
                this.$el.find(".chart").remove();
            }
            
            // loads the story
            this.$el.find(".article-text").text(this.article.story);
            
            // adds tags       
            for (var i = 0; i < this.article.tags.length; i++) {
                // tag button
                var tagButton = '<button class="tag" input="' + this.article.tags[i] + '">' + this.article.tags[i] +'</button>';
                // append into the DOM
                var tag = this.$el.find(".tags-h5");
                tag.append(tagButton);
            }
            
            // TODO: update this to add the table
            if (this.article.table) {
                // display table
            } else {
                // remove table
            }
            
            // id edited, remove the editor div
            if (isEdited) {
                this.$el.find(".editor").remove();
            }
        },
        
        // closes the subview
        close: function() {
            this.undelegateEvents();
            this.remove();
        }, 
        
        
        /*********************************************************                                                     
         *********************************************************                                                      
         *********************************************************                                                       
         ******************* EDITOR MODE METHODS *****************
         ********************************************************* 
         ********************************************************* 
         *********************************************************/
         
        // approve button, update CSS
        approveArticleButtonPressed: function() {
            this.resetConfirmDenyCSS();
            console.log("approve button");
            $("#" + this.el.id).addClass("alert-success");
            $("#" + this.el.id).addClass("well");
        },
        
        // deny button, update CSS
        denyArticleButtonPressed: function() {
            this.resetConfirmDenyCSS();
            console.log("deny button");
            $("#" + this.el.id).addClass("alert-danger");
            $("#" + this.el.id).addClass("well");
        },
        
        // dropup button "NO", just reset CSS
        unconfirmButtonPressed: function() {
            console.log("unconfirm");
            this.resetConfirmDenyCSS();  
        },
        
        // "yes" on approve dropup, upload to parse
        confirmApproveButtonPressed: function() {
            console.log("confirm approve");
            this.article.uploadToMainSite(this.approveArticleCallbacks());
        },
        
        // "yes" on deny dropup, send to admin view for updating
        confirmDenyButtonPressed: function() {
            console.log("confirm deny");
            // TODO: redirect to admin
        },
        
        // note to self: set up delegate for article view, handle deletion from feed level
        approveArticleCallbacks: function() {
            var that = this;
            return {
                success: function() {
                    // go home
                    console.log(that.delegate);
                    Backbone.history.navigate("home", {trigger: true});
                },
                failure: function() {
                    alert("sorry, we could not process your request");
                }
            };
        },
    
        // helper function for above
        resetConfirmDenyCSS: function() {
            $(".alert-success").removeClass("alert-success");
            $(".alert-danger").removeClass("alert-danger");
            $(".well").removeClass("well"); 
        }
    
    });
    return ArticleView;
    
});