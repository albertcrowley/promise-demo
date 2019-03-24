const sqlite3 = require('sqlite3').verbose()
const promise_sqlite = require('sqlite')
const http = require('http')
const fetch = require('node-fetch')

const db_file = 'chinook.db'
const sql1 = "SELECT ArtistId, Name from artists limit 5"
const url =  'http://jsonplaceholder.typicode.com/todos/'
const sql2 = "SELECT Name from tracks where name like '%WORD%' limit 10"

function using_callbacks() {
    const db = new sqlite3.Database(db_file);
    db.all(sql1, {}, function (err, rows) {
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

                    db.all(sql2.replace("WORD", word), function (err, rows) {
                        rows.forEach(function (track) {
                            console.log(`      -  (${word}), ${track.Name}`)
                        })
                    });
                });

            })

        })
    });
}

function cleaner_using_callbacks() {
    const db = new sqlite3.Database(db_file);
    db.all(sql1, {}, function (err, rows) {
        rows.forEach(function (artist) {
            http.get(url + artist.ArtistId, function (resp) {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    let title = JSON.parse(data).title
                    let first_word = title.split(" ")[0]
                    db.all(sql2.replace("WORD", first_word), function (err, rows) {
                        rows.forEach(function (track) {
                            console.log(track.Name)
                        })
                    });
                });
            })
        })
    });
}



function using_promises() {
    let db = null;
    promise_sqlite.open(db_file)
        .then ( _db => {
            db = _db
            return db.all(sql1)
        })
        .then( rows => {
            const f = rows.map( row => fetch (url + row.ArtistId))
            return Promise.all(f)
        })
        .then( (fetches) => {
            return (Promise.all( fetches.map( f => f.json()) ))
        })
        .then( jsons => {
            return jsons.map( j => j.title.split(" ")[0])
        })
        .then(words => {
            const queries = words.map( word => db.all(sql2.replace("WORD", word)))
            return Promise.all( queries )
        })
        .then( rows_array => {
            rows_array.map(
                rows => {
                    rows.map( r=> console.log (r.Name))
                })
        })

}


// using_callbacks()
cleaner_using_callbacks()
 using_promises()



