require('babel/register');
var assert = require('assert');
var renderAppWithFreshReact = require('../../utils/renderAppWithFreshReact');
var Benchtable = require('benchtable');

var argv = require('yargs').argv;
var testFolder = argv.f || argv.folder || 'master';
var baselineFolder = argv.baseline || argv.baseline || '0.14.0';

if (argv.h || argv.help) {
    console.log('  -f: test folder within react/');
    console.log('  -b: baseline folder within react/');
    process.exit(0);
}

var appPath = require.resolve('../fixtures/apps/chat/app');
var statePath = require.resolve(appPath + '/../state.json');
var currentReactPath = require.resolve('../../react/' + testFolder + '/react-with-addons');
var react13Path = require.resolve('../../react/0.13.3/react-with-addons');

console.log('Comparing ' + testFolder + ' with baseline (' + baselineFolder + ' and react-server)');

renderAppWithFreshReact(currentReactPath, appPath, statePath).then(function (reactMasterApp) {
    return renderAppWithFreshReact(react13Path, appPath, statePath).then(function (react13App) {
        assert(reactMasterApp.markup, react13App.markup);
        assert(reactServerApp.markup, react13App.markup);

        var suite = new Benchtable();

        // add tests
        suite
            .addFunction('RenderChat', function(React, context) {
                React.renderToString(context.createElement());
            })
            .addInput('React ' + testFolder, [reactMasterApp.React, reactMasterApp.context])
            .addInput('React ' + baselineFolder, [react13App.React, react13App.context])
            .addInput('React-Server', [reactServerApp.React, reactServerApp.context])
            // add listeners
            .on('error', function (e) {
                throw e.target.error;
            })
            .on('cycle', function(event) {
                console.log(String(event.target));
            })
            .on('complete', function() {
                //console.log(JSON.stringify(this._results, null, 2));
                console.log(this.table.toString());
            })
            // run async
            .run({ async: true, defer: true });
    });
}).catch(function (e) {
    console.log(e.stack || e);
});
