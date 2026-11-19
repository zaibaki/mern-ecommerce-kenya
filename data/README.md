# Seeded catalogue export

JSON exports of the Kenyan catalogue as seeded in the live database
(`data/products.json` — 45 products, `data/categories.json` — 8 categories,
`data/brands.json` — 8 brands), exported 2026-11-19 with `mongoexport` from
the `mern_ecommerce` database.

These files are reference only. The authoritative source is the seed script
`server/utils/seed.js`, which reproduces the same data (plus 90 reviews and
6 Kenyan demo customers) on `docker compose up`.
