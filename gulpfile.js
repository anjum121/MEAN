const gulp = require('gulp');
const ts = require('gulp-typescript');
var nodemon = require('gulp-nodemon');

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', function () {
    const tsResult = tsProject.src()
        .pipe(tsProject());
    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], function () {
    gulp.watch('src/**/*.ts', ['scripts']);
});




gulp.task('start', function () {
    nodemon({
        script: 'dist/server.js'
        , ext: 'js html',
        execMap: {
            js: "node --inspect"
        }
        , env: {'NODE_ENV': 'development'}
    })
});

gulp.task('default', ['watch','start']);