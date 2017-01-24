var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/data/user-api.sqlite'
});

db = {};

db.userdetail = sequelize.import(__dirname + '/models/use.js')
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;