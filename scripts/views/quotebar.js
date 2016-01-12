// Boilerplate code for modules requiring Backbone
define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
  'models/quote',
  'text!templates/quoteBarTemplate.html'
], 

function($, _, Backbone, Parse, Quote, quoteBarTemplate){

    var QuoteBarView = Backbone.View.extend({
        
        tagName: "div",
        id: "quotebar-view",
        
        quotes: [],
        
        initialize: function() {
            // renders the bar
            this.render();
            
            // renders each quote individually
            this.quotes = this.generateQuotes();
        },
        
        render: function() {
            this.$el.html(quoteBarTemplate);
        },
        
        generateQuotes: function() {
            var SP500 = new Quote('SP500',"^GSPC",this.getQuotesCallbacks);
            var NASDAQ = new Quote('NASDAQ',"^IXIC",this.getQuotesCallbacks); 
            var US10yr = new Quote('US10yr',"^TNX",this.getQuotesCallbacks);  
            var Euro = new Quote('Euro',"EURUSD=X",this.getQuotesCallbacks);
            var Oil = new Quote('Oil',"CLG16.NYM",this.getQuotesCallbacks);
            var Nikkei = new Quote('Nikkei',"^N225",this.getQuotesCallbacks);
            
            return [SP500, NASDAQ, US10yr, Euro, Oil, Nikkei];
        },

        getQuotesCallbacks: {
            success: function(stock, price, dayChange) {
                // on success, add each element in sucession to the DOM
                var changeColor;
                if (dayChange[0] === '-')
                {
                    changeColor = 'red';
                }
                else
                {
                    changeColor = 'green';
                }
                if (stock === 'US10yr')
                {
                    $('.' + stock).html(stock + ' ' + price + '%' + ' ' + "<span class=" + changeColor + ">" + dayChange + "</span>"); 
                }
                else 
                {
                    $('.' + stock).html(stock + ' $'+ price + ' ' + "<span class=" + changeColor + ">" + dayChange + "</span>"); 
                }
            },
            failure: function() {
                // if there is a failure, just dont add the bar
                $('.stock-price-header-row').remove();
            }
        },
    
    });
    
    return QuoteBarView;
});