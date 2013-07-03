var 
    Geonames = require('../../.'),
    should = require('should');

Geonames.connect("mongodb://localhost/socialbro_development");

describe("------ Geonames Module: ", function(){

  describe("findByLocation", function(){   
    it("Madrid is ES", function(done){
      Geonames.findByLocation('Madrid', 1, function(err, result) {        
        should.not.exist(err);
        should.exist(result);
        result.country_code.should.be.eql('ES');
        done();
      });
    });

    it("Córdoba is AR", function(done){
      Geonames.findByLocation('Córdoba', -3, function(err, result) {        
        should.not.exist(err);
        should.exist(result);
        result.country_code.should.be.eql('AR');
        done();
      });
    });

    it("Málaga, España is ES", function(done){
      Geonames.findByLocation('Málaga España', 1, function(err, result) {        
        should.not.exist(err);
        should.exist(result);
        result.country_code.should.be.eql('ES');
        done();
      });
    });

    it("Cerca de Córdoba is ES", function(done){
      Geonames.findByLocation('Cerca de Córdoba', 1, function(err, result) {        
        should.not.exist(err);
        should.exist(result);
        result.country_code.should.be.eql('ES');
        done();
      });
    });

    it("New York is US", function(done){
      Geonames.findByLocation('New York', -5, function(err, result) {        
        should.not.exist(err);
        should.exist(result);
        result.country_code.should.be.eql('US');
        done();
      });
    });

    it("New York is US with undefined utc offset", function(done){
      Geonames.findByLocation('New York', undefined, function(err, result) {        
        should.not.exist(err);
        should.exist(result);
        result.country_code.should.be.eql('US');
        done();
      });
    });

 });
});