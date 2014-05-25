var fs = require('fs');
var director = require('director');
var template = require('lodash.template');
var flatsheet = require('flatsheet')();
var levelup = require('levelup');
var leveljs = require('level-js');
var config = require('./config.json');

/* set up indexeddb using levelup */
window.db = levelup(config.name, { db: leveljs, valueEncoding: 'json' })

/* request data from flatsheet, plop it into indexeddb */
flatsheet.sheet(config.sheet, function (err, res){
  if (err) return console.error(err);

  res.rows.forEach(function (row) {
    db.get(row.slug, function (err, value) {
      if (!value || JSON.stringify(value) !== JSON.stringify(row)) {
        db.put(row.slug, row);
      }
    });
  });
});

/* find #main-content */
var mainEl = document.getElementById('main-content');

/* pull in html templates */
var postListSource = fs.readFileSync('templates/post-list.html', 'utf8');
var postSource = fs.readFileSync('templates/post.html', 'utf8');

/* function for root route */
function list () {
  removeEl('post');
  var postList = [];

  db.createReadStream({})
    .on('data', function (post) { postList.push(post) })
    .on('close', function () {
      var data = {
        baseurl: config.baseurl,
        posts: postList
      };
      var listEl = createEl('post-list', postListSource, data);
      mainEl.appendChild(listEl);
    });
}

/* function for post show route */
function post (post) {
  removeEl('post-list');

  db.get(post, function (err, value) {
    var errorMsg = { title: 'Not Found', content: 'something went wrong' };
    var post;

    if (err) post = errorMsg;
    else post = value;

    var data = { 
      baseurl: config.baseurl,
      post: post
    };

    var postEl = createEl('post', postSource, data);
    mainEl.appendChild(postEl);
  });
}

/* set up routes of the app */
var router = new director.Router({
  '/': list,
  '/:post': post
});

/* configure and initialize router */
router.configure({ strict: false });
router.init();

/* redirect to root hash url if no hash */
if (router.getRoute() == '') router.setRoute('/');


/*
* helper functions
*/

/* create the html for a view */
function createEl (id, source, data) {
  var compiled = template(source);
  var html = compiled(data);
  var el = document.createElement('div');
  el.id = id;
  el.innerHTML = html;
  return el;
}

/* remove view parent element */
function removeEl (el) {
  var element = document.getElementById(el);
  if (element) element.parentNode.removeChild(element);
}