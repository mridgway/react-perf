require('babel/register');
var Benchtable = require('benchtable');
var Promise = require('es6-promise').Promise;
var React = require('./react/stock');
var ReactOpt = require('./react/optimized');
var ReactOpt2 = require('./react/optimized2');
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

var Optimized2AppPromise = new Promise (function (resolve) {
    var app = require('./chat-optimized2/app');
    app.rehydrate(JSON.parse(JSON.stringify(state)), function (err, context) {
        resolve(context);
    });
});

Promise.all([StockAppPromise, OptimizedAppPromise, Optimized2AppPromise]).then(function (contexts) {
    var suite = new Benchtable();
    var output = React.renderToStaticMarkup(contexts[0].createElement());
    var outputOpt = ReactOpt.renderToStaticMarkup(contexts[1].createElement());
    var outputOpt2 = ReactOpt.renderToStaticMarkup(contexts[2].createElement());
    if (output !== outputOpt || output !== outputOpt2) {
        throw new Error('Output not the same');
    }

    // allow v8 optimization
    for(var i=0; i<1000; ++i) {
        React.renderToStaticMarkup(contexts[0].createElement());
        ReactOpt.renderToStaticMarkup(contexts[1].createElement());
        ReactOpt.renderToStaticMarkup(contexts[2].createElement());
    }

    // add tests
    suite
        .addFunction('RenderChat', function(LocalReact, context) {
            LocalReact.renderToString(context.createElement());
        })
        .addInput('Stock', [React, contexts[0]])
        .addInput('InlineInstantiateChildrenWithMap', [ReactOpt, contexts[1]])
        .addInput('InlineInstantiateChildenWithTraverse', [React, contexts[2]])
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
