require('babel/register');
var profiler = require('profiler');
var renderAppWithFreshReact = require('../../utils/renderAppWithFreshReact');
var reactPath = require.resolve('../../react/0.13.3/react-with-addons');
var statePath = require.resolve('../fixtures/apps/chat/state.json');
var appPath = require.resolve('../fixtures/apps/chat/app');

renderAppWithFreshReact(reactPath, appPath, statePath).then(function (app) {
    profiler.resume();
    for (var i = 0; i<10000; ++i) {
        app.React.renderToStaticMarkup(app.context.createElement());
    }
    profiler.pause();
}).catch(function (e) {
    console.error(e.stack || e);
});
