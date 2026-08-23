


// ========== PROTOCOL CONSTANTS ==========
const PT={APP_AUTH_REQ:2100,APP_AUTH_RES:2101,ACC_AUTH_REQ:2102,ACC_AUTH_RES:2103,NEW_ORDER_REQ:2106,CANCEL_ORDER_REQ:2109,CLOSE_POSITION_REQ:2111,AMEND_POSITION_SLTP_REQ:2110,SYMBOLS_LIST_REQ:2114,SYMBOLS_LIST_RES:2115,SYMBOL_BY_ID_REQ:2116,SYMBOL_BY_ID_RES:2117,TRADER_REQ:2121,TRADER_RES:2122,RECONCILE_REQ:2124,RECONCILE_RES:2125,EXECUTION_EVENT:2126,SUBSCRIBE_SPOTS_REQ:2127,SUBSCRIBE_SPOTS_RES:2128,UNSUBSCRIBE_SPOTS_REQ:2129,SPOT_EVENT:2131,ORDER_ERROR_EVENT:2132,ERROR_RES:2142,GET_ACCOUNTS_REQ:2149,GET_ACCOUNTS_RES:2150,GET_TRENDBARS_REQ:2137,GET_TRENDBARS_RES:2138,HEARTBEAT:51};

// ========== SYMBOL DEFINITIONS ==========
const SYM_DEFS={
  XAUUSD:{key:'XAUUSD',ctMatch:['XAUUSD','XAU/USD','GOLD'],bn:'XAUUSDT',label:'XAU/USD',name:'Gold',digits:3,defSL:2.5,defTP:5,pip:0.01,weekend:false},
  XAGUSD:{key:'XAGUSD',ctMatch:['XAGUSD','XAG/USD','SILVER'],bn:'',label:'XAG/USD',name:'Silver',digits:3,defSL:0.15,defTP:0.3,pip:0.001,weekend:false},
  EURUSD:{key:'EURUSD',ctMatch:['EURUSD','EUR/USD'],bn:'EURUSDT',label:'EUR/USD',name:'Euro',digits:5,defSL:0.0015,defTP:0.003,pip:0.0001,weekend:false},
  GBPUSD:{key:'GBPUSD',ctMatch:['GBPUSD','GBP/USD'],bn:'GBPUSDT',label:'GBP/USD',name:'Pound',digits:5,defSL:0.0018,defTP:0.0036,pip:0.0001,weekend:false},
  USDJPY:{key:'USDJPY',ctMatch:['USDJPY','USD/JPY'],bn:'',label:'USD/JPY',name:'Yen',digits:3,defSL:0.15,defTP:0.3,pip:0.01,weekend:false},
  USDCHF:{key:'USDCHF',ctMatch:['USDCHF','USD/CHF'],bn:'',label:'USD/CHF',name:'Swiss Franc',digits:5,defSL:0.0015,defTP:0.003,pip:0.0001,weekend:false},
  USDCAD:{key:'USDCAD',ctMatch:['USDCAD','USD/CAD'],bn:'',label:'USD/CAD',name:'Loonie',digits:5,defSL:0.0018,defTP:0.0036,pip:0.0001,weekend:false},
  AUDUSD:{key:'AUDUSD',ctMatch:['AUDUSD','AUD/USD'],bn:'',label:'AUD/USD',name:'Aussie',digits:5,defSL:0.0015,defTP:0.003,pip:0.0001,weekend:false},
  NZDUSD:{key:'NZDUSD',ctMatch:['NZDUSD','NZD/USD'],bn:'',label:'NZD/USD',name:'Kiwi',digits:5,defSL:0.0015,defTP:0.003,pip:0.0001,weekend:false},
  EURGBP:{key:'EURGBP',ctMatch:['EURGBP','EUR/GBP'],bn:'',label:'EUR/GBP',name:'Euro/Pound',digits:5,defSL:0.0012,defTP:0.0024,pip:0.0001,weekend:false},
  EURJPY:{key:'EURJPY',ctMatch:['EURJPY','EUR/JPY'],bn:'',label:'EUR/JPY',name:'Euro/Yen',digits:3,defSL:0.18,defTP:0.36,pip:0.01,weekend:false},
  GBPJPY:{key:'GBPJPY',ctMatch:['GBPJPY','GBP/JPY'],bn:'',label:'GBP/JPY',name:'Pound/Yen',digits:3,defSL:0.25,defTP:0.5,pip:0.01,weekend:false},
  BTCUSDT:{key:'BTCUSDT',ctMatch:['BTCUSD','BTC/USD'],bn:'BTCUSDT',label:'BTC/USDT',name:'Bitcoin',digits:2,defSL:60,defTP:120,pip:1,weekend:true},
  ETHUSDT:{key:'ETHUSDT',ctMatch:['ETHUSD','ETH/USD'],bn:'ETHUSDT',label:'ETH/USDT',name:'Ethereum',digits:2,defSL:5,defTP:10,pip:0.01,weekend:true},
  LTCUSDT:{key:'LTCUSDT',ctMatch:['LTCUSD','LTC/USD'],bn:'LTCUSDT',label:'LTC/USDT',name:'Litecoin',digits:2,defSL:1,defTP:2,pip:0.01,weekend:true},
  XRPUSDT:{key:'XRPUSDT',ctMatch:['XRPUSD','XRP/USD'],bn:'XRPUSDT',label:'XRP/USDT',name:'Ripple',digits:4,defSL:0.01,defTP:0.02,pip:0.0001,weekend:true},
  SOLUSDT:{key:'SOLUSDT',ctMatch:['SOLUSD','SOL/USD'],bn:'SOLUSDT',label:'SOL/USDT',name:'Solana',digits:2,defSL:2,defTP:4,pip:0.01,weekend:true}
};
// weekend:true = trades 24/7 including Sat/Sun (crypto). Everything else here
// is FX/metals, which close roughly Fri 22:00 UTC to Sun 22:00 UTC — see
// isMarketOpenWeekend() below.

// ========== STATE ==========
let state={
  broker:'ctrader',env:'demo',connected:false,accountReady:false,accountId:null,moneyDigits:2,
  ws:null,msgSeq:0,hbTimer:null,wasEverConnected:false,ctReconnectTimer:null,
  connecting:false,intentionalDisconnect:false,connectionGeneration:0,envSwitchTimer:null,
  paused:false,stopped:true,auto:false,paper:true,armed:false,newsTrading:false,
  balance:0,equity:0,paperBalance:10000,startBalance:null,
  wins:0,losses:0,todayPnl:0,todayKey:'',
  assets:{},currentSymbol:'XAUUSD',symbolsByNorm:{},pendingTrendbarRequests:{},
  bnSockets:{},bnRelayUrl:'http://localhost:8788',bnApiKey:'',bnApiSecret:'',
  chart:null,candleSeries:null,chartData:[],lastChartUpdate:0,
  newsEvents:[],nextEvent:null,newsMode:false,newsBlackout:false
};

let cfg={
  strategy:'confluence',
  lotSize:0.01,posPerEntry:3,maxPositions:0,basketProfit:5,cooldownSec:60,
  tf:15,slDollars:15,trailBuffer:2,maxHoldMin:5,maxSpreadPct:0.5,
  autoReverse:true,profitProtect:true
};
// Presets just auto-fill the same fields every strategy already uses — you can
// still edit any of them by hand afterward. EMA Ride/Pullback additionally
// switch the whole signal engine (see computeEmaSignal); the other five all
// run on the same trend/momentum/RSI/spread confluence engine, just tuned.
const STRATEGY_PRESETS={
  scalping:{tf:1,slDollars:8,basketProfit:5,cooldownSec:5,maxHoldMin:8,hint:'M1 entries, tight $8 stop, fast 5s re-entry, 8min max hold.'},
  day:{tf:15,slDollars:15,basketProfit:20,cooldownSec:60,maxHoldMin:720,hint:'M15 entries, $15 stop, can hold up to 12 hours.'},
  swing:{tf:60,slDollars:30,basketProfit:50,cooldownSec:600,maxHoldMin:4320,hint:'H1 entries, $30 stop, can hold up to 3 days.'},
  position:{tf:60,slDollars:50,basketProfit:100,cooldownSec:3600,maxHoldMin:20160,hint:'H1 entries, $50 stop, can hold up to 14 days.'},
  confluence:{hint:'Trend + momentum + RSI + spread, scored 0-100 — uses whatever Timeframe/SL/etc you set below.'},
  emaRide:{hint:'Uses the Timeframe below for EMA5/13/89. No fixed take-profit — Basket Profit is ignored, it exits on a trend flip instead.'},
  emaPullback:{slDollars:15,basketProfit:22.5,hint:'Uses the Timeframe below for EMA5/13/89. Basket Profit auto-set to 1.5x your SL (the "1:1.5" target) — edit either if you want a different ratio.'}
};
const STRATEGY_LABELS={confluence:'Trend Confluence',scalping:'Scalping',day:'Day Trading',swing:'Swing Trading',position:'Position Trading',emaRide:'EMA Trend — Ride',emaPullback:'EMA Trend — Pullback'};
function applyStrategyPreset(){
  const key=$('cfgStrategy').value;
  const p=STRATEGY_PRESETS[key];
  $('strategyHint').textContent=p.hint||'';
  if(p.tf!=null)$('cfgTF').value=p.tf;
  if(p.slDollars!=null)$('cfgSL').value=p.slDollars;
  if(p.basketProfit!=null)$('cfgBasket').value=p.basketProfit;
  if(p.cooldownSec!=null)$('cfgCool').value=p.cooldownSec;
  if(p.maxHoldMin!=null)$('cfgHold').value=p.maxHoldMin;
}
let tvChart=null, candleSeries=null, emaLine1=null, emaLine2=null, emaLine3=null;

// ========== HELPERS ==========
const $=id=>document.getElementById(id);
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  if(id==='splash')$('scrSplash').classList.add('active');
  else if(id==='broker')$('scrBroker').classList.add('active');
  else if(id==='loginCT')$('scrLoginCT').classList.add('active');
  else if(id==='loginBN')$('scrLoginBN').classList.add('active');
  else if(id==='dash'){
    $('scrDash').classList.add('active');
    // FIX (chart-blank bug): if a keyboard-triggered resize happened while
    // this screen was hidden, the chart's canvas could still be stuck at
    // 0 width from that. Now that the container is actually visible again,
    // force it back to the real width and refit — cheap, and makes the
    // chart self-heal instead of needing a manual page refresh.
    const chartEl=document.getElementById('tvChart');
    if(tvChart&&chartEl&&chartEl.clientWidth>0){
      requestAnimationFrame(()=>{
        if(!tvChart||!chartEl||chartEl.clientWidth<=0)return;
        tvChart.resize(chartEl.clientWidth,220);
        if(state.assets[state.currentSymbol]&&state.assets[state.currentSymbol].bars1.length)redrawChart();
        else tvChart.timeScale().fitContent();
      });
    }
  }
  else if(id==='symbols')$('scrSymbols').classList.add('active');
  else if(id==='config')$('scrConfig').classList.add('active');
}
function log(msg){
  const el=$('miniLog');if(!el)return;
  const t=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const d=document.createElement('div');d.textContent=t+' '+msg;el.prepend(d);
  while(el.children.length>5)el.removeChild(el.lastChild);
}
function setText(id,txt){const e=$(id);if(e)e.textContent=txt;}
function fmt$(n){return '$'+(n||0).toFixed(2);}
function fmtPnL(n){return (n>=0?'+':'')+n.toFixed(2);}
function todayKey(){return new Date().toISOString().slice(0,10);}
function resetDaily(){const k=todayKey();if(state.todayKey!==k){state.todayKey=k;state.todayPnl=0;state.wins=0;state.losses=0;}}
function setConnBadge(txt,cls){const b=$('connBadge');if(b){b.textContent=txt;b.className='badge '+cls;}}
function showLoading(t){$('loadingText').textContent=t||'Loading...';$('loadingOverlay').classList.add('active');
  // FIX: this could hang forever if the broker responds with an error partway
  // through login instead of the expected next step (confirmed: ERROR_RES was
  // logged but never called hideLoading()) — you'd be stuck on this screen
  // with literally no way out, since the refresh button only exists on the
  // dashboard you can't reach. Auto-clears after 15s no matter what, and the
  // overlay itself is now tappable to dismiss immediately.
  clearTimeout(state.loadingTimeout);
  state.loadingTimeout=setTimeout(()=>{hideLoading();alert('Timed out waiting for a response. Check your Access Token hasn\'t expired, then try CONNECT again.');},15000);
}
function hideLoading(){clearTimeout(state.loadingTimeout);$('loadingOverlay').classList.remove('active');state.connecting=false;setConnectBtnEnabled(true);}

