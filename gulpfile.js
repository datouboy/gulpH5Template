'use strict';
const gulp = require('gulp'),
	path = require('path'),
	fs = require('fs'),
	del  = require('del'),
	uglify = require('gulp-uglify'),//JS压缩插件
	concat = require('gulp-concat'),//JS合并插件
	less = require('gulp-less'),
	lessPluginAutoPrefix = require('less-plugin-autoprefix'),//CSS补全插件
	minifyCss = require('gulp-minify-css'),//压缩CSS
	imagemin = require('gulp-imagemin'),//图片压缩
	htmlReplace = require('gulp-html-replace'),//Html文本替换
	htmlmin = require('gulp-htmlmin'),//压缩Html
	connect = require('gulp-connect');//测试服务器

const config = {
	src : './src',
	dest : './dest'
}

//CSS补全插件配置
var autoprefix = new lessPluginAutoPrefix({
    browsers: ["last 5 versions"]
});

//清空文件夹
gulp.task('clean', function(){
	del([config.dest+'/*']);
});

//压缩合并JS(各个JS库)
gulp.task('uglifyJsLib', function(){
	// 1.找到JS文件
	return gulp.src([config.src+'/js/lib/*.js'])
	// 2.压缩JS文件
		.pipe(uglify())
	// 3.合并成一个JS文件
		.pipe(concat('common_lib.js'))
	// 4.另存至指定文件夹
		.pipe(gulp.dest(config.dest+'/js'));
});

//压缩JS
gulp.task('uglifyJs', function(){
	// 1.找到JS文件
	return gulp.src([config.src+'/js/*.js'])
	// 2.压缩JS文件
		.pipe(uglify())
	// 3.另存至指定文件夹
		.pipe(gulp.dest(config.dest+'/js'))
		.pipe(connect.reload());
});

//编译less（调试用）
gulp.task('less', function () {
	return gulp.src(config.src+'/css/*.less')
		.pipe(less({
			//调用CSS前缀补全插件
			plugins: [autoprefix]
		}))
		.pipe(gulp.dest(config.dest+'/css'))
		.pipe(connect.reload());
});

//编译less后压缩CSS（正式部署用）
gulp.task('miniLess', function () {
	return gulp.src(config.src+'/css/*.less')
		.pipe(less({
			//调用CSS前缀补全插件
			plugins: [autoprefix]
		}))
		.pipe(minifyCss())
		.pipe(gulp.dest(config.dest+'/css'))
		.pipe(connect.reload());
});

//压缩图片
gulp.task('minImage', () =>
	gulp.src(config.src+'/images/**/*.{png,jpg,jpge,gif,webp,svg}')
        .pipe(imagemin())
        .pipe(gulp.dest(config.dest+'/images'))
);

//替换Html文本内容，压缩Html文件
gulp.task('minHtml', function() {
	var htmlminConfig = {
		//collapseWhitespace: true,//压缩Html
		removeEmptyAttributes: true,//删除空属性值 <input id=""> ==> <input>
		minifyJS: true,//压缩页面JS
		minifyCSS: true//压缩页面CSS
	}
	return gulp.src(config.src+'/*.html')
		/*.pipe(htmlReplace({
				'commonLib' : 'js/common_lib.js'
			}))*/
		.pipe(htmlmin(htmlminConfig))
		.pipe(gulp.dest(config.dest))
		.pipe(connect.reload());
});

//Copy 图片文件夹文件
gulp.task('copyImages', function(){
	return gulp.src(config.src+'/images/**')
    	.pipe(gulp.dest(config.dest+'/images'))
});

//Copy JS文件夹文件
gulp.task('copyJS', function(){
	return gulp.src(config.src+'/js/*.js')
    	.pipe(gulp.dest(config.dest+'/js'))
});

//测试服务器
gulp.task('webServer', function() {
    connect.server({
    	name: 'Test Server',
		root: config.dest,
    	port: 9090,
		livereload: true
    });
});

// 监听文件变化（调试用）
gulp.task('watch',function(){
    // 监听less
    gulp.watch(config.src+'/css/*.less', function(){
        gulp.run('less');
    });

    // 监听js
    gulp.watch(config.src+'/js/*.js', function(){
        gulp.run('copyJS');
    });

    // 监听图片
    gulp.watch(config.src+'/images/**', function(){
        gulp.run('copyImages');
    });
    
    // 监听html
    gulp.watch(config.src+'/*.html', function(){
        gulp.run('minHtml');
    });
});

//调试任务（组合任务）
gulp.task('test', ['clean'], function() {
	gulp.start('uglifyJsLib', 'copyJS', 'less', 'copyImages', 'minHtml', 'webServer', 'watch');
});

//默认任务（组合任务）
gulp.task('default', ['clean'], function() {
	gulp.start('uglifyJsLib', 'uglifyJs', 'miniLess', 'copyImages', 'minImage', 'minHtml');
});