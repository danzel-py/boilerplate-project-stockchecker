'use strict';
require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');



const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();
app.use(helmet.contentSecurityPolicy({
  directives: {
    styleSrc: ["'self'"],
    scriptSrc: ["'self'"]
  }
}))
app.use(helmet.xssFilter())



app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DB;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("stockpricechecker").collection("stocks");
  // perform actions on the collection object

  //For FCC testing purposes
  fccTestingRoutes(app);
  
  //Routing for API 
  apiRoutes(app, collection);  
      
  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
});

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });


//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
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
    }, 3500);
  }
});

module.exports = app; //for testing
