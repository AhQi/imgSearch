// server.js
// where your node app starts

// init project
const httpReq = require('request');
const express = require('express');
const app = express();

var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var db;
var url = 'mongodb://'+process.env.DB_USER_NAME+':'+process.env.DB_USER_PASSWORD+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;

    
MongoClient.connect(url, function (err, dataBase) {

  if (!err) {
    console.log('Connection established to', url);

  } else {
    console.log(err);
  }
  
  db = dataBase;
  var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
    console.log((new Date()).toString());
  });
});




// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) =>{
  
  response.sendFile(__dirname + '/views/index.html');
});

function resultFilter(result){
  return {'url': result.link,
          'snippet': result.snippet,
          'thumbnail': result.image.thumbnailLink,
          'context': result.image.contextLink};
  
}

app.get("/api/lateset/imageSearch", function (request, response) {
  db.collection('searchHistory')
    .find()
    .sort({when:-1})
    .limit(10)
    .project({_id:0})
    .toArray((err, res) => {
      if(!err){
        response.send(res);
      }else{
        throw err;
      }
  });
                                                                        
  
});
app.route("/api/imageSearch/*").get( (request, response) => {
  var curDate = new Date();
  console.log(curDate);
  
  var keyword = request.params[0];
  var displayItem = (request.query.offset >= 1 && request.query.offset <= 10) ? request.query.offset: 10;
  var apiKey = process.env.CSE_API_KEY;
  var srhEngId = process.env.CSE_ENG_ID;
  var searchUrl = 'https://www.googleapis.com/customsearch/v1?searchType=image&key='+apiKey
                  +'&cx='+srhEngId
                  +'&q='+keyword
                  +'&num='+displayItem;
  
  var searchLog = {'term': keyword, 'when': curDate};
  console.log(db);
  
  db.collection('searchHistory').insertOne( searchLog, function(err, res) {
    if(err) {
      console.log("err2");
                
    }
  });
 

  httpReq(searchUrl, { json: true }, (err, res, body) => {
    if (err) { 
      return console.log(err); 
    }
    var result = [];
    
    body['items'].forEach((element) => {
      result.push(resultFilter(element));
    });
    
    
    response.send(result);
  });
  
});


// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// listen for requests :)

