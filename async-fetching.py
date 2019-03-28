#!/usr/bin/python
import sqlite3
import urllib
import urllib.request
import json
import asyncio
import aiohttp

db_file = 'chinook.db'
sql1 = "SELECT ArtistId, Name from artists limit 10"
url =  "http://localhost:3000/artist/%s/word"
sql2 = "SELECT Name from tracks where name like '%%%s%%' limit 10"

# Step 1 - Query a list of artist IDs and Names from the database
# Step 2 - Read from a slow API to get most common words from that artists song titles
# Step 3 - Query the database for all song titles that have that common word

async def fetch(id):
    session = aiohttp.ClientSession()
    response = await session.get(url % str(id) )
    json = await response.json()
    session.close()

    #
    # this old code is not asycn because urllib isn't async!
    #
    # r = urllib.request.urlopen(url % str(id))
    # js = r.read()
    # title = (json.loads(js))['word']
    # word = title.split(' ')[0]
    return json['word']

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
        co = fetch(id)
        # t = asyncio.create_task(co)
        t = loop.create_task(co)
        tasks.append( t )
        t.add_done_callback( lookup )
        print ("searching for " + str(id))

    for t in tasks:
        res = await t

loop = asyncio.get_event_loop()
loop.run_until_complete(work())
loop.close()

# or in PYthon 3.7
# asyncio.run(work())
