require('babel/register');
var Benchtable = require('benchtable');
var Promise = require('es6-promise').Promise;
var React = require('./react/stock');
var ReactOpt = require('./react/optimized');
var state = require('./state.json');

var StockAppPromise = new Promise (function (resolve) {
    var app = require('./chat/app');
    app.rehydrate(JSON.parse(JSON.stringify(state)), function (err, context) {
        resolve(context);
    });
});

var OptimizedAppPromise = new Promise (function (resolve) {
    var app = require('./chat-optimized/app');
    app.rehydrate(JSON.parse(JSON.stringify(state)), function (err, context) {
        resolve(context);
    });
});

Promise.all([StockAppPromise, OptimizedAppPromise]).then(function (contexts) {
    var suite = new Benchtable();
    var output = React.renderToStaticMarkup(contexts[0].createElement());
    var outputOpt = ReactOpt.renderToStaticMarkup(contexts[1].createElement());
    if (output !== outputOpt) {
        console.log(output);
        console.log(outputOpt);
        throw new Error('Output not the same');
    }

    // add tests
    suite
        .addFunction('RenderChat', function(React, context) {
            React.renderToString(context.createElement());
        })
        .addInput('Optimized', [ReactOpt, contexts[1]])
        .addInput('Stock', [ReactOpt, contexts[0]])
        // add listeners
        .on('error', function (e) {
            throw e.target.error;
        })
        .on('cycle', function(event) {
          console.log(String(event.target));
        })
        .on('complete', function() {
            console.log('The Fastest test suite is ' + '\u001b[32m' + this.filter('fastest').pluck('name') + '\u001b[0m\n');
            console.log(this.table.toString());
        })
        // run async
        .run({ async: true, defer: true});
}).catch(function (e) {
    console.log(e.stack || e);
});
