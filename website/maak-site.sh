#!/usr/bin/env bash
# Zet dashboard.html om naar de website (website/public/index.html).
# Draai dit na elke wijziging aan dashboard.html en commit het resultaat.
set -euo pipefail
cd "$(dirname "$0")"
{
  printf '%s' '<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#0c6a5e"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="manifest" href="/manifest.webmanifest"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Huisboekje"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html,body{height:100%}body{margin:0;font:14px/1.4 system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
  printf '\n'
  cat ../dashboard.html
  printf '\n</body></html>\n'
} > public/index.html
echo "website/public/index.html bijgewerkt"
