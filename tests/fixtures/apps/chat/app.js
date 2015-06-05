/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var Fluxible = require('fluxible');

var app = new Fluxible({
    component: require('./components/ChatApp.jsx')
});

app.registerStore(require('./stores/RouteStore'));
app.registerStore(require('./stores/MessageStore'));
app.registerStore(require('./stores/ThreadStore'));
app.registerStore(require('./stores/UnreadThreadStore'));

module.exports = app;
