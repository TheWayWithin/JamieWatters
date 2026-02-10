# WIP.co Post — Crypto Trading Bot Stop-Loss Fix

**POST AFTER blog is live on jamiewatters.work**

---

Found a systematic bug in my crypto trading bot's stop-loss placement 🔍

76% of BTC signals had stops inside the noise band (1.15% vs 1.5% minimum). Math shows 57% chance of noise stop-out within 24 hours.

Fixed with 19 lines of code — ATR-based stop floor that widens tight stops programmatically.

Day 11: +$271 (+9.0%) on paper, 32 trades, Sharpe 4.21.

Full write-up: https://jamiewatters.work/journal/trader-7-stop-loss-guardrails

#llmtrader7

---

**To post via API:**
```
POST /v1/todos?api_key=KEY
{"body": "<post content above>"}
```
