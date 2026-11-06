# Huisboekje als eigen website (Cloudflare Pages)

Hiermee zet je het dashboard op je eigen webadres, bijvoorbeeld `huisboekje.pages.dev`:

- **Inloggen:** alleen jouw e-mailadres komt erin. Je vult je e-mailadres in en krijgt een code (Cloudflare Access).
- **Opslag:** je gegevens staan in je eigen Cloudflare-opslag (KV), dus laptop en telefoon lopen gelijk.
- **Kosten:** het gratis abonnement van Cloudflare is ruim genoeg.

De server-functie (`functions/api/data.js`) controleert bij elke aanvraag het ondertekende inlogbewijs van Cloudflare Access. Staat Access nog niet goed ingesteld, dan slaat de website **niets** op de server op. Er komen dus nooit gegevens onbeschermd online.

## Wat staat waar

| Bestand | Wat |
|---|---|
| `public/index.html` | Het dashboard, gemaakt uit `../dashboard.html` met `maak-site.sh` |
| `public/_headers` | Beveiligingsinstellingen (geen caching, niet insluitbaar, niet indexeren) |
| `functions/api/data.js` | Opslaan en ophalen van je gegevens, alleen met geldige inlog |

## Stappenplan (± 20 minuten)

> De namen van knoppen in Cloudflare veranderen weleens. Zoek naar de vetgedrukte woorden als iets net anders heet.

### 1. Cloudflare-account
Maak een gratis account op [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) en zet tweestapsverificatie aan (*My Profile → Authentication*).

### 2. Website koppelen aan GitHub
1. Ga naar **Workers & Pages → Create → Pages → Connect to Git**.
2. Geef Cloudflare toegang tot de repository **huisboekje** en kies die.
3. Instellingen:
   - **Production branch:** `main` (of de branch waar dit op staat)
   - **Framework preset:** None
   - **Build command:** leeg laten
   - **Build output directory:** `public`
   - **Root directory:** `website`
4. Klik **Save and Deploy**. Je krijgt een adres zoals `https://huisboekje-xxx.pages.dev`. **Open het nog niet met echte gegevens:** het slot zit er nog niet op.

### 3. Opslag aanmaken (KV)
1. **Storage & Databases → KV → Create** en noem het `huisboekje`.
2. Ga naar je Pages-project → **Settings → Bindings → Add → KV namespace**.
   - Variable name: `HUISBOEKJE` (precies zo, in hoofdletters)
   - KV namespace: `huisboekje`

### 4. Het slot erop (Cloudflare Access)
1. Open **Zero Trust** in het menu links. De eerste keer kies je een teamnaam, bijvoorbeeld `marc-huisboekje`, en het gratis plan. Je teamdomein wordt dan `marc-huisboekje.cloudflareaccess.com`.
2. **Access → Applications → Add an application → Self-hosted**.
   - Application name: `Huisboekje`
   - Session duration: bijvoorbeeld 1 week
   - Public hostname: je Pages-adres, bijvoorbeeld `huisboekje-xxx.pages.dev`
   - Voeg een **tweede** hostname toe: `*.huisboekje-xxx.pages.dev`. Dat zijn de testversies van elke wijziging, die moeten ook op slot.
3. **Policy:** naam `Alleen ik`, Action **Allow**, Include → **Emails** → jouw e-mailadres.
4. Login method: **One-time PIN** (code per e-mail) staat standaard aan.
5. Sla op en open daarna de applicatie opnieuw. Kopieer de **Application Audience (AUD) Tag** (een lange code).

> Tip: in het Pages-project kun je onder **Settings → General → Access policy** ook met één klik de testversies afschermen.

### 5. De server laten weten welk slot het is
In je Pages-project → **Settings → Variables and Secrets → Add** (voor Production):

| Naam | Waarde |
|---|---|
| `ACCESS_TEAM_DOMAIN` | `marc-huisboekje.cloudflareaccess.com` (jouw teamdomein) |
| `ACCESS_AUD` | de AUD Tag uit stap 4 |

Ga daarna naar **Deployments** en kies bij de laatste versie **Retry deployment**, zodat de instellingen actief worden.

### 6. Testen
1. Open je adres in een **privévenster**. Je moet eerst het inlogscherm van Cloudflare zien. Zie je meteen het dashboard? Dan klopt stap 4 niet.
2. Log in met je e-mailadres en de code.
3. Klik **Begin met eigen gegevens**. Rechtsboven moet **"Opgeslagen op je eigen server"** staan.
   - Staat er "Server niet ingesteld"? Controleer stap 3 en 5 en deploy opnieuw.
4. Open de site op je telefoon, log in en kies Deel → **Zet op beginscherm**.

### Eigen domeinnaam (optioneel)
In het Pages-project → **Custom domains** voeg je bijvoorbeeld `boekje.jouwdomein.nl` toe. Voeg dat adres daarna ook toe als hostname in je Access-applicatie (stap 4).

## Dashboard bijwerken
Wijzigingen maak je in `dashboard.html` in de hoofdmap. Daarna:

```bash
./website/maak-site.sh
```

Commit en push. Cloudflare zet de nieuwe versie automatisch online.

## Goed om te weten
- **Back-up:** maak af en toe een back-up via het menu (*Back-up maken*). Die kun je ook terugzetten in de claude.ai-versie, en andersom.
- **Twee apparaten tegelijk:** heb je op twee apparaten tegelijk iets gewijzigd, dan meldt de site "op een ander apparaat gewijzigd". Herlaad dan de pagina. Er wordt niets ongemerkt overschreven.
- **Uitloggen:** via *Uitloggen* onderaan het menu.
- **Wie kan erbij:** de gegevens staan per e-mailadres apart. Voeg je later iemand toe aan de Access-policy, dan krijgt die een eigen, leeg huisboekje en ziet die jouw gegevens niet.
