
define([
   'jquery',
   'underscore',
   'backbone',
   'parse',
   'views/login',
   'views/signup',
   'views/home',
   'views/feed',
   'views/admin',
   'views/editor'
], 

function($, _, Backbone, Parse, LogInView, SignupView, HomeView, FeedView, AdminView, EditorView){
    
    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'index',
            'home(/)':'home',
            'home/:filter':'home',
            'login':'login',
            'signup':'signup',
            'admin':'admin',
            'editor':'editor',
            '*path':'defaultAction'
        },
        
        index: function() {
            if (Parse.User.current()) {
                Backbone.history.navigate("home", {trigger:true});
            } else {
                Backbone.history.navigate("login", {trigger:true});
            }
        },
        
        home: function(filter) {
            // checks if the user is logged in before going to home
            if (Parse.User.current()) {
                // check if there is a filter, if so, load with a filtered feed
                if(filter) {
                    // create new homeView with filtered feed
                    var view = new HomeView(filter);
                    this.loadView(view);
                } else {
                    // create new homeView with unfiltered feed
                    var view = new HomeView(null);
                    this.loadView(view);
                }
            } else {
                Backbone.history.navigate("login", {trigger:true});
            }
        },
        
        login: function() {

            // if there is a user, dont let them go to login page
            if (Parse.User.current()) {
                Backbone.history.navigate("home", {trigger:true});
            } else {
                var view = new LogInView();
                this.loadView(view);
            }
        },
        
        signup: function() {

            // if there is a user, dont let them go to signup page
            if (Parse.User.current()) {
                Backbone.history.navigate("home", {trigger:true});
            } else {
                var view = new SignupView();
                this.loadView(view);
            }
        },
        
        admin: function() {
            // checks if the user is logged in and is an admin before routing
            if (Parse.User.current() && Parse.User.current().get("isAdmin")) {
                var view = new AdminView();
                this.loadView(view);
            } else {
                Backbone.history.navigate("home", {trigger:true});
            }
        },

        editor: function() {
            console.log("editor");
            
             // checks if the user is logged in and is an admin before routing
            if (Parse.User.current() && Parse.User.current().get("isAdmin") && Parse.User.current().get("isAdmin")) {
                var view = new EditorView();
                this.loadView(view);
            } else {
                Backbone.history.navigate("home", {trigger:true});
            }
        },
        
        loadView : function(view) {

            // if there is a current view and a close method, remove via close, else via remove
            if (this.view) {
                if (this.view.close) {
                    this.view.close();
                    this.view = view;
                } else {
                    this.view.remove();
                    this.view = view;
                }
            } else {
                this.view = view;
            }
    	}
    });

    var initialize = function(){
        
        var app_router = new AppRouter();
       
        app_router.index();
        
        Backbone.history.start();
        
        return app_router;
    };
    
    return {
        initialize: initialize
    };
});