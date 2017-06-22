var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var bump = require('gulp-bump');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var babelify = require('babelify');
var assign = require('lodash.assign');
var browserSync = require('browser-sync');
var del = require('del');
var streamCombiner = require('stream-combiner');
var fs = require('fs');

// User settings
var userSettingsJsonFile = './gulp.user.json';
var userSettings = {};
if (fs.existsSync(userSettingsJsonFile)) {
    userSettings = JSON.parse(fs.readFileSync(userSettingsJsonFile));
}

/**
 * The version bump type
 * major: 1.0.
 * minor: 0.1.0
 * patch: 0.0.2
 * prerelease: 0.0.1-2
 */
var versionBumpType = 'prerelease';

// Destination folders
var destinationFolders = ['./dist'];
if (userSettings.destinationFolder) {
    destinationFolders.push(userSettings.destinationFolder);
}

// Custom options
var customOpts = {
    entries: ['./src/index.js'],
    debug: true,
    transform: [
        ['babelify',
            {
                presets: [
                    [
                        "es2015",
                        {
                            loose: true
                        }
                    ]
                ],
                plugins: ["transform-object-rest-spread"],
                ignore: ["./src/libs/**"]
            }
        ]
    ],
    ignore: ['./src/libs/**']
};
var opts = assign({}, watchify.args, customOpts);
var b = function () {
    return browserify(opts);
};
var w = watchify(b());


var bundle = function (pkg) {
    return pkg.bundle()
        .on('error', function (err) {
            console.log(err.message);
            browserSync.notify(err.message, 3000);
            this.emit('end');
        })
        .pipe(plumber())
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        //.pipe(uglify({ compress: false }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest(destinationFolders));
};

w.on('log', gutil.log);

/**
 * This task removes all files inside the 'dist' directory.
 */
gulp.task('clean', function () {
    del.sync('./dist/**/*');
});

/**
 * This task will copy all files from libs into 'dist/libs'.
 * If you want to process them, just add your code to this task.
 */
gulp.task('libs', ['clean'], function () {
    return gulp.src(['./src/libs/**'])
        .pipe(plumber())
        .pipe(dest(destinationFolders, '/libs'));
});

/**
 * This task will copy all files from media into 'dist/media'.
 * If you want to process them, just add your code to this task.
 */
gulp.task('media', ['libs'], function () {
    return gulp.src(['./src/media/**'])
        .pipe(plumber())
        .pipe(dest(destinationFolders, '/media'));
});

/**
 * This task will copy index.html and favicon.ico into 'dist'.
 * If you want to process it, just add your code to this task.
 */
gulp.task('index', ['media'], function () {
    return gulp.src(['./src/index.html', './src/favicon.ico'])
        .pipe(plumber())
        .pipe(dest(destinationFolders));
});

/**
 * Version bump
 */
gulp.task('bump', ['index'], function () {
    return gulp.src('./src/media/version.json')
        .pipe(bump({
            type: versionBumpType
        }))
        .pipe(gulp.dest('./src/media'))
        .pipe(dest(destinationFolders, '/media'));
});

/**
 * This task will bundle all other js files and babelify them.
 * If you want to add other processing to the main js files, add your code here.
 */
gulp.task('bundle', ['index'], function () {
    return bundle(w);
});


gulp.task('bundle-mac', function () {
    return bundle(w);
});

/**
 * This task starts watching the files inside 'src'. If a file is changed,
 * removed or added then it will run refresh task which will run the bundle task
 * and then refresh the page.
 * 
 * For large projects, it may be beneficial to separate copying of libs and
 * media from bundling the source. This is especially true if you have large
 * amounts of media.
 */
gulp.task('watch', ['bundle'], function () {
    var watcher = gulp.watch(
        [
            './src/**/*',
            './index.html',
            './index.js'
        ], ['refresh']);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});


/**
 * This task starts browserSync. Allowing refreshes to be called from the gulp
 * bundle task.
 */
gulp.task('browser-sync', ['watch'], function () {
    return browserSync({
        server: {
            baseDir: './dist'
        },
        reloadDelay: 1000,
        reloadDebounce: 2000
    });
});

gulp.task('mac-watch', function () {
    console.log('Start mac watch');
    w.on('update', function () {
        gulp.start('refresh-mac');
    });
});

/**
 * This is the default task which chains the rest.
 */
gulp.task('default', ['browser-sync']);
gulp.task('mac', ['browser-sync', 'mac-watch']);
gulp.task('platform', () => {
    if(process.platform === 'darwin') {
        gulp.start(['browser-sync', 'mac-watch']);
    } else {
        gulp.start('browser-sync');
    }
});

/**
 * Using a dependency ensures that the bundle task is finished before reloading.
 */
gulp.task('refresh', ['bundle'], browserSync.reload);
gulp.task('refresh-mac', ['bundle-mac'], browserSync.reload);

/**
 * Build with browserify and exit
 */
gulp.task('build', ['bump'], bundle.bind(null, b()));

/**
 * Build with browserify and exit, don't bump version
 */
gulp.task('build-nobump', ['index'], bundle.bind(null, b()));

/**
 * Combine destination folders
 */
function dest(paths, appendPath) {
    if (!appendPath) {
        appendPath = '';
    }
    return streamCombiner(paths.map(function (path) {
        return gulp.dest(path + appendPath);
    }));
}