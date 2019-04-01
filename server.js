const sqlite = require('sqlite')
const db_file = 'chinook.db'

const password = "fjehjdie23!"

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

app.listen(port);

function mode(arr){
    return arr.sort((a,b) =>
        arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}

const boring_words = [
    'the', 'i', 'a', 'an', 'so', 'man', 'love',
    'it', 'me', 'you', 'of', 'in', 'pt.', 'man',
    'to', 'it']

app.route('/artist/:id/word')
    .get( (req,res) => {
        const sql = "select tracks.Name from tracks " +
            "join albums on tracks.AlbumId = albums.AlbumId " +
            "join artists on artists.ArtistId = albums.ArtistId " +
            "where artists.ArtistId = '" + req.params.id + "'"

        sqlite.open(db_file)
            .then ( db => {
                return db.all(sql)
            })
            .then ( (names) => {
                let all_titles = names.map( row => row.Name)
                let all_words = ["start"]
                for (t of all_titles) {
                    all_words = all_words.concat(t.split(" "));
                }

                let good_words = all_words.filter( w => ! boring_words.includes(w.toLowerCase()))

                setTimeout(
                    () =>  res.json( { "word" : mode (good_words)}),
                    1000)
            })
    });

console.log('RESTful API server started on: ' + port);