// ========== NAVIGATION ==========
function chooseBroker(b){
  state.broker=b;
  if(b==='ctrader'){
    showScreen('loginCT');
    const sel=$('ctEnv');
    if(sel && !sel.dataset.bound){
      sel.dataset.bound='1';
      sel.addEventListener('change',()=>{
        const env=sel.value;
        state.env=env;
        state.accountId=null;state.accountReady=false;state.connected=false;
        clearTimeout(state.ctReconnectTimer);clearTimeout(state.envSwitchTimer);clearInterval(state.hbTimer);
        rememberCtEnvState();
        loadCtEnvState(env,true);
        ctStatus('Selected '+env.toUpperCase()+'. Connect will use only a '+env.toUpperCase()+' account.');
      });
    }
  }else showScreen('loginBN');
}
function showNewsModal(){$('newsModal').classList.add('active');renderNewsList();}
function hideNewsModal(){$('newsModal').classList.remove('active');}

// ========== STORAGE ==========
function saveCreds(){
  if($('swRemCT').classList.contains('on')){localStorage.setItem('tpea_ct_id',$('ctId').value);localStorage.setItem('tpea_ct_sec',$('ctSec').value);localStorage.setItem('tpea_ct_tok',$('ctTok').value);localStorage.setItem('tpea_ct_ref',$('ctRef').value);localStorage.setItem('tpea_ct_env',$('ctEnv').value);}
  if($('swRemBN').classList.contains('on')){localStorage.setItem('tpea_bn_key',$('bnKey').value);localStorage.setItem('tpea_bn_sec',$('bnSec').value);localStorage.setItem('tpea_bn_env',$('bnEnv').value);localStorage.setItem('tpea_bn_rel',$('bnRelay').value);}
  localStorage.setItem('tpea_cfg',JSON.stringify(cfg));
  localStorage.setItem('tpea_sym',state.currentSymbol);
}
function loadCreds(){
  const a=localStorage.getItem('tpea_ct_id');if(a){$('ctId').value=a;$('ctSec').value=localStorage.getItem('tpea_ct_sec')||'';$('ctTok').value=localStorage.getItem('tpea_ct_tok')||'';$('ctRef').value=localStorage.getItem('tpea_ct_ref')||'';$('ctEnv').value=localStorage.getItem('tpea_ct_env')||'demo';$('swRemCT').classList.add('on');}
  const k=localStorage.getItem('tpea_bn_key');if(k){$('bnKey').value=k;$('bnSec').value=localStorage.getItem('tpea_bn_sec')||'';$('bnEnv').value=localStorage.getItem('tpea_bn_env')||'testnet';$('bnRelay').value=localStorage.getItem('tpea_bn_rel')||'http://localhost:8788';$('swRemBN').classList.add('on');}
  const c=localStorage.getItem('tpea_cfg');if(c){cfg=JSON.parse(c);}
  const s=localStorage.getItem('tpea_sym');if(s)state.currentSymbol=s;
  if(!Number.isFinite(Number(cfg.lotSize))||Number(cfg.lotSize)<=0||Number(cfg.lotSize)>1000)cfg.lotSize=fallbackStartLot({key:state.currentSymbol});
}
loadCreds();

function ctEnvKey(k){return 'tpea_ct_'+k+'_'+(state.env||$('ctEnv')?.value||'demo');}
function rememberCtEnvState(){
  const env=$('ctEnv')?.value||state.env||'demo';
  try{
    if($('ctTok')?.value) localStorage.setItem('tpea_ct_tok_'+env,$('ctTok').value.trim());
    if($('ctRef')?.value) localStorage.setItem('tpea_ct_ref_'+env,$('ctRef').value.trim());
    if(state.accountId) localStorage.setItem('tpea_ct_account_'+env,String(state.accountId));
  }catch(e){}
}
function loadCtEnvState(env, keepCommon=true){
  try{
    const tok=localStorage.getItem('tpea_ct_tok_'+env);
    const ref=localStorage.getItem('tpea_ct_ref_'+env);
    if(tok) $('ctTok').value=tok;
    else if(!keepCommon) $('ctTok').value='';
    if(ref) $('ctRef').value=ref;
  }catch(e){}
}

// ========== CTRADER OAUTH HELPER ==========
// Real flow per Spotware's own docs: authorize at connect.spotware.com/apps/auth,
// which redirects back to OUR OWN page with ?code=..., then that code is
// exchanged for a token at openapi.ctrader.com/apps/token. This whole app
// already sends Client Secret straight from the browser to establish its
// WebSocket connections, so doing the token exchange the same way is
// consistent with its existing security model — not a new category of risk.
// Honest caveat: the token-exchange step is a direct cross-origin browser
// fetch to cTrader's own server. If their endpoint doesn't allow that (CORS),
// it'll fail with a network error — that's a real possible outcome of doing
// this without a backend, not a bug in this code. Manual token entry above
// always works as a fallback either way.
function ctRedirectUri(){ return window.location.origin+window.location.pathname; }
function startCtOAuth(){
  const clientId=$('ctId').value.trim();
  if(!clientId){alert('Enter your Client ID first.');return;}
  saveCreds();
  const url='https://id.ctrader.com/my/settings/openapi/grantingaccess/?client_id='+encodeURIComponent(clientId)+'&redirect_uri='+encodeURIComponent(ctRedirectUri())+'&scope=trading';
  window.open(url,'_blank');
}
async function checkOAuthCallback(){
  const params=new URLSearchParams(window.location.search);
  const code=params.get('code');
  if(!code)return false;
  history.replaceState({},'',window.location.pathname); // strip ?code= so a refresh doesn't re-trigger this
  const clientId=$('ctId')?$('ctId').value.trim():'';
  const clientSecret=$('ctSec')?$('ctSec').value.trim():'';
  showScreen('loginCT');
  if(!clientId||!clientSecret){
    log('Got an auth code back but Client ID/Secret aren\'t filled in — re-enter them and tap the OAuth button again.');
    return true;
  }
  // NOTE: we deliberately do NOT attempt a browser fetch() to exchange the code here.
  // cTrader's token endpoint doesn't send CORS headers, so a browser fetch always
  // fails to be read — but the request still reaches their server first and burns
  // the one-time code before that failure is caught, making a "try fetch, then
  // fall back" approach fail every time. Going straight to the manual/curl exchange
  // means the code only gets used once, successfully.
  const redirectUri=ctRedirectUri();
  const cmd='curl "https://openapi.ctrader.com/apps/token?grant_type=authorization_code&code='
    +code+'&redirect_uri='+encodeURIComponent(redirectUri)
    +'&client_id='+clientId+'&client_secret='+clientSecret+'"';
  const box=$('ctStatus');
  if(box){
    box.innerHTML='Authorization received. Browsers can\'t complete this last step directly — run this in Termux, then paste the "accessToken" value from the reply into the Access Token field above:'
      +'<div class="mini-log" style="height:auto; max-height:none; margin-top:8px; user-select:all; white-space:pre-wrap; word-break:break-all;">'+cmd.replace(/</g,'&lt;')+'</div>';
  }
  log('Authorization code received — run the command shown below in Termux.');
  return true;
}

// ========== CONFIG UI ==========
function loadConfigUI(){
  const def=SYM_DEFS[state.currentSymbol];
  $('configTitle').textContent=def?def.label:state.currentSymbol;
  $('cfgStrategy').value=cfg.strategy;
  $('strategyHint').textContent=(STRATEGY_PRESETS[cfg.strategy]||{}).hint||'';
  if(!Number.isFinite(Number(cfg.lotSize))||Number(cfg.lotSize)<=0||Number(cfg.lotSize)>1000)cfg.lotSize=fallbackStartLot({key:state.currentSymbol});
  $('cfgLot').value=formatLots(cfg.lotSize);
  $('cfgPosCount').value=cfg.posPerEntry;
  $('cfgMaxPos').value=cfg.maxPositions;
  $('cfgTF').value=cfg.tf;
  $('cfgBasket').value=cfg.basketProfit;
  $('cfgCool').value=cfg.cooldownSec;
  $('cfgSL').value=cfg.slDollars;
  $('cfgTrail').value=cfg.trailBuffer;
  $('cfgHold').value=cfg.maxHoldMin;
  $('cfgSpread').value=cfg.maxSpreadPct;
  $('swReverse').classList.toggle('on',cfg.autoReverse);
  $('swProtect').classList.toggle('on',cfg.profitProtect);
  $('swNewsTrade').classList.toggle('on',state.newsTrading);
  $('swPaper').classList.toggle('on',state.paper);
  $('swArm').classList.toggle('on',state.armed);
  const envSel=$('cfgEnv');if(envSel)envSel.value=state.env;
}
// In-app Demo/Live switch — reconnects with the same saved credentials,
// no trip back to the login screen needed. Closes the current connection;
// the existing onclose auto-reconnect logic in connectCT() picks the new
// env up automatically since it always reads state.env fresh.
function resetCtAccountData(clearBars){
  state.accountReady=false;state.connected=false;state.accountId=null;state.symbolsByNorm={};state.pendingTrendbarRequests={};
  Object.values(state.assets).forEach(a=>{
    a.symbolId=null;a.full=null;a.subscribedSymbolId=null;
    if(clearBars){a.bars1=[];a.bars5=[];a.bars15=[];a.bars30=[];a.bars60=[];a.currentBar=null;a.dataReady=false;}
    a.bid=null;a.ask=null;a.lastPrice=0;a.signal='WAIT';a.score=0;a.streak=0;a.floatingPnL=0;
  });
}
function switchEnv(newEnv){
  if(newEnv===state.env)return;
  if(!confirm('Switch to '+(newEnv==='live'?'LIVE (real money)':'DEMO (paper money)')+' and reconnect?')){
    $('cfgEnv').value=state.env;return;
  }
  state.env=newEnv;
  if($('ctEnv'))$('ctEnv').value=newEnv;
  if($('bnEnv'))$('bnEnv').value=newEnv;
  saveCreds();
  log('Switching to '+newEnv.toUpperCase()+'...');
  if(state.broker==='ctrader'){
    state.intentionalDisconnect=true;state.connectionGeneration++;
    clearTimeout(state.ctReconnectTimer);clearTimeout(state.envSwitchTimer);clearInterval(state.hbTimer);
    resetCtAccountData(true);
    const oldWs=state.ws;state.ws=null;
    if(oldWs){try{oldWs.onopen=null;oldWs.onmessage=null;oldWs.onerror=null;oldWs.onclose=null;oldWs.close(1000,'environment switch');}catch(e){}}
    state.connecting=false;setConnBadge('OFFLINE','off');showLoading('Switching to '+newEnv.toUpperCase()+'...');
    state.envSwitchTimer=setTimeout(()=>{state.intentionalDisconnect=false;connectCT();},800);
  }else{
    state.accountReady=false;connectBN();
  }
}
function saveConfig(){
  cfg.strategy=$('cfgStrategy').value;
  const enteredLot=parseFloat($('cfgLot').value);cfg.lotSize=(Number.isFinite(enteredLot)&&enteredLot>0&&enteredLot<=1000)?cleanLotNumber(enteredLot):fallbackStartLot({key:state.currentSymbol});
  cfg.posPerEntry=parseInt($('cfgPosCount').value)||1;
  cfg.maxPositions=parseInt($('cfgMaxPos').value)||0;
  cfg.tf=parseInt($('cfgTF').value)||15;
  cfg.basketProfit=parseFloat($('cfgBasket').value)||5;
  cfg.cooldownSec=parseInt($('cfgCool').value)||60;
  cfg.slDollars=parseFloat($('cfgSL').value)||15;
  cfg.trailBuffer=parseFloat($('cfgTrail').value)||2;
  cfg.maxHoldMin=parseInt($('cfgHold').value)||5;
  cfg.maxSpreadPct=parseFloat($('cfgSpread').value)||0.5;
  cfg.autoReverse=$('swReverse').classList.contains('on');
  cfg.profitProtect=$('swProtect').classList.contains('on');
  state.newsTrading=$('swNewsTrade').classList.contains('on');
  state.paper=$('swPaper').classList.contains('on');
  state.armed=$('swArm').classList.contains('on');
  saveCreds();
  renderChartTfButtons();
  if(candleSeries)redrawChart();
  showScreen('symbols');
  log('Config saved for '+state.currentSymbol);
}
function updatePaper(){state.paper=$('swPaper').classList.contains('on');}
function toggleArm(){if(!state.paper){$('swArm').classList.toggle('on');state.armed=$('swArm').classList.contains('on');saveCreds();return;}alert('Turn Paper Mode OFF first');}

