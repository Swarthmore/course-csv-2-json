var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: "search-course-data-mspkldvllazhgahqqsihmvdzka.us-east-1.es.amazonaws.com",
});

client.indices.exists({
  index: "courses"
}).then(function(exists) {
   // true = index exisits
   if (exists) {
     populateIndex();
   } else {
     return client.indices.create({
       index: "courses"
    });
   }
  }, function(reason) {
  // rejection
  console.log(reason);
}).then(function(crated){
   populateIndex();
}, function(reason) {
// rejection
console.log(reason);
});


populateIndex = function(){

  var courses = require("./trico.json");

  var bulkIns = { body: [] };

  for (var n in courses){
    bulkIns.body.push({ index: {
      _index: "courses",
      _type: courses[n]._type,
      _id: courses[n]._id,
    }});
    bulkIns.body.push(courses[n].body);
  }

  client.bulk(bulkIns, function (error, response) {
    console.log("ERROR", error);
    console.log("RESPONSE", response);
  });
};
