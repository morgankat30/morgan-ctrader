# Morgan AI Trading Engine — cTrader Open API build

Single self-contained HTML file. Real WebSocket connection to cTrader's Open API,
real live prices, a real (tick-based EMA/RSI/momentum/structure) signal engine, and
real market order execution with stop loss / take profit — no random number placeholder
signals, no fake wallet balance.

## How it works

- Connects over `wss://demo.ctraderapi.com:5036` or `wss://live.ctraderapi.com:5036`
  using the JSON variant of cTrader's Open API (no Protobuf compiler needed — works
  straight from a browser).
- Auto-discovers which of BTC/ETH/LTC/XRP crypto CFDs and EUR/GBP/JPY/AUD/XAU forex
  instruments your connected account actually has available, and only shows those.
- Every tick updates a live EMA(9)/EMA(21) trend read, RSI(14), momentum, and a simple
  swing-structure check. A confirmation score (0–100) is the % of those checks that
  agree, same idea as the "SIGNAL CONFIRMATION" panel from the reference screenshots —
  except every number on it comes from a real price feed.
- Orders are sent as real `NEW_ORDER_REQ` market orders with relative SL/TP. Fills,
  rejections and closes come back as real `EXECUTION_EVENT` / `ORDER_ERROR_EVENT`
  messages and are shown in the log — nothing is simulated unless Paper mode is on.

## Safety defaults (please keep these until you've tested)

- **Paper mode starts ON.** Signals run live, trades are simulated locally, nothing
  is sent to your broker.
- **Live execution requires an explicit "Arm" toggle** in addition to Paper being off,
  and arming on a live account asks for a confirmation first.
- **Auto-execute starts OFF.** You review the signal and confirmation score yourself
  and tap BUY/SELL, until you trust it enough to flip auto on.
- **"Remember on this device" is OFF by default.** Flip it on next to Connect if you
  want your keys pre-filled next time — they're saved in this browser's local storage
  on your phone only, never sent anywhere else. A "Forget saved login details" button
  appears on the broker-choice screen once anything is saved, so you can clear it any
  time (e.g. before lending someone your phone).

## One-time setup

1. Register with a broker that runs on cTrader (registration link provided separately
   in chat).
2. Log in to the broker's cTrader account, then go to
   [openapi.ctrader.com/apps](https://openapi.ctrader.com/apps) with the same cTrader ID.
3. Click **Add new app**, fill in a name/description, save. Wait for Spotware's approval
   email (usually fast).
4. Open your approved app and click **Playground** → choose scope **trading** → **Get token**.
   This hands you an Access Token + Refresh Token for your own account without you having
   to build an OAuth screen.
5. Copy the app's Client ID and Client Secret (View button under Credentials), and the
   Access Token from the Playground, into the Connect screen in this app.
6. Start on **Demo**. Only switch to Live once you're happy with how it trades.

## Deploy

Same as before — open `index.html` directly, or serve it from Termux's HTTP server and
open it in Chrome/Edge. No build step, no other files required.

## Risk management

A dedicated panel on the dashboard, shared across both brokers:

- **Risk-based sizing** (on by default) — trade size is calculated from "risk % of
  balance ÷ stop-loss distance" instead of a flat manual amount. Turn it off to go back
  to typing an exact volume/amount per trade.
- **Daily loss limit** — once realized losses for the day hit this %, new trades are
  blocked until the next day. Resets automatically at midnight (device local time).
- **Portfolio risk cap** — total risk across every open position combined can't exceed
  this % of balance, even if each individual trade looks fine on its own.
- **Breakeven trigger** — once a trade moves this % in your favor, cTrader trades get a
  real stop-loss amendment moving the stop to entry (so that trade can no longer turn
  into a loss). Binance has no server-side stop-loss orders, so this is a
  software-watched equivalent instead — it arms once triggered and auto-closes if price
  falls back to entry. This only works while the page and (for Binance) the relay stay
  open; it is not a server-side protection like cTrader's.
- **Max spread filter** — a signal is skipped if the live bid/ask spread is wider than
  this %, since a wide spread usually means bad execution conditions.

On execution speed: orders are already sent as immediate market orders on live tick
data with no artificial delay — that part is already as fast as it gets. These risk
settings control how much is risked per trade, not how quickly orders fire. Loosening
them (higher risk %, no daily cap) means more frequent and larger trades, not faster
ones — and it directly increases how much you can lose, so change them deliberately.

## Notes / next steps

- Volume is entered as a multiple of the broker's minimum tradable size for that
  instrument (fetched live via `SYMBOL_BY_ID_REQ`), not a fixed lot size, since minimums
  differ per symbol and per broker.
- SL/TP are entered as a plain price distance (e.g. `0.0020` for EUR/USD, `2.5` for
  XAU/USD) and sent as `relativeStopLoss`/`relativeTakeProfit` — this works the same
  regardless of the symbol's decimal digits.
- The signal engine is intentionally simple and transparent (EMA cross + RSI + momentum
  + swing structure + a volatility gate) so you can see exactly why it fired. It has not
  been backtested — treat Demo results as the first real test of whether this strategy
  is worth running, same as Phase 4 in the original plan.
- Access tokens expire after ~30 days; refresh by getting a new one from the Playground
  (or wire up `apps/token?grant_type=refresh_token` if you want it automatic).
