var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var cors = require('cors');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({credentials: true, origin: true}));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  response.send(`data:application/x-font-woff;base64,${JSON.stringify(request.body)}`);
  response.sendStatus(200);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
