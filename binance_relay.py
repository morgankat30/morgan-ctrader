#!/usr/bin/env python3
"""Morgan AI Binance relay: Spot + USDⓈ-M Futures.
Run with: python3 binance_relay.py
"""
import json,hmac,hashlib,time,urllib.request,urllib.parse,urllib.error
from http.server import HTTPServer,SimpleHTTPRequestHandler
PORT=8788
SPOT_LIVE='https://api.binance.com'; SPOT_TEST='https://testnet.binance.vision'
FUT_LIVE='https://fapi.binance.com'; FUT_TEST='https://testnet.binancefuture.com'

def bases(testnet,market):
    if market=='futures': return FUT_TEST if testnet else FUT_LIVE
    return SPOT_TEST if testnet else SPOT_LIVE

def sign(secret,q): return hmac.new(secret.encode(),q.encode(),hashlib.sha256).hexdigest()
def req(method,base,path,key,secret,params=None,signed=True):
    p=dict(params or {})
    if signed:
        p['timestamp']=int(time.time()*1000);p['recvWindow']=5000
    q=urllib.parse.urlencode(p)
    if signed:q+='&signature='+sign(secret,q)
    r=urllib.request.Request(base+path+('?'+q if q else ''),method=method)
    if key:r.add_header('X-MBX-APIKEY',key)
    try:
        with urllib.request.urlopen(r,timeout=8) as x:return json.loads(x.read().decode())
    except urllib.error.HTTPError as e:
        try:return json.loads(e.read().decode())
        except Exception:return {'error':'HTTP '+str(e.code)}
    except Exception as e:return {'error':str(e)}
class Handler(SimpleHTTPRequestHandler):
    def cors(self):
        self.send_header('Access-Control-Allow-Origin','*');self.send_header('Access-Control-Allow-Headers','Content-Type');self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS')
    def do_OPTIONS(self):self.send_response(204);self.cors();self.end_headers()
    def do_POST(self):
        try:body=json.loads(self.rfile.read(int(self.headers.get('Content-Length',0))) or b'{}')
        except Exception:body={}
        key=body.get('apiKey','');secret=body.get('apiSecret','');market=body.get('market','spot');test=bool(body.get('testnet'));base=bases(test,market);path=self.path
        if market=='futures':
            if path=='/api/binance/account':result=req('GET',base,'/fapi/v2/account',key,secret)
            elif path=='/api/binance/exchangeInfo':result=req('GET',base,'/fapi/v1/exchangeInfo',key,secret,{},False)
            elif path=='/api/binance/klines':result=req('GET',base,'/fapi/v1/klines',key,secret,{'symbol':body.get('symbol',''),'interval':body.get('interval','1m'),'limit':min(int(body.get('limit',120)),1500)},False)
            elif path=='/api/binance/leverage':result=req('POST',base,'/fapi/v1/leverage',key,secret,{'symbol':body['symbol'],'leverage':int(body.get('leverage',3))})
            elif path=='/api/binance/order':
                params={'symbol':body['symbol'],'side':body['side'],'type':body.get('type','MARKET'),'newOrderRespType':body.get('newOrderRespType','RESULT')}
                for k in ('quantity','positionSide','reduceOnly','stopPrice','closePosition','workingType'):
                    if k in body and body[k] is not None:params[k]=body[k]
                result=req('POST',base,'/fapi/v1/order',key,secret,params)
            elif path=='/api/binance/protection':
                sym=body['symbol'];side=body['side'];close_side='SELL' if side=='BUY' else 'BUY'
                out=[]
                for typ,price in [('STOP_MARKET',body.get('stopPrice')),('TAKE_PROFIT_MARKET',body.get('takeProfitPrice'))]:
                    if not price:continue
                    out.append(req('POST',base,'/fapi/v1/order',key,secret,{'symbol':sym,'side':close_side,'positionSide':'BOTH','type':typ,'stopPrice':price,'closePosition':'true','workingType':'MARK_PRICE'}))
                result={'orders':out}
            elif path=='/api/binance/positionRisk':result=req('GET',base,'/fapi/v2/positionRisk',key,secret,{'symbol':body.get('symbol','')})
            else:result={'error':'unknown futures endpoint'}
        else:
            if path=='/api/binance/account':result=req('GET',base,'/api/v3/account',key,secret)
            elif path=='/api/binance/order':result=req('POST',base,'/api/v3/order',key,secret,{'symbol':body['symbol'],'side':body['side'],'type':'MARKET','quantity':body['quantity'],'newOrderRespType':body.get('newOrderRespType','RESULT')})
            elif path=='/api/binance/exchangeInfo':result=req('GET',base,'/api/v3/exchangeInfo',key,secret,{'symbol':body.get('symbol','')},False)
            elif path=='/api/binance/klines':result=req('GET',base,'/api/v3/klines',key,secret,{'symbol':body.get('symbol',''),'interval':body.get('interval','1m'),'limit':min(int(body.get('limit',120)),1000)},False)
            else:result={'error':'unknown spot endpoint'}
        payload=json.dumps(result).encode();self.send_response(200);self.cors();self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
    def do_GET(self):
        if self.path.startswith('/api/'):self.send_response(404);self.cors();self.end_headers();return
        super().do_GET()
    def end_headers(self):self.cors();super().end_headers()
    def log_message(self,fmt,*args):print('[relay]',fmt%args)
if __name__=='__main__':
    print('Morgan AI Binance Spot + USDⓈ-M Futures relay running at http://localhost:%d'%PORT)
    print('Keep withdrawals disabled on the API key. Start on Futures Testnet.')
    HTTPServer(('0.0.0.0',PORT),Handler).serve_forever()
