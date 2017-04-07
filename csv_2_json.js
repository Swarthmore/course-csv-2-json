var csv = require("fast-csv");
var fs = require("fs");
var path = require('path');

//realative path to the csv file to parse
var csvFile = "./SWAT_TriCoGuide.csv";
//define the header row for the CSV (this will be object keys)
var headerRow = [
  'Campus',
  'Semester',
  'ID',
  'Program',
  'Prefix',
  'Code',
  'Section',
  'Name',
  'Credit',
  'Schedule',
  'Location',
  'Day',
  'Time',
  'Building',
  'Room',
  'LabInfo',
  'Instructor',
  '',
  'ExtendedInfo',
  'URL',
  '',
  '',
  '',
  '',
  '' ];

var courseData = [];
var multiValued = {};

csv.fromPath(csvFile, {headers : headerRow, delimiter: '\t'}).on("data", function(data){
  delete data[''];
  courseData.push(data);
  //remember the multivalued items, parsed into arrays later
  for (var key in data){
    if (data[key].search(/<br\/?>|\|/) != -1){
      multiValued[key] = true;
    }
  }
}).on("end", function(){
  var reduceArray = true;
  for (var i in courseData){
    //split the multivalued items into arrays
    for (var key in multiValued){
      reduceArray = true;
      courseData[i][key] = (courseData[i][key].length) ? courseData[i][key].split(/<br\/?>|\|/) : [];
      //check to see if all values in the array are unique. If so, reduce to a single value
      if (courseData[i][key].length > 1 ){
        for (var i2 = 1; i2 < courseData[i][key].length; i2++) {
          if (courseData[i][key][i2] !== courseData[i][key][0])
            reduceArray = false;
            break;
        }
        if (reduceArray){
          courseData[i][key] = [ courseData[i][key][0] ];
        }
      }
    }
  }
  //todo save output to file
  //console.log(courseData);

  //transform this data into the desired format
  let esData = [];
  let campusName, courseId;
  courseData.forEach(function(course){
    switch (course.Campus){
      case "B":
        campusName = "Bryn Mawr";
        break;
      case "H":
        campusName = "Haverford";
        break;
      case "S":
      default:
        campusName = "Swarthmore";
        courseId = [campusName, course.Prefix, course.Code].join(" ").replace(/\s+/g, "_");
        break;
    }
    console.log(course.Semester);
    console.log(courseId);
    esData.push({
            _index: 'courses',
            _type: 'course',
            _id: courseId,
            body: {
              "campus": campusName,
              "program": course.Program,
              "semester": course.Semester,
              "courseNumber": [course.Prefix, course.Code].join(" "),
              "name": course.Name,
              "description": course.ExtendedInfo,
              "instructor": course.Instructor,
              "day": course.Day,
              "time": course.Time
            }
          });
  });


  //write the json data file
  writeJSON(esData, "swat.json");

});

function writeJSON(data, fileName){
  var dataFile = path.join(__dirname, fileName);
  var writeFile = false;
  fs.stat(dataFile, function (err, stats){
    if (err){
      writeFile = true;
    } else {
      try {
        var oldData = require(dataFile);
        writeFile = !myObjCompare(oldData, data);
      } catch (e){
         writeFile = true;
      }
    }
    if (writeFile){
      fs.writeFile(dataFile, JSON.stringify(data), function(err) {
        if (err) {
          console.log("Error writing to file " + dataFile + ": " + err.message);
        }
        console.log("Data file, " + dataFile + ", was just updated");
      });
    }
  });
}
