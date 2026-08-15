#!/usr/bin/env python3
"""
Morgan AI - Binance relay
Runs a tiny local server that:
  1. Serves this folder's files (same as `python3 -m http.server`)
  2. Signs and forwards Binance order/account requests server-side,
     because Binance blocks browsers from calling those endpoints directly.

Usage (in Termux, inside this project's folder):
    python3 binance_relay.py
Then open:
    http://localhost:8788/index.html

Your API key/secret are sent from the browser to this script over
localhost only (never leave your device) and this script forwards them
to Binance directly (server-to-server, not subject to browser CORS).
"""

import json
import hmac
import hashlib
import time
import urllib.request
import urllib.parse
import urllib.error
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8788

LIVE_BASE = "https://api.binance.com"
TESTNET_BASE = "https://testnet.binance.vision"


def sign(secret, query):
    return hmac.new(secret.encode(), query.encode(), hashlib.sha256).hexdigest()


def binance_request(method, base, path, api_key, api_secret, params):
    params = dict(params or {})
    params["timestamp"] = int(time.time() * 1000)
    params["recvWindow"] = 5000
    query = urllib.parse.urlencode(params)
    query += "&signature=" + sign(api_secret, query)
    url = base + path + "?" + query
    req = urllib.request.Request(url, method=method)
    req.add_header("X-MBX-APIKEY", api_key)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read().decode())
        except Exception:
            return {"error": "HTTP " + str(e.code)}
    except Exception as e:
        return {"error": str(e)}


class Handler(SimpleHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length) or b"{}")
        api_key = body.get("apiKey", "")
        api_secret = body.get("apiSecret", "")
        base = TESTNET_BASE if body.get("testnet") else LIVE_BASE

        if self.path == "/api/binance/account":
            result = binance_request("GET", base, "/api/v3/account", api_key, api_secret, {})
        elif self.path == "/api/binance/order":
            params = {
                "symbol": body["symbol"],
                "side": body["side"],
                "type": "MARKET",
                "quantity": body["quantity"],
            }
            result = binance_request("POST", base, "/api/v3/order", api_key, api_secret, params)
        elif self.path == "/api/binance/exchangeInfo":
            try:
                url = base + "/api/v3/exchangeInfo?symbol=" + urllib.parse.quote(body.get("symbol", ""))
                with urllib.request.urlopen(url, timeout=10) as resp:
                    result = json.loads(resp.read().decode())
            except Exception as e:
                result = {"error": str(e)}
        else:
            result = {"error": "unknown endpoint"}

        payload = json.dumps(result).encode()
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        # Serve static files (same as http.server) for anything not under /api/
        if self.path.startswith("/api/"):
            self.send_response(404)
            self._cors()
            self.end_headers()
            return
        super().do_GET()

    def end_headers(self):
        # add CORS headers to static file responses too
        self._cors()
        super().end_headers()

    def log_message(self, fmt, *args):
        print("[relay]", fmt % args)


if __name__ == "__main__":
    print(f"Morgan AI Binance relay running at http://localhost:{PORT}")
    print("Open http://localhost:%d/index.html on this device to use it." % PORT)
    HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
