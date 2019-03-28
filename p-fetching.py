#!/usr/bin/python
import sqlite3
import urllib
import urllib.request
import json
import asyncio

db_file = 'chinook.db'
sql1 = "SELECT ArtistId, Name from artists limit 10"
url =  "http://localhost:3000/artist/%s/word"
sql2 = "SELECT Name from tracks where name like '%%%s%%' limit 10"

async def fetch(id):
    r = urllib.request.urlopen(url % str(id))
    js = r.read()
    title = (json.loads(js))['word']
    word = title.split(' ')[0]
    return word

def lookup(fut):
    print ("my result is " + fut.result())
    conn = sqlite3.connect('./chinook.db')
    res = conn.execute( sql2 % (fut.result()) )
    names = res.fetchall()
    for n in names:
        print ("Got a match on " + str(n))

async def work():
    conn = sqlite3.connect('./chinook.db')
    res = conn.execute(sql1)
    artists = res.fetchall()

    tasks = []
    for (id,a) in artists:
        t = loop.create_task(fetch(id)) #this is synchronous!!!!
        tasks.append( t )
        t.add_done_callback( lookup )
        print ("searching for " + str(id))


    for t in tasks:
        res = await t


        #
        #

loop = asyncio.get_event_loop()
loop.run_until_complete(work())
loop.close()

# or in PYthon 3.7
# asyncio.run(work())
