var mockery = require('mockery');
var Promise = require('es6-promise').Promise;

module.exports = function renderAppWithFreshReact(reactPath, appPath, statePath) {
    return new Promise(function (resolve, reject) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false,
            warnOnReplace: true
        });
        var state = require(statePath);
        var React = require(reactPath);
        mockery.registerMock('react', React);
        mockery.registerMock('react/addons', React);
        var app = require(appPath);
        app.rehydrate(state).then(function (context) {
            var markup = React.renderToStaticMarkup(context.createElement());
            mockery.deregisterAll();
            mockery.resetCache();
            mockery.disable();
            resolve({
                context: context,
                React: React,
                markup: markup
            });
        }).catch(reject);
    });
};
