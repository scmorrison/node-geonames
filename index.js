var 
	mongoose = require('mongoose'),
	Geoname = require('./models/Geoname');

function Geonames() {
}
module.exports = new Geonames();

Geonames.prototype.connect = function(mongodb) {
	return mongoose.connect(mongodb);
}

Geonames.prototype.findByName = function(name, limit, cb) {
	Geoname.findByName(name, limit, cb);	
}

Geonames.prototype.findByNameAndUTCOffset = function(name, UTCOffset, limit, cb) {
	Geoname.findByNameAndUTCOffset(name, UTCOffset, limit, cb);
}

Geonames.prototype.findByCoords = function(lon, lat, limit, cb) {
	Geoname.findByName(name, limit, cb);	
}