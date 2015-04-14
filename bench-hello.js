require('babel/register');
var Benchtable = require('benchtable');
var Promise = require('es6-promise').Promise;
var React = require('./react/stock');
var ReactOpt = require('./react/optimized');
var state = require('./state.json');

var StockAppPromise = new Promise (function (resolve) {
    var Hello = React.createClass({
        displayName: 'Hello',
        render: function () {
            return React.createElement('div', {}, 'Hello world!');
        }
    });
    resolve(Hello);
});

var OptimizedAppPromise = new Promise (function (resolve) {
    var Hello = ReactOpt.createClass({
        displayName: 'HelloOptimized',
        render: function () {
            return ReactOpt.createElement('div', {}, 'Hello world!');
        }
    });
    resolve(Hello);
});

Promise.all([StockAppPromise, OptimizedAppPromise]).then(function (components) {
    var suite = new Benchtable();
    var output = React.renderToStaticMarkup(React.createElement(components[0]));
    var outputOpt = ReactOpt.renderToStaticMarkup(ReactOpt.createElement(components[1]));
    if (output !== outputOpt) {
        throw new Error('Output not the same');
    }

    // allow v8 optimization
    for(var i=0; i<1000; ++i) {
        React.renderToStaticMarkup(React.createElement(components[0]));
        ReactOpt.renderToStaticMarkup(ReactOpt.createElement(components[1]));
    }

    // add tests
    suite
        .addFunction('RenderChat', function(LocalReact, Component) {
            LocalReact.renderToString(LocalReact.createElement(Component));
        })
        .addInput('Optimized', [ReactOpt, components[1]])
        .addInput('Stock', [React, components[0]])
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