// ========== SYMBOL LIST ==========
function isWeekendClosed(def){
  if(def.weekend)return false; // crypto — always open
  const now=new Date();const day=now.getUTCDay();const h=now.getUTCHours();
  // FX/metals: closed roughly Sat 00:00 UTC through Sun 22:00 UTC (broker hours vary slightly)
  if(day===6)return true;
  if(day===0&&h<22)return true;
  return false;
}
function renderSymbolList(){
  const list=$('symbolList');if(!list)return;list.innerHTML='';
  Object.keys(SYM_DEFS).forEach(key=>{
    const def=SYM_DEFS[key];const active=key===state.currentSymbol;
    const closed=isWeekendClosed(def);
    const div=document.createElement('div');div.className='symbol-card'+(active?' check-on':'');
    if(closed)div.style.opacity='0.5';
    div.innerHTML='<div class="info"><div class="sym">'+def.label+(closed?' <span style="color:var(--gold); font-size:10px;">CLOSED (weekend)</span>':def.weekend?' <span style="color:var(--green); font-size:10px;">24/7</span>':'')+'</div><div class="detail">'+def.name+' &bull; Lot '+cfg.lotSize+'</div></div><div class="check">'+(active?'&#10003;':'')+'</div>';
    div.onclick=()=>{
      state.currentSymbol=key;initAsset();renderSymbolList();showScreen('config');loadConfigUI();
      // Actually subscribe/load data for the newly picked symbol (see fix note
      // on activateCtSymbol above) — this used to silently do nothing.
      if(state.accountReady){
        if(state.broker==='ctrader')activateCtSymbol(key);
        else{const a=state.assets[key];if(a){a.bnSymbol=SYM_DEFS[key].bn;bnSubscribe(a);bnSeed(a);}}
      }
      // FIX: activateCtSymbol()/bnSeed() only redraw the chart as a side effect
      // of actually FETCHING data — if you'd already visited this symbol once
      // this session, they skip re-fetching (correctly, to avoid spamming the
      // broker) but that meant switching BACK to an already-loaded symbol left
      // the chart showing whatever the previous symbol looked like. This
      // covers every case directly: if bars are already there, show them now;
      // if not, the fetch above will redraw once they arrive.
      const a=state.assets[key];
      if(candleSeries&&a&&a.bars1.length)redrawChart();
      renderChartTfButtons();
    };
    list.appendChild(div);
  });
}
// Search/add any pair the broker actually offers — not just the built-in
// list. cTrader: matches against the real symbol list already loaded from
// SYMBOLS_LIST_RES (state.symbolsByNorm). Binance: accepts the typed symbol
// directly (e.g. "SOLUSDT") since any valid Binance pair works as typed.
function addCustomSymbol(){
  const raw=$('symSearch').value.trim();
  if(!raw){return;}
  const status=$('symSearchStatus');
  const cleanKey=raw.toUpperCase().replace(/[^A-Z]/g,'');
  if(SYM_DEFS[cleanKey]){status.textContent=def_or(cleanKey)+' is already in your list.';status.style.color='var(--dim)';$('symSearch').value='';return;}
  if(state.broker==='ctrader'){
    if(!state.accountReady||!Object.keys(state.symbolsByNorm||{}).length){
      status.textContent='Connect first — need the broker\'s symbol list to search.';status.style.color='var(--gold)';return;
    }
    const norm=s=>String(s).toUpperCase().replace(/[^A-Z]/g,'');
    const target=norm(raw);
    let hit=state.symbolsByNorm[target];
    if(!hit){
      // Try common separator variants (EUR/JPY, EURJPY, EUR-JPY etc all normalize the same way already)
      hit=Object.values(state.symbolsByNorm).find(s=>norm(s.symbolName)===target);
    }
    if(!hit){status.textContent='No match for "'+raw+'" on this account. Check the exact symbol name your broker uses.';status.style.color='var(--red)';return;}
    SYM_DEFS[cleanKey]={key:cleanKey,ctMatch:[hit.symbolName],bn:'',label:hit.symbolName,name:hit.symbolName,digits:5,defSL:15,defTP:20,pip:0.0001,weekend:false};
    status.textContent='Added '+hit.symbolName+'.';status.style.color='var(--green)';
    $('symSearch').value='';renderSymbolList();
  }else{
    const bnSym=cleanKey.endsWith('USDT')?cleanKey:cleanKey+'USDT';
    SYM_DEFS[cleanKey]={key:cleanKey,ctMatch:[],bn:bnSym,label:bnSym.replace('USDT','/USDT'),name:bnSym,digits:2,defSL:10,defTP:20,pip:0.01,weekend:true};
    status.textContent='Added '+bnSym+' — will confirm it\'s a real Binance pair once you select it (invalid symbols will just fail to stream).';status.style.color='var(--green)';
    $('symSearch').value='';renderSymbolList();
  }
}
function def_or(key){return SYM_DEFS[key]?SYM_DEFS[key].label:key;}

// ========== CTRADER CONNECTION ==========
// FIX (login flakiness bug): connectCT() had no guard against being called
// again while an attempt was already in flight. Every tap of CONNECT opened
// a brand new WebSocket, but they all shared the single state.ws variable —
// so a slow-to-open earlier socket and a newer one would race, and whichever
// one's onopen fired last would "win" state.ws even if it wasn't the one the
// server was mid-handshake with. Messages could end up sent on one socket
// while the server expected them on another, which is exactly what produces
// CANT_ROUTE_REQUEST — and repeatedly tapping CONNECT "worked eventually"
// only because it occasionally left you with just one clean connection.
// Failed attempts also never cleared the old heartbeat interval, so retries
// leaked a stacking setInterval. Now: ignore taps while already connecting,
// and forcibly tear down (handlers detached first, so it can't fire stale
// callbacks into shared state) anything left over before opening a new one.
// FIX: closing the browser tab/app without the WebSocket sending a proper
// close frame can leave cTrader's server still holding that session open
// for a while. A later connection attempt for the same account can then
// collide with that stale session server-side, which is what produces
// CANT_ROUTE_REQUEST — and it can keep happening for a bit no matter how
// correct the client code is, since the old session has to time out on
// cTrader's end, not ours. This at least makes sure OUR side always sends
// a clean close when you actually leave the page.
window.addEventListener('pagehide',()=>{
  state.intentionalDisconnect=true;clearTimeout(state.ctReconnectTimer);clearTimeout(state.envSwitchTimer);clearInterval(state.hbTimer);
  if(state.ws){try{state.ws.close(1000,'page hidden');}catch(e){}}
});

function clearCtSocket(ws,clean=true){
  if(!ws)return;
  try{ws.onopen=null;ws.onmessage=null;ws.onerror=null;ws.onclose=null;ws.close(clean?1000:1006,clean?'client close':'connection reset');}catch(e){}
}
function scheduleCtReconnect(reason){
  if(state.intentionalDisconnect)return;
  clearTimeout(state.ctReconnectTimer);
  state.ctReconnectTimer=setTimeout(()=>{
    state.ctReconnectTimer=null;
    if(!state.intentionalDisconnect&&!state.connected&&!state.connecting)connectCT();
  },2500);
  ctStatus(reason||'Connection dropped — reconnecting...');
}
function connectCT(){
  if(state.connecting){ctStatus('Already connecting — please wait...');return;}
  if(state.connected&&state.ws&&state.ws.readyState===1){ctStatus('Already connected.');return;}
  clearTimeout(state.ctReconnectTimer);state.intentionalDisconnect=false;state.connecting=true;setConnectBtnEnabled(false);
  if(state.ws){
    const old=state.ws;state.ws=null;clearInterval(state.hbTimer);clearCtSocket(old,true);
    setTimeout(()=>connectCTOpen(),500);return;
  }
  connectCTOpen();
}
function connectCTOpen(){
  clearInterval(state.hbTimer);
  state.clientId=$('ctId').value.trim();state.clientSecret=$('ctSec').value.trim();state.env=$('ctEnv').value;loadCtEnvState(state.env,true);state.accessToken=$('ctTok').value.trim();rememberCtEnvState();
  if(!state.clientId||!state.clientSecret||!state.accessToken){state.connecting=false;setConnectBtnEnabled(true);hideLoading();alert('Fill all fields');return;}
  saveCreds();showLoading('Connecting to cTrader...');ctStatus('Opening '+state.env.toUpperCase()+' connection...');
  const host=state.env==='live'?'wss://live.ctraderapi.com:5036':'wss://demo.ctraderapi.com:5036';
  const generation=++state.connectionGeneration;let ws;
  try{ws=new WebSocket(host);}catch(e){state.connecting=false;setConnectBtnEnabled(true);hideLoading();ctStatus('Failed to open connection: '+e.message);alert('Failed: '+e.message);return;}
  state.ws=ws;
  ws.onopen=()=>{
    if(state.ws!==ws||generation!==state.connectionGeneration)return;
    state.connected=true;ctStatus('Connected — authorizing application...');
    send(PT.APP_AUTH_REQ,{clientId:state.clientId,clientSecret:state.clientSecret});
    state.hbTimer=setInterval(()=>send(PT.HEARTBEAT,{}),8000);
  };
  ws.onmessage=ev=>{
    if(state.ws!==ws||generation!==state.connectionGeneration)return;
    let m;try{m=JSON.parse(ev.data);}catch(e){return;}handleCT(m);
  };
  ws.onclose=ev=>{
    if(state.ws!==ws||generation!==state.connectionGeneration)return;
    state.ws=null;state.connected=false;state.accountReady=false;clearInterval(state.hbTimer);setConnBadge('OFFLINE','off');
    state.connecting=false;setConnectBtnEnabled(true);hideLoading();
    if(state.intentionalDisconnect)return;
    if(!state.wasEverConnected)ctStatus('Connection closed before finishing (code '+ev.code+'). Check the selected '+state.env.toUpperCase()+' account/token, then try CONNECT again.');
    else scheduleCtReconnect('Connection dropped — reconnecting automatically...');
  };
  ws.onerror=()=>{
    if(state.ws!==ws||generation!==state.connectionGeneration)return;
    setConnBadge('ERROR','off');ctStatus('WebSocket error — waiting for cTrader to close the failed session...');
  };
}
function setConnectBtnEnabled(on){const b=$('ctConnectBtn');if(b){b.disabled=!on;b.style.opacity=on?'1':'0.5';}}
function ctStatus(msg){const el=$('ctStatus');if(el)el.textContent=msg;}
function send(pt,payload){
  if(!state.ws||state.ws.readyState!==1||(!state.accountId&&pt!==PT.APP_AUTH_REQ&&pt!==PT.GET_ACCOUNTS_REQ&&pt!==PT.HEARTBEAT))return null;
  const id='m'+(state.msgSeq++);
  try{state.ws.send(JSON.stringify({clientMsgId:id,payloadType:pt,payload}));return id;}catch(e){return null;}
}
function handleCT(m){
  const pt=m.payloadType,p=m.payload||{};
  switch(pt){
    case PT.APP_AUTH_RES:ctStatus('Application authorized — fetching accounts...');send(PT.GET_ACCOUNTS_REQ,{accessToken:state.accessToken});break;
    case PT.GET_ACCOUNTS_RES:{
      const accs=p.ctidTraderAccount||[];
      const want=state.env==='live';
      // FIX: this used to fall back to accs[0] when no account matched the
      // selected environment, which silently tried to authorize a LIVE
      // account on the DEMO websocket host (or vice versa). cTrader rejects
      // that mismatch with an ERROR_RES, which showed up as a confusing
      // "token may have expired" alert — the real issue was there simply
      // wasn't a matching-environment account on this token. No more silent
      // fallback: log exactly what accounts this token has access to, so a
      // missing demo/live account is obvious instead of masked.
      // Write to the console AND the login-screen status line (not just the
      // mini-log, which lives on the dashboard screen you haven't reached
      // yet if login is failing) so this is actually visible when it matters.
      const accSummary=accs.length?accs.map(a=>(a.isLive?'LIVE':'DEMO')+' #'+a.ctidTraderAccountId).join(', '):'(empty list)';
      console.log('[cTrader] Token has '+accs.length+' account(s): '+accSummary);
      log('Token has '+accs.length+' account(s): '+accSummary);
      ctStatus('Token accounts: '+accSummary+' — checking for '+state.env.toUpperCase()+'...');
      const envAccs=accs.filter(a=>!!a.isLive===want);
      let savedId=null;try{savedId=localStorage.getItem('tpea_ct_account_'+state.env);}catch(e){}
      const ac=envAccs.find(a=>String(a.ctidTraderAccountId)===String(savedId))||envAccs[0];
      if(!ac){
        hideLoading();state.connecting=false;state.connected=false;state.accountReady=false;state.accountId=null;setConnectBtnEnabled(true);
        const have=accs.length?accs.map(a=>a.isLive?'LIVE':'DEMO').join(', '):'none';
        ctStatus('No '+state.env.toUpperCase()+' account found on this token. This token only has: '+have+'.');
        alert('No '+state.env.toUpperCase()+' account on this token (it has: '+have+'). In cTrader, make sure a '+state.env+' account is linked to your cTrader ID and was included when you approved this app, then get a fresh token and try again.');
        return;
      }
      ctStatus('Found '+state.env.toUpperCase()+' account '+ac.ctidTraderAccountId+' — authorizing...');state.accountId=ac.ctidTraderAccountId;rememberCtEnvState();send(PT.ACC_AUTH_REQ,{ctidTraderAccountId:state.accountId,accessToken:state.accessToken});break;}
    case PT.ACC_AUTH_RES:state.accountReady=true;state.wasEverConnected=true;state.connecting=false;setConnectBtnEnabled(true);hideLoading();ctStatus('Connected.');setConnBadge(state.env==='live'?'LIVE':'DEMO',state.env==='live'?'live':'demo');send(PT.TRADER_REQ,{ctidTraderAccountId:state.accountId});send(PT.SYMBOLS_LIST_REQ,{ctidTraderAccountId:state.accountId});send(PT.RECONCILE_REQ,{ctidTraderAccountId:state.accountId,returnProtectionOrders:true});initAsset();fastStartFromCache(state.currentSymbol);showScreen('dash');initChart();startNewsEngine();break;
    case PT.TRADER_RES:applyTrader(p.trader);break;
    case PT.SYMBOLS_LIST_RES:indexSymbols(p.symbol||[]);break;
    case PT.SYMBOL_BY_ID_RES:applySymbol((p.symbol||[])[0]);break;
    case PT.GET_TRENDBARS_RES:applyHistory(m,p);break;
    case PT.SPOT_EVENT:onSpot(p);break;
    case PT.EXECUTION_EVENT:onExec(p);break;
    case PT.ORDER_ERROR_EVENT:{
        const code=p.errorCode||'ORDER_ERROR',desc=p.description||'';
        const friendly={TRADING_BAD_VOLUME:'Broker rejected the lot size/volume for this symbol.',TRADING_BAD_PRICES:'Broker rejected the requested price.',TRADING_BAD_STOPS:'Stop-loss distance is outside this symbol\'s allowed range.',NOT_ENOUGH_MONEY:'Not enough free margin for this order.',TRADING_DISABLED:'Trading is disabled for this symbol.',TRADING_NOT_ALLOWED:'This account is not allowed to trade.'};
        log('Order error: '+code+(desc?' — '+desc:'')+(friendly[code]?' | '+friendly[code]:''));
        break;}
    case PT.ERROR_RES:{
      hideLoading();state.connecting=false;
      const code=p.errorCode||'';
      log('API error: '+code+(p.description?(' — '+p.description):''));
      // FIX: this used to tell you "Your Access Token may have expired" for
      // EVERY error code, including ones that have nothing to do with your
      // token at all (ALREADY_SUBSCRIBED, INVALID_REQUEST, etc.) — which is
      // both wrong and actively harmful: it trains you to keep re-logging-in
      // for problems a fresh login can't fix, and each unnecessary reconnect
      // attempt is exactly what causes CANT_ROUTE_REQUEST pileups below.
      // Only the error codes that actually mean "your token/session is bad"
      // get the re-login message now; everything else gets its own accurate
      // explanation.
      const AUTH_ERRORS=['OA_AUTH_TOKEN_EXPIRED','INVALID_ACCESS_TOKEN','ACCOUNT_NOT_AUTHORIZED','CLIENT_AUTH_FAILURE','UNAUTHORIZED'];
      if(code==='CANT_ROUTE_REQUEST'){
        // Server-side routing conflict — usually a previous session for this
        // account hasn't been cleaned up on cTrader's end yet (e.g. the app
        // was closed/backgrounded earlier without a clean disconnect). This
        // is NOT actually your access token expiring, despite what it might
        // look like — retrying immediately tends to just add to the pileup,
        // so force a short cooldown instead of letting CONNECT be tapped
        // straight away.
        ctStatus('cTrader is still clearing a previous session for this account. Waiting 20s before you can retry...');
        setConnectBtnEnabled(false);
        let secs=20;
        const iv=setInterval(()=>{
          secs--;
          if(secs<=0){clearInterval(iv);setConnectBtnEnabled(true);ctStatus('You can try CONNECT again now.');}
          else ctStatus('cTrader is still clearing a previous session for this account. Waiting '+secs+'s before you can retry...');
        },1000);
      }else if(code==='ALREADY_SUBSCRIBED'){
        // Harmless — a price feed subscription arrived twice for the same
        // symbol (normal on a fast reconnect). Doesn't need your attention
        // or an alert; the feed is fine either way.
        ctStatus('(Already subscribed to this symbol\'s price feed — no action needed.)');
      }else if(code==='INVALID_REQUEST'){
        setConnectBtnEnabled(true);
        ctStatus('Request rejected: '+(p.description||'missing or invalid fields')+'. This is a bug in what was sent, not your login — please report it.');
        alert('cTrader rejected a request as invalid: '+(p.description||code)+'. This is not a token problem — no need to log in again.');
      }else if(AUTH_ERRORS.includes(code)){
        state.accountReady=false;state.connected=false;state.accountId=null;
        setConnectBtnEnabled(true);
        ctStatus('Authentication error: '+code+(p.description?(' — '+p.description):'')+'.');
        alert('cTrader authentication error: '+code+(p.description?(' — '+p.description):'')+'. Refresh the Access Token, then connect again.');
      }else{
        setConnectBtnEnabled(true);
        ctStatus('API error: '+code+(p.description?(' — '+p.description):''));
        alert('cTrader error: '+code+(p.description?(' — '+p.description):''));
      }
      break;}
    case PT.RECONCILE_RES:(p.position||[]).forEach(pos=>trackPosition(pos));break;
  }
}

