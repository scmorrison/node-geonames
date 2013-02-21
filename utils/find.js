var
	Geonames = require('../index');

var argv = require('optimist')
  .usage('Usage: $0 -d [mongodb://localhost/database] -p "New york"')
  .demand(['d'])
  .alias('d', 'database')
  .describe('d', 'Mongo DB URI, e.g. mongodb://localhost/database')
  .alias('p', 'place')
  .describe('place', 'Place, e.g. New York')  
  .alias('lat', 'lat')
  .describe('lat', 'Latitude')  
  .alias('lon', 'lon')
  .describe('lon', 'Longitude')  
  .argv;

var db = Geonames.connect(argv.database);


if (typeof argv.place == 'string') {
	console.log('******* By Name', argv.place, ' *********');
	/*Geonames.findByName(argv.place, 10, function(err, results) {
		console.log(results);
		process.exit();
	});*/

	Geonames.findByNameAndUTCOffset(argv.place, 1, 10, function(err, results) {
		console.log(results);
		process.exit();
	});
}
else {
	console.log('******* By Coords', argv.lat, argv.lon, ' *********');
	var lat = argv.lat;
	var lon = argv.lon;
	Geonames.findByCoords(-4.79905, 37.92847, 10, function(err, results) {
		console.log(results);
		process.exit();
	});
}	
