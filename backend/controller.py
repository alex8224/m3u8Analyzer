# -*- coding:utf-8 -*-

from flask import Flask, request
from flask_cors import CORS
import subprocess
import requests
import os
from threading import Thread
import urllib.parse
import json
from parse_ad_ts import *


app = Flask(__name__)
TOKEN = ""

token=""
chat_id=""
AGENT = "https://cdn.v82u1l.com/fvod/299fb785c0ed062f38f1216c73dab682236ab81f7e081095a6344e9f261b6e8c8bc2ef60f08933789bdbe3c0c776a5ff87ebd46c4106d91c6b3ee83d30b6677f9d26d589b1784c07e9f7a8d481c37b3bb59f68c9c34c06c2.ts"
HEADER = { "User-Agent": AGENT}

@app.route('/m3u8/', methods=['GET'])
def download():
    m3u8 = request.args.get('m3u8')
    token = request.args.get('token')
    epname = request.args.get('epname')
    header = json.loads(urllib.parse.unquote(request.args.get("header")))

    # 验证 token 是否正确
    if token != TOKEN:
        return '', 403

    send_telegram_notification("开始下载 %s" % (epname, ))
    # 调用 download_m3u8 命令执行下载操作
    
    print(header)
    header_param = ""
    for k,v in header.items():
        val = """ -H "%s: %s" """ % (k,v.replace('"', "'"))
        header_param += val

    m3u8 = find_and_remove_ads(f"{m3u8}")
    cmd = f'./m3u8_download {m3u8} {header_param} --save-name {epname}'
    Thread(target=runcmd, args=(cmd,epname)).start()

    # 下载完成后发送通知给 Telegram 机器人
    #send_telegram_notification('Download completed')

    return 'Download started'

def runcmd(cmd, epname):
    print("cmd %s" % cmd)
    subprocess.run(cmd, shell=True)
    subprocess.run(f"mv {epname}.mp4 /usr/share/nginx/html/catoon/", shell=True)
    send_telegram_notification(f"{epname} 下载完成!")


def send_telegram_notification(message):
    # 在这里编写发送通知给 Telegram 机器人的代码
    # 可以使用第三方库如 python-telegram-bot 等来实现发送通知的功能

    # 示例代码（需要安装 python-telegram-bot 库）
    url="https://api.telegram.org/bot%s/sendMessage" % (token, )
    send_msg_cmd = "curl -s -X POST %s -d chat_id=%s -d text=\"%s\"" % (url, chat_id, message)
    print(send_msg_cmd)
    subprocess.run(send_msg_cmd, shell=True)
if __name__ == '__main__':

    app.run()

