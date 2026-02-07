# Sprint 2 – Scrum-muistio

Päivä: 7.2.2026  
Osallistujat: (täydennä nimet)

## Mitä päätettiin
- Toteutetaan offline UX “cached mode” Inboxiin (banneri + last synced).
- Lisätään lead-listan cache AsyncStorageen, jotta airplane mode -demo onnistuu varmasti.
- Debug-ruutuun lisätään “Clear cached leads”, jotta demo on helppo toistaa.

## Esteet / riskit
- Offline-tila voi jäädä päälle debug-flagin persistoinnin vuoksi → demossa aina ensin Debug → Reset.
- Cache-avainten yhteensopivuus: varmistetaan storage-keyt ja dataformaatit.

## Seuraavat stepit
- Implementoi cache hydraus mountissa (cache ensin → verkko jos online).
- Lisää OfflineBanner Inboxiin ja estä refresh offline-tilassa.
- Päivitä docs: architecture + työajanseuranta.
