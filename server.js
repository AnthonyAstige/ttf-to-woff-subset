// TODO: Refactor / cleanup this as needed
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var cors = require('cors');
var fs = require('fs');
var shortid = require('shortid');
var got = require('got');
var Fontmin = require('fontmin')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({credentials: true, origin: true}));

app.use(express.static('public'));

// http://stackoverflow.com/a/28835460
function base64_encode(file) {
    const contents = fs.readFileSync(file);                // read binary data
    return new Buffer(contents).toString('base64');      // convert binary data to base64 encoded string
}

app.post("/base64", function (request, response) {
  console.log(`Creating font for ${request.body.glyphs.length} glyphs: ${request.body.glyphs}`)
  // Setup
  const remotePath = request.body.ttfURL
  // const remotePath = 'https://wtfismyip.com/text'
  const id = shortid()
  const tmpPath = `/tmp/${id}.ttf`
  const builtTTFPath = `/tmp/built/${id}.ttf`
  const builtWOFFPath = `/tmp/built/${id}.woff`

  // Hacked callback hell (at least it'll perform well...)
  got(remotePath, {encoding: 'binary'}).then(resp => {
    console.log(`Downloaded ${remotePath} at ${resp.body.length} bytes?`)
    // console.log(resp)
    fs.writeFile(tmpPath, resp.body, 'binary', (err) => {
      const stats = fs.statSync(tmpPath)
      console.log(`Wrote ${tmpPath} at ${stats.size} bytes`)

      const fm = new Fontmin()
        .src(tmpPath)
        // Strip glyphs but keep hint info
        .use(Fontmin.glyph({ text: request.body.glyphs, hinting: true }))
        // Convert to deflated woff
        .use(Fontmin.ttf2woff({ deflate: true}))
        .dest('/tmp/built')
      fm.run((err, cbFiles) => {
        if(err) {
          throw err
        }
        const TFFStats = fs.statSync(builtTTFPath)
        const WOFFStats = fs.statSync(builtWOFFPath)
        console.log(`Output ${builtTTFPath} at ${TFFStats.size} bytes`)
        console.log(`Output ${builtWOFFPath} at ${WOFFStats.size} bytes`)
        response.send(`data:application/x-font-woff;base64,${base64_encode(builtWOFFPath)}`);
      })
    })
  })

});

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});