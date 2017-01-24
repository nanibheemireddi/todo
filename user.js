var express = require('express');
var bcrypt = require('bcrypt');
var _ = require('underscore');
var bodyParser = require('body-parser');
var app = express();
var PORT = 8080;
var db = require('./db.js');
var middleware = require('./middleware.js')(db);
var userdetails = [];
var userNextId = 1;
app.use(bodyParser.json());
app.get('/users',middleware.requireAuthentication, function(req,res){
 	var query = req.query;

 	where = {};
 	if (query.hasOwnProperty("un")) {
 		where.surname = {
 			$like: '%' + query.un + '%'
 		};
 	}

 	if(query.hasOwnProperty("email")) {
 		where.email = {
 			$like: "%" + query.email + '%'
 		}
 	}

 	if(query.hasOwnProperty("mobile")) {
 		where.mobile = query.mobile; 
 	}

 	if(query.hasOwnProperty("zip")) {
 		where.Zip = query.zip;
 	}

 	if(query.hasOwnProperty("city")) {
 		where.city = query.city;
 	}

 	if(query.hasOwnProperty("state")) {
 		where.state = query.state;
 	}

 	if(query.hasOwnProperty("country")) {
 		where.country = query.country;
 	}

 	db.userdetail.findAll({where: where}).then(function(users) {
 		if(Object.keys(users).length > 0) {
 			res.json(users);	
 		} else {
 			res.status(404).json({'error' : 'data not found'});
 		}
 	}).catch(function(e) {
 		res.status(500).send(e);
 	});
});
 
app.get('/users/:id',middleware.requireAuthentication, function(req, res){
 	var userid = parseInt(req.params.id, 10);
 	db.userdetail.findById(userid).then(function(user) {
 		if(user) {
 			res.json(user.toJSON());	
 		} else {
 			res.status(404).json({'error' :'data not found'});
 		}
 	},function(e) {
 		res.status(400).send(e);
 	});
});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'surname','email','password','mobile','Zip','city','state','country');
	db.userdetail.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	},function(e) {
		res.status(400).send(e);
	});
});


app.post('/users/login', function(req,res) {
	var body =  _.pick(req.body, 'email', 'password');
	db.userdetail.authenticate(body).then(function(user) {
		res.header('auth', user.generateToken('authentication')).json(user.toPublicJSON());
	}, function() {
		res.status(401).send('authentication failed....');
	});
});


app.delete('/users/:id', function(req, res) {
	var userid = parseInt(req.params.id, 10);
	db.userdetail.destroy({
		where: {
			id: userid
		}
	}).then(function(user) {
		if(user) {
			res.json(user);
		} else {
			res.status(404).json({'error': 'match not found'});
		}
	},function(e) {
		res.status(500).send(e);
	});
});

app.put('/users/:id',middleware.requireAuthentication, function(req, res) {
	var userid = parseInt(req.params.id, 10);
	var body = _.pick(req.body,'surname','email','password','mobile','Zip','city','state','country' );
	var attributes = {};

	if(body.hasOwnProperty("surname")) {
		attributes.surname = body.surname.trim(); 
	}
	if(body.hasOwnProperty("email")) {
		attributes.email = body.email.trim(); 
	}
	if(body.hasOwnProperty("password")) {
		attributes.password = body.password; 
	}
	if(body.hasOwnProperty("mobile")) {
		attributes.mobile = body.mobile; 
	}
	if(body.hasOwnProperty("Zip")) {
		attributes.Zip = body.Zip; 
	}
	if(body.hasOwnProperty("city")) {
		attributes.city = body.city.trim(); 
	}
	if(body.hasOwnProperty("status")) {
		attributes.state = body.status.trim(); 
	}
	if(body.hasOwnProperty("country")) {
		attributes.country = body.country.trim(); 
	}

	db.userdetail.findById(userid).then(function(user) {
		if(user) {
			user.update(attributes).then(function(user) {
				res.json(user.toJSON());
			},function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).json({'error':'not found'});
		}
	},function(e) {
		res.status(500).send(e);
	});
});

db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('express server is started on ' + PORT);
	});
});
