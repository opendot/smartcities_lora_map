console.log("exportdata");

var fs = require('fs');


const MongoClient = require('mongodb').MongoClient;
const mongoUrl = "mongodb://dot:d0td0t@195.206.7.232:27017/dotdot";

var json2csv = require('json2csv');
// var fields = ['field1', 'field2', 'field3'];

var run = function () {
    MongoClient.connect(mongoUrl, function (error, db) {
        console.log("1");
        var rez = db.collection('dataset').find();
        rez.toArray(function (error2, array) {
            console.log(array.length);
            try {
                var result = json2csv({
                    data: array //, fields: fields
                });
                console.log(result);

                fs.writeFile("data/dump.csv", result);

            } catch (err) {
                console.error(err);
            }

            db.close();
        });
    });
}

run();
