var express = require('express');
var http = require('http');
var balance = require("quantum-crypto");
var chaingear = require("../min_chaingear.json");

dict = {};
chaingear.forEach(function(x) {
    dict[x.token_symbol] = x.system;
});

var app = express();

app.get('/', function(req, res, next) {
    balance(req.query.address, function(error, items) {
        var assets = [];
        items.forEach(function(item, i, items) {
          if (item.status === 'success' && item.quantity !== void 0 && dict[item.asset] !== undefined) {
            assets.push({"quantity": item.quantity, "asset": dict[item.asset]});
          }
        });
        if (assets.length === 0) {
          content = JSON.stringify("Wrong address");
          res.writeHead(400, {
              'Content-Length': content.length,
              'Content-Type': 'application/json' });
        }
        else {
          content = JSON.stringify(assets);
          res.writeHead(200, {
              'Content-Length': content.length,
              'Content-Type': 'application/json' });
        }
        res.write(content);
        res.end();
    });
});

var port = process.env.PORT || 3001;
http.createServer(app).listen(port, function (err) {
  if (err) console.log('Error:' + err);
  else console.log('Listening on port:' + port);
});
