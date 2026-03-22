/* ============================================================
   index.js — MessageBoard Node.js / Express server
   ============================================================ */

const express = require('express');
const app = express();

// Serve static client files (index.html, style.css, script.js)
app.use(express.static('public'));

// Allow cross-origin requests so any front-end can consume this API
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});


/* ── Section 2.1 : Test route ──────────────────────────────── */
// GET /test/<anything>  →  { "msg": "<anything>" }
app.get('/test/*', function(req, res) {
  // req.url is e.g. "/test/blihblah"  →  strip the leading "/test/"
  const param = req.url.substr('/test/'.length);
  res.json({ msg: param });
});


/* ── Section 2.3 : Stateful counter ───────────────────────── */
let counter = 0;

// GET /cpt/query  →  current counter value
app.get('/cpt/query', function(req, res) {
  res.json({ value: counter });
});

// GET /cpt/inc          →  increment by 1,   return { code: 0 }
// GET /cpt/inc?v=XXX    →  increment by XXX  return { code: 0 }
//                          if XXX is not an integer return { code: -1 }
app.get('/cpt/inc', function(req, res) {
  if (req.query.v !== undefined) {
    // A value was supplied — validate it is an integer
    if (!String(req.query.v).match(/^-?[0-9]+$/)) {
      return res.json({ code: -1 });
    }
    counter += parseInt(req.query.v, 10);
  } else {
    counter += 1;
  }
  res.json({ code: 0 });
});


/* ── Section 2.4 : Message micro-service ──────────────────── */

/**
 * Each message is stored as an object:
 * {
 *   id:     number   (index in the array, never changes)
 *   msg:    string
 *   pseudo: string
 *   date:   ISO-8601 string
 * }
 * Deleted slots are set to null so existing indices stay stable.
 */
var allMsgs = [
  { id: 0, pseudo: "Alice", msg: "Welcome to MessageBoard! 🎉",              date: new Date("2025-01-01T10:00:00").toISOString() },
  { id: 1, pseudo: "Bob",   msg: "Hey everyone, great app!",                  date: new Date("2025-01-01T10:05:00").toISOString() },
  { id: 2, pseudo: "Carol", msg: "I love cats 🐱",                            date: new Date("2025-01-01T10:12:00").toISOString() },
  { id: 3, pseudo: "Dave",  msg: "CSS Zen Garden is truly incredible.",       date: new Date("2025-01-01T10:20:00").toISOString() },
  { id: 4, pseudo: "Eve",   msg: "Can't wait to see what JavaScript enables!", date: new Date("2025-01-01T10:35:00").toISOString() },
];

// GET /msg/nber  →  number of non-deleted messages
app.get('/msg/nber', function(req, res) {
  const count = allMsgs.filter(function(m) { return m !== null; }).length;
  res.json({ count: count });
});

// GET /msg/getAll  →  array of all non-deleted message objects
app.get('/msg/getAll', function(req, res) {
  res.json(allMsgs.filter(function(m) { return m !== null; }));
});

// GET /msg/get/<n>  →  { code: 1, msg: <object> }  or  { code: 0 }
app.get('/msg/get/*', function(req, res) {
  const raw = req.url.substr('/msg/get/'.length);

  if (!raw.match(/^[0-9]+$/)) {
    return res.json({ code: 0 });
  }

  const idx = parseInt(raw, 10);

  if (idx >= allMsgs.length || allMsgs[idx] === null) {
    return res.json({ code: 0 });
  }

  res.json({ code: 1, msg: allMsgs[idx] });
});

// GET /msg/post/<message>?pseudo=<pseudo>
//   →  adds the message, returns { code: 0, id: <new index> }
app.get('/msg/post/*', function(req, res) {
  const raw    = req.url.substr('/msg/post/'.length).split('?')[0];
  const text   = unescape(raw);
  const pseudo = req.query.pseudo ? unescape(req.query.pseudo) : 'Anonymous';

  if (!text) {
    return res.json({ code: -1, error: 'Empty message' });
  }

  const newMsg = {
    id:     allMsgs.length,
    pseudo: pseudo,
    msg:    text,
    date:   new Date().toISOString(),
  };

  allMsgs.push(newMsg);
  res.json({ code: 0, id: newMsg.id });
});

// GET /msg/del/<n>  →  { code: 0 } on success, { code: -1 } on error
app.get('/msg/del/*', function(req, res) {
  const raw = req.url.substr('/msg/del/'.length);

  if (!raw.match(/^[0-9]+$/)) {
    return res.json({ code: -1 });
  }

  const idx = parseInt(raw, 10);

  if (idx >= allMsgs.length || allMsgs[idx] === null) {
    return res.json({ code: -1 });
  }

  allMsgs[idx] = null;
  res.json({ code: 0 });
});


/* ── Start server ──────────────────────────────────────────── */
const PORT = process.env.PORT || 8080;
app.listen(PORT, function() {
  console.log('App listening on port ' + PORT + '...');
});
