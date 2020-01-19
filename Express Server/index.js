// Import required modules for this express server
const express = require("express");
const bodyParser = require("body-parser");

// cors module required to enable Cross Origin requests
const cors = require('cors');

// Pool used instead of client to prevent crash due to heavy load resulting
// out of multiple queries made to the database
const { Pool } = require('pg');

// Details of the Database connection
const pool = new Pool({
  user: 'spriy',
  host: 'localhost',
  database: 'test',
  password: 'priyanshu',
  port: 5432,
});

const restService = express();

restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

restService.use(cors());
restService.use(bodyParser.json());


// Webhook for serving requests from Dialogflow interface


restService.post("/dialogflow", function(req, res) {
  var speech = "Thanks for reaching out to The Cyber Cell. Appropriate action will be taken soon.";
    // req.body.queryResult &&
    // req.body.queryResult.parameters &&
    // req.body.queryResult.parameters.loc
    // ? "Thanks for reaching out to The Cyber Cell. Appropriate action will be taken soon." // req.body.queryResult.parameters.echoText
    //  : "Seems like some problem. Speak again.";
  var name = "'" + req.body.queryResult.parameters.name + "'";
  var site = ", '" + req.body.queryResult.parameters.site + "'";
  var location = ", '" + req.body.queryResult.parameters.location + "'";
  var date = ", '" + req.body.queryResult.parameters.date.substr(0,10) + "'";
  var age = ", '" + req.body.queryResult.parameters.age + "'";
  var gender = ", '" + req.body.queryResult.parameters.gender + "'";
  gender = gender.toLowerCase();
  site = site.toLowerCase();
  if(gender === ", 'female'" || gender === ", 'f'") gender = ", 'Female'";
  if(gender === ", 'male'" || gender === ", 'm'") gender = ", 'Male'";
  if(site === ", 'insta'") site = ", 'Instagram'";
  if(site === ", 'fb'") site = ", 'Facebook'";
  // console.log(ques + plat + locn);

  // payload variable
	var dtemp = {
	    "google": {
	      "expectUserResponse": true,
	      "richResponse": {
	        "items": [
	          {
	            "simpleResponse": {
	              "textToSpeech": speech,
	            }
	          }
	        ]
	      }
	    },
	    "facebook": {
	      "expectUserResponse": true,
	      "richResponse": {
	        "items": [
	          {
	            "simpleResponse": {
	              "textToSpeech": speech,
	            }
	          }
	        ]
	      }
	    },
	  };

  // Time lag introduced to process query after response to the interface is sent
  setTimeout(function(){
  	var q = "Insert into data values(" + name + site + location + date + age + gender + ");";
    pool.query(q, (err, res) => {
      if(err) console.log(err);
      else console.log(name + site + location + date + age + gender + ", entered successfully!");
    });
  }, 1000);
  return res.json({
    "payload": dtemp,
    "data": dtemp,
    "fulfillmentText": speech,
    "speech": speech,
    "displayText": speech,
    "source": "AnantVijay-Team"
  });
});



// Serving analytics interface here
//----------------------------------------------------------------------------//
var QuestionData = [];
restService.get("/analytics", function(req, res) {

  pool.query("SELECT * from data;", (err, resq) => {
    if(err) console.log(err);
    else {
      QuestionData = resq.rows;
    }
  });

  setTimeout(function() {
    return res.json({
        details: QuestionData,
      });
  }, 1000);
});

restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});