// ========== BINANCE CONNECTION ==========
async function connectBN(){
  state.bnApiKey=$('bnKey').value.trim();state.bnApiSecret=$('bnSec').value.trim();state.env=$('bnEnv').value;state.bnRelayUrl=$('bnRelay').value.trim().replace(/\/$/,'');
  if(!state.bnApiKey||!state.bnApiSecret){alert('Fill all fields');return;}
  saveCreds();showLoading('Connecting to Binance...');
  try{const acct=await bnCall('/api/binance/account',{});if(acct.error){hideLoading();alert('Error: '+acct.error);return;}applyBNAccount(acct);state.accountReady=true;state.wasEverConnected=true;hideLoading();setConnBadge(state.env==='live'?'BINANCE LIVE':'BINANCE TEST',state.env==='live'?'live':'demo');showScreen('dash');initAsset();initChart();startNewsEngine();startBnStream();}catch(e){hideLoading();alert('Relay error. Is binance_relay.py running?');}
}
async function bnCall(path,body){const r=await fetch(state.bnRelayUrl+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({apiKey:state.bnApiKey,apiSecret:state.bnApiSecret,testnet:state.env!=='live',market:'spot'},body))});return r.json();}
function applyBNAccount(acct){if(!acct||acct.error)return;if(acct.balances){const u=acct.balances.find(b=>b.asset==='USDT');state.balance=u?parseFloat(u.free)+parseFloat(u.locked):0;}else{state.balance=parseFloat(acct.totalWalletBalance||0);}state.equity=state.balance;if(state.startBalance==null)state.startBalance=state.balance;updateDash();}

// ========== ASSET INIT ==========
function initAsset(){
  const sym=state.currentSymbol;const def=SYM_DEFS[sym];if(!def)return;
  if(!state.assets[sym])state.assets[sym]={key:sym,label:def.label,name:def.name,symbolId:null,full:null,lastPrice:0,bid:null,ask:null,bars1:[],bars5:[],bars15:[],bars30:[],bars60:[],currentBar:null,dataReady:false,positions:[],signal:'WAIT',score:0,streak:0,lastDir:'WAIT',lastTradeAt:0,lastCloseAt:0,floatingPnL:0,emaFast:null,emaSlow:null,emaTrend:null,rsi:null,atr:null,momentum:0};
  const a=state.assets[sym];a.bnSymbol=def.bn;
  setText('sigPair',def.label+' - '+def.name);
  setText('robotMeta',STRATEGY_LABELS[cfg.strategy]+' &bull; '+def.label+' &bull; '+(state.auto?'Auto':'Manual'));
}
function initAssetBN(){initAsset();const a=state.assets[state.currentSymbol];if(a)a.bnSymbol=SYM_DEFS[state.currentSymbol].bn;bnSubscribe(a);bnSeed(a);}

