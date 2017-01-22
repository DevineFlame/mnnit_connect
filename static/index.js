
var path = require('path');
var express = require('express');

var app = express();

app.post('/static/myaction', function(req, res) {
  console.log("you came to me");
  console.log(req.query.name);
  res.send('You sent the name ravi.');
});

/*