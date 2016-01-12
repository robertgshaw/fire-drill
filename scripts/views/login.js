define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
  'router',
  'text!templates/loginTemplate.html',
  'views/signup',
  'views/home',
  'views/admin'
], 

function($, _, Backbone, Parse, Router, loginTemplate, SignUpView, HomeView, AdminView){

    var LogInView = Backbone.View.extend({
        
        tagName: "div",
	    id: "login-view",
        
        events: {
            "submit #login-form" : "logIn",
            "click .signup-mobile" : "signUp",
            "click .signup-desktop" : "signUp"
        },
        
        initialize: function() {
            $("body").html(this.el);
            this.render();
        }, 
        
        // renders our form
        render: function() {
            this.$el.html(loginTemplate);
        },
        
        logIn: function(e) { 
            // prevent default action of form submit, manually submit below
            e.preventDefault();

            // login the user via Parse
            
            var username;
            var password;
            
            if ($(window).width() <= 768)
            {
                username = $('#login-username-mobile').val();
                password = $('#login-password-mobile').val();
            }
            else
            {
                username = $('#login-username-desktop').val();
                password = $('#login-password-desktop').val(); 
            }
        
            Parse.User.logIn(username, password, {
                // on success, head to homepages
                success: function(user) {
                    // if current user is an admin, go to admin page
                    if (Parse.User.current().get('isAdmin')) {
                        
                        Backbone.history.navigate("admin", {trigger:true});
                        
                    // if user is non-admin, go to homepage
                    } else {
                        
                        Backbone.history.navigate("home", {trigger:true});
                    }
                        
                },
                
                error: function(user, error){
                  alert("Incorrect username or password.");
                }
            });
        },
        
        signUp: function() {
            Backbone.history.navigate("signup", {trigger:true});
        }
        
    });
    
    return LogInView;
});
