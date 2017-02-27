// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var pdf = require('express-pdf');

mongoose.connect('mongodb://romanalesenkov:12345678@ds157509.mlab.com:57509/users-app'); // connect to our database

var User     = require('./app/models/user');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(pdf);

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');

    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// on routes that end in report
// ----------------------------------------------------
router.route('/reports/users')

// create a bear (accessed at POST http://localhost:8080/api/users)
    .get(function(req, res) {

        User.find(function(err, users) {
            if (err)
                return res.send(err);

            var usersListHTML = users.map(function(user){
                return '<li>' + user.firstName + ' ' + user.lastName + '</li>';
            }).join('');
            var currentDate = new Date();
            var currentDateFormatted = currentDate.getUTCDate() + '-' + currentDate.getUTCMonth() + 1 + '-' + currentDate.getUTCFullYear();

            var htmlContent = '<html><body><center><h1>List of users</h1> <small>' + currentDateFormatted + '</small></center><ol>' + usersListHTML + '</ol></body></html>';
            res.pdfFromHTML({
                filename: 'users_' + currentDateFormatted + '.pdf',
                htmlContent: htmlContent,
                options: {}
            });
        });
    });

// on routes that end in /users
// ----------------------------------------------------
router.route('/users')

// create a bear (accessed at POST http://localhost:8080/api/users)
    .post(function(req, res) {
        var user = new User();      // create a new instance of the User model
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.age = req.body.age;
        user.sex = req.body.sex;
        user.city = req.body.city;
        user.income = req.body.income;

        // save the user and check for errors
            user.save(function(err) {
                if (err) {
                    res.send(err);
                }
                res.json({ message: 'User created!' });
            });
    })

    // get all the users (accessed at GET http://localhost:8080/api/users)
    .get(function(req, res) {
        User.find(function(err, users) {
            if (err)
                return res.send(err);

            res.json(users);
        });
    });

// on routes that end in /user/:user_id
// ----------------------------------------------------
router.route('/user/:user_id')

// get the user with that id (accessed at GET http://localhost:8080/api/user/:user_id)
    .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                return res.send(err);
            res.json(user);
        });
    })

    // update the user with this id (accessed at PUT http://localhost:8080/api/user/:user_id)
    .put(function(req, res) {

        // use our user model to find the user we want
        User.findById(req.params.user_id, function(err, user) {

            if (err)
                return res.send(err);

            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.age = req.body.age;
            user.sex = req.body.sex;
            user.city = req.body.city;
            user.income = req.body.income;

            // save the bear
            user.save(function(err) {
                if (err)
                    return res.send(err);

                res.json({ message: 'User updated!' });
            });

        });
    })

    // delete the user with this id (accessed at DELETE http://localhost:8080/api/user/:user_id)
    .delete(function(req, res) {
        User.remove({
            _id: req.params.user_id
        }, function(err, user) {
            if (err)
                return res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });



// on routes that end in /bears
// ----------------------------------------------------
router.route('/bears')

    // create a bear (accessed at POST http://localhost:8080/api/bears)
    .post(function(req, res) {
        var bear = new Bear();      // create a new instance of the Bear model
        bear.name = req.body.name;  // set the bears name (comes from the request)
        // save the bear and check for errors
        bear.save(function(err) {
            if (err) {
                return res.send(err);
            }
            res.json({ message: 'Bear created!' });
        });
    })

    // get all the bears (accessed at GET http://localhost:8080/api/bears)
    .get(function(req, res) {
        Bear.find(function(err, bears) {
            if (err)
                return res.send(err);

            res.json(bears);
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);