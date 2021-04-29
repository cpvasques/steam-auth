var express = require('express'),
	helmet = require('helmet'),
	passport = require('passport'),
	cors = require('cors'),
	util = require('util'),
	session = require('express-session'),
	SteamStrategy = require('./lib/passport-steam').Strategy;

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

passport.use(
	new SteamStrategy(
		{
			returnURL: 'http://localhost:3000/auth/steam/return',
			realm: 'http://localhost:3000/',
			apiKey: 'suaApiKeySTEAM',
		},
		function (identifier, profile, done) {
			process.nextTick(function () {
				profile.identifier = identifier;
				return done(null, profile);
			});
		}
	)
);

var app = express();
app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));

app.use(cors());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(
	session({
		secret: 'your secret',
		name: 'name of session id',
		resave: true,
		saveUninitialized: true,
	})
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../../public'));

app.get(
	'/auth/steam',
	passport.authenticate('steam', { failureRedirect: '/' }),
	function (req, res) {
		return res.json(res);
	}
);

app.get(
	'/auth/steam/return',
	passport.authenticate('steam', { failureRedirect: '/' }),
	function (req, res) {
		let json = {
			id: res.req.user.id,
			displayName: res.req.user.displayName,
			photos: res.req.user.photos[2],
		};

		json = encodeURIComponent(JSON.stringify(json));

		res.redirect(`http://localhost:8080/${json}`);
	}
);

app.listen(3000);

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}
