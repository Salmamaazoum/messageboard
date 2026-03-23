const express = require('express');
const app = express();

app.use(express.static('public'));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/test/*', function(req, res) {
  const param = req.url.substr('/test/'.length);
  res.json({ msg: param });
});

let counter = 0;

app.get('/cpt/query', function(req, res) {
  res.json({ value: counter });
});

app.get('/cpt/inc', function(req, res) {
  if (req.query.v !== undefined) {
    if (!String(req.query.v).match(/^-?[0-9]+$/)) {
      return res.json({ code: -1 });
    }
    counter += parseInt(req.query.v, 10);
  } else {
    counter += 1;
  }
  res.json({ code: 0 });
});

var allMsgs = [
  { id: 0, pseudo: "Alice", msg: "Welcome to MessageBoard! 🎉",              date: new Date("2025-01-01T10:00:00").toISOString() },
  { id: 1, pseudo: "Bob",   msg: "Hey everyone, great app!",                  date: new Date("2025-01-01T10:05:00").toISOString() },
  { id: 2, pseudo: "Carol", msg: "I love cats 🐱",                            date: new Date("2025-01-01T10:12:00").toISOString() },
  { id: 3, pseudo: "Dave",  msg: "CSS Zen Garden is truly incredible.",       date: new Date("2025-01-01T10:20:00").toISOString() },
  { id: 4, pseudo: "Eve",   msg: "Can't wait to see what JavaScript enables!", date: new Date("2025-01-01T10:35:00").toISOString() },
];

app.get('/msg/nber', function(req, res) {
  const count = allMsgs.filter(function(m) { return m !== null; }).length;
  res.json({ count: count });
});

app.get('/msg/getAll', function(req, res) {
  res.json(allMsgs.filter(function(m) { return m !== null; }));
});

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, function() {
  console.log('App listening on port ' + PORT + '...');
});
