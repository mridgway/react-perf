require('babel/register');

var argv = require('yargs').argv;
var testFolder = argv.f || argv.folder || 'master';

var profiler = require('profiler');
var renderAppWithFreshReact = require('../../utils/renderAppWithFreshReact');
var reactPath = require.resolve('react/dist/react');
var reactDOMPath = require.resolve('react-dom/server');
var statePath = require.resolve('../fixtures/apps/chat/state.json');
var appPath = require.resolve('../fixtures/apps/chat/app');

renderAppWithFreshReact(reactPath, reactDOMPath, appPath, statePath).then(function (app) {
    profiler.resume();
    for (var i = 0; i<10000; ++i) {
        app.ReactDOM.renderToStaticMarkup(app.React.createElement(app.context.getComponent(), {
            context: app.context.getComponentContext()
        }));
    }
    profiler.pause();
}).catch(function (e) {
    console.error(e.stack || e);
});
