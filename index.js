var 
	mongoose = require('mongoose'),
	async = require('async'),
	Geoname = require('./models/Geoname');

function Geonames() {
}
module.exports = new Geonames();

function getWords(s) {
  if (s) {	
  	var a = s.split(/[ \f\n\r\t\v\u00A0\u201C\u201D\u2026\u003F\u00BF\u007E\u2028\u2029\u201C\u201D.,:;¡\¿\?\!\-\_\\\/\(\)\"\'\&\~\^]+/);
  }	
  return s ? a : [];
}

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
	Geoname.findByCoords(lon, lat, limit, cb);
}

Geonames.prototype.findByLocation = function(location, utc_offset, cb) {
	var coords = location.match(/(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)/);

	if (coords && coords.length == 5) {
		console.log('>> By Coords');
		Geoname.findByCoords(parseFloat(coords[3]), parseFloat(coords[1]), 1, function(err, results) {
			if (err) return cb(err);
			console.log(' ---', location, results);
			if (results && results.length > 0) {
				cb(null, results[0]);
			}
			else cb();
		});
	}
	else {
		var winners = [];
		var winnersByName = [];
		var found = false;
		var words = getWords(location);
		if (words.length != 1) words.push(location); //Add the full location as a possible place
		if (words.length > 2) { 
			//Generate consecutives word couples
			var total = words.length - 1;
			for (var i = 0; i < total; i++) {
				words.push(words[i] + ' ' + words[i + 1]);
			}
		} 
		async.forEachSeries(words, function(location, next) {
			if (utc_offset !== undefined) {
				Geoname.findByNameAndUTCOffset(location, utc_offset, 1, function(err, results) {
					if (err) return next(err);
					if (results && results.length > 0) {
						console.log(' >> By UTC Offset ', results[0]);
						winners.push(results[0]);
						found = true;
						winnersByName = []; //ignore winners found by name
						next();
					}
					else if (!found) { //consider by name only if utc offset don't match anything
						Geoname.findByName(location, 1, function(err, results) {
							if (err) return next(err);
							if (results && results.length > 0) {
								console.log(' >> By Name ', results[0]);
								winnersByName.push(results[0]);
							}
							next();
						});
					}
					else next();	
				});
			}
			else {
				Geoname.findByName(location, 1, function(err, results) {
					if (err) return next(err);
					if (results && results.length > 0) {
						console.log(' >> By Name ', results[0]);
						winners.push(results[0]);
					}
					next();
				});			
			}					
		}, function(err) {
			if (err) return cb(err);
			winners = winners.concat(winnersByName);
			if (winners.length > 0) {
				//Sort winners by population ASC
				winners.sort(function(a,b) {
					return a.population - b.population;
				});
				return cb(null, winners[0]);
			}
			else return cb();
		});
	}
}
