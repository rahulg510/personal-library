'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var cors        = require('cors');
var helmet      = require('helmet');
var MongoClient = require('mongodb').MongoClient;

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy('PHP 4.2.0'));
const MONGODB_CONNECTION_STRING = process.env.DB;

MongoClient.connect(MONGODB_CONNECTION_STRING,function(err,database){
  if(err) return console.error(err);

  database.db('library').createCollection('books',{
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title"],
        properties:
        {
          title: {
            bsonType: "string"
          }
        }
      }
    }},function(err,db){
      if(err) return console.log(err);
      console.log("Database connection established");
//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app,db);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + 3000);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for unit/functional testing
    })
})