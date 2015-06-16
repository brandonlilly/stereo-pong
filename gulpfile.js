var babel =       require('gulp-babel');
var browserify =  require('browserify');
var cncat =       require('gulp-concat');
var gulp =        require('gulp');
var plumber =     require('gulp-plumber');
var uglify =      require('gulp-uglify');

var appPath = 'app/*.js';

gulp.task('babel', function () {
  gulp.src([appPath])
    .pipe(plumber())
    .pipe(babel())
    .pipe(cncat('application.js'))
    // .pipe(uglify())
    .pipe(gulp.dest('compiled'));
});

gulp.task('watch', function() {
  gulp.watch([appPath], ['babel']);
});

gulp.task('default', ['babel', 'watch']);
