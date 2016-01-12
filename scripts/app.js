define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
  'router'
], 

function($, _, Backbone, Parse, Router){

    // call Initialize function in Router
    var initialize = function() {
        Parse.initialize("7N5U35J0jpm3grUnRNZES7OsEzUYXGQH5OSk37eX", "6JLVYn85YQs8PO3Zzfs0rIxw1TnEjMAZ5r7hyA1a");
        Router.initialize();
    };
    
    return {
        initialize: initialize
    };
});