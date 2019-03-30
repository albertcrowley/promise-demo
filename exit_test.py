import asyncio

async def exit():
    loop = asyncio.get_event_loop()
    loop.stop()


for task in asyncio.Task.all_tasks():
	task.cancel()

asyncio.ensure_future(exit())
