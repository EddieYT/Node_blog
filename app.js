const express = require('express'),
      path = require('path'),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      expressValidator = require('express-validator'),
      flash = require('connect-flash'),
      session = require('express-session'),
      config = require('./config/database'),
      passport = require('passport');

// Conncect to DB
mongoose.connect(config.database);
let db = mongoose.connection;

// Check for db connection/errors
db.once('open', function() {
  console.log('Connect to mongoDb');
});

db.on('error', function(err) {
  console.log(err);
});

// Init App
const app = express();
// Bring in models
let Article = require('./models/article');

// Load the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));


// Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
// Passport config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// Home route
app.get('/', function(req, res) {
    Article.find({}, function(err, articles) {
      if (err) {
        console.log(err);
      } else {
        res.render('index', {
          title: 'A Place to Think Out Loud',
          articles: articles
        });
      }
    });
});

// Route files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

app.listen(8080, function() {
    console.log('Server started on port 8080');
});
