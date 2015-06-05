var gulp = require('gulp');
var shell = require('gulp-shell');
var replace = require('gulp-replace');
var argv = require('yargs').argv;

var remote = argv.r || argv.remote || null;
var commit = argv.c || argv.commit || 'origin/master';
var folder = commit.replace(/.*\//g, '');
console.log(remote, commit, folder);

gulp.task('clean', shell.task([
    'rm -Rf /tmp/react || 0'
]));

gulp.task('clone', shell.task([
    'git clone https://github.com/facebook/react.git || true'
], { cwd: '/tmp' }));

gulp.task('remote', ['clone'], shell.task([
    'git remote add ' + remote + ' https://github.com/' + remote + '/react.git || true'
], { cwd: '/tmp' }));

gulp.task('checkout', ['remote', 'clone'], shell.task([
    'git fetch ' + remote || 'origin',
    'git checkout -f ' + commit
], { cwd: '/tmp/react' }));

gulp.task('install', ['checkout'], shell.task([,
    'npm i'
], { cwd: '/tmp/react' }));

gulp.task('envify', ['install'], function () {
    return gulp.src('grunt/config/browserify.js', {cwd: '/tmp/react'})
        .pipe(replace(/development/g, 'production'))
        .pipe(gulp.dest('grunt/config/', {cwd: '/tmp/react'}));
});

gulp.task('build', ['envify'], shell.task([
    './node_modules/.bin/grunt build'
], {cwd: '/tmp/react'}));

gulp.task('copy', ['build'], function () {
    gulp.src('build/react-with-addons.js', {cwd: '/tmp/react'})
        .pipe(gulp.dest('react/' + folder + '/'))
});

gulp.task('currentSHA', function (cb) {
    var output = shell([
        'git rev-parse --short=10 HEAD'
    ], {cwd: '/tmp/react'});

    output.on('data', function (data) {
        console.log(data);
    });

    output.on('error', cb);
    output.on('end', cb);
});

gulp.task('default', ['copy']);
