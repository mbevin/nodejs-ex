require('./common.js');

//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var compression = require('compression');
app.use(compression());

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

function getQ(req, defaultLimit) {

  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }

  if (db) {
    var col = db.collection('stats');
    let limit = req.query.limit;
    if(!limit) {
      if(defaultLimit) {
        limit = defaultLimit;
      }
    }

    var q;

    let query = {};
    let doQuery = false;
    let installID = req.query.installID;
    if(installID) {
      query.installID = installID;
      doQuery = true;
    }
    let debugBuild = req.query.debugBuild;
    if(debugBuild) {
      query.debugBuild = debugBuild;
      doQuery = true;
    }
    let guid = req.query.guid;
    if(guid) {
      query.guid = guid;
      doQuery = true;
    }
    let puzzleN = req.query.puzzleN;
    if(puzzleN) {
      query.puzzleN = puzzleN;
      doQuery = true;
    }

    if(doQuery) {
      q = col.find(query).sort({_id:-1})
    }
    else {
      q = col.find().sort({_id:-1})
    }
    if(limit) {
      q = q.limit(limit);
    }
    return q;
  }
  return undefined;
}
app.get('/', function (req, res) {  
  q = getQ(req, 50);
  if(q) {
    q.toArray(function(err,result, docs) {
      if(err){
        res.send(err);
      }
      else {
        col.count({}, function(err, numDocs) {
          if(err) {
            res.send(err);
          }
          else {
            // Create a document with request IP and current time of request
            // col.insert({ip: req.ip, date: Date.now()});
            res.render('index.html', { dbInfo: dbDetails, dbLatest: result, dbNumItems: numDocs });
          }
        });
      }
    });

  } else {
    res.render('index.html', { dbLatest: null, dbNumItems: null });
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

var bodyParser = require('body-parser')
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// dump not pretty-printed with default no limit ....  
app.get('/dumpall', function (req, res) {
  app.set('json spaces', 0);
  q = getQ(req);

  if(q) {
    q.toArray(function(err,result, docs) {
      if(err){
        res.send(err);
      }
      else {
        //res.send(prettyPrint(result));
        res.json(result); 
      }
    });
  } else {
     res.send('fail - no DB.');
  }
});


// dump pretty-printed with default limit of 1000 results ....  
app.get('/dumpp', function (req, res) {
  app.set('json spaces', 3);
  q = getQ(req, 1000);

  if(q) {
    q.toArray(function(err,result, docs) {
    //col.find().toArray(function(err,result, docs) {
      if(err){
        res.send(err);
      }
      else {
        //res.send(prettyPrint(result));
        res.json(result); 
      }
    });
  } else {
     res.send('fail - no DB.');
  }
});

app.post('/stats', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  
  // convert from whatever it is we're getting from the app to a JSON object .............
  var b = req.body;
  var keys = Object.keys(b);
  console.log("Body keys: " + keys);
  console.log("Body keys sz: " + size(keys));
  if(size(keys) == 1) {
    b = keys[0];
    b = JSON.parse(b);
  }
  /*
  console.log("Body keys: " + Object.keys(b));
  console.log("Body is: " + prettyPrint(b)); 

  b = JSON.stringify(b);
  b = JSON.parse(b).data;
  */
  console.log("Body2 is: " + prettyPrint(b));
  
  //b = JSON.parse(b);
  /*
  // what we're receiving from app seems to come as a string rather than JSON ....?
  if(typeof b == 'string') {
    console.log("Body is string - trying to unescape + parse ......");
    //b = unescape(b);
    b = JSON.parse(b);
  }
  else {
    console.log("Body is not a string ......");
  }
  //b = eval("(" + b + ")");
  */
  console.log("Parsed body is: " + prettyPrint(b));

  var clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  b.date = new Date();
  b.clientIP = clientIP;

  console.log("ClientIP: " + clientIP);
  console.log("Received stats: " + prettyPrint(b));

  if (db) {
    var col = db.collection('stats');
    col.insertOne(b, (err, result) => {
      res.send("success, data: " + prettyPrint(b));
    });
  } else {
    res.send('fail - no DB. data: ' + prettyPrint(b));
  }
});


// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
