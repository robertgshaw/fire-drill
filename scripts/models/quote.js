define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
], 

function($, _, Backbone, Parse) {
    
    var Quote = Backbone.Model.extend({
       
        ticker: '',
        stock: '',
        price: '',
        dayChange: '',
        
        initialize: function(stock, ticker, callbacks) {
            this.ticker = ticker;
            this.stock = stock;
            
            var base_url = "https://query.yahooapis.com/v1/public/yql";
            
            var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + ticker + "')");

            $.getJSON(base_url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
                .done(function (data) {
                    this.price = data.query.results.quote.LastTradePriceOnly;
                    this.dayChange = data.query.results.quote.PercentChange;
                    
                    // adds to the DOM
                    callbacks.success(stock, this.price, this.dayChange);
                })
                .fail(function (jqxhr, textStatus, error) {
                    console.log("failed to load stocks data");
                    callbacks.failure();
                });
        },
        
    });
    
    return Quote;
});