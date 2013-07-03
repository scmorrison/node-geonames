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
		//console.log('>> By Coords');
		Geoname.findByCoords(parseFloat(coords[3]), parseFloat(coords[1]), 1, function(err, results) {
			if (err) return cb(err);
			//console.log(' ---', location, results);
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
		words = words.slice(0, 3);
		if (words.length > 2) { 
			//Generate consecutives word couples
			var locations = words.slice(0, 3);

			var i = 0;
			locations.push(location);  //Add the full location as a possible place
			async.forEachSeries(words, function(word, next) {
				if (i == words.length - 1) return next();
				locations.push(words[i] + ' ' + words[i + 1]);
				i++;
				return next();
			}, function() {
				processLocations(locations);
			});
		}
		else {
			if (words.length > 1) words.push(location); //Add the full location as a possible place
			processLocations(words);
		} 

		function processLocations(locations) {
			//console.log('locations', locations);
			async.forEachSeries(locations, function(location, next) {
				if (utc_offset !== undefined) {
					Geoname.findByNameAndUTCOffset(location, utc_offset, 1, function(err, results) {
						if (err) return next(err);
						if (results && results.length > 0) {
							//console.log(' >> By UTC Offset ', results[0]);
							winners.push(results[0]);
							found = true;
						}
						Geoname.findByName(location, 1, function(err, results) {
							if (err) return next(err);
							if (results && results.length > 0) {
								//console.log(' >> By Name ', results[0]);
								winnersByName.push(results[0]);
							}
							next();
						});
					});
				}
				else {
					Geoname.findByName(location, 1, function(err, results) {
						if (err) return next(err);
						if (results && results.length > 0) {
							//console.log(' >> By Name ', results[0]);
							winners.push(results[0]);
						}
						next();
					});			
				}					
			}, function(err) {
				if (err) return cb(err);
				async.series([
					function stepFilterWinnersByName(callback) {
						//console.log('stepFilterWinnersByName', winnersByName.length);
						if (!found || winnersByName.length == 0) return callback();
						//If found someone by UTC offset then add only countries without offset info
						async.filter(winnersByName, function(place, next) {
							return next(null, place.offset_raw === null);
						}, function(results) {
							winnersByName = results;
							callback();
						});
					},
					function stepConcatWinnersByName(callback) {
						//console.log('stepConcatWinnersByName');
						if (winnersByName.length == 0) return callback();
						//console.log('winners', winners, winnersByName);

						async.contact(winners, function(winner, next) {
							return next(null, winner); 
						}, function(err, results) {
							winners = results;
							return callback();
						});
					},
					function stepSortWinners(callback) {
						//console.log('stepSortWinners');
						if (winners.length == 0) return cb();
						//Sort winners by population DESC
						async.sortBy(winners, function(item, next) {
								return next(null, -1 * item.population);
						}, function(err, results) {
							return cb(err, results[0]);
						});
					}
				]);
			});
		}
	}
}
