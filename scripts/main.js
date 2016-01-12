require.config({
    // baseURL, all other paths in reference to this
    baseUrl: "scripts",
    // names of all other paths
    paths: {
        jquery: "lib/jquery",
        underscore: "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min",
        backbone: "https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone-min",
        parse: "//www.parsecdn.com/js/parse-1.6.12.min",
        bean: "lib/bean.min",
        Flotr: "lib/flotr2-amd",
        proto: "lib/prototype",
        bootstrap: "lib/bootstrap.min",
        templates: "../templates"
    },
    shim: {
        "bootstrap" : { "deps" :['jquery'] },
        
        'underscore' : { 
            exports : '_'
        },
    
        "backbone": {
            deps: ["underscore", "jquery"],
            exports: "Backbone"  //attaches "Backbone" to the window object
        }
    }
        
});

require(
    // Load our app module and pass it to our definition function
    ['app'], function(App){
        // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
        App.initialize();
});