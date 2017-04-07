var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: "search-course-data-mspkldvllazhgahqqsihmvdzka.us-east-1.es.amazonaws.com",
});

client.indices.exists({
  index: "courses2"
}).then(function(exists) {
   // true = index exisits
   if (exists) {
     populateIndex();
   } else {
     return client.indices.create({
       index: "courses2"
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

  var courses = require("./swat.json");

  var bulkIns = { body: [] };

  for (var n in courses){
    bulkIns.body.push({ index: {
      _index: "courses2",
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