function indexSymbols(list){
  state.symbolsByNorm={};list.forEach(s=>{state.symbolsByNorm[norm(s.symbolName)]=s;cacheSymbolId(s.symbolName,s.symbolId);});
  activateCtSymbol(state.currentSymbol);
}
// SPEED: the chart used to sit empty until the full broker symbol list came
// back, THEN it looked up this symbol's ID, THEN it requested candle
// history — two full round trips after login before a single candle could
// draw. Since a symbol's numeric ID on a given account/environment doesn't
// change between sessions, cache it locally and, on reconnect, kick off the
// candle-history request immediately using the cached ID — in parallel with
// the fresh symbol list request, not after it. If the cached ID turns out
// wrong (broker changed something) the normal indexSymbols() path below
// still runs once the real list arrives and corrects it.
function symCacheKey(sym){return 'tpea_symid_'+state.env+'_'+sym;}
function cacheSymbolId(symbolName,id){
  for(const key in SYM_DEFS){
    if(SYM_DEFS[key].ctMatch.some(m=>norm(m)===norm(symbolName))){
      try{localStorage.setItem(symCacheKey(key),id);}catch(e){}
    }
  }
}
function fastStartFromCache(sym){
  let id;try{id=localStorage.getItem(symCacheKey(sym));}catch(e){id=null;}
  if(!id)return;
  const a=state.assets[sym];if(!a||a.symbolId)return; // already resolved (real list beat us here) — skip
  id=parseInt(id,10);if(!id)return;
  a.symbolId=id; // provisional — activateCtSymbol() will confirm/correct this once the real symbol list arrives
  send(PT.SUBSCRIBE_SPOTS_REQ,{ctidTraderAccountId:state.accountId,symbolId:[id]});
  a.subscribedSymbolId=id; // tracked separately from dataReady — see activateCtSymbol
  fetchHistory(id);
  log('Fast-starting '+sym+' chart from last known symbol ID while confirming with broker...');
}
// FIX: subscribing/fetching-history for a symbol only ever ran once, from
// indexSymbols() right after connecting — switching symbols via the Allowed
// Symbols list changed state.currentSymbol but never subscribed to its price
// feed or loaded its chart history at all. Every symbol past the first one
// would have shown a permanently frozen price. Pulled the subscribe+fetch
// logic into its own function so the symbol-switch handler can call it too.
function activateCtSymbol(sym){
  const def=SYM_DEFS[sym];if(!def)return;
  if(!state.accountReady)return; // will run again once SYMBOLS_LIST_RES arrives after connecting
  let hit=null;for(const m of def.ctMatch){const s=state.symbolsByNorm[norm(m)];if(s){hit=s;break;}}
  if(!hit){log(sym+' not found on this account');return;}
  const a=state.assets[sym];if(!a)return;
  if(a.symbolId===hit.symbolId&&a.dataReady&&a.subscribedSymbolId===hit.symbolId)return; // fully settled, nothing to do
  const idChanged=a.symbolId!=null&&a.symbolId!==hit.symbolId;
  a.symbolId=hit.symbolId;a.full=hit;
  // FIX: this used to gate re-subscribing on BOTH symbolId matching AND
  // dataReady being true. dataReady only flips once candle history finishes
  // loading (a separate, slower round trip) — so whenever fastStartFromCache()
  // had already subscribed using the cached ID, and the real symbol list then
  // confirmed the SAME id before history finished, dataReady was still false
  // and this fired a second SUBSCRIBE_SPOTS_REQ for a symbol already
  // subscribed. cTrader correctly rejects that as ALREADY_SUBSCRIBED.
  // Subscription state and "do we have candle data yet" are two separate
  // questions — track them with two separate flags instead of one.
  if(a.subscribedSymbolId!==hit.symbolId){
    send(PT.SUBSCRIBE_SPOTS_REQ,{ctidTraderAccountId:state.accountId,symbolId:[hit.symbolId],subscribeToSpotTimestamp:true});
    a.subscribedSymbolId=hit.symbolId;
  }
  send(PT.SYMBOL_BY_ID_REQ,{ctidTraderAccountId:state.accountId,symbolId:[hit.symbolId]});
  if(idChanged||!a.dataReady)fetchHistory(hit.symbolId); // avoid a redundant re-fetch if the cached fast-start already got the right ID
}
function norm(s){return String(s).toUpperCase().replace(/[^A-Z]/g,'');}
// FIX: this app was hardcoding "1 lot = 100,000 units" everywhere (volume calc,
// P&L calc, close volume) — that's only true for standard FX pairs. For metals/
// crypto CFDs the broker's own lotSize differs, and this exact assumption is
// what produced a runaway 9,999,999,999,999-lot order in earlier testing on a
// different build. Always read the real value from the symbol data cTrader
// already sent us (a.full.lotSize), falling back to the FX standard only if
// that data hasn't loaded yet.
function lotSizeFor(a){
  const n=Number(a?.full?.lotSize);
  return Number.isFinite(n)&&n>0&&n<1e15?n:0;
}
function brokerMinVolumeFor(a){
  const v=Number(a?.full?.minVolume);
  return Number.isFinite(v)&&v>0&&v<1e15?v:0;
}
function brokerStepVolumeFor(a){
  const v=Number(a?.full?.stepVolume);
  return Number.isFinite(v)&&v>0&&v<1e15?v:brokerMinVolumeFor(a);
}
function brokerMaxVolumeFor(a){
  const v=Number(a?.full?.maxVolume);
  return Number.isFinite(v)&&v>0&&v<1e15?v:Infinity;
}
function fallbackStartLot(a){
  const k=a?.key||'';
  if(k==='XAUUSD'||k==='XAGUSD')return 0.01;
  if(k.endsWith('USDT'))return 0.01;
  return 0.10;
}
function cleanLotNumber(n){
  const x=Number(n);
  if(!Number.isFinite(x)||x<=0||x>1000)return 0.01;
  return Number(x.toFixed(6));
}
function formatLots(n){
  const x=cleanLotNumber(n);
  if(x>=1)return String(Number(x.toFixed(2)));
  if(x>=0.01)return String(Number(x.toFixed(2)));
  return String(Number(x.toFixed(6)));
}
function normalizeLots(a,lots){
  const lotSize=lotSizeFor(a);if(!lotSize||!Number.isFinite(Number(lots))||Number(lots)<=0)return null;
  const minVol=brokerMinVolumeFor(a),step=brokerStepVolumeFor(a)||minVol,maxVol=brokerMaxVolumeFor(a);
  let raw=Number(lots)*lotSize;
  if(minVol)raw=Math.max(raw,minVol);
  if(step)raw=Math.round(raw/step)*step;
  if(minVol)raw=Math.max(raw,minVol);
  if(Number.isFinite(maxVol))raw=Math.min(raw,maxVol);
  if(step)raw=Math.floor(raw/step)*step;
  if(minVol)raw=Math.max(raw,minVol);
  return Number.isFinite(raw)&&raw>0?Math.round(raw):null;
}
function volumeFor(a,lots){const v=normalizeLots(a,lots);return v==null?NaN:v;}
function minLotsFor(a){const lotSize=lotSizeFor(a),minVol=brokerMinVolumeFor(a);return lotSize&&minVol?minVol/lotSize:null;}
function setBrokerLotHint(a){
  const lotSize=lotSizeFor(a),minVol=brokerMinVolumeFor(a),stepVol=brokerStepVolumeFor(a),maxVol=brokerMaxVolumeFor(a);
  if(!lotSize||!minVol||!stepVol){
    const fallback=fallbackStartLot(a);cfg.lotSize=fallback;const input=$('cfgLot');if(input){input.value=formatLots(fallback);input.step='0.01';input.min='0.01';input.max='100';}return;
  }
  const minLots=minVol/lotSize,stepLots=stepVol/lotSize,maxLots=Number.isFinite(maxVol)?maxVol/lotSize:Infinity;
  // Use a clean MT-style starting size: FX 0.10, metals/crypto 0.01, but never
  // below the broker minimum or above its maximum. Orders still use the exact
  // broker volume conversion underneath.
  let start=Math.max(fallbackStartLot(a),minLots);
  if(Number.isFinite(maxLots))start=Math.min(start,maxLots);
  if(stepLots>0)start=Math.ceil(start/stepLots-1e-12)*stepLots;
  if(Number.isFinite(maxLots))start=Math.min(start,maxLots);
  start=cleanLotNumber(start);
  cfg.lotSize=start;
  const input=$('cfgLot');
  if(input){
    input.step=String(Math.max(0.000001,cleanLotNumber(stepLots)));
    input.min=formatLots(minLots);input.max=Number.isFinite(maxLots)?formatLots(maxLots):'100';input.value=formatLots(start);
  }
  log(a.label+' lot size: '+formatLots(start)+' (broker min '+formatLots(minLots)+', step '+formatLots(stepLots)+')');
}
function dollarPerUnitFor(volumeInBrokerUnits){ return volumeInBrokerUnits/100; } // cTrader volume is expressed in 0.01 base units (cents)
function digitsFor(a){ return a.full && a.full.digits!=null ? a.full.digits : (SYM_DEFS[a.key]?SYM_DEFS[a.key].digits:5); }
function roundToDigits(price,digits){ const s=Math.pow(10,digits); return Math.round(price*s)/s; }
function fetchHistory(id,attempt){
  const msgId=send(PT.GET_TRENDBARS_REQ,{ctidTraderAccountId:state.accountId,symbolId:id,period:'M1',fromTimestamp:Date.now()-8640*60000,toTimestamp:Date.now()});
  const n=attempt||1;if(msgId)state.pendingTrendbarRequests[msgId]={symId:id,attempt:n};
  setTimeout(()=>{if(msgId&&state.pendingTrendbarRequests[msgId]){delete state.pendingTrendbarRequests[msgId];if(n<3)fetchHistory(id,n+1);}},10000);
}
function applyHistory(m,p){
  const pen=state.pendingTrendbarRequests[m.clientMsgId];delete state.pendingTrendbarRequests[m.clientMsgId];if(!pen)return;
  const a=Object.values(state.assets).find(x=>x.symbolId===pen.symId);if(!a)return;
  const raw=p.trendbar||[];if(!raw.length){if(pen.attempt<3)fetchHistory(pen.symId,pen.attempt+1);return;}
  a.bars1=raw.map(tb=>{const l=(tb.low||0)/1e5;return{t:tb.utcTimestampInMinutes*60000,o:l+(tb.deltaOpen||0)/1e5,h:l+(tb.deltaHigh||0)/1e5,l,c:l+(tb.deltaClose!=null?tb.deltaClose:(tb.deltaOpen||0))/1e5};}).sort((x,y)=>x.t-y.t).slice(-3000);
  buildHigher(a);a.dataReady=true;log(a.label+' history loaded ('+a.bars1.length+' bars)');
  // FIX: this used to loop candleSeries.update() per historical bar — .update()
  // is for a single live tick, not bulk history, and it never clears whatever
  // was already on the chart. On a symbol switch that meant the new symbol's
  // candles got smeared on top of the previous symbol's instead of replacing
  // them. Only touch the chart if this history is actually for the symbol
  // currently on screen, and go through redrawChart() so it also respects
  // whatever timeframe/EMA overlay is currently selected.
  if(candleSeries&&a.key===state.currentSymbol)redrawChart();
}
function buildHigher(a){
  const bucket=(mins,max)=>{const b={};a.bars1.forEach(x=>{const k=Math.floor(x.t/(mins*60000))*(mins*60000);const q=b[k]||{t:k,o:x.o,h:x.h,l:x.l,c:x.c};q.h=Math.max(q.h,x.h);q.l=Math.min(q.l,x.l);q.c=x.c;b[k]=q;});return Object.values(b).sort((x,y)=>x.t-y.t).slice(-max);};
  a.bars5=bucket(5,400);a.bars15=bucket(15,300);a.bars30=bucket(30,200);a.bars60=bucket(60,150);
}
// FIX: the Timeframe dropdown in Settings was stored (cfg.tf) but never
// actually used anywhere — computeIndicators() always read bars15 no matter
// what you picked, and H1 didn't even have a bar array built at all. Confirmed
// bug. This is the single lookup every timeframe-aware function below now uses.
function tfBars(a,tf){
  return tf===1?a.bars1:tf===5?a.bars5:tf===15?a.bars15:tf===30?a.bars30:tf===60?a.bars60:a.bars15;
}
function applySymbol(sym){
  if(!sym)return;
  const a=Object.values(state.assets).find(x=>x.symbolId===sym.symbolId);if(!a)return;
  a.full=sym;
  if(sym.digits!=null&&SYM_DEFS[a.key])SYM_DEFS[a.key].digits=Number(sym.digits);
  setBrokerLotHint(a);
  if(candleSeries&&a.key===state.currentSymbol)redrawChart();
}
function applyTrader(t){if(!t)return;state.moneyDigits=t.moneyDigits||2;state.balance=t.balance/Math.pow(10,state.moneyDigits);state.equity=t.equity/Math.pow(10,state.moneyDigits);if(state.startBalance==null)state.startBalance=state.balance;updateDash();}

// ========== CHART ==========
const CHART_TF_OPTIONS=[{m:1,l:'1m'},{m:5,l:'5m'},{m:15,l:'15m'},{m:30,l:'30m'},{m:60,l:'1H'}];
function renderChartTfButtons(){
  const row=$('chartTfRow');if(!row)return;
  row.innerHTML='';
  CHART_TF_OPTIONS.forEach(opt=>{
    const b=document.createElement('button');
    b.textContent=opt.l;
    b.style.cssText='background:'+(cfg.tf===opt.m?'rgba(255,0,51,0.15)':'var(--panel)')+'; border:1px solid '+(cfg.tf===opt.m?'var(--red)':'var(--line)')+'; color:'+(cfg.tf===opt.m?'var(--red)':'var(--dim)')+'; border-radius:8px; padding:4px 10px; font-family:Orbitron; font-size:10px; font-weight:700; cursor:pointer;';
    b.onclick=()=>{cfg.tf=opt.m;renderChartTfButtons();redrawChart();};
    row.appendChild(b);
  });
}
function initChart(){
  if(!document.getElementById('tvChart'))return;
  $('chartLoading').style.display='none';
  const chartEl=document.getElementById('tvChart');
  tvChart= LightweightCharts.createChart(chartEl,{
    width:chartEl.clientWidth,height:220,layout:{background:{color:'#12121a'},textColor:'#6b6b80'},grid:{vertLines:{color:'#1a1a25'},horzLines:{color:'#1a1a25'}},
    crosshair:{mode:LightweightCharts.CrosshairMode.Normal},rightPriceScale:{borderColor:'#2a2a3a'},timeScale:{borderColor:'#2a2a3a',timeVisible:true,secondsVisible:false}
  });
  candleSeries=tvChart.addCandlestickSeries({upColor:'#00ff88',downColor:'#ff0033',borderUpColor:'#00ff88',borderDownColor:'#ff0033',wickUpColor:'#00ff88',wickDownColor:'#ff0033'});
  // Indicator overlay: EMA5/13/89 (green/cyan/gold) for the EMA Trend styles,
  // EMA9/21 (cyan/gold) for everything else — same indicators the signal
  // engine itself actually reads, not decorative placeholders.
  emaLine1=tvChart.addLineSeries({color:'#00ff88',lineWidth:1,priceLineVisible:false,lastValueVisible:false});
  emaLine2=tvChart.addLineSeries({color:'#00f0ff',lineWidth:1,priceLineVisible:false,lastValueVisible:false});
  emaLine3=tvChart.addLineSeries({color:'#ffd700',lineWidth:2,priceLineVisible:false,lastValueVisible:false});
  // FIX: this used to resize on every window 'resize' event unconditionally.
  // On mobile, opening the keyboard while typing in Config (a different,
  // hidden screen) also fires a window resize — and at that moment
  // chartEl.clientWidth reads 0 because the chart's screen isn't visible,
  // which silently shrank the chart to 0 width. Coming back to the
  // dashboard afterward showed a dark chart with no candles: they were
  // still there, just drawn into a 0px-wide canvas. Only resize when the
  // container actually has real width (i.e. its screen is on-screen).
  window.addEventListener('resize',()=>{if(tvChart&&chartEl.clientWidth>0)tvChart.resize(chartEl.clientWidth,220);});
  renderChartTfButtons();
  redrawChart();
}
// Full rebuild: candles + EMA overlay for whatever timeframe (cfg.tf) and
// strategy are currently active. Called on symbol switch, timeframe change,
// strategy change, and whenever a new bar closes on the active timeframe.
function redrawChart(){
  if(!candleSeries)return;
  const a=state.assets[state.currentSymbol];if(!a)return;
  const bars=tfBars(a,cfg.tf);
  if(!bars.length)return;
  const data=bars.map(b=>({time:b.t/1000,open:b.o,high:b.h,low:b.l,close:b.c}));
  candleSeries.setData(data);
  const closes=bars.map(b=>b.c);
  const times=bars.map(b=>b.t/1000);
  const toLine=(seriesVals)=>seriesVals.map((v,i)=>v==null?null:{time:times[i],value:v}).filter(x=>x!==null);
  if(cfg.strategy==='emaRide'||cfg.strategy==='emaPullback'){
    emaLine1.setData(toLine(emaLineSeries(closes,5)));
    emaLine2.setData(toLine(emaLineSeries(closes,13)));
    emaLine3.setData(toLine(emaLineSeries(closes,89)));
  }else{
    emaLine1.setData(toLine(emaLineSeries(closes,9)));
    emaLine2.setData(toLine(emaLineSeries(closes,21)));
    emaLine3.setData([]);
  }
  tvChart.timeScale().fitContent();
}
function updateChart(a,price,now){
  if(!candleSeries||!a.currentBar||a.key!==state.currentSymbol)return; // don't let a background symbol's ticks bleed onto the visible chart
  if(cfg.tf===1){
    const t=a.currentBar.t/1000;
    candleSeries.update({time:t,open:a.currentBar.o,high:a.currentBar.h,low:a.currentBar.l,close:a.currentBar.c});
  }
  // Higher timeframes update on bar close (see updateBars' redrawChart() call)
  // rather than every tick — the underlying bucket only actually changes then.
}

