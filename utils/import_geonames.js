var
	mongoose = require('mongoose'),
	async = require('async'), 	
	Geoname = require('../models/geoname.js');

var argv = require('optimist')
  .usage('Usage: $0 -f [geonamesFile] -d [mongodb://localhost/database] -r false')
  .demand(['f', 'd', 'r'])
  .alias('f', 'file')
  .describe('f', 'Path to a Geonames data, e.g. /tmp/AllCountries.txt')
  .alias('d', 'database')
  .describe('d', 'Mongo DB URI, e.g. mongodb://localhost/database')
  .alias('r', 'reset')
  .describe('r', 'Where to clean the database before importing, use true to clean it')  
  .argv;

var db = mongoose.connect(argv.database);

function doImport(err) {
	if (err) {
		console.log(err);
		process.exit();
	}

	mongoose.model('Geoname').doImport(argv.file, function(err, count, imported) {
		if (err) console.log(err);
		console.log('Number of names imported: ' + count);
		process.exit();
	});
}	

if (argv.reset === 'true') { mongoose.model('Geoname').remove(doImport); } else doImport();
