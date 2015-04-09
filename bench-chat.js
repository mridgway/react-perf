require('babel/register');
var Benchmark = require('benchmark');
var Promise = require('es6-promise').Promise;
var React = require('./react/stock');
var ReactOpt = require('./react/optimized');
var state = require('./state.json');

var ReactPromise = new Promise (function (resolve) {
    var app = require('./chat/app');
    app.rehydrate(JSON.parse(JSON.stringify(state)), function (err, context) {
        resolve(context);
    });
});

var ReactOptPromise = new Promise (function (resolve) {
    var app = require('./chat-optimized/app');
    app.rehydrate(JSON.parse(JSON.stringify(state)), function (err, context) {
        resolve(context);
    });
});

Promise.all([ReactPromise, ReactOptPromise]).then(function (contexts) {
    var suite = new Benchmark.Suite();
    global.React = React;
    global.ReactOpt = ReactOpt;
    var context = global.context = contexts[0];
    var contextOpt = global.contextOpt = contexts[1];
    var output = React.renderToStaticMarkup(context.createElement());
    var outputOpt = ReactOpt.renderToStaticMarkup(contextOpt.createElement());
    if (output !== outputOpt) {
        throw new Error('Output not the same');
    }

    // add tests
    suite.add('React', function() {
        React.renderToString(context.createElement());
    })
    .add('ReactOpt', function() {
        ReactOpt.renderToString(contextOpt.createElement());
    })
    // add listeners
    .on('error', function (e) {
        throw e.target.error;
    })
    .on('cycle', function(event) {
      console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').pluck('name'));
    })
    // run async
    .run({ async: true, defer: true});
}).catch(function (e) {
    console.log(e.stack || e);
});
