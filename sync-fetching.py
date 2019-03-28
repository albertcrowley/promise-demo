#!/usr/bin/python
import sqlite3
import urllib
import urllib.request
import json

db_file = 'chinook.db'
sql1 = "SELECT ArtistId, Name from artists limit 10"
url =  "http://localhost:3000/artist/%s/word"
sql2 = "SELECT Name from tracks where name like '%%%s%%' limit 10"

# Step 1 - Query a list of artist IDs and Names from the database
# Step 2 - Read from a slow API to get most common words from that artists song titles
# Step 3 - Query the database for all song titles that have that common word


conn = sqlite3.connect('./chinook.db')
res = conn.execute(sql1)
artists = res.fetchall()
for (id,a) in artists:
    r = urllib.request.urlopen(url % str(id))
    js = r.read()
    title = (json.loads(js))['word']
    word = title.split(' ')[0]
    print ("searching for " + word)

    res = conn.execute( sql2 % (word) )
    names = res.fetchall()
    for n in names:
        print ("Got a match on " + str(n))

