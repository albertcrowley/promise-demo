const sqlite3 = require('sqlite3').verbose()
const promise_sqlite = require('sqlite')
const http = require('http')
const fetch = require('node-fetch')

const db_file = 'chinook.db'
const sql1 = "SELECT ArtistId, Name from artists limit 10"
const url_template =  'http://localhost:3000/artist/:id/word'
const sql2 = "SELECT Name from tracks where name like '%WORD%' limit 10"

function using_callbacks() {
    const db = new sqlite3.Database(db_file);
    db.all(sql1, {}, function (err, rows) {
        rows.forEach(function (artist) {
            console.log(artist.ArtistId + ": " + artist.Name);
            http.get(url_template.replace(':id', artist.ArtistId), function (resp) {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    let result = JSON.parse(data);

                    let word = result.word

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
            http.get(url_template.replace(':id', artist.ArtistId), function (resp) {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    let word = JSON.parse(data).word
                    db.all(sql2.replace("WORD", word), function (err, rows) {
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
    p = promise_sqlite.open(db_file)
        .then ( _db => {
            db = _db
            return db.all(sql1)
        })
        .then( rows => {
            console.log("number of rows returned:", rows.length)
            const f = rows.map( row => {
                const url = url_template.replace(':id', row.ArtistId)
                console.log ("fetching url", url)
                return fetch (url)
            })
            return Promise.all(f)
        })
        .then( (fetches) => {
            return (Promise.all( fetches.map( f => f.json()) ))
        })
        .then( jsons => {
            return jsons.map( json => json.word)
        })
        .then(words => {
            console.log ("top words",words)
            const queries = words.map( word => db.all(sql2.replace("WORD", word)))
            return Promise.all( queries )
        })
        .then( rows_array => {
            rows_array.map(
                rows => {
                    rows.map( r=> console.log (r.Name))
                })
        })
        .catch( err => {

        })
}

function no_cheat_promise() {
    let db = null;
    promise_sqlite.open(db_file)
        .then ( _db => {
            db = _db
            return db.all(sql1)
        })
        .then( rows => {
            console.log("number of rows returned:", rows.length)
            for (let artist of rows) {
                const url = url_template.replace(':id', artist.ArtistId)
// A
                Promise.all([fetch(url)])
                    .then( ([result]) => Promise.all( [result.json()]) )
                    .then( ([json]) => Promise.all( [json.word, artist]))
                    .then( ([word, artist]) =>Promise.all( [db.all(sql2.replace("WORD", word)), artist])  )
                    .then( ([rows,artist]) => {
                        for (r2 of rows) {
                            console.log ("Artist:", artist, "\tTrack:", r2.Name)
                        }
                    } )

            }
        })

}


// using_callbacks()
//  cleaner_using_callbacks()
// using_promises()
no_cheat_promise()


