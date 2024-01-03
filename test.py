import asyncio
import random
import json


async def looptest():
    for x in range(10):
        await asyncio.sleep(1)
        print(x)

asyncio.get_event_loop().run_until_complete(looptest())
asyncio.get_event_loop().run_forever()
# 运行事件循环