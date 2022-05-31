const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
require('dotenv').config();
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let mongo_uri = process.env.MONGO_URI
mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true })

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urlSchema = new mongoose.Schema({
  "original_url": String,
  "short_url": Number
})

let Url = mongoose.model("Url", urlSchema);

let isValidUrl = (str) => {
  const matchpattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
  return matchpattern.test(str);
}

app.post("/api/shorturl", (req, res, next) => {
    let str = req.body.url;
  console.log(str)
     let urlValid = isValidUrl(str);
     let urlId = Math.floor(Math.random() * 10000);
    console.log(urlValid)
    
    let urlObj = {
      "original_url": str,
      "short_url": urlId
    }
    if(urlValid){
      const urlModel = new Url(urlObj);
      Url.create(urlModel, function(err, data){
        if(err) return err
      })

      res.send(urlModel)
      console.log(urlObj)
    } else {
      res.send({error: 'invalid url'})
    }

})

app.get("/api/shorturl/:id", (req, res)=> {
  let short = req.params.id;
  console.log(short);
  let link = '';
  let findId = Url.find({"short_url": parseInt(short)}, (err, data) => {
    if (err) return res.send({error: 'invalid url'})
    console.log(data);
    link = data[0].original_url;
    res.redirect(link);
  });

})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
