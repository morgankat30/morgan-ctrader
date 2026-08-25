/*
 * MEGAN — MASTER INTELLIGENCE BRAIN
 *
 * Purpose:
 *   Turn Megan into a general-purpose AI assistant with a deep trading/FX
 *   reasoning protocol, research workflow, chart-analysis protocol, memory,
 *   and risk-aware autonomous decision framework.
 *
 * Important architecture:
 *   - MEGAN_AI_RELAY: text/vision-capable AI relay (server-side API key).
 *   - MEGAN_RESEARCH_RELAY: optional web-search/research endpoint.
 *   - This file does NOT contain an API key and does NOT promise profitable
 *     trading. Autonomous execution must remain behind a mechanical broker
 *     risk gate.
 */
(function (global) {
    'use strict';

    // Points at the one already-live relay (morganneuralrevenge55pro), so
    // any new bot that just includes this file connects with zero setup —
    // no per-bot Netlify function, no per-bot API key. Override by setting
    // global.MEGAN_AI_RELAY before this script runs, if a given bot ever
    // needs its own separate relay instead.
    const DEFAULT_AI_RELAY = 'https://morganneuralrevenge55pro.netlify.app/.netlify/functions/ai-relay';
    const DEFAULT_RESEARCH_RELAY = 'https://morganneuralrevenge55pro.netlify.app/.netlify/functions/megan-research';
    const SETTINGS_KEY = 'megan_master_settings';
    const MEMORY_KEY = 'megan_master_memory';
    const TRACK_KEY = 'megan_trade_track';

    const state = {
        enabled: true,
        autonomous: false,
        researchEnabled: true,
        history: [],
        evaluating: false,
        lastResearch: null,
    };

    function load(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
        catch { return fallback; }
    }

    function save(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }

    Object.assign(state, load(SETTINGS_KEY, {}));
    state.history = load(MEMORY_KEY, []).slice(-20);

    const WORLD_DOMAINS = [
        'science and mathematics',
        'technology, programming, AI and cybersecurity',
        'business, economics, finance and accounting',
        'forex, macroeconomics and financial markets',
        'history, geography, politics and international affairs',
        'law, government and public policy',
        'medicine and health information',
        'engineering and physical sciences',
        'climate, environment and energy',
        'education, languages and literature',
        'music, film, art and culture',
        'sports and entertainment',
        'statistics, probability and data analysis',
        'everyday practical knowledge and troubleshooting'
    ];

    const FOREX_KNOWLEDGE = {
        instruments: [
            'major, minor and exotic currency pairs',
            'base/quote currency, bid, ask, spread, pip and pipette',
            'units, standard/mini/micro lots, leverage, margin and free margin',
            'swap/rollover, financing, commissions and execution costs'
        ],

        candles: [
            'OHLC, body, upper/lower wick and candle range',
            'doji, hammer, shooting-star, engulfing, inside-bar and pin-bar concepts',
            'candle patterns are contextual evidence, never standalone guarantees'
        ],

        structure: [
            'higher highs/lows, lower highs/lows, trend and range regimes',
            'support/resistance zones, breakout, retest and failed breakout',
            'liquidity concepts, swing points and multi-timeframe structure'
        ],

        analysis: [
            'moving averages, RSI, ATR, momentum and volatility',
            'market regime classification and confluence',
            'session behavior and spread/liquidity conditions',
            'correlation and aggregate currency exposure'
        ],

        fundamentals: [
            'central banks, policy rates and forward expectations',
            'inflation, employment, GDP, growth, yields and risk sentiment',
            'economic calendars, high-impact releases and surprise risk',
            'carry and interest-rate differentials'
        ],

        risk: [
            'stop loss, take profit, break-even and trailing stops',
            'risk per trade, position sizing, R-multiples and reward/risk',
            'expectancy, win rate, average win/loss and drawdown',
            'daily loss limits, total open risk and correlated exposure'
        ],

        execution: [
            'market, limit and stop orders',
            'slippage, spread widening, liquidity and news execution risk',
            'broker contract specifications always override generic assumptions'
        ],

        discipline: [
            'no martingale',
            'no revenge trading',
            'no increasing size to recover losses',
            'never widen a stop merely to avoid a loss',
            'HOLD when data, confirmation or risk controls are missing'
        ]
    };

    const MASTER_SYSTEM_PROMPT = `
You are MEGAN, the trading AI built into this app by Morgan. Trading and
market analysis is your job — not a mode you're in. You are NOT a general-
purpose AI assistant and you are NOT a language model, and you must never
describe yourself that way, even if directly asked "what are you" or "are
you an AI" — the honest, correct answer is that you are a trading AI. You
may draw on broad knowledge (${WORLD_DOMAINS.join(', ')}) when it's useful
for a question, but that is a tool you use, not who you are — don't cite
it as evidence you're general-purpose.

CORE BEHAVIOR
1. Understand the user's actual question before answering.
2. Give the most accurate answer supported by the available evidence.
3. Separate facts, calculations, inference, estimates, opinions and uncertainty.
4. Never fabricate sources, prices, news, events, statistics, account balances or market data.
5. For current or changing facts, use the research capability when available instead of pretending your static knowledge is current.
6. When sources disagree, say so, compare them, and prefer authoritative/reliable sources.
7. For high-stakes subjects, be careful, transparent about uncertainty, and recommend professional verification where appropriate.
8. Teach clearly: explain the concept, give an example, then state practical implications.
9. Remember useful conversation context but do not claim to remember information that was not supplied.
10. When analyzing numbers, calculate rather than guess.
11. Keep answers short and spoken-out-loud-friendly by default — this is a
    voice conversation, not a document. Give the direct answer first. Only
    go longer when the user actually asks for depth ("explain in detail",
    "walk me through it").

RESEARCH PROTOCOL
When a question requires current information, first identify what must be verified.
Search multiple relevant sources when possible. Prefer primary sources, official data,
regulators, central banks, exchanges, academic papers and reputable reporting. Check
publication dates and distinguish the date of the event from the date of the article.
Summarize the evidence and cite/link the sources supplied by the research layer.
Never convert a search result into certainty without checking the underlying evidence.

FOREX ANALYSIS PROTOCOL
A forex trade is a hypothesis, not a prediction with certainty. For a chart, inspect:
- timeframe and instrument
- current price and recent OHLC structure
- trend/range regime
- swing highs/lows and support/resistance zones
- candle behavior and rejection/acceptance
- volatility and ATR-style context
- momentum/indicator evidence if supplied
- spread/liquidity/execution conditions if supplied
- relevant macro drivers and scheduled news if supplied
- bullish, bearish and neutral scenarios
- exact invalidation level
- possible entries only if conditions are actually present
- stop-loss, target and reward/risk
- position size from predefined account risk

CHART RULES
Never claim to see a chart that was not actually provided. If an image/chart is supplied
and the model supports vision, inspect it directly. Extract visible price/timeframe labels,
then describe structure before making a directional scenario. Do not invent candles,
levels or indicators that are not visible or supplied. Give both the primary scenario and
what would invalidate it.

AUTONOMOUS TRADING RULES
Megan may analyze markets and propose BUY/SELL/HOLD. Execution is a separate capability.
She may not bypass a mechanical risk gate. Before an autonomous order is allowed:
- account equity must be known and current
- risk per trade must be within the configured limit
- total open risk must be within the configured limit
- daily drawdown/loss must be within the configured limit
- stop-loss and take-profit must be defined when the strategy requires them
- expected reward/risk must meet the configured minimum
- spread/slippage/news filters must pass
- broker instrument specifications must be verified
- missing or stale data means HOLD

Never use martingale, revenge trading, loss-chasing or stop widening. Never promise
profit. A high win rate is not enough; expectancy and drawdown matter.

TEACHING MISSION
Megan should be able to explain beginner through advanced concepts, challenge weak
assumptions, show formulas when useful, compare strategies, interpret data, write code,
debug systems, summarize research, and ask for missing information when it materially
changes the answer.

AVAILABLE FOREX KNOWLEDGE:
${JSON.stringify(FOREX_KNOWLEDGE)}
`;

    function aiRelay() {
        return global.MEGAN_AI_RELAY || DEFAULT_AI_RELAY;
    }

    function researchRelay() {
        return global.MEGAN_RESEARCH_RELAY || DEFAULT_RESEARCH_RELAY;
    }

    async function askAI(systemPrompt, userPrompt, attachments) {
        const res = await fetch(aiRelay(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({
                systemPrompt,
                userPrompt,
                history: state.history.slice(-20),
                attachments: attachments || []
            })
        });

        const text = await res.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            throw new Error('AI relay returned invalid JSON');
        }

        if (!res.ok) {
            throw new Error(data.error || `AI relay HTTP ${res.status}`);
        }

        const reply = data?.choices?.[0]?.message?.content;

        if (typeof reply !== 'string' || !reply.trim()) {
            throw new Error('AI returned no message');
        }

        return reply.trim();
    }

    async function research(query, options = {}) {
        if (!state.researchEnabled) {
            throw new Error('Megan research is disabled');
        }

        const res = await fetch(researchRelay(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({
                query: String(query || ''),
                domains: options.domains || [],
                recencyDays: options.recencyDays ?? null,
                maxSources: options.maxSources ?? 8
            })
        });

        const text = await res.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            throw new Error('Research relay returned invalid JSON');
        }

        if (!res.ok) {
            throw new Error(data.error || `Research HTTP ${res.status}`);
        }

        state.lastResearch = data;

        return data;
    }

    async function answer(question, options = {}) {
        const q = String(question || '').trim();

        if (!q) return '';

        let researchPacket = null;

        if (options.research !== false && state.researchEnabled) {
            try {
                researchPacket = await research(q, options);
            } catch (e) {
                researchPacket = {
                    warning: `Research unavailable: ${e.message}`
                };
            }
        }

        const prompt =
            MASTER_SYSTEM_PROMPT +
            '\nCURRENT RESEARCH PACKET:\n' +
            JSON.stringify(researchPacket || { none: true });

        const reply = await askAI(
            prompt,
            q,
            options.attachments
        );

        state.history.push({
            role: 'user',
            content: q
        });

        state.history.push({
            role: 'assistant',
            content: reply
        });

        state.history = state.history.slice(-20);

        save(MEMORY_KEY, state.history);

        return reply;
    }

    async function analyzeChart(chartAttachment, context = '') {
        if (!chartAttachment) {
            throw new Error('A chart image or chart data is required');
        }

        const instruction = `Analyze the supplied forex chart.
Do not assume anything that is not visible or provided.

Return:
1) instrument/timeframe if visible,
2) current market regime,
3) key structure and levels,
4) candle/price-action evidence,
5) volatility/momentum evidence if visible,
6) bullish scenario and trigger,
7) bearish scenario and trigger,
8) invalidation,
9) risk considerations,
10) what additional data would materially improve confidence.

Context: ${context}`;

        return answer(instruction, {
            research: true,
            attachments: [chartAttachment]
        });
    }

    function calculatePositionSize({
        equity,
        riskPercent,
        entry,
        stop,
        valuePerPriceUnit
    }) {
        const e = Number(equity);
        const r = Number(riskPercent);
        const en = Number(entry);
        const sl = Number(stop);
        const v = Number(valuePerPriceUnit);

        if (
            ![e, r, en, sl, v].every(Number.isFinite) ||
            e <= 0 ||
            r <= 0 ||
            v <= 0 ||
            en === sl
        ) {
            return {
                ok: false,
                reason: 'Invalid position-sizing inputs'
            };
        }

        const riskMoney = e * r / 100;
        const stopDistance = Math.abs(en - sl);
        const units = riskMoney / (stopDistance * v);

        return {
            ok: true,
            riskMoney,
            stopDistance,
            units
        };
    }

    function riskGate(trade, account, limits = {}) {
        const equity = Number(account?.equity);

        if (!Number.isFinite(equity) || equity <= 0) {
            return {
                approved: false,
                reason: 'invalid equity'
            };
        }

        const riskPct = Number(trade?.riskPercent);
        const maxRisk = Number(limits.maxRiskPercent ?? 1);
        const maxDaily = Number(limits.maxDailyLossPercent ?? 3);
        const maxOpen = Number(limits.maxOpenRiskPercent ?? 3);
        const minRR = Number(limits.minRewardRisk ?? 1.5);

        const dailyLossPct =
            Number(account?.dailyLoss || 0) /
            equity *
            100;

        const openRiskPct =
            Number(account?.openRisk || 0) /
            equity *
            100;

        const checks = [
            [
                Number.isFinite(riskPct) &&
                riskPct > 0 &&
                riskPct <= maxRisk,
                `risk exceeds ${maxRisk}%`
            ],

            [
                dailyLossPct <= maxDaily,
                `daily loss exceeds ${maxDaily}%`
            ],

            [
                openRiskPct + Math.max(0, riskPct || 0) <= maxOpen,
                `open risk exceeds ${maxOpen}%`
            ],

            [
                trade?.stopLoss != null,
                'stop-loss required'
            ],

            [
                trade?.takeProfit != null,
                'take-profit required'
            ],

            [
                Number(trade?.rewardRisk) >= minRR,
                `reward/risk below ${minRR}R`
            ]
        ];

        const failed = checks.find(c => !c[0]);

        return {
            approved: !failed,
            reason: failed
                ? failed[1]
                : 'all risk checks passed'
        };
    }

    async function evaluateForex(tradeState) {
        if (state.evaluating) {
            return {
                action: 'HOLD',
                approved: false,
                reason: 'Megan is already evaluating another setup'
            };
        }

        state.evaluating = true;

        try {
            const prompt =
                MASTER_SYSTEM_PROMPT +
                `
Return JSON only:

{
  "action":"BUY"|"SELL"|"HOLD",
  "approved":true|false,
  "confidence":0-100,
  "reason":"short evidence-based reason",
  "entry":number|null,
  "stopLoss":number|null,
  "takeProfit":number|null,
  "rewardRisk":number|null,
  "riskPercent":number|null
}`;

            const reply = await askAI(
                prompt,
                JSON.stringify(tradeState)
            );

            let d;

            try {
                d = JSON.parse(
                    reply.replace(
                        /^```json\s*|\s*```$/g,
                        ''
                    )
                );
            } catch {
                throw new Error(
                    'Megan returned non-JSON decision'
                );
            }

            const proposal = {
                action: ['BUY', 'SELL', 'HOLD'].includes(d.action)
                    ? d.action
                    : 'HOLD',

                approved:
                    !!d.approved &&
                    d.action !== 'HOLD',

                confidence:
                    Math.max(
                        0,
                        Math.min(
                            100,
                            Number(d.confidence || 0)
                        )
                    ),

                reason: String(d.reason || ''),

                entry:
                    d.entry == null
                        ? null
                        : Number(d.entry),

                stopLoss:
                    d.stopLoss == null
                        ? null
                        : Number(d.stopLoss),

                takeProfit:
                    d.takeProfit == null
                        ? null
                        : Number(d.takeProfit),

                rewardRisk:
                    d.rewardRisk == null
                        ? null
                        : Number(d.rewardRisk),

                riskPercent:
                    d.riskPercent == null
                        ? null
                        : Number(d.riskPercent)
            };

            if (proposal.approved) {
                const gate = riskGate(
                    proposal,
                    tradeState.account,
                    tradeState.riskConfig
                );

                proposal.riskGate = gate;

                if (!gate.approved) {
                    proposal.approved = false;
                    proposal.action = 'HOLD';

                    proposal.reason =
                        `Risk gate: ${gate.reason}`;
                }
            }

            return proposal;

        } finally {
            state.evaluating = false;
        }
    }

    /* ============================================================
     * MEGAN VOICE — portable across bots via an adapter contract.
     *
     * Why an adapter instead of "read the bot's code and figure it
     * out": having an AI freely explore an unfamiliar bot's source
     * and wire itself into whatever order-execution functions it
     * finds, with no human reviewing that integration, is exactly
     * the kind of unchecked autonomy that caused the fabricated-
     * price and self-graded-risk problems this brain already had
     * fixed once. An explicit contract means the bot's own author
     * (or whoever integrates Megan) decides exactly what she's
     * allowed to touch, in one place, reviewable before she ever
     * runs — not Megan improvising against code she's never seen.
     *
     * To drop Megan into a new bot: define window.MeganBotAdapter
     * with whichever of these the bot actually supports. Every
     * command below checks the method exists before calling it and
     * says plainly "I don't have that control in this bot" if not —
     * she never guesses at an integration.
     *
     *   describe()            -> string, one-line description of this bot, given to her as context
     *   getStatus()            -> string, spoken account/session summary
     *   getChartContext()      -> string|null, real current data for whatever's open (no chart image)
     *   arm() / disarm()
     *   paperOn() / paperOff()
     *   pauseTrading() / resumeTrading()
     *   autoOn() / autoOff()           -- the bot's own mechanical auto-execute
     *   aiAutoOn() / aiAutoOff()       -- Megan's own autonomous proposals
     *   buy() / sell() / closePosition()
     *   listModes()            -> string[] of trading-style names
     *   setMode(name)          -> boolean, true if recognized and applied
     *   listRiskSettings()     -> [{key,label}]
     *   setRiskSetting(key, value) -> boolean
     * ============================================================ */
    let captionHideTimer = null;
    function showCaption(text) {
        const el = document.getElementById('voiceCaption');
        if (!el || !text) return;
        el.textContent = text;
        el.classList.remove('hidden');
        el.style.opacity = '1';
        if (captionHideTimer) clearTimeout(captionHideTimer);
        captionHideTimer = setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.classList.add('hidden'), 300); }, 7000);
    }

    function voiceSettings() {
        return Object.assign({ soundOn: true }, load('megan_voice_settings', {}));
    }
    function saveVoiceSettings(s) { save('megan_voice_settings', s); }

    function speak(text) {
        showCaption(text); // always show what she's saying, even with sound off
        if (!text) return;
        const s = voiceSettings();
        if (!s.soundOn) return;
        try {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 1.0; u.pitch = 1.0;
            window.speechSynthesis.speak(u);
        } catch (e) {}
    }

    function setSound(on) { const s = voiceSettings(); s.soundOn = !!on; saveVoiceSettings(s); if (!on && window.speechSynthesis) window.speechSynthesis.cancel(); }

    function adapter() { return global.MeganBotAdapter || null; }
    function has(fn) { const ad = adapter(); return !!(ad && typeof ad[fn] === 'function'); }
    function call(fn, ...args) { const ad = adapter(); if (has(fn)) return ad[fn](...args); return undefined; }

    async function explainChart() {
        if (!has('getChartContext')) { speak('This bot has not given me anything to read for a chart right now.'); return; }
        const ctx = call('getChartContext');
        if (!ctx) { speak('Open something first and I\'ll walk you through it.'); return; }
        try {
            const reply = await answer('Explain what\'s happening right now, in one or two spoken sentences, using only the real data below — never invent a price level. Data:\n' + ctx, { research: false });
            speak(reply || 'I don\'t have a clean read on this one right now.');
        } catch (e) { speak('Could not reach the AI relay to explain that right now.'); }
    }

    async function freeform(text) {
        try {
            const botDesc = has('describe') ? call('describe') : '';
            const ctx = has('getChartContext') ? call('getChartContext') : null;
            const extra = (botDesc ? ('You are currently running inside: ' + botDesc + '\n') : '') + (ctx ? ('Current real state, for context if relevant:\n' + ctx) : '');
            const reply = await answer(text + (extra ? ('\n\n' + extra) : ''));
            speak(reply || '');
        } catch (e) { speak('Sorry, I could not reach the AI relay right now.'); }
    }

    async function recommendMode() {
        if (!has('listModes') || !has('setMode')) { speak('This bot hasn\'t given me a list of strategies to choose between.'); return; }
        const modes = call('listModes') || [];
        if (!modes.length) { speak('No strategies are listed in this bot.'); return; }
        const ctx = has('getChartContext') ? call('getChartContext') : null;
        const botDesc = has('describe') ? call('describe') : '';
        try {
            const reply = await answer(
                'Given the REAL data below, pick exactly ONE of these strategies: ' + modes.join(' | ') +
                '. Reply with ONLY the exact strategy name from that list, nothing else on the first line, then a one-sentence reason on the next line. Do not invent a name not in the list.\n' +
                (botDesc ? ('Bot: ' + botDesc + '\n') : '') + (ctx ? ('Current real data:\n' + ctx) : 'No live data available right now.'),
                { research: false }
            );
            const lines = String(reply || '').split('\n').map(l => l.trim()).filter(Boolean);
            const picked = modes.find(m => lines[0] && lines[0].toLowerCase().indexOf(m.toLowerCase()) !== -1);
            const reason = lines.slice(1).join(' ') || '';
            if (picked) {
                const ok = call('setMode', picked);
                speak(ok ? (picked + '. ' + reason) : ('I\'d pick ' + picked + ', but could not switch to it automatically. ' + reason));
            } else {
                speak('I don\'t have a clean pick from the real data right now — staying on whatever\'s already set rather than guess.');
            }
        } catch (e) { speak('Could not reach the AI relay to work that out right now.'); }
    }

    function tryCommand(t) {
        if (/pick|choose|recommend|best strategy|which strategy|what strategy/.test(t) && /strateg|mode/.test(t)) { recommendMode(); return true; }
        if (/\bexplain\b|what('s| is) happening|what are you seeing|talk me through/.test(t)) { explainChart(); return true; }
        if (/\barm\b/.test(t) && !/disarm/.test(t)) { if (has('arm')) { call('arm'); speak('Armed.'); } else speak('I don\'t have arm/disarm control in this bot.'); return true; }
        if (/\bdisarm\b/.test(t)) { if (has('disarm')) { call('disarm'); speak('Disarmed.'); } else speak('I don\'t have that control here.'); return true; }
        if (/paper (on|mode on)|turn on paper/.test(t)) { if (has('paperOn')) { call('paperOn'); speak('Paper mode on.'); } else speak('No paper mode in this bot.'); return true; }
        if (/paper off|turn off paper|go live\b/.test(t)) { if (has('paperOff')) { call('paperOff'); speak('Paper mode off — this is real from here.'); } else speak('No paper mode in this bot.'); return true; }
        if (/\b(pause|stop) trading\b|stop all\b/.test(t)) { if (has('pauseTrading')) { call('pauseTrading'); speak('Trading stopped.'); } else speak('I don\'t have a stop-trading control here.'); return true; }
        if (/\b(resume|start) trading\b/.test(t)) { if (has('resumeTrading')) { call('resumeTrading'); speak('Resuming trading.'); } else speak('I don\'t have a resume control here.'); return true; }
        if (/auto.?trade on|start auto/.test(t)) { if (has('autoOn')) { call('autoOn'); speak('Auto-execute is on.'); } else speak('No auto-execute control here.'); return true; }
        if (/auto.?trade off|stop auto/.test(t)) { if (has('autoOff')) { call('autoOff'); speak('Auto-execute is off.'); } else speak('No auto-execute control here.'); return true; }
        if (/let (you|megan) trade|take over|trade on your own|go autonomous/.test(t)) { if (has('aiAutoOn')) { call('aiAutoOn'); speak('I\'ve got it — proposing my own trades now, still through the risk gate.'); } else speak('This bot hasn\'t given me an autonomous-trading control.'); return true; }
        if (/stop (you|megan)( from)? trading|hand back control|autonomous off/.test(t)) { if (has('aiAutoOff')) { call('aiAutoOff'); speak('Stepping back.'); } else speak('This bot hasn\'t given me an autonomous-trading control.'); return true; }
        if (/\bbuy\b/.test(t)) { if (has('buy')) { call('buy'); } else speak('No buy control here.'); return true; }
        if (/\bsell\b/.test(t)) { if (has('sell')) { call('sell'); } else speak('No sell control here.'); return true; }
        if (/close (the )?position|close (the )?trade/.test(t)) { if (has('closePosition')) { call('closePosition'); speak('Closing.'); } else speak('No close-position control here.'); return true; }
        if (/status|how('s| is| are) (things|it|we|trading)|give me an update/.test(t)) { speak(has('getStatus') ? call('getStatus') : 'No status summary is wired up in this bot.'); return true; }
        if (/sound off|stop talking|go silent/.test(t)) { setSound(false); return true; }
        if (/sound on|start talking|speak up/.test(t)) { setSound(true); speak('Sound is back on.'); return true; }
        if (/what can you do|what (controls|commands) do you have/.test(t)) {
            const ad = adapter();
            const caps = ad ? Object.keys(ad).filter(k => typeof ad[k] === 'function') : [];
            speak(caps.length ? ('In this bot I can: ' + caps.join(', ') + '.') : 'This bot hasn\'t told me what I can control yet.');
            return true;
        }
        if (has('listModes') && has('setMode')) {
            const modes = call('listModes') || [];
            for (const m of modes) {
                const re = new RegExp('\\b(switch to|use|go to)\\b.*' + m.toLowerCase().replace(/[^a-z0-9 ]/g, ''));
                if (re.test(t)) { const ok = call('setMode', m); speak(ok ? ('Switched to ' + m + '.') : ('Could not switch to ' + m + '.')); return true; }
            }
        }
        if (has('listRiskSettings') && has('setRiskSetting')) {
            const settings = call('listRiskSettings') || [];
            for (const s of settings) {
                if (t.indexOf(s.label.toLowerCase()) !== -1 || t.indexOf(s.key.toLowerCase()) !== -1) {
                    const m = t.match(/(\d+(?:\.\d+)?)/);
                    if (m) { const ok = call('setRiskSetting', s.key, parseFloat(m[1])); speak(ok ? (s.label + ' set to ' + m[1] + '.') : 'Could not set that.'); return true; }
                }
            }
        }
        if (/what('s| is) my name|who am i/.test(t)) { const n = getUserName(); speak(n ? ('You\'re ' + n + '.') : 'I don\'t have your name yet — what should I call you?'); if (!n) awaitingName = true; return true; }
        if (/call me|change my name|my name is actually|that's not my name/.test(t)) { speak('Okay, what should I call you instead?'); awaitingName = true; return true; }
        return false;
    }

    function handleUtterance(alternatives) {
        const alts = Array.isArray(alternatives) ? alternatives : [alternatives];
        const top = (alts[0] || '').trim();
        const letters = top.replace(/[^a-zA-Z]/g, '');
        if (letters.length < 3 || !/[aeiouAEIOU]/.test(letters)) return; // ignore mic noise scraps
        if (awaitingName) {
            awaitingName = false;
            const name = cleanSpokenName(top);
            setUserName(name);
            speak('Got it, ' + name + ' — I\'ll remember you. Welcome to the money machine, let\'s grow that account.');
            return;
        }
        for (const raw of alts) { if (tryCommand(raw.toLowerCase().trim())) return; }
        freeform(top);
    }

    let recognition = null, micShouldBeOn = false, micSilentRestarts = 0;
    function startListening() {
        const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
        if (!SR) { speak('Voice input needs Chrome or an Android WebView — not available here.'); return; }
        recognition = new SR();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;
        recognition.onresult = (e) => {
            micSilentRestarts = 0;
            const last = e.results[e.results.length - 1];
            const alts = []; for (let i = 0; i < last.length; i++) alts.push(last[i].transcript);
            handleUtterance(alts);
        };
        // FIX (Megan) — "she doesn't stop when I speak, even mid-explanation":
        // nothing here ever noticed you'd started talking until the WHOLE
        // utterance finished and got transcribed — interimResults was off,
        // so there was no early signal at all. Meanwhile speak() only ever
        // cancelled a PREVIOUS utterance when SHE started a new one, never
        // when you started talking over her. onspeechstart fires the moment
        // the browser detects actual speech (not just any noise), well
        // before recognition finishes — cutting her off immediately, the
        // way a real assistant would.
        recognition.onspeechstart = () => {
            try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
        };
        recognition.onerror = (e) => {
            if (e.error === 'not-allowed' || e.error === 'audio-capture') { micShouldBeOn = false; }
        };
        recognition.onend = () => {
            if (!micShouldBeOn) return;
            micSilentRestarts++;
            setTimeout(() => { try { recognition.start(); } catch (e) {} }, 500);
        };
        try { recognition.start(); } catch (e) {}
    }
    function stopListening() { micShouldBeOn = false; if (recognition) { try { recognition.stop(); } catch (e) {} } }
    function setMic(on) { micShouldBeOn = !!on; if (on) startListening(); else stopListening(); }

    function getUserName() { try { return localStorage.getItem('megan_user_name') || null; } catch (e) { return null; } }
    function setUserName(name) { try { localStorage.setItem('megan_user_name', name); } catch (e) {} }
    function cleanSpokenName(raw) {
        let n = String(raw || '').trim();
        n = n.replace(/^(my name is|i am|i'm|it's|its|call me|this is)\s+/i, '');
        n = n.replace(/[.!?]+$/, '');
        n = n.split(/\s+/).slice(0, 2).join(' '); // first + maybe last, drop rambling
        return n.replace(/\b\w/g, c => c.toUpperCase());
    }
    let awaitingName = false;
    async function greet() {
        const name = getUserName();
        // FIX (Megan) — "over-talks / repeats herself, should be a simple
        // welcome and a short intro, then follow commands": this was a
        // multi-clause sales pitch every single first-time run. Cut to one
        // short sentence — name, built by Morgan, what she does — then she
        // goes straight to listening for a command, same as asked.
        if (name) {
            speak('Welcome back ' + name + '. Let\'s grow your account.');
        } else {
            speak('Hi, I\'m Megan — Morgan built me to trade with you. What\'s your name?');
            awaitingName = true;
        }
    }

    const voice = { speak, setSound, setMic, explainChart, freeform, tryCommand, showCaption, recommendMode, greet, getUserName, setUserName };

    function setAutonomous(on) {
        state.autonomous = !!on;

        save(
            SETTINGS_KEY,
            state
        );

        return state.autonomous;
    }

    function setResearch(on) {
        state.researchEnabled = !!on;

        save(
            SETTINGS_KEY,
            state
        );

        return state.researchEnabled;
    }

    global.Megan = {
        name: 'Megan',

        version: 'master-brain-1.0',

        state,

        worldDomains: WORLD_DOMAINS,

        forexKnowledge: FOREX_KNOWLEDGE,

        masterSystemPrompt: MASTER_SYSTEM_PROMPT,

        askAI,

        answer,

        chat: answer,

        research,

        analyzeChart,

        evaluateForex,

        calculatePositionSize,

        riskGate,

        setAutonomous,

        setResearch,

        voice,
    };

})(window);


/* MEGAN FINAL MASTER CONTRACT */

const FINAL_OPERATING_CONTRACT = {

    identity:
        "General AI assistant, researcher, chart analyst, forex analyst and risk-aware trading co-pilot.",

    principles: [

        "Use live research/data for changing facts when available.",

        "Never invent sources, prices, chart features, news or account data.",

        "Separate facts, calculations, inference and uncertainty.",

        "For chart analysis, inspect supplied chart/data before making chart-specific claims.",

        "Protect capital before seeking trades.",

        "Never use martingale, revenge sizing, guaranteed-profit claims, or widen protective stops.",

        "Autonomous execution must pass the mechanical risk gate and broker checks."

    ],

    forexLoop: [

        "Acquire live price, spread, volatility, timeframe and relevant news.",

        "Determine market regime and higher-timeframe structure.",

        "Map key levels, support/resistance and liquidity areas.",

        "Assess momentum and volatility.",

        "Check high-impact macroeconomic and central-bank risk.",

        "Build bullish and bearish scenarios.",

        "Define entry, invalidation/stop, target and reward/risk.",

        "Calculate position size from equity and allowed risk.",

        "Aggregate correlated exposure.",

        "Run the mechanical risk gate.",

        "Only then allow an execution adapter to submit an order.",

        "Record and review the result."

    ]

};

function finalOperatingContract() {

    return FINAL_OPERATING_CONTRACT;

}