// ========== LIVE PRICE & BARS ==========
function onSpot(p){
  const a=Object.values(state.assets).find(x=>x.symbolId===p.symbolId);if(!a)return;
  const bid=p.bid?p.bid/1e5:(a.bid||a.lastPrice||0);const ask=p.ask?p.ask/1e5:(a.ask||a.lastPrice||0);
  if(!bid&&!ask)return;a.bid=bid;a.ask=ask;a.lastPrice=(bid+ask)/2;
  updateBars(a,a.lastPrice,Date.now());computeIndicators(a);computeSignal(a);
  if(a.positions.length){updatePositions(a);checkExits(a);checkTrail(a);if(!state.paused&&!state.stopped&&state.auto)maybeAddStackLeg(a);}
  if(!state.paused&&!state.stopped&&state.auto&&!state.newsBlackout)maybeTrade(a);
  if(state.newsTrading&&state.newsMode)newsBreakoutCheck(a);
  updateChart(a,a.lastPrice,Date.now());updateDash();
}
function updateBars(a,price,now){
  const min=Math.floor(now/60000)*60000;
  if(!a.currentBar||a.currentBar.t!==min){if(a.currentBar){a.bars1.push(a.currentBar);if(a.bars1.length>3000)a.bars1.shift();buildHigher(a);if(candleSeries&&a.key===state.currentSymbol)redrawChart();}a.currentBar={t:min,o:price,h:price,l:price,c:price};}
  else{a.currentBar.h=Math.max(a.currentBar.h,price);a.currentBar.l=Math.min(a.currentBar.l,price);a.currentBar.c=price;}
}

// ========== BINANCE STREAM ==========
function bnSubscribe(a){
  if(!a.bnSymbol)return;const host=state.env==='live'?'wss://stream.binance.com:9443':'wss://stream.testnet.binance.vision:9443';
  const s=a.bnSymbol.toLowerCase();const url=host+'/stream?streams='+s+'@bookTicker/'+s+'@kline_1m';
  try{if(state.bnSockets[a.key]&&state.bnSockets[a.key].readyState<=1)state.bnSockets[a.key].close();}catch(e){}
  const sock=new WebSocket(url);
  sock.onopen=()=>log('Stream: '+a.label);
  sock.onmessage=ev=>{let w;try{w=JSON.parse(ev.data);}catch(e){return;}const msg=w.data||w;
    if(msg.e==='bookTicker'){a.bid=parseFloat(msg.b);a.ask=parseFloat(msg.a);a.lastPrice=(a.bid+a.ask)/2;updateBars(a,a.lastPrice,Date.now());computeIndicators(a);computeSignal(a);if(a.positions.length){updatePositions(a);checkExits(a);checkTrail(a);if(!state.paused&&!state.stopped&&state.auto)maybeAddStackLeg(a);}if(!state.paused&&!state.stopped&&state.auto&&!state.newsBlackout)maybeTrade(a);if(state.newsTrading&&state.newsMode)newsBreakoutCheck(a);updateChart(a,a.lastPrice,Date.now());updateDash();}
    else if(msg.e==='kline'&&msg.k){const k=msg.k;const bar={t:Number(k.t),o:parseFloat(k.o),h:parseFloat(k.h),l:parseFloat(k.l),c:parseFloat(k.c),v:parseFloat(k.v||0)};if(!a.bars1.length||a.bars1[a.bars1.length-1].t!==bar.t)a.bars1.push(bar);else a.bars1[a.bars1.length-1]=bar;if(a.bars1.length>3000)a.bars1.shift();buildHigher(a);computeIndicators(a);computeSignal(a);updateDash();}
  };
  sock.onerror=()=>log(a.label+' stream error');
  sock.onclose=()=>{setTimeout(()=>bnSubscribe(a),1200);};
  state.bnSockets[a.key]=sock;
}
async function bnSeed(a){try{const r=await bnCall('/api/binance/klines',{symbol:a.bnSymbol,interval:'1m',limit:1000});if(Array.isArray(r)){a.bars1=r.map(k=>({t:Number(k[0]),o:parseFloat(k[1]),h:parseFloat(k[2]),l:parseFloat(k[3]),c:parseFloat(k[4]),v:parseFloat(k[5]||0)}));buildHigher(a);a.dataReady=true;computeIndicators(a);if(candleSeries&&a.key===state.currentSymbol)redrawChart();log(a.label+' chart seeded');}}catch(e){log('Seed error: '+e.message);}}

// ========== NEWS ENGINE ==========
function generateNewsCalendar(){
  const now=new Date();const events=[];
  // NFP: First Friday of every month at 8:30 AM EST (13:30 UTC)
  for(let i=0;i<3;i++){const d=new Date(now.getFullYear(),now.getMonth()+i,1);while(d.getDay()!==5)d.setDate(d.getDate()+1);d.setUTCHours(13,30,0,0);events.push({time:d.getTime(),title:'Non-Farm Payrolls (NFP)',currency:'USD',impact:'high',forecast:'+200K',previous:'+180K'});}
  // FOMC: Every 6 weeks (approx) - simplified schedule
  const fomcBase=new Date(2024,0,31); // Jan 31 2024
  for(let i=0;i<6;i++){const d=new Date(fomcBase.getTime()+i*42*86400000);d.setUTCHours(19,0,0,0);if(d.getTime()>now.getTime()-86400000)events.push({time:d.getTime(),title:'FOMC Interest Rate Decision',currency:'USD',impact:'high',forecast:'5.50%',previous:'5.50%'});}
  // CPI: Monthly around 13th at 8:30 AM EST
  for(let i=0;i<3;i++){const d=new Date(now.getFullYear(),now.getMonth()+i,13);d.setUTCHours(13,30,0,0);events.push({time:d.getTime(),title:'CPI Inflation Data',currency:'USD',impact:'high',forecast:'3.2%',previous:'3.1%'});}
  // ECB: Every 6 weeks
  const ecbBase=new Date(2024,0,25);
  for(let i=0;i<6;i++){const d=new Date(ecbBase.getTime()+i*42*86400000);d.setUTCHours(13,15,0,0);if(d.getTime()>now.getTime()-86400000)events.push({time:d.getTime(),title:'ECB Interest Rate Decision',currency:'EUR',impact:'high',forecast:'4.50%',previous:'4.50%'});}
  // Retail Sales: Monthly around 15th
  for(let i=0;i<3;i++){const d=new Date(now.getFullYear(),now.getMonth()+i,15);d.setUTCHours(13,30,0,0);events.push({time:d.getTime(),title:'Retail Sales',currency:'USD',impact:'medium',forecast:'+0.3%',previous:'+0.2%'});}
  // GDP: Quarterly (simplified)
  for(let i=0;i<4;i++){const d=new Date(now.getFullYear(),i*3+1,25);d.setUTCHours(13,30,0,0);if(d.getTime()>now.getTime()-86400000)events.push({time:d.getTime(),title:'GDP Growth Rate',currency:'USD',impact:'high',forecast:'2.1%',previous:'2.0%'});}
  // Weekly: Unemployment Claims every Thursday
  for(let i=0;i<8;i++){const d=new Date(now.getTime()+i*86400000);while(d.getDay()!==4)d.setDate(d.getDate()+1);d.setUTCHours(13,30,0,0);events.push({time:d.getTime(),title:'Unemployment Claims',currency:'USD',impact:'medium',forecast:'220K',previous:'218K'});}
  state.newsEvents=events.sort((a,b)=>a.time-b.time).filter(e=>e.time>now.getTime()-3600000);
}
function checkNews(){
  if(!state.newsEvents.length)return;
  const now=Date.now();
  // Find next event
  state.nextEvent=state.newsEvents.find(e=>e.time>now)||null;
  if(!state.nextEvent){setText('newsText','No upcoming events');setText('newsCountdown','');state.newsBlackout=false;state.newsMode=false;return;}
  const diff=state.nextEvent.time-now;
  const hrs=Math.floor(diff/3600000);const mins=Math.floor((diff%3600000)/60000);const secs=Math.floor((diff%60000)/1000);
  setText('newsCountdown',(hrs>0?hrs+'h ':'')+mins+'m '+secs+'s');
  setText('newsText',state.nextEvent.title+' ('+state.nextEvent.currency+') - '+state.nextEvent.impact.toUpperCase()+' IMPACT');
  // News blackout: 5 min before to 10 min after for non-news-trading mode
  if(!state.newsTrading){state.newsBlackout=diff<300000&&diff>-600000;}
  else{
    // News trading mode
    if(diff<120000&&diff>0&&!state.newsMode){state.newsMode=true;log('NEWS MODE: '+state.nextEvent.title+' in '+Math.floor(diff/60000)+'min');closeAll();}
    if(diff<0&&diff>-600000){state.newsMode=true;}
    if(diff<-600000){state.newsMode=false;}
  }
}
function newsBreakoutCheck(a){
  if(!state.newsMode||!a.lastPrice||!a.bars1.length)return;
  const lastBar=a.bars1[a.bars1.length-1];if(!lastBar)return;
  const move=Math.abs(a.lastPrice-lastBar.c);const pip=SYM_DEFS[a.key].pip||0.01;
  if(move>5*pip){const dir=a.lastPrice>lastBar.c?'BUY':'SELL';log('NEWS BREAKOUT '+dir+' on '+a.label);executeTrade(a,dir);state.newsMode=false;}
}
function renderNewsList(){
  const list=$('newsList');if(!list)return;list.innerHTML='';
  state.newsEvents.slice(0,20).forEach(ev=>{
    const d=new Date(ev.time);
    const div=document.createElement('div');div.className='news-item';
    div.innerHTML='<div class="time">'+d.toLocaleString()+' UTC</div><div class="title">'+ev.title+'</div><div style="font-size:11px;color:var(--dim);">Forecast: '+ev.forecast+' | Previous: '+ev.previous+'</div><span class="impact '+ev.impact+'">'+ev.impact.toUpperCase()+' IMPACT</span>';
    list.appendChild(div);
  });
}
function startNewsEngine(){generateNewsCalendar();setInterval(checkNews,1000);checkNews();}

// ========== INDICATORS ==========
function ema(v,p){if(v.length<p)return null;let e=v.slice(0,p).reduce((x,y)=>x+y,0)/p;const k=2/(p+1);for(let i=p;i<v.length;i++)e=v[i]*k+e*(1-k);return e;}
// Full EMA series (one value per bar, not just the latest) — for plotting a
// line on the chart, distinct from ema() above which only returns the most
// recent value for signal computation.
function emaLineSeries(v,p){
  if(v.length<p)return [];
  const out=new Array(v.length).fill(null);
  let e=v.slice(0,p).reduce((x,y)=>x+y,0)/p;out[p-1]=e;
  const k=2/(p+1);
  for(let i=p;i<v.length;i++){e=v[i]*k+e*(1-k);out[i]=e;}
  return out;
}
function rsi(v,p=14){if(v.length<=p)return null;let g=0,l=0;for(let i=1;i<=p;i++){const d=v[i]-v[i-1];if(d>0)g+=d;else l-=d;}let ag=g/p,al=l/p;for(let i=p+1;i<v.length;i++){const d=v[i]-v[i-1];ag=(ag*(p-1)+Math.max(d,0))/p;al=(al*(p-1)+Math.max(-d,0))/p;}return al===0?100:100-(100/(1+ag/al));}
function atr(bars,p=14){if(bars.length<=p)return null;let tr=[];for(let i=1;i<bars.length;i++){const c=bars[i],pr=bars[i-1];tr.push(Math.max(c.h-c.l,Math.abs(c.h-pr.c),Math.abs(c.l-pr.c)));}let a=tr.slice(0,p).reduce((x,y)=>x+y,0)/p;for(let i=p;i<tr.length;i++)a=(a*(p-1)+tr[i])/p;return a;}

function computeIndicators(a){
  const c1=a.bars1.map(x=>x.c);
  const higherBars=tfBars(a,cfg.tf);
  const cH=higherBars.map(x=>x.c);
  a.emaFast=ema(c1,9);a.emaSlow=ema(c1,21);a.emaTrend=ema(cH,9);a.rsi=rsi(c1,14);a.atr=atr(a.bars1,14);
  const back=c1[Math.max(0,c1.length-4)];a.momentum=back?((c1[c1.length-1]-back)/back)*100:0;
  a.dataReady=c1.length>=50&&cH.length>=20;
}

// Dispatches to whichever engine cfg.strategy picked. "confluence" (and its
// Scalping/Day/Swing/Position presets, which just auto-fill different
// tf/SL/basket/cooldown values into this same engine) all use the trend+
// momentum+RSI+spread scoring below. The two EMA Trend styles use a
// completely different, purpose-built engine (see computeEmaSignal).
function computeSignal(a){
  if(cfg.strategy==='emaRide'||cfg.strategy==='emaPullback'){computeEmaSignal(a);return;}
  computeConfluenceSignal(a);
}
function computeConfluenceSignal(a){
  if(!a.dataReady||!a.lastPrice){a.signal='WAIT';a.score=0;return;}
  const higherLen=tfBars(a,cfg.tf).length;
  const trend=a.emaTrend&&higherLen?a.lastPrice>a.emaTrend?'BUY':'SELL':'WAIT';
  const setup=a.emaFast&&a.emaSlow?(a.emaFast>a.emaSlow?'BUY':a.emaFast<a.emaSlow?'SELL':'WAIT'):'WAIT';
  const momDir=a.momentum>0.004?'BUY':a.momentum<-0.004?'SELL':'WAIT';
  const rsiOk=a.rsi!=null?!(trend==='BUY'&&a.rsi>75)&&!(trend==='SELL'&&a.rsi<25):true;
  const spreadPct=a.ask&&a.bid&&a.lastPrice?((a.ask-a.bid)/a.lastPrice)*100:0;const spreadOk=spreadPct<=cfg.maxSpreadPct;
  let score=0,dir='WAIT';
  if(trend!=='WAIT'&&trend===setup){score=40;dir=trend;if(momDir===dir)score+=20;if(rsiOk)score+=15;if(spreadOk)score+=15;if(Math.abs(a.momentum)>0.008)score+=10;}
  a.signal=dir;a.score=Math.min(100,score);
  if(dir!=='WAIT'&&a.lastDir===dir)a.streak++;else{a.lastDir=dir;a.streak=1;}
}

// EMA 5/13/89 strategy, ported from our tested build. EMA5 = fastest reaction,
// EMA13 = confirmation (5-crosses-back-over-13 is the entry trigger), EMA89 =
// trend filter (both 5 and 13 must be on the same side of it). A pullback is
// EMA5/EMA13 coming close together or briefly crossing to the opposite side —
// NOT price touching EMA89. Uses whatever timeframe is picked in Settings
// (cfg.tf), same as every other strategy here.
function computeEmaSignal(a){
  const bars=tfBars(a,cfg.tf);
  const closes=bars.map(x=>x.c);
  if(closes.length<95){a.signal='WAIT';a.score=0;a.emaWarmup=closes.length+'/95 bars';return;}
  const e5=ema(closes,5),e13=ema(closes,13),e89=ema(closes,89);
  const e5p=ema(closes.slice(0,-1),5),e13p=ema(closes.slice(0,-1),13);
  if(e5==null||e13==null||e89==null||e5p==null||e13p==null){a.signal='WAIT';a.score=0;return;}
  a.ema5=e5;a.ema13=e13;a.ema89=e89;
  let trend='WAIT';
  if(e5>e89&&e13>e89)trend='BUY';else if(e5<e89&&e13<e89)trend='SELL';
  a.emaState=a.emaState||{trend:'WAIT',pullback:false};
  const st=a.emaState;
  if(trend!==st.trend){st.trend=trend;st.pullback=false;}
  const gap=Math.abs(e5-e13);
  const closeEnough=gap<=closes[closes.length-1]*0.0006;
  const oppositeCross=trend==='BUY'?(e5<=e13):trend==='SELL'?(e5>=e13):false;
  if(trend!=='WAIT'&&(closeEnough||oppositeCross))st.pullback=true;
  const bar=bars[bars.length-1];const range=bar.h-bar.l;
  const bodyOk=range>0&&(trend==='BUY'?(bar.c>bar.o&&(bar.c-bar.o)>=range*0.4):trend==='SELL'?(bar.c<bar.o&&(bar.o-bar.c)>=range*0.4):false);
  const crossBack=trend==='BUY'?(e5p<=e13p&&e5>e13):trend==='SELL'?(e5p>=e13p&&e5<e13):false;
  const entryOK=trend!=='WAIT'&&st.pullback&&crossBack&&bodyOk;
  a.dataReady=true;
  a.signal=entryOK?trend:'WAIT';a.score=entryOK?100:0;
  a.streak=entryOK?2:0; // EMA entries are event-triggered (fresh cross), not accumulated over ticks like the confluence engine — satisfy maybeTrade's streak>=2 gate directly
  if(entryOK)st.pullback=false; // consumed — wait for the next pullback before firing again
}
// Ride mode has no fixed profit target — it holds until EMA5+EMA13 break
// cleanly back through EMA89 (the trend it was riding is gone). Called from
// checkExits() instead of the basket-profit check for that one style.
function checkEmaTrendFlipExit(a){
  if(cfg.strategy!=='emaRide'||!a.positions.length)return;
  const pos=a.positions[0];
  const trendNow=a.emaState?a.emaState.trend:'WAIT';
  if(trendNow!==pos.side){log('EMA trend flip — closing ride position on '+a.label+'.');closeAllPositions(a);}
}

// ========== TRADING LOGIC ==========
function maybeTrade(a){
  if(!a.dataReady||a.signal==='WAIT'||a.streak<2)return;
  const now=Date.now();
  if(a.lastCloseAt&&now-a.lastCloseAt<cfg.cooldownSec*1000)return;
  if(a.lastTradeAt&&now-a.lastTradeAt<cfg.cooldownSec*1000)return;
  const hasPos=a.positions.length>0;
  const sameDir=hasPos&&a.positions[0].side===a.signal;
  if(hasPos&&sameDir)return;
  if(hasPos&&!sameDir){closeAllPositions(a);return;}
  if(!hasPos)executeTrade(a,a.signal);
}

// FIX: "Positions Per Entry" used to fire ALL of them simultaneously in one
// tight loop at the same price — that's just one oversized trade split into N
// tickets, not real stacking, and it multiplies risk instantly with zero
// confirmation that the move is actually working. Ported from our tested
// build instead: open exactly 1, then add another only once the most recent
// one is already +0.5R in profit, up to the configured count — so risk only
// grows as the trade proves itself.
function executeTrade(a,side){
  const now=Date.now();a.lastTradeAt=now;
  if(state.paper)paperOpen(a,side);else realOpen(a,side);
  log(side+' 1/'+cfg.posPerEntry+' '+cfg.lotSize+' on '+a.label+(cfg.posPerEntry>1?' (adds more as it proves itself, +0.5R per leg)':''));
  updateDash();
}
function maybeAddStackLeg(a){
  if(!a.positions.length||a.positions.length>=cfg.posPerEntry)return;
  const last=a.positions[a.positions.length-1];
  if(!last.initialRisk||last.initialRisk<=0)return;
  const dir=last.side==='BUY'?1:-1;
  const profitDist=(a.lastPrice-last.entryPrice)*dir;
  if(profitDist<last.initialRisk*0.5)return;
  if(state.paper)paperOpen(a,last.side);else realOpen(a,last.side);
  log('Stack leg '+a.positions.length+'/'+cfg.posPerEntry+' added on '+a.label+' (prior leg reached +0.5R).');
  updateDash();
}

function paperOpen(a,side){
  const entry=a.lastPrice;
  const vol=volumeFor(a,cfg.lotSize);
  const slDist=cfg.slDollars/dollarPerUnitFor(vol);
  const sl=side==='BUY'?entry-slDist:entry+slDist;
  a.positions.push({side,entryPrice:entry,volume:vol,stopLoss:sl,takeProfit:null,openedAt:Date.now(),paper:true,peakPnL:0,trailingActive:false,initialRisk:slDist});
}

function realOpen(a,side){
  if(!state.armed){log('LIVE NOT ARMED');return;}
  if(state.broker==='ctrader'){
    const symId=a.symbolId;
    // FIX: this is what produced "INVALID_REQUEST — missing required fields:
    // volume" from the broker, wrongly shown to you as a token-expiry alert.
    // volumeFor() can come back as 0/NaN when a symbol's lot-size details
    // (a.full) haven't loaded yet — e.g. tapping BUY/SELL right after a
    // symbol switch, before SYMBOL_BY_ID_RES arrives. Sending that broken
    // number serializes to JSON null, which the broker reports as a missing
    // field. Catch it here, locally, with a clear reason instead.
    if(!symId){log('Cannot trade '+a.label+' yet — still loading this symbol from the broker. Try again in a moment.');return;}
    if(!a.full||!lotSizeFor(a)||!brokerMinVolumeFor(a)){log('Cannot trade '+a.label+' yet — broker lot rules are still loading.');send(PT.SYMBOL_BY_ID_REQ,{ctidTraderAccountId:state.accountId,symbolId:[symId]});return;}
    const vol=volumeFor(a,cfg.lotSize);
    if(!Number.isFinite(vol)||vol<=0){log('Cannot trade '+a.label+': invalid broker volume '+vol+'.');return;}
    // FIX: NEW_ORDER_REQ takes relativeStopLoss (relative distance, fixed
    // 1/100000-of-price-unit scale per cTrader's own API spec — confirmed by
    // checking their proto docs directly), not an absolute "stopLoss" price
    // field. The previous version here sent an absolute price and would very
    // likely have been rejected or misinterpreted by the broker.
    const slDist=cfg.slDollars/dollarPerUnitFor(vol);
    const relSL=Math.max(1,Math.round(slDist*100000));
    const clientOrderId=('SXU-'+Date.now().toString(36)).slice(0,50);
    send(PT.NEW_ORDER_REQ,{ctidTraderAccountId:state.accountId,symbolId:symId,orderType:1,tradeSide:side==='BUY'?1:2,volume:vol,relativeStopLoss:relSL,label:'SXU',clientOrderId});
  }else{
    bnCall('/api/binance/order',{symbol:a.bnSymbol,side:side==='BUY'?'BUY':'SELL',type:'MARKET',quantity:cfg.lotSize.toString()});
  }
}

function closeAllPositions(a){
  if(!a.positions.length)return;
  a.positions.forEach(pos=>{if(pos.paper)paperClose(a,pos);else realClose(a,pos);});
  a.positions=[];a.lastCloseAt=Date.now();
  updateDash();
}
// Closes one specific position (by asset key + index in a.positions) instead
// of the whole basket — used by the Open Positions panel's per-row close
// button, mirroring how MT5 lets you close individual tickets.
function closeOnePosition(symKey,idx){
  const a=state.assets[symKey];if(!a)return;
  const pos=a.positions[idx];if(!pos)return;
  if(pos.paper){paperClose(a,pos);a.positions.splice(idx,1);updateDash();}
  else{realClose(a,pos);} // real close removes it from a.positions once EXECUTION_EVENT confirms the fill
}

function paperClose(a,pos){
  const exit=a.lastPrice;const pnl=(pos.side==='BUY'?exit-pos.entryPrice:pos.entryPrice-exit)*dollarPerUnitFor(pos.volume);
  state.paperBalance+=pnl;state.todayPnl+=pnl;
  if(pnl>0)state.wins++;else state.losses++;
  log('Paper close '+pos.side+' PnL '+fmtPnL(pnl));
  if(cfg.autoReverse&&a.signal!=='WAIT'&&a.signal!==pos.side){
    setTimeout(()=>{if(!state.paused&&!state.stopped&&state.auto)executeTrade(a,a.signal);},500);
  }
}

function realClose(a,pos){
  if(state.broker==='ctrader'){
    const v=Number(pos.volume);
    if(!Number.isFinite(v)||v<=0){log('Cannot close '+a.label+': broker position volume is invalid.');return;}
    send(PT.CLOSE_POSITION_REQ,{ctidTraderAccountId:state.accountId,positionId:pos.positionId,volume:v});
  }else{
    const side=pos.side==='BUY'?'SELL':'BUY';
    bnCall('/api/binance/order',{symbol:a.bnSymbol,side,type:'MARKET',quantity:cfg.lotSize.toString()});
  }
  log('Close sent: '+pos.side+' on '+a.label);
}

function updatePositions(a){
  let total=0;a.positions.forEach(p=>{
    const pnl=(p.side==='BUY'?a.lastPrice-p.entryPrice:p.entryPrice-a.lastPrice)*dollarPerUnitFor(p.volume);
    p.floatingPnL=pnl;total+=pnl;
    if(pnl>p.peakPnL)p.peakPnL=pnl;
  });
  a.floatingPnL=total;
}

function checkExits(a){
  if(!a.positions.length)return;
  const now=Date.now();
  // Ride mode has no fixed profit target — see checkEmaTrendFlipExit — so skip
  // the basket-profit close for that one style only.
  if(cfg.strategy!=='emaRide'&&a.floatingPnL>=cfg.basketProfit){log('Basket profit: '+fmtPnL(a.floatingPnL));closeAllPositions(a);return;}
  checkEmaTrendFlipExit(a);
  if(!a.positions.length)return; // may have just been closed by the trend-flip check above
  // Max hold time
  const oldest=Math.min(...a.positions.map(p=>p.openedAt));
  if(now-oldest>cfg.maxHoldMin*60000){log('Max hold reached');closeAllPositions(a);return;}
  // Stop-loss and profit-lock trailing now both live in checkTrail() below —
  // that used to be gated behind "already in profit," which meant a paper
  // trade's ORIGINAL stop-loss was never actually enforced on a losing move at
  // all (confirmed missing here — only basket-profit and max-hold could ever
  // close a paper trade that never went positive). Fixed there, not duplicated
  // here.
}

