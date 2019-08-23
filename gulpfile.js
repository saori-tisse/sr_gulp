/*
  gulpプラグインの読み込み
--------------------------------- */
var gulp = require('gulp');
var sass = require('gulp-sass'); //Sassコンパイル
var plumber = require('gulp-plumber'); //エラー時の強制終了を防止
var notify = require('gulp-notify'); //エラー発生時にデスクトップ通知する
var sassGlob = require('gulp-sass-glob'); //@importの記述を簡潔にする
var browserSync = require('browser-sync'); //ブラウザ反映
var postcss = require('gulp-postcss'); //autoprefixerとセット
var autoprefixer = require('autoprefixer'); //ベンダープレフィックス付与
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var mozjpeg = require('imagemin-mozjpeg');
var ejs = require("gulp-ejs");
var rename = require("gulp-rename"); //.ejsの拡張子を変更
var mmq = require("gulp-merge-media-queries");
const cssmin = require('gulp-cssmin');
const uglify = require("gulp-uglify");
const changed = require('gulp-changed');

/*
  ディレクトリ設定
--------------------------------- */
var paths = {
  srcDir: 'src',
  dstDir: 'dist',
  assetDir: '/assets'
}

/*
  sass
--------------------------------- */
gulp.task('sass', function () {
  return gulp
    .src(paths.srcDir + paths.assetDir + '/scss/**/*.scss')
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))//エラーチェック
    .pipe(sassGlob())//importの読み込みを簡潔にする
    .pipe(sass({
      outputStyle: 'expanded' //expanded, nested, campact, compressedから選択
    }))
    .pipe(postcss([autoprefixer(
      {
        browsers: ['last 3 version', 'safari 5', 'ie 8', 'ie 9', 'ie 10', 'ie 11', 'opera 12.1', 'firefox 14', 'ios 6', 'android 4'],
        cascade: false
      }
    )]))
    .pipe(mmq({
      log: true
    }))
    .pipe(gulp.dest(paths.srcDir + paths.assetDir + '/css'))//コンパイル後の出力先
    .pipe(notify({
      title: 'Sassをコンパイルしました',
      message: new Date(),
      icon: '../gulplogo.jpg'
    }));
});

/*
  browser sync
--------------------------------- */
gulp.task('browser-sync', function (done) {
  browserSync.init({

    //ローカル開発
    server: {
      baseDir: "./src",
      index: "index.html"
    }
  });
  done();
});

gulp.task('reload', function (done) {
  browserSync.reload();
  done();
});

/*
  ejs
--------------------------------- */
gulp.task("ejs", (done) => {
  gulp
    .src([paths.srcDir + "/ejs/**/*.ejs", "!" + "ejs/**/_*.ejs"])
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))//エラーチェック
    .pipe(ejs({}, {}, { ext: '.html' })) //ejsを纏める
    .pipe(rename({ extname: ".html" })) //拡張子をhtmlに
    .pipe(gulp.dest(paths.srcDir)); //出力先
  done();
});

/*
  Dist
---------------------------------------------*/
gulp.task('dist', function () {
  // HTML,HTM,PHP コピー
  gulp.src([
    paths.srcDir + '/**/*',
    '!' + paths.srcDir + '/_**/*',
    '!' + paths.srcDir + '/**/_*',
    '!' + paths.srcDir + '/**/*.css',
    '!' + paths.srcDir + '/**/*.js',
    '!' + paths.srcDir + '/**/*.+(jpg|jpeg|png|gif|svg|ico)'
  ])
    .pipe(plumber({
      errorHandler: notify.onError("Error: &amp;amp;lt;%= error.message %&amp;amp;gt;")
    }))
    .pipe(gulp.dest(paths.dstDir));

  // CSS
  gulp.src(paths.srcDir + '/**/*.css')
    .pipe(plumber({
      errorHandler: notify.onError("Error: &amp;amp;lt;%= error.message %&amp;amp;gt;")
    }))
    .pipe(cssmin())
    .pipe(gulp.dest(paths.dstDir))

  // JS
  gulp.src(paths.srcDir + '/**/*.js')
    .pipe(plumber({
      errorHandler: notify.onError("Error: &amp;amp;lt;%= error.message %&amp;amp;gt;")
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dstDir))

  // IMG
  var imageminOptions = [
    pngquant({ quality: [70 - 85], }),
    mozjpeg({ quality: 85 }),
    imagemin.gifsicle({
      interlaced: false,
      optimizationLevel: 1,
      colors: 256
    }),
    imagemin.jpegtran(),
    imagemin.optipng(),
    imagemin.svgo()
  ];
  gulp.src(paths.srcDir + '/**/*.+(jpg|jpeg|png|gif|svg|ico)')
    .pipe(plumber())
    .pipe(changed(paths.dstDir + '/**/'))
    .pipe(imagemin(imageminOptions))
    .pipe(gulp.dest(paths.dstDir))
    .pipe(notify({
      title: '画像を圧縮しました',
      message: new Date(),
      sound: 'Tink',
      icon: '../gulplogo.jpg'
    }));

});


/*
  Watch
---------------------------------------------*/
gulp.task('default', gulp.parallel('browser-sync', function () {
  gulp.watch(paths.srcDir + paths.assetDir + '/js/*.js', gulp.task('reload'));
  gulp.watch(paths.srcDir + '/**/*.scss', gulp.task('sass'));
  gulp.watch(paths.srcDir + '/**/*.scss', gulp.task('reload'));
  //gulp.watch(paths.srcDir + '/**/*.css', gulp.task('css'));
  gulp.watch(paths.srcDir + '/ejs/**/*.ejs', gulp.task('ejs'));
  gulp.watch(paths.srcDir + '/ejs/**/*.ejs', gulp.task('reload'));
}));
