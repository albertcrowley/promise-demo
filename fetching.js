const sqlite3 = require('sqlite3').verbose()
const promise_sqlite = require('sqlite')
const http = require('http')
const fetch = require('node-fetch')

const db_file = 'chinook.db'
const sql1 = "SELECT ArtistId, Name from artists limit 10"
const url_template =  'http://localhost:3000/artist/:id/word'
const sql2 = "SELECT Name from tracks where name like '%WORD%' limit 10"

 // Step 1 - Select 10 artist IDs and Names from the database
 // Step 2 - Read from a slow API to get most common word from that artist's song titles
 // Step 3 - Query the database for all song titles that have that common word


function print_artist_result(rows, artist, word) {
    console.log (``)
    console.log (`The most common word in ${artist}'s songs is ${word}`)
    console.log (`searching for '${word}' from the web API` )
    console.log (`Here are other songs with that word in the title:`)

    for (r2 of rows) {
        console.log (`  - ${r2.Name}`)
    }

}

function using_callbacks() {
    console.log ('using callbacks')
    const db = new sqlite3.Database(db_file);
    db.all(sql1, {}, function (err, rows) {
        //? rows = [ {ArtistID : 1, Name : 'Adam Ant'} , {ArtistID : 2, Name : 'Bon Jovi'}, .... ]
        rows.forEach(function (artist) {
            http.get(url_template.replace(':id', artist.ArtistId), function (resp) {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    let result = JSON.parse(data); //? { word: 'love' }
                    db.all(sql2.replace("WORD", result.word), function (err, rows) {
                        //? rows = [ {Name: 'track 1'} , {Name: 'track 2', ....}
                        print_artist_result(rows, artist.Name, result.word)
                    });
                });

            })

        })
    });
}

// function cleaner_using_callbacks() {
//     console.log ('using cleaner callbacks')
//     const db = new sqlite3.Database(db_file);
//     db.all(sql1, {}, function (err, rows) {
//         rows.forEach(function (artist) {
//             http.get(url_template.replace(':id', artist.ArtistId), function (resp) {
//                 let data = '';
//                 resp.on('data', (chunk) => {
//                     data += chunk;
//                 });
//                 resp.on('end', () => {
//                     let word = JSON.parse(data).word
//                     db.all(sql2.replace("WORD", word), function (err, rows) {
//                         print_artist_result(rows, artist.Name, word)
//                     });
//                 });
//             })
//         })
//     });
// }



function using_promises() {
    let db = null;
    p = promise_sqlite.open(db_file)
        .then ( _db => {
            db = _db
            return db.all(sql1)
        })
        .then( rows => {
            const f = rows.map( row => {
                const url = url_template.replace(':id', row.ArtistId)
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
            console.log (err)
        })
}

async function using_fewer_promises() {
    let db = null;
    db = await promise_sqlite.open(db_file)
    db.all(sql1)
      .then( rows => {
          console.log("number of rows returned:", rows.length)
          const f = rows.map( row => {
              const url = url_template.replace(':id', row.ArtistId)
              console.log ("fetching url", url)
              let aathing = row.Name
              return fetch (url)
          })
          return Promise.all(f)
      })
      .then( async (fetches) => {
          let words = []
          for (f of fetches) {
              let result = await f.json()
              words.push( result.word )
          }
          console.log ("top words",words)
          const queries = words.map( word => db.all(sql2.replace("WORD", word)))
          return Promise.all( queries )
      })
      .then( rows_array => {
          console.log ("Artist", row)
          for (r of rows_array) {
              console.log (r.Name)
          }
      })
      .catch( err => {
          console.log (err)
      })
}


async function no_cheat_promise() {
    console.log ("using promises")
    db = await promise_sqlite.open(db_file)
    db.all(sql1)
        .then( rows => {
            for (let artist of rows) {
                const url = url_template.replace(':id', artist.ArtistId)
                fetch(url)
                    .then( result => result.json() )
                    .then( json  => json.word )
                    .then( word => Promise.all( [db.all(sql2.replace("WORD", word)), word ]) )
                    .then( ([rows, word]) => print_artist_result(rows, artist.Name, word) )
                    .catch(error => console.log(error))
            }
        })
}


// using_callbacks()
//  cleaner_using_callbacks()
// using_fewer_promises()
// using_promises()
no_cheat_promise()


