var fs = require('fs');
var director = require('director');
var template = require('lodash.template');
var levelup = require('levelup');
var leveljs = require('level-js');
var paganate = require('paganate');
var eve = require('dom-events');
var elClass = require('element-class');
var removeEl = require('remove-elements');
var async = require('contra');
var config = require('./config.json');

/* set optional host, token options from config */
var opts = {};
if (config.host) opts.host = config.host;

/* initialize flatsheet with options */
var flatsheet = require('flatsheet')(opts);

/* set number of posts per page for pagination */
var limit = config.limit;
var total;

/* initialize pagination */
var page = paganate({ limit: limit });

/* listen for page event to page through items */
page.on('page', function (page, offset) {
  /* get items from the local db */
  getItems(offset);
});

/* find the #get-items button */
var getItemsEl = document.getElementById('get-items');

/* listen for click event on #get-items button */
eve.on(getItemsEl, 'click', function(e) {
  page.next();
  e.preventDefault();
});

/* set up indexeddb using levelup */
window.db = levelup(config.name, { db: leveljs, valueEncoding: 'json' })

/* find #main-content */
var mainEl = document.getElementById('main-content');

/* pull in html templates */
var postListSource = fs.readFileSync('templates/post-list.html', 'utf8');
var postSource = fs.readFileSync('templates/post.html', 'utf8');

/* function for root route */
function list () {
  removeEl('.post-show');
  elClass(getItemsEl).remove('hidden');
  requestData(function () {
    page.page(0);
  });    
}

/* function for post show route */
function post (postSlug) {
  elClass(getItemsEl).add('hidden');
  removeEl('.post-list');
  removeEl('.post-show');

  var i = 0;
  db.createReadStream({ keys: true })
    .on('data', function (item) {
      i++;

      if (postSlug === item.key.split('_')[1]) {
        db.get(item.key, function (err, value) {
          var post;

          if (err) post = { title: 'Not Found', content: 'something went wrong' };
          else post = value;

          var data = { 
            baseurl: config.baseurl,
            post: post
          };

          var postEl = createEl('post-show', postSource, data);
          mainEl.appendChild(postEl);
        });
      }
    })
    .on('close', function (err) {
      if (i === 0) {
        requestData(function(){
          location.reload();
        });
      }
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

/* request data from flatsheet, plop it into indexeddb */
function requestData (callback) {
  flatsheet.sheet(config.sheet, function (error, response){
    if (error) callback(error);

    /* rows are ordered by when they were made, so reverse them to get newest first */
    var rows = response.rows.reverse();
    total = rows.length;

    async.each(rows, iterator, done);

    function iterator (row, i, cb) {
      var slug = i + '_' + row.slug;

      db.get(slug, function (err, value) {
        if (!value || JSON.stringify(value) !== JSON.stringify(row)) {
          db.put(slug, row);
        }
        cb();
      });
    }

    function done () {
      if (callback) callback();
    }
  });
}

/* get items from indexeddb based on pagination offset */
function getItems (offset) {
  var postList = [];

  var stream = db.createReadStream({ 
    start: offset, 
    end: offset + limit, 
    limit: limit
  });

  stream.on('data', function (post) { 
    postList.push(post);
  });

  stream.on('close', function () {
    var data = {
      baseurl: config.baseurl,
      posts: postList
    };

    var listEl = createEl('post-list', postListSource, data);
    mainEl.appendChild(listEl);

    if (total <= offset + limit) elClass(getItemsEl).add('hidden');
  });
}

/* create the html for a view */
function createEl (slug, source, data) {
  var compiled = template(source);
  var html = compiled(data);
  var el = document.createElement('div');
  el.className = slug;
  el.innerHTML = html;
  return el;
}