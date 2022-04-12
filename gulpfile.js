var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', function(cb) {
  gulp
    .src('less/cleenmain.less')
    .pipe(less())
    .pipe(
      gulp.dest("./")
    );
  cb();
});

gulp.task(
  'default',
  gulp.series('less', function(cb) {
    gulp.watch(['less/*.less', 'less/tab/*.less', 'less/chat/*.less'], gulp.series('less'));
    cb();
  })
);