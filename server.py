import asyncio
import random
import json
import websockets

nextTabId = None
async def handle_websocket(websocket, path):
    try:
        # 发送 listTab 命令给扩展
        command = {"action": "listTab", "param": {}}
        await websocket.send(json.dumps(command))
        print("命令已发送", command)
        async for message in websocket:
            data = json.loads(message)
            print("收到响应 ", data)
            # 处理扩展的响应
            await handle_extension_response(data)
            await switch_to_tab(websocket)
            print("等待下一个响应")
    except websockets.exceptions.ConnectionClosed:
        print("WebSocket连接已关闭")

async def send_list_tabs_command(websocket):
    pass
    

async def handle_extension_response(data):
    # 处理扩展的响应
    global nextTabId
    nextIndex = random.randint(0, len(data))
    if nextIndex + 1 > len(data):
        nextIndex = 0
    for tabInfo in data:
        print(tabInfo)
    print(f"nextIndex is {nextIndex}")
    try:
        nextTabId = data[nextIndex]["tabId"]
    except:
        pass
    await asyncio.sleep(1)
   
def process_list_tabs_result(data):
    # 处理 listTabResult 操作的具体逻辑
    print("Received listTabResult:")
    print(json.dumps(data, indent=2))

def get_tabs_info():
    # 实现获取标签页信息的逻辑，返回类似以下结构的数据
    # [{"tabId": xx, "windowId": xx, "title": "xx", "favIconUrl": "", "active": True|False}, ...]
    pass

async def switch_to_tab(websocket):
    # 实现切换到指定标签页的逻辑
    command = {"action": "switchTab", "param": {"tabId": nextTabId}}
    print(f"命令已发送 ", command)
    await websocket.send(json.dumps(command))
    

def capture_tab_screenshot(tab_id):
    # 实现捕获指定标签页截图的逻辑，返回截图的数据URL
    pass

if __name__ == "__main__":
    start_server = websockets.serve(handle_websocket, "localhost", 8088)

    asyncio.get_event_loop().run_until_complete(start_server)

    # 运行事件循环
    asyncio.get_event_loop().run_forever()
