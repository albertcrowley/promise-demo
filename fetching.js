var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('chinook.db');
const http = require('http');
const url =  'http://jsonplaceholder.typicode.com/todos/'


function using_callbacks() {
    db.all("SELECT * from artists limit 25", {}, function (err, rows) {

        rows.forEach(function (artist) {
            console.log(artist.ArtistId + ": " + artist.Name);
            http.get(url + artist.ArtistId, function (resp) {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    let result = JSON.parse(data);

                    let word = result.title.split(" ")[0]

                    console.log("   - ", word)

                    db.all(`SELECT * from tracks where name like '%${word}%' limit 5`, function (err, rows) {
                        rows.forEach(function (track) {
                            console.log(`      -  (${word}), ${track.Name}`)
                        })
                    });
                    // db.each(`SELECT * from tracks where name like '%${word}%' limit 5`, function(err, track) {
                    //
                    //     console.log (`      -  (${word}), ${track.Name}`)
                    // });

                });

            })

        })
    });
}




using_callbacks();



