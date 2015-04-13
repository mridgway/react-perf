require('babel/register');
var profiler = require('profiler');
var Promise = require('es6-promise').Promise;
var ReactOpt = require('./react/stock');
var state = require('./state.json');
var OptimizedAppPromise = new Promise (function (resolve) {
    var app = require('./chat/app');
    app.rehydrate(JSON.parse(JSON.stringify(state)), function (err, context) {
        resolve(context);
    });
});

OptimizedAppPromise.then(function (context) {
    profiler.resume();
    for (var i=0; i<10000; ++i) {
        ReactOpt.renderToString(context.createElement());
    }
    profiler.pause();
}).catch(function (e) {
    console.error(e.stack || e);
});
