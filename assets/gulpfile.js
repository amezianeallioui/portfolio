//Project related.
var source = './',
    dest   = '../www/assets/',
    site   = 'localhost/portfolio/www';

var gulp = require('gulp');

//gulp css libraries
var globbing     = require("gulp-css-globbing");
var sass         = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var cssnano      = require('gulp-cssnano');
var concat       = require('gulp-concat');
var rename       = require('gulp-rename');

//gulp js libraries
var uglify       = require('gulp-uglify');
var plumber      = require('gulp-plumber');

//npm libraries
var del 		     = require('del');
var browserSync  = require('browser-sync');
var reload       = browserSync.reload;

// Tâche css
gulp.task('css', function() {

	del([dest+'css/style.min.css', '!' + dest + 'css']);

  return gulp.src(source + 'css/main.css')
      .pipe(plumber())
      .pipe(globbing({ extensions: ['.scss'] }))
      .pipe(sourcemaps.init())
      .pipe(sass({
        includePaths: [source+'css/**/*']
      }))
      .pipe(autoprefixer({
          browsers: ['> 1%', 'last 2 versions']
      }))
      .pipe(cssnano())
      .pipe(concat('style.min.css'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(dest+'css/'))
      .pipe(reload({stream: true}));
});

// gulp.task("source", function() {
//
//   gulp.src(dest+"/*.php")
//     .pipe(reload({stream: true}));
//
// });

gulp.task("watch", function() {

  gulp.start('css');
  gulp.watch(source + '/css/**/*', ['css']);

});

gulp.task("serve", function() {
  browserSync({proxy: site});
  gulp.start('watch');
});

gulp.task('default', ['serve'], function() {
});
