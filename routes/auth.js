const express = require('express'),
	router = express.Router(),
	passport = require('passport');

router.get('/steam',
	passport.authenticate('steam', { failureRedirect: '/' }),
	function (req, res) {
		res.redirect('/');
	});

router.get('/steam/return',
	function (req, res, next) {
		req.url = req.originalUrl;
		console.log("------ res --------", res.body)
		next();
	},
	passport.authenticate('steam', { failureRedirect: '/' }),
	function (req, res) {
		console.log("==== res ====", res.req.user)
		res.redirect(`${process.env.APP_BASE_URL}/?id=${res.req.user.id}&name=${res.req.user.displayName}&avatar=${res.req.user.photos[1].value}`);
	});

module.exports = router;