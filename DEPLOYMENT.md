# Publisering av kolderup.net

Nettstedet ligger i `docs/` og består av statiske filer. Pico CSS 2.1.1 Classless følger med i `docs/assets/` sammen med MIT-lisensen.

## Forhåndsvis lokalt

Kjør fra rotmappen i repoet:

```sh
python3 -m http.server 8000 --directory docs
```

Åpne [http://localhost:8000/](http://localhost:8000/) med en oppdatert nettleser. Sjekk forsiden og `/equations/`, `/matte/`, `/mat/` og `/bok/`. På nivå 6 kan du løse `2*x + 3 = 11` ved å flytte 3, slå sammen 11 og −3, dele på 2, faktorisere 8 og forkorte brøkene på begge sider. Resultatet skal være `x = 4`.

## GitHub Pages

Hovedrepoet bruker allerede **Deploy from a branch**, med `master` og `/ (root)`. Første versjon ligger i den nye kildemappen `/docs`. GitHub Pages serverer denne direkte med `.nojekyll` og `CNAME`.

1. Slå sammen pull requesten i [terjekol/terjeweb](https://github.com/terjekol/terjeweb).
2. Åpne **Settings → Pages**. Velg **Deploy from a branch**, deretter **master** og **/docs**. Trykk **Save**.
3. Publiseringsmappen inneholder en `CNAME` med `kolderup.net`. Sjekk at **Custom domain** viser nøyaktig `kolderup.net`. Legg inn domenet der hvis feltet er tomt. Hvis GitHub melder at domenet allerede er i bruk, undersøk eierskap og eksisterende oppsett før du går videre.
4. Verifiser gjerne domenet på GitHub-kontoen med TXT-posten GitHub oppgir. Sjekk at den nye Pages-jobben er grønn før du endrer DNS. Før egendomenet er knyttet til Pages, er standardadressen `https://terjekol.github.io/terjeweb/`. GitHub kan videresende den til egendomenet etter at `CNAME` er tatt i bruk.

[Publiseringskilde for GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
[Konfigurere egendefinert domene](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
[Verifisere domeneeierskap](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)

## DNS og HTTPS

Navneserverne for `kolderup.net` var under `ui-dns.*` ved oppslag 22. november 2026. Bruk **Domains & SSL → DNS** hvis du administrerer dem i IONOS. Ta vare på eksisterende `@`- og `www`-poster før endringen. Bare disse vertsnavnene inngår i overgangen. Behold postene for blant annet e-post og `lab.kolderup.net`. `capellait.no` har et eget Pages-oppsett.

| Vert | Type | Verdi |
| --- | --- | --- |
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |
| `@` | AAAA, hvis du vil tilby IPv6 | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| `www` | CNAME, hvis du vil tilby www | `terjekol.github.io` |

Erstatt gamle A- og AAAA-poster på `@` som peker til tidligere hosting. Hvis du velger IPv6, legger du inn hver av de fire AAAA-verdiene som egen post. For `www` erstatter CNAME-posten eventuelle gamle A-, AAAA- eller CNAME-poster på akkurat det vertsnavnet.

Når Pages viser at DNS er godkjent, aktiver **Enforce HTTPS**. Åpne alle fem rutene under `https://kolderup.net` og verifiser også `https://lab.kolderup.net/equations.html` og `capellait.no`. Ved behov kan du gjenopprette de tidligere DNS-postene. Den tidligere publiseringskilden i hovedrepoet kan velges ved å sette Pages tilbake til `master` og `/ (root)`.

[GitHubs DNS-verdier og oppsett](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
[IONOS om A-poster](https://www.ionos.com/help/domains/glossary-important-terms-and-topics-explained/a-record/)

## Ligningsløseren

`docs/equations/solver.js` bygger på [den gamle labens bundle](https://github.com/terjekol/lab.kolderup.net/blob/15876b0ffa494f42ffbff90b1c7c02b0a0e0befc/obfuscated.js). Funksjons- og variabelnavn, deler av gjengivelsen og den lesbare oppgavegeneratoren er hentet fra [FunkyTerje](https://github.com/terjekol/FunkyTerje/tree/3b272cc2be3dbe965031f8e3a1f807fba75db0d3/math). De eksisterende algebraoperasjonene og de seks oppgavenivåene er videreført. Inndata valideres før en ny oppgave lastes. Forklaringsvideoene hentes først når videopanelet åpnes.

Dette er et verktøy for trinnvis øving. Egne oppgaver bruker små bokstaver, heltall på opptil seks sifre, ett likhetstegn og eksplisitt `*` for multiplikasjon. Oppsettet støtter brøker med `/` og parenteser. Nivået bestemmer hvilke operasjoner som vises. Bruk verktøyet til enkle, lineære ligninger og kontroller vilkår for brøker med variabler. Potenser, flerleddsbrøker, flere variabler og ligninger med ingen eller uendelig mange løsninger har begrenset støtte.

Ved klargjøring passerte HTML-validering og lenkekontroll for alle fem rutene med både rotdomene og GitHub Pages-prefikset `/terjeweb/`. Automatiserte tester dekket 1 200 genererte oppgaver, egne uttrykk, algebraoperasjoner, angre og gjør om, fokus og montering av videospilleren. Visuell kontroll og selve videoavspillingen gjenstår.

## Bokprosjektet

`docs/bok/` er en statisk inngang til bokprosjektet. Utdrag kan få egne adresser under `/bok/utdrag/` og labber under `/bok/lab/`. Ved flytting til `kodebok.kolderup.net` kan bokmappen bli en egen publiseringsrot med kopier av de delte stilfilene, og `/bok/` kan peke dit. Flytt labbene til `lab.kolderup.net` når de har en egen publiseringskilde og de gamle labadressene er kartlagt.
