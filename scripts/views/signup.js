define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
  'text!templates/signupTemplate.html',
  'views/home'
], 

function($, _, Backbone, Parse, signupTemplate, HeaderView){

    var SignUpView = Backbone.View.extend({
        
        tagName: "div",
	    id: "signup-view",
        
        events: {
            "click .back" : "renderLogin",
            "click .signup-desktop" : "registerUser",
            "click .signup-mobile" : "registerUser"
        },
        
        initialize: function() {
            // add this to the html
            $("body").html(this.el);
        
            // render the views together
		    this.render();        
        },
        
        render: function(e){
            this.$el.html(signupTemplate);
        },
        
        registerUser: function(){
            var pw;
            var confirm;
            if ($(window).width() <= 768)
            {
                pw = $('#signup-password-mobile').val();
                confirm = $('#signup-confirm-mobile').val();
            }
            else
            {
                pw = $('#signup-password-desktop').val();
                confirm = $('#signup-confirm-desktop').val(); 
            }
            if (pw === confirm)
            {
                // configures new user to be added to database
                var user = new Parse.User();
                if ($(window).width() <= 768)
                {
                    user.set("username", $('#signup-username-mobile').val());
                    user.set("email", $('#signup-email-mobile').val());
                }
                else 
                {
                    user.set("username", $('#signup-username-desktop').val());
                    user.set("email", $('#signup-email-desktop').val());
                }
                user.set("password", pw);
                // by default, sets user as non-admin
                user.set("isAdmin", false);
                
                user.signUp(null, {
                    success: function(user) {
                        Backbone.history.navigate("home", {trigger:true});
                    },
                    error: function(user, error) {
                        alert("Error:" + error.code + " " + error.message);
                    }
                });
            }
            else
            {
                alert("Passwords do not match.");
            }
            return false;
        }
    });
    
    return SignUpView;
});
