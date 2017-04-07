var csv = require("fast-csv");
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

    console.log(esData);
});
