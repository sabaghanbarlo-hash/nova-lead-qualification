# Nova Renovations — AI Lead Qualification

A free, fully client-side lead qualification and mini-CRM demo built for a
fictional renovation company, **Nova Renovations**. It captures leads,
scores them with a transparent local rules engine, sorts them into
HOT / WARM / COLD, and gives each lead a full pipeline (status, notes,
follow-up date) plus CSV export.

**Live demo:** https://sabaghanbarlo-hash.github.io/nova-lead-qualification/

## No paid AI, no backend

- No paid AI APIs of any kind
- No API keys
- No server / backend
- No external network calls — everything runs in the browser
- Data persists locally in localStorage

All "intelligence" is deterministic JavaScript: weighted scoring rules plus
keyword matching against the lead description. It is a demonstration of
how lead qualification logic can be structured, not a machine-learning
model — and the HOT/WARM/COLD labels are demo qualification rules, not an
objective measure of a lead's real value. This is stated directly in the
app dashboard as well.

## How scoring works

Each lead earns points from four factors, capped at 100 total:

- Budget: high budget up to +25, scaling down to +2 for "not sure yet"
- Timeline: immediate +25, within 1 month +18, 3-6 months +10, none +2
- Project type: higher-value projects (whole-home, kitchen, addition) score higher
- Buying-intent language: +5 per detected keyword in the description (ready, book, quote, urgent, start, price, consultation, asap, schedule, estimate, hire, today, this week, move forward), capped at +20
- Profile completeness: small bonus for having email / phone / location on file

Final score to category:
- 65-100: HOT
- 40-64: WARM
- 0-39: COLD

Every lead's detail view includes a "Why this lead received this score"
panel showing the exact point breakdown.

## Features

- Lead intake form (name, email, phone, project type, budget, timeline, location, description, preferred contact method)
- Instant local scoring on submit
- Dashboard: total leads, hot/warm/cold counts, average score, leads needing follow-up, pipeline-by-status chart, recent hot leads
- Lead list with search, category filter, status filter, and sorting
- Lead detail modal with full score breakdown, editable status (New -> Contacted -> Qualified -> Proposal -> Won/Lost), follow-up date, and a running notes log
- CSV export of the full lead list
- 12 realistic pre-loaded sample leads so the demo is useful immediately
- Data persists across reloads via localStorage; delete a lead any time

## Files

- index.html — structure (dashboard, leads table, intake form, modal)
- styles.css — CRM-style visual design
- script.js — scoring engine, storage, rendering, filters/sort, CSV export
- README.md — this file

## Run locally

No build step. Open index.html directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Deploy

Static site — deploy anywhere (GitHub Pages, Netlify, Vercel, S3, etc.) with zero configuration.

---

Built as a portfolio piece by Saba (https://sabaghanbarlo-hash.github.io/saba-portfolio/).
