# QuoteFlow – Sprint 1 demo (6.2.2026)

## Sprint 1 demon testipolku (toimittava 100%)

1) Avaa app → Inbox näyttää skeletonin → lista näkyy
2) Kirjoita haku → lista suodattuu → jos ei osumia, “Ei liidejä” -tyhjätila näkyy
3) Valitse statuschip → suodatus toimii
4) Klikkaa liidi → detail aukeaa (skeleton + data)
5) Pakotettu virhe videoon:
   - Avaa `/debug` → SIMULATE_ERROR päälle → palaa Inboxiin → ErrorCard + Retry näkyy varmasti
   - Fallback: services/apiClient.ts → `SIMULATE_ERROR=true` (jos halutaan varmistus vaikka debug UI pettäisi)

## 1 minuutin demopuhe (sellaisenaan)

“QuoteFlow on yrittäjän mobiilinäkymä tarjouspyyntöjen käsittelyyn. Inbox-näkymässä näkyy asiakkaiden lähettämät liidit, eli tarjouspyynnöt, joihin yrittäjä voi reagoida nopeasti. Näen listassa uudet pyynnöt, voin hakea otsikosta ja suodattaa statuksen mukaan, ja avata yksittäisen liidin detaljeihin. Tässä demossa data tulee vielä fake-repositorysta, mutta arkkitehtuuri on tehty niin, että datalähde voidaan vaihtaa API:ksi ilman UI-muutoksia.”

## Mistä liidit tulevat? (tekstikaavio)

1) Yritys julkaisee mainoksen/postauksen (Facebook tms.)
2) Postauksessa on QR-koodi / linkki
3) Asiakas avaa linkin → täyttää tarjouspyynnön
4) Tarjouspyyntö tallentuu taustalle (backend/API)
5) QuoteFlow-appi hakee liidit → näyttää ne Inboxissa

Liidi = asiakkaan lähettämä tarjouspyyntö, joka tulee yrittäjän Inboxiin.

Huom: tämä sovellus on yrittäjän työkalu, ei asiakkaan appi; asiakaspuoli on QR-linkin takana. Demossa käytetään fake-dataa, mutta API-vaihto on mahdollista ilman UI-muutosta.
