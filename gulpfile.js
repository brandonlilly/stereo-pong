var babel =      require('gulp-babel');
var cncat =      require('gulp-concat');
var gulp =       require('gulp');
var plumber =    require('gulp-plumber');
var uglify =     require('gulp-uglify');

var appPath = 'app/*.js';
var vendorPath = 'vendor/*.js';

gulp.task('babel', function () {
  gulp.src([appPath, vendorPath])
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
