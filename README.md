# Incan Gold Strategy Results

A simple public webpage presenting the top ten strategies from a seeded four-player Incan Gold simulation.

[View the site](https://incan-gold-strategy-results.jacoba1100254352.chatgpt.site)

The results come from the [Incan Gold Strategy Tester](https://github.com/Jacoba1100254352/Incan-Gold-Strategy-Tester). Its two-stage validation screened 112 strategies, then compared ten finalists over 50,000 games each using a shared seed schedule.

## Development

Use Node **24.18.1** and npm **12.0.2** (the runtime pins are committed).

```sh
npm ci
npm run dev
```

Run the project checks with:

```sh
npm run lint
npm run typecheck
npm run build:static
npm run test:static
npm audit
npm audit --omit=dev
npm audit signatures
```

`build:static` runs `vinext build --prerender-all --prerender-concurrency 1`.
The route HTML is written to `dist/server/prerendered-routes/index.html` and
`404.html`. The checks verify the ten complete ranking rows, both decorative
icons, the 404 page, and the absence of application/UI-library client entries.
All page content must remain usable without JavaScript. Keep the table and
icons as server components; do not introduce client hooks or event handlers.

The production host publishes static HTML/CSS/assets with `script-src 'none'`
and retains its existing client-component guard and artifact filtering. Vinext
also emits framework JavaScript and a server bundle for the optional Sites
adapter; their presence in build output does not authorize deploying a runtime
or publishing JavaScript on the static production host. `npm run build` remains
available for the optional Sites build. These commands validate source artifacts
and do not deploy either host.
