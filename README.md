# Huisboekje

Persoonlijke administratie voor financiën en belastingen. Deze map is de **standaard**: vaste sjablonen die je elk jaar (en elke maand) opnieuw invult.

> ⚠️ **Privacy:** zet hier nooit je BSN, wachtwoorden, DigiD-codes of volledige rekeningnummers in. Houd deze repository **privé**. Scans van documenten bewaar je in je eigen (versleutelde) opslag; hier noteer je alleen *waar* ze staan.

## Structuur

| Map | Wat | Hoe vaak |
|---|---|---|
| [`01-overzicht/`](01-overzicht/) | Jaaroverzicht: inkomen, uitgaven, vermogen in één blik | Jaarlijks |
| [`02-begroting/`](02-begroting/) | Maandbegroting en vaste lasten | Jaarlijks opzetten, maandelijks bijhouden |
| [`03-transacties/`](03-transacties/) | Uitgaven en inkomsten per maand (CSV) + categorieën | Maandelijks |
| [`04-belastingen/`](04-belastingen/) | Checklist aangifte inkomstenbelasting, toeslagen, map per belastingjaar | Jaarlijks (feb–apr) |
| [`05-vermogen/`](05-vermogen/) | Bezittingen en schulden op peildatum 1 januari | Jaarlijks (1 jan) |
| [`06-documenten/`](06-documenten/) | Register van belangrijke documenten en bewaartermijnen | Bij elke nieuwe polis/contract |
| [`07-doelen/`](07-doelen/) | Spaardoelen, buffer, aflossen | Per kwartaal |
| [`kalender.md`](kalender.md) | Vaste deadlines in het jaar | Doorlopend |

## Werkwijze

**Maandelijks (± 30 min)**
1. Exporteer de transacties van je bank en zet ze in `03-transacties/JJJJ-MM.csv` (kopieer `transacties-sjabloon.csv`).
2. Geef elke regel een categorie uit [`categorieen.md`](03-transacties/categorieen.md).
3. Vergelijk met de begroting in `02-begroting/` en noteer afwijkingen.
4. Bewaar facturen/bonnetjes die fiscaal relevant zijn (zorgkosten, giften, hypotheek) en noteer ze in de map van het belastingjaar.

**Jaarlijks**
1. **1 januari:** vul `05-vermogen/vermogen-sjabloon.csv` in (peildatum voor box 3).
2. **Januari:** nieuwe begroting maken, toeslagen en voorlopige aanslag controleren.
3. **Maart–april:** belastingaangifte doen met [`04-belastingen/aangifte-checklist.md`](04-belastingen/aangifte-checklist.md).
4. **December:** jaaroverzicht invullen, doelen evalueren, documenten opschonen.

## Nieuw jaar starten

```bash
JAAR=2026
cp -r 04-belastingen/jaren/_sjabloon 04-belastingen/jaren/$JAAR
cp 01-overzicht/jaaroverzicht-sjabloon.md 01-overzicht/$JAAR.md
cp 02-begroting/begroting-sjabloon.csv 02-begroting/$JAAR.csv
cp 05-vermogen/vermogen-sjabloon.csv 05-vermogen/$JAAR-01-01.csv
```

## Disclaimer

Dit is een hulpmiddel voor je eigen administratie, geen fiscaal advies. Bedragen, tarieven en regels veranderen jaarlijks: controleer ze op [belastingdienst.nl](https://www.belastingdienst.nl) of bij een adviseur.