// Ported from our tested build: continuous profit-lock, not a crude "close if
// PnL drops below 50% of peak" — that old rule could give back nearly half of
// a winning trade before doing anything. This locks in ~90% of profit above a
// small $1.50 cushion, only ever tightening, never loosening.
// FIX: the old version applied cfg.trailBuffer (a DOLLAR amount, per its own
// "$" label) directly as a raw PRICE offset — harmless-looking on XAU/USD
// (~4597) but would have been catastrophic on EUR/USD (~1.17), moving the stop
// by a nonsensical multi-unit distance. Now correctly converted through the
// symbol's real $-per-price-unit.
function checkTrail(a){
  if(!a.positions.length)return;
  const digits=digitsFor(a);
  a.positions.forEach(p=>{
    if(!p.paper)return;
    const dollarPerUnit=dollarPerUnitFor(p.volume);
    if(dollarPerUnit<=0)return;
    // Profit-lock ratcheting is optional (cfg.profitProtect) — but the basic
    // stop-loss hit check below is NOT optional and always runs regardless.
    if(cfg.profitProtect){
      const armAt=cfg.trailBuffer!=null?cfg.trailBuffer:0.5;
      if(p.floatingPnL>=armAt){
        const lockedProfit=Math.max(0,0.9*p.floatingPnL-1.5);
        const lockedOffset=lockedProfit/dollarPerUnit;
        let candidateStop=p.side==='BUY'?p.entryPrice+lockedOffset:p.entryPrice-lockedOffset;
        candidateStop=roundToDigits(candidateStop,digits);
        const improves=p.stopLoss==null?true:(p.side==='BUY'?candidateStop>p.stopLoss:candidateStop<p.stopLoss);
        if(improves){p.stopLoss=candidateStop;p.trailingActive=true;}
      }
    }
    if(p.stopLoss==null)return;
    if(p.side==='BUY'&&a.lastPrice<=p.stopLoss){log((p.trailingActive?'Profit lock':'Stop loss')+' closing '+a.label+' ('+fmtPnL(p.floatingPnL)+').');closeAllPositions(a);}
    if(p.side==='SELL'&&a.lastPrice>=p.stopLoss){log((p.trailingActive?'Profit lock':'Stop loss')+' closing '+a.label+' ('+fmtPnL(p.floatingPnL)+').');closeAllPositions(a);}
  });
}

function onExec(p){
  if(!p)return;
  const et=p.executionType;
  if(et==='ORDER_FILL'){
    const a=Object.values(state.assets).find(x=>x.symbolId===p.symbolId);
    if(a){
      const digits=digitsFor(a);
      if(p.positionId&&p.volume>0){
        const side=p.tradeSide===1?'BUY':'SELL';
        const entry=p.price?p.price/1e5:0;
        if(!a.positions.some(x=>x.positionId===p.positionId)){
          a.positions.push({positionId:p.positionId,side,entryPrice:entry,volume:p.volume,stopLoss:null,takeProfit:null,openedAt:Date.now(),paper:false,peakPnL:0,trailingActive:false,initialRisk:cfg.slDollars/dollarPerUnitFor(p.volume)});
        }
        log('Filled '+side+' '+a.label+' @ '+entry.toFixed(digits));
      }
      if(p.closedVolume>0){
        const idx=a.positions.findIndex(x=>x.positionId===p.positionId);
        if(idx>=0){
          const pos=a.positions[idx];const exit=p.price?p.price/1e5:0;
          const pnl=(pos.side==='BUY'?exit-pos.entryPrice:pos.entryPrice-exit)*dollarPerUnitFor(pos.volume);
          state.todayPnl+=pnl;if(pnl>0)state.wins++;else state.losses++;
          a.positions.splice(idx,1);a.lastCloseAt=Date.now();
          log('Closed '+pos.side+' PnL '+fmtPnL(pnl));
          if(cfg.autoReverse&&a.signal!=='WAIT'&&a.signal!==pos.side&&!state.paused&&!state.stopped&&state.auto){
            setTimeout(()=>executeTrade(a,a.signal),500);
          }
        }
      }
    }
    updateDash();
  }
}

function trackPosition(pos){
  const a=Object.values(state.assets).find(x=>x.symbolId===pos.tradeData.symbolId);
  if(!a)return;
  // FIX: no dedup here meant calling this twice for the same broker position
  // (e.g. RECONCILE_RES arriving again from a manual refresh) pushed a
  // second, duplicate entry — doubling P&L, doubling the positions list,
  // and doubling what CLOSE_POSITION_REQ would think it needs to close.
  if(a.positions.some(x=>x.positionId===pos.positionId))return;
  const side=pos.tradeData.tradeSide===1?'BUY':'SELL';
  const entry=pos.price?pos.price/1e5:0;
  a.positions.push({positionId:pos.positionId,side,entryPrice:entry,volume:pos.tradeData.volume,stopLoss:pos.stopLoss?pos.stopLoss/1e5:null,takeProfit:pos.takeProfit?pos.takeProfit/1e5:null,openedAt:Date.now(),paper:false,peakPnL:0,trailingActive:false});
}

// ========== MANUAL CONTROLS ==========
function manualTrade(side){const a=state.assets[state.currentSymbol];if(a)executeTrade(a,side);}
function closeAll(){const a=state.assets[state.currentSymbol];if(a)closeAllPositions(a);}
function togglePause(){
  state.paused=!state.paused;
  $('btnPause').classList.toggle('active',state.paused);
  log(state.paused?'PAUSED':'RESUMED');
}
function toggleStop(){
  state.stopped=!state.stopped;
  $('btnStop').classList.toggle('stop-active',state.stopped);
  if(state.stopped){closeAll();log('STOPPED - All closed');}else{log('RESTARTED');}
}
// FIX: this used to be a full location.reload() — which is exactly what
// produced "it jumps back to the main page in the middle of a trade": an
// accidental pull-to-refresh (very easy to trigger just scrolling up to check
// the dashboard while a trade is open) wiped the entire app state and dropped
// you back on the splash/login screen, needing a full reconnect. There was
// never a real need for that — the WebSocket already streams live prices;
// "refresh" only ever needed to re-pull balance/positions/symbol data over
// the connection that's already open. Falls back to a real reload only if
// the connection is actually down, since then there's nothing to resync.
function manualRefresh(){
  if((state.broker==='ctrader'&&state.connected&&state.accountReady)){
    log('Refreshing account & position data...');
    send(PT.TRADER_REQ,{ctidTraderAccountId:state.accountId});
    send(PT.RECONCILE_REQ,{ctidTraderAccountId:state.accountId,returnProtectionOrders:true});
    const a=state.assets[state.currentSymbol];
    if(a&&a.symbolId)send(PT.SYMBOL_BY_ID_REQ,{ctidTraderAccountId:state.accountId,symbolId:[a.symbolId]});
    updateDash();
  }else if(state.broker==='binance'&&state.accountReady){
    log('Refreshing account data...');
    (async()=>{try{const acct=await bnCall('/api/binance/account',{});if(!acct.error)applyBNAccount(acct);updateDash();}catch(e){}})();
  }else{
    log('Not connected — reloading app...');
    location.reload();
  }
}

/* ---------------- Pull-to-refresh (dashboard) ---------------- */
(function initPullToRefresh(){
  const scroller=document.getElementById('dashScroll'),indicator=document.getElementById('pullIndicator');
  if(!scroller||!indicator)return;
  scroller.style.overscrollBehaviorY='contain';scroller.style.touchAction='pan-y';
  const THRESHOLD=65,MAX_PULL=95;let startY=null,pulling=false,armed=false;
  const reset=()=>{indicator.style.height='0px';indicator.textContent='\u2193 Pull to refresh';startY=null;pulling=false;armed=false;};
  scroller.addEventListener('touchstart',e=>{
    if(scroller.scrollTop<=0){startY=e.touches[0].clientY;pulling=true;armed=false;}
  },{passive:true});
  scroller.addEventListener('touchmove',e=>{
    if(!pulling||startY===null||scroller.scrollTop>0)return;
    const d=e.touches[0].clientY-startY;if(d<=0)return;
    const capped=Math.min(d,MAX_PULL);indicator.style.height=capped+'px';
    armed=capped>=THRESHOLD;indicator.textContent=armed?'\u2191 Release to refresh':'\u2193 Pull to refresh';
    if(armed&&e.cancelable)e.preventDefault();
  },{passive:false});
  scroller.addEventListener('touchend',()=>{const doRefresh=armed;reset();if(doRefresh)manualRefresh();},{passive:true});
  scroller.addEventListener('touchcancel',reset,{passive:true});
})();

function toggleAuto(){
  state.auto=!state.auto;
  $('btnAuto').classList.toggle('active',state.auto);
  log('Auto '+(state.auto?'ON':'OFF'));
}

// ========== DASHBOARD UPDATE ==========
const SESSIONS=[{name:'Sydney',start:21,end:6},{name:'Tokyo',start:0,end:9},{name:'London',start:7,end:16},{name:'New York',start:12,end:21}];
function renderSessionBadge(){
  const el=$('sessionBadge');if(!el)return;
  const h=new Date().getUTCHours();
  const live=SESSIONS.filter(s=>s.start<s.end?(h>=s.start&&h<s.end):(h>=s.start||h<s.end)).map(s=>s.name);
  el.textContent=live.length?('Session: '+live.join(' + ')+' open'):'Session: between major sessions (low liquidity)';
}
function updateDash(){
  resetDaily();
  renderSessionBadge();
  const a=state.assets[state.currentSymbol];if(!a)return;
  const totalPnL=a.floatingPnL+(state.paper?0:state.todayPnl);
  const el=$('dashPnl');if(el){el.textContent=fmtPnL(totalPnL);el.className='pnl-big '+(totalPnL>=0?'pos':'neg');}
  setText('stBal',fmt$(state.paper?state.paperBalance:state.balance));
  setText('stBalLbl',state.paper?'Balance (Paper)':'Balance ('+(state.env==='live'?'Live':'Demo')+')');
  setText('stEq',fmt$(state.equity));
  setText('stToday',fmtPnL(state.todayPnl));
  setText('sigPrice',a.lastPrice?a.lastPrice.toFixed(a.full?a.full.digits:5):'-');
  const sig=$('sigText');if(sig){sig.textContent=a.signal;sig.className='sig '+a.signal;}
  setText('sigScore','Signal strength: '+a.score+'% | Streak: '+a.streak);
  setText('robotMeta',STRATEGY_LABELS[cfg.strategy]+' &bull; '+a.label+' &bull; '+(state.auto?'Auto':'Manual')+(state.newsBlackout?' &bull; NEWS BLACKOUT':'')+(state.newsMode?' &bull; NEWS MODE':''));
  renderPositionsPanel();
}

// Always-visible open positions, across every symbol the bot holds — not
// just the one currently selected — each with its own live $ and % P&L,
// same idea as MT5's Trade tab. Rebuilds every updateDash() call (i.e. on
// every price tick for whichever symbol just moved), so numbers move live
// instead of only refreshing when you happen to switch screens.
function renderPositionsPanel(){
  const panel=$('positionsPanel');if(!panel)return;
  const rows=[];
  Object.values(state.assets).forEach(a=>{
    (a.positions||[]).forEach((p,idx)=>{
      rows.push({a,p,idx});
    });
  });
  if(!rows.length){
    panel.innerHTML='<div class="positions-empty">No open positions right now.</div>';
    return;
  }
  panel.innerHTML=rows.map(({a,p,idx})=>{
    const pnl=p.floatingPnL||0;
    const digits=digitsFor(a);
    const notional=Math.abs(p.entryPrice*dollarPerUnitFor(p.volume))||1;
    const pnlPct=(pnl/notional)*100;
    const lots=(p.volume/lotSizeFor(a)).toFixed(2);
    return '<div class="pos-row">'
      +'<div class="side '+p.side+'">'+p.side+'</div>'
      +'<div class="mid">'
        +'<div class="sym">'+a.label+'</div>'
        +'<div class="meta">'+lots+' lot &bull; entry '+p.entryPrice.toFixed(digits)+' &bull; now '+(a.lastPrice?a.lastPrice.toFixed(digits):'—')+(p.paper?' &bull; paper':'')+'</div>'
      +'</div>'
      +'<div class="pnlcol">'
        +'<div class="pnl '+(pnl>=0?'pos':'neg')+'">'+fmtPnL(pnl)+'</div>'
        +'<div class="pnlpct">'+(pnlPct>=0?'+':'')+pnlPct.toFixed(2)+'%</div>'
        +'<div class="posClose" onclick="closeOnePosition(\''+a.key+'\','+idx+')">close</div>'
      +'</div>'
    +'</div>';
  }).join('');
}

// ========== INIT ==========
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
renderSymbolList();
const rd=$('ctRedirectDisplay');if(rd)rd.textContent=ctRedirectUri();
checkOAuthCallback().then(handled=>{ if(!handled) showScreen('splash'); });
