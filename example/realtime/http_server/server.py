#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from http.server import HTTPServer, BaseHTTPRequestHandler
import os
import time


class LiveAudioStream(BaseHTTPRequestHandler):
    def do_GET(self):
        print(self.path)
        self.send_response(200, "OK")
        self.send_header("Connection", "closed")
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Access-Control-Allow-Origin", "*")
        # self.send_header("Content-Length", os.path.getsize("foo.mp3"))
        self.end_headers()
        with open("demo.aac", mode="rb") as f:
            while True:
                bytes_buf = f.read(4096)
                if not bytes_buf:
                    break
                print("sending {} bytes".format(str(len(bytes_buf))))
                self.wfile.write(bytes_buf)
                time.sleep(0.5)

    def do_HEAD(self):
        print(self.path)
        self.send_header("Content-Length", 1024)
        self.send_response(200, "OK")
        self.end_headers()


if __name__ == '__main__':
    server = HTTPServer(('localhost', 9090), LiveAudioStream)
    server.serve_forever(0.05)
