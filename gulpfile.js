"use strict";

const { src, dest } = require("gulp");
const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require('sass'));
const cssnano = require("cssnano");
const rigger = require("gulp-rigger");
const uglify = require("gulp-uglify");
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const plumber = require("gulp-plumber");
const del = require("del");
const panini = require("panini");
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
var postcss = require('gulp-postcss');
const browsersync = require("browser-sync").create();



/* Paths to source/build/watch files
=========================*/

var path = {
    build: {
        html: "dist/",
        js: "dist/assets/js/",
        css: "dist/assets/css/",
        images: "dist/assets/img/",
        fonts: "dist/assets/fonts/"
    },
    src: {
        html: "src/*.{htm,html,php}",
        js: "src/assets/js/**/*.js",
        css: "src/assets/scss/**/*.scss",
        images: "src/assets/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}",
        imagesWebp: "src/assets/img/**/*.{jpg,jpeg,png}",
        fonts: "src/assets/fonts/**/*.{woff2,woff,ttf}"
    },
    watch: {
        html: "src/**/*.{htm,html,php}",
        js: "src/assets/js/**/*.js",
        css: "src/assets/scss/**/*.scss",
        images: "src/assets/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}",
        fonts: "src/assets/fonts/**/*.{woff2,woff,ttf}"
    },
    clean: "./dist"
};


/* Tasks
=========================*/

function browserSync(cb) {
    browsersync.init({
        server: {
            baseDir: "./dist/"
        },
        port: 3000
    });
    cb()
}

function browserSyncReload(cb) {
    browsersync.reload();
    cb()
}

function html() {
    panini.refresh();
   return src(path.src.html, { base: 'src/' })
    .pipe(plumber())   
        .pipe(panini({
            root: 'src/',
            layouts: 'src/tpl/layouts/',
            partials: 'src/tpl/partials/',
            helpers: 'src/tpl/helpers/',
            data: 'src/tpl/data/'
        }))
        .pipe(dest(path.build.html))
       .pipe(browsersync.stream())
        
}

function css() {
      var plugins = [
        autoprefixer({overrideBrowserslist:  ['last 2 versions'], cascade: true}),
       
    ];
    var plugins2 = [
        cssnano({ zindex: false,
            discardComments: {
                removeAll: true
            }
        })
    ];
    return src(path.src.css, { base: 'src/assets/scss/' })
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssbeautify())
        .pipe(postcss(plugins))
        .pipe(dest(path.build.css))
        .pipe(removeComments())
        .pipe(postcss(plugins2))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
         .pipe(browsersync.stream())
     
}


function js(cb) {
    return src(path.src.js, { base: './src/assets/js/' })
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.build.js))
         .pipe(browsersync.stream())
        cb()
} 

function images(cb) {
     gulp.src(path.src.images)
   .pipe(imagemin( [
	imagemin.mozjpeg({quality: 95, progressive: true}),
	imagemin.optipng({optimizationLevel: 3}),],
    ))
    .pipe(dest(path.build.images))
    return src(path.src.imagesWebp)
    .pipe(imagemin( [
	imagemin.mozjpeg({quality: 100, progressive: true}),
	imagemin.optipng({optimizationLevel: 3}),],
    ))
    .pipe(webp({quality: 95}))
    .pipe(dest(path.build.images))
    
  
    
    cb()
}
function fonts() {
    return src(path.src.fonts)
    .pipe(dest(path.build.fonts));
    
}
function clean(cb) {
    return del(path.clean);
    cb()
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, browserSync);


// export tasks
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
