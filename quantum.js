var express = require('express');
var http = require('http');
var balance = require("quantum-crypto");
var chaingear = require("../min_chaingear.json");
var Gitter = require('node-gitter');
var gitter = new Gitter(require('./gitter.json').token);

var dict = {};
var nodestats;
var app = express();

chaingear.forEach(function(x) {
    dict[x.token_symbol] = x.system;
});

gitter.rooms.join('cyberFund/nodestats')
  .then(function(room) {
    nodestats = room;
});

app.get('/', function(req, res, next) {
    balance(req.query.address, function(error, items) {
        var service = items[0].service;
        var assets = [];
        items.forEach(function(item, i, items) {
          if (item.status === 'success' && item.quantity !== void 0 && dict[item.asset] !== undefined) {
            assets.push({"quantity": item.quantity, "asset": dict[item.asset]});
          }
        });
        if (assets.length === 0) {
          error_log = "@/all Attention! Service don't respond: " + service;
          nodestats.send(error_log);

          content = JSON.stringify("Wrong address or service don't respond");
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
