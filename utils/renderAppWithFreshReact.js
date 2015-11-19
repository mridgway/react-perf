var mockery = require('mockery');
var Promise = require('es6-promise').Promise;

module.exports = function renderAppWithFreshReact(reactPath, reactDOMPath, appPath, statePath) {
    return new Promise(function (resolve, reject) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false,
            warnOnReplace: true
        });
        var state = require(statePath);
        var React = require(reactPath);
        var ReactDOM = require(reactDOMPath);
        mockery.registerMock('react', React);
        mockery.registerMock('react-dom', ReactDOM);
        mockery.registerMock('react-dom/server', ReactDOM);
        var app = require(appPath);
        app.rehydrate(state).then(function (context) {
            var markup = ReactDOM.renderToStaticMarkup(
                React.createElement(context.getComponent(), {
                    context: context.getComponentContext()
                })
            );
            mockery.deregisterAll();
            mockery.resetCache();
            mockery.disable();
            resolve({
                context: context,
                React: React,
                ReactDOM: ReactDOM,
                markup: markup
            });
        }).catch(reject);
    });
};
