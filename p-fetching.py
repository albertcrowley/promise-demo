#!/usr/bin/python
import sqlite3
import urllib
import urllib.request
import json

db_file = 'chinook.db'
sql1 = "SELECT ArtistId, Name from artists limit 5"
url =  "http://jsonplaceholder.typicode.com/todos/"
sql2 = "SELECT Name from tracks where name like '%%%s%%' limit 10"


conn = sqlite3.connect('./chinook.db')
res = conn.execute(sql1)
artists = res.fetchall()
for (id,a) in artists:
    r = urllib.request.urlopen(url + str(id))
    js = r.read()
    title = (json.loads(js))['title']
    word = title.split(' ')[0]
    print ("searching for " + word)

    res = conn.execute( sql2 % (word) )
    names = res.fetchall()
    for n in names:
        print ("Got a match on " + str(n))

