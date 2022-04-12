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
    gulp.watch(['../../systems/cleenmain/less/*.less', '../../systems/cleenmain/less/tab/*.less', '../../systems/cleenmain/less/chat/*.less'], gulp.series('less'));
    cb();
  })
);