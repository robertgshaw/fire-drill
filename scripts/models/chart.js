define([
  'jquery',
  'underscore',
  'backbone',
  'parse',
  'Flotr'
], 

function($, _, Backbone, Parse, Flotr) {
    
    var Chart = Backbone.Model.extend({
       
        ticker: '',
        startDate: '',
        
        initialize: function(element, ticker, startDate, callbacks, i) {
            this.ticker = ticker;
            this.startDate = startDate;
            
            // get today's date
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth(); //January is 0!
            var yyyy = today.getFullYear();

            if(dd<10) {
                dd='0'+dd;
            } 

            if(mm<10) {
                mm='0'+mm;
            }
            
            // construct endDate string
            var endDate = yyyy + '-' + mm + '-' + dd;
            var that = this; 
            
            // construct URL with parameters
            var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22' + this.ticker + '%22%20and%20startDate%20%3D%20%22' + this.startDate + '%22%20and%20endDate%20%3D%20%22'+ endDate + '%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
            console.log(url);
            $.getJSON(url)
                .done(function (data) {
                    if (data.query.results) {
                        console.log(data);
                        var pricePair = [];
                        var prices = [];
                        var priceData = [];
                        var dateData = [];
                        
                        for(var i = data.query.results.quote.length - 1; i > -1; i--)
                        {
                            var priceFloat = parseFloat(data.query.results.quote[i].Close);
                            prices.push(priceFloat);
                            
                            // pair index and date for each data point
                            dateData.push([i, data.query.results.quote[i].Date]);
            
                            // pair index and price float for each data point
                            pricePair = [(data.query.results.quote.length - 1 - i), priceFloat];
                            priceData.push(pricePair);
                        }
                        
                        // get max & min price from prices array
                        var maxPrice = Math.max.apply(Math, prices);
                        var minPrice = Math.min.apply(Math, prices);
                        
                        // get date cutoffs in dataset for x-axis labels
                        var labels = that.getDateCutoffs(dateData);
                        
                        // construct chart
                        that.constructChart(element, priceData, maxPrice, minPrice, labels);
                        callbacks.success();
                    } else {
                        // remove the chart div
                        console.log(element);
                        element.remove();
                    }
                })
                .fail(function (jqxhr, textStatus, error) {
                    console.log("Failed to load stocks data");
                });
        },
        
        constructChart: function(element, priceData, maxPrice, minPrice, labels){
            
            // scale y axis for max and min price in dataset
            var ymax = Math.round(maxPrice * 1.1);
            var ymin = Math.round(minPrice * 0.9);
            
            // draw chart in element
            Flotr.draw(
                element,
                [priceData],
                {
                    lines:{show:true},
                    yaxis: {max: ymax, min: ymin, tickDecimals: 2},
                    xaxis: {max: priceData.length, ticks: labels},
                    mouse: {track: true, trackDecimals: 2, position: 'ne', trackFormatter: function(obj){
                        return obj.y;
                    },
                    shadowsize: 2
                }
            });
        },
        
        getDateCutoffs: function(dateData) {
            
            // get currentMonth and currentYear of first element
            var currentMonth = dateData[0][1].substring(5,7);
            var currentYear = dateData[0][1].substring(0,4);
            
            var day;
            var month;
            var year;
            
            var labelArray = [];
            var counter;
            
            // for datasets 2 months or less
            if (dateData.length < 60)
            {
                counter = 0;
                
                // add a label every 10 days
                for (var i = 0; i < dateData.length; i++)
                {
                    day = dateData[i][1].substring(8,10);
                    month = dateData[i][1].substring(5,7);
                    year = dateData[i][1].substring(0,4);
                    counter++;
                    if (counter === 10)
                    {
                        labelArray.push([i, this.assignMonthString(month) + ' ' + day]);
                        counter = 0;
                    }
                }
            }
            // for datasets 2 months to 6 months
            else if (dateData.length >= 61 && dateData.length < 183)
            {
                for (var i = 0; i < dateData.length; i++)
                {
            
                    month = dateData[i][1].substring(5,7);
                    year = dateData[i][1].substring(0,4);
                    
                    // add a label at the beginning of each month
                    if (month.localeCompare(currentMonth))
                    {
                        // push this data point to array of x-axis labels
                        labelArray.push([i, this.assignMonthString(month) + ' ' + year]);
                        // set currentMonth to new month 
                        currentMonth = month;
                    }
                }
            }
            // for datasets 6 months to 2 years
            else if (dateData.length >= 183 && dateData.length < 730)
            {
                
                counter = 0;
                
                for (var i = 0; i < dateData.length; i++)
                {
                    // get month & year from date string
                    month = dateData[i][1].substring(5,7);
                    year = dateData[i][1].substring(0,4);
                    
                    // compare month to currentMonth
                    if (month.localeCompare(currentMonth))
                    {
                        counter ++;
                        if (counter === 3)
                        {
                             labelArray.push([i, this.assignMonthString(month) + ' ' + year]);
                             counter = 0;
                        }
                        // push this data point to array of x-axis labels
                        // set currentMonth to new month 
                        currentMonth = month;
                    }
                    
                }
            }
            // for datasets greater than 2 years
            else
            {
                for (var i = 0; i < dateData.length; i++)
                {
                    
                    year = dateData[i][1].substring(0,4);
                    
                    // add a label at the beginning of every year
                    if (year.localeCompare(currentYear))
                    {
                        labelArray.push([i, year]);
                    }
                    
                    // set currentMonth to new year
                    currentYear = year;
                }
            }
            
            // return array of labels for x-axis of chart
            return labelArray;
        },
        
        assignMonthString: function(month)
        {
             // assign correct string based on month
            if (month === '01')
                return 'Jan';
            else if (month === '02')
                return 'Feb';
            else if (month === '03')
                return 'Mar';
            else if (month === '04')
                return 'Apr';
            else if (month === '05')
                return 'May';
            else if (month === '06')
                return 'Jun';
            else if (month === '07')
                return 'Jul';
            else if (month === '08')
                return 'Aug';
            else if (month === '09')
                return 'Sep';
            else if (month === '10')
                return 'Oct';
            else if (month === '11')
                return 'Nov';
            else if (month === '12')
                return 'Dec';
        }
    });
    return Chart;
});