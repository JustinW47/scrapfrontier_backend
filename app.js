const express = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	session = require('express-session'),
	SteamStrategy = require('passport-steam').Strategy,
	authRoutes = require('./routes/auth'),
	appRoutes = require('./routes/app'),
	apiRoutes = require('./routes/api'),
	User = require('./models/user')

require('dotenv').config()
var cors = require('cors')
const { addDefaultUser } = require('./db/initialize');

const db = require("./db");

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once('open', async () => {
	console.log('Connected to MongoDB');

	// try {
	// 	// Add default user data
	// 	await addDefaultUser();
	// } catch (error) {
	// 	console.error('Error initializing database:', error);
	// }
});


//Determine data to be stored in session
passport.serializeUser(function (user, done) {
	//save JSON data to session
	done(null, user._json);
});

//Match session data with DB data and parse
passport.deserializeUser(function (obj, done) {
	//Search DB for user with session's steam ID
	console.log("------ steam obj ------", obj)
	User.findOne({ steam_id: obj.steamid },
		(err, user) => {
			//Fetched object is attached to request object (req.user)
			done(err, user);
		});
});

//Specify Passport authentication strategy (Steam)
passport.use(new SteamStrategy({
	returnURL: `${process.env.BACKEND_BASE_URL}/auth/steam/return`,
	realm: process.env.BACKEND_BASE_URL,
	apiKey: process.env.STEAM_API_KEY
}, function (identifier, profile, done) {
	//Check if user exists in DB
	console.log("----- identifier --------", identifier)
	console.log("----- profile --------", profile)
	User.findOne({ steam_id: profile.id }, function (err, user) {
		// if (err) 
		// {

		// } 
		if (!user) {
			//User does not exist, define new user
			var newUser = User({
				steam_id: profile.id,
				username: profile.displayName,
				photo_url: profile.photos[2].value
			});
			//Save new user to DB
			newUser.save(function (err) {
				if (err) {
					console.log('Error : ', err)
					throw err;
				}
				console.log('New user ' + profile.displayName + '[' + profile.id + '] created');
			});
		}
	});
	profile.identifier = identifier;
	return done(null, profile);
}));

const app = express();
var corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))

//Initialise session
app.use(session({
	secret: 's3cr3tStr1nG',
	saveUninitialized: false,
	resave: true
}));

//Authentication middleware
app.use(passport.initialize());
app.use(passport.session());

//Point to static asset directory
app.use(express.static('public'));

//Define routes
app.use('/', appRoutes);
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

//Start server
app.listen(process.env.PORT, function () {
	console.log('Listening on port ' + process.env.PORT);
});