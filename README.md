# REICHT. — Version 7 / Zusammenbruch, Zeit-Phase und Outro
Ein düsteres Aufstiegsspiel über Besitz, Status, Reichweite und das nächste Ziel.

## Neu in Version 7 — Der Zusammenbruch
Die Eskalation ist jetzt in sechs Akten inszeniert (Details auf `idee.html`). Der Bogen dauert bei aktivem Spiel rund 9 bis 10 Minuten (Fehlermeldung nach etwa 6 bis 7 Minuten, danach 2 bis 3 Minuten Zeit-Phase). Stellschrauben: `pressure()` und `tick()` in `script.js`, `MAX_IGNORED` in `fx.js`.

1. **Aufstieg:** ruhig, Erfolge werden gefeiert, Jubel-Partikel und Aufleuchten bei jedem Kauf.
2. **Beschleunigung:** Herzschlag-Vignette am Bildrand, HUD-Zahlen mit Farbsäumen, Tempo steigt.
3. **Überlast:** Fake-Fehlerfenster (Schlaf.exe, Freizeit nicht gefunden, verpasste Anrufe ...), Spam-Wörter über der Stadt, Zeilenversatz, chromatische Aberration, Farbblöcke, Text-Korruption im HUD, Tab-Titel mit wachsender Benachrichtigungszahl. Ein Fenster schliessen erzeugt neue. Die Belohnung wird leerer: Jubel-Partikel werden grau und weniger.
4. **ERROR_429:** wie bisher, jetzt mit Zusammenfassung («x Min aktiv / y Aktionen / Pausen: n»).
5. **Zeit-Phase:** Ruhige Fenster «Nimm dir Zeit.» tauchen schon in der Überlast vereinzelt auf und nach der Fehlermeldung immer öfter. «Ja, jetzt» führt sofort aufs Land. «Später» oder Ignorieren verstärkt sie (Fenster werden grösser, Wandtext «NIMM DIR ZEIT.» wächst, Welt entfärbt sich, Musik wird leiser, ein ruhiger Klangteppich entsteht).
6. **Kollaps und Outro:** Nach 10 ignorierten Zeit-Meldungen bricht das Bild zusammen (Tape-Stop, Schwarz, «STOPP.», «ATME.»), dann folgt die bestehende Reise aufs Land. Im Outro gibt es Sonnenstrahlen, Glühwürmchen, eine **Atem-Kugel** (4 s ein, 4 s aus) und eine Uhr **«Zeit für dich»**, die hochzählt, ohne etwas zu messen.

Weitere Änderungen: Boot-Sequenz und wachsende Skyline auf der Startseite, Seitenübergänge, Scroll-Reveal, ruhig atmender Hintergrund auf `achtsam.html` mit Hilfsangeboten (Die Dargebotene Hand 143, Pro Juventute 147), Chaos-Sound (verstimmte Töne, Sirene, Herzschlag-Bass, Stotter-Effekt), Pacing verdichtet (`pressure()`, Schwellen in `tick()`).

**Schutz und Zugänglichkeit:** Hinweis auf Flackern und Lautstärke beim Start, Option «Effekte reduzieren» (setzt `genug-motion`), «FX AUS» im Spiel und `prefers-reduced-motion` schalten Beben, Glitch, Blitze und Animationen ab. Der Einzelbild-Blitz tritt höchstens alle 3 Sekunden auf, der Herzschlag bleibt unter 2 Hz. Zeit-Meldungen werden Screenreadern über eine Live-Region vorgelesen.

Neue Dateien: `fx.js` (Zusammenbruch-Engine, nutzt die globalen Variablen aus `script.js`), `fx.css`, `site.js` (Übergänge, Reveal), `intro.js` (Boot, Skyline). Einhängepunkte in `script.js` heissen `window.FX?.…` und sind optional.

## In Visual Studio Code starten
1. ZIP entpacken und den Ordner `REICHT` in VS Code öffnen.
2. Mit der optionalen Erweiterung **Live Server** `index.html` öffnen.
3. Alternativ im Ordner `python3 -m http.server 8000` starten und `http://localhost:8000` öffnen.

Keine npm-Installation, Frameworks, API-Schlüssel, externen Dienste oder Datenbank erforderlich. Ein Doppelklick auf die HTML-Datei funktioniert grundsätzlich ebenfalls. Für verlässliche Soundauswahl, lokale Schrift und seitenübergreifenden Sitzungsspeicher wird ein lokaler Server empfohlen.

## Spielablauf
Du beginnst mit einer Mietwohnung. «Mehr.» erhöht deinen fiktiven Kontostand in CHF und bringt Follower. Investitionen werden vom Kontostand abgezogen. Kaufe direkt über die Plus-Markierungen auf der Karte oder über den grossen Button «Bauen & Investieren» neben «Mehr». Das Menü zeigt alle freigeschalteten Optionen, ihren Preis und Ertrag. Die Karte lässt sich mit Maus oder Finger verschieben; «Karte» zentriert sie. Bei fokussierter Karte funktionieren auch die Pfeiltasten. Das Baumenü schliesst über seinen Button oder Escape.

Die Karte wächst von 7 × 7 weiter über die frühere Grenze von 11 × 11 hinaus. Sie erreicht bei 80 Investitionen beispielsweise 23 × 23 Felder; der technische Rahmen liegt bei 64 × 64. Bestehende Nachbargebäude bleiben erhalten, neue kommen dazu. Plus/Minus und Ziehen steuern die Kamera. Neue Grundstücksringe erscheinen beim Ausbau; Häuser wachsen aus dem Boden. Zusätzliche Gebäude, Baustellen, Kräne, Rauch, Fussgänger, Verkehr und Anzeigetafeln lassen die Stadt zunehmend lebendig und dicht werden. Wohnhäuser, Karriere, Freizeit und Auszeichnungen sind über das Spielfeld verteilt; auch der vordere/untere Teil wird von Beginn an bewohnt. Die automatische Kartenansicht zoomt bei Wachstum etwas heraus. Kompakte, farbcodierte Markierungen zeigen den Sektor; Details und Preis erscheinen bei Hover oder Tastaturfokus. Reduzierte Bewegung zeigt diese Entwicklung ohne die laufenden Bewegungsanimationen.

Vier Sektoren sind zunächst offen. Nach drei Upgrades werden jeweils zwei weitere freigeschaltet. Alle zwölf Aufstiegsketten lassen sich wiederholt ausbauen:
- Wohnen: Mietwohnung, Eigentumswohnung, Reihenhaus, Einfamilienhaus, Villa, Anwesen, Privatinsel.
- Mobilität: zu Fuss, Gebrauchtwagen, Neuwagen, Sportwagen, Supersportwagen, Privatjet.
- Karriere: Berufseinstieg, Festanstellung, Teamleitung, Abteilungsleitung, Geschäftsführung, Vorstand, eigener Konzern.
- Weitere Ketten: Einrichtung, Uhr, Kooperationen, öffentliche Kampagnen, Freizeitbesitz, Auszeichnungen, Bühnen und Einfluss.

Jeder Kauf wird kurz als Erfolg inszeniert und sofort mit der nächsten Erwartung verknüpft. Die Sprites verändern sich ebenfalls, insbesondere Wohnung/Haus/Villa, Fahrzeuge und Karrieregebäude. Nach den benannten Stufen folgen weitere numerische Ausbaustufen. Es gibt kein vollständig abgeschlossenes Inventar. Preise steigen schneller als die Erträge.

Follower-Meilensteine steigen von 100 über 1 000, 10 000 und weitere Zehnerpotenzen. Sie erscheinen direkt auf dem Spielfeld und unterbrechen das Spielen nicht mehr durch einen Dialog. Besitz- und Karriereerfolge erzeugen denselben Druck wie Reichweitenziele. Die Mitteilungen werden mit dem Fortschritt schneller und zahlreicher. Vergleichstexte zu Besitz und Karriere berücksichtigen deinen aktuellen Stand.

## Die Kernbotschaft ist Teil der Mechanik
Ziele setzen, Herausforderungen bewältigen, unter Druck Routine gewinnen, Erfolge wahrnehmen und sich Zeit für sich nehmen gehören zusammen.

Vor einer neuen Runde wählst du Wohnen, Karriere oder ein eigenes Projekt als **Hauptziel**. Es liegt bewusst bei Stufe 15 einer einzigen Aufstiegskette und ist ohne Vernachlässigung praktisch nicht erreichbar. Es gibt keine Zwischenziel-Dialoge mehr. Im Outro und in der Auswertung steht: «Dein Hauptziel ist noch nicht erreicht. Das ist in Ordnung. Du darfst weiter daran arbeiten, aber nicht auf Kosten von dir.» (`FX.goalLine()`).

Aktionen im moderaten Druckbereich erhöhen eine spielinterne Routine. Je 20 solcher Aktionen steigt der Ertrag um 3 %, bis höchstens 18 %. Das ist eine Spielregel, keine Aussage über messbare psychische Belastbarkeit oder einen wissenschaftlich optimalen Stressbereich. Extreme Überlastung wird dadurch nicht belohnt.

Alle Scanlines und schrägen Regenlinien wurden entfernt. Die Pixelgrafik bleibt erhalten.

## Langsamer Aufbau und Erfolge
Die ersten Käufe und Reichweitenziele werden positiv gefeiert. Reguläre Druck-Mitteilungen beginnen erst später. Die musikalische Eskalation wird durch Spielzeit **und** Fortschritt begrenzt: Ein schneller Kaufrausch allein kann den Sound nicht sofort auf die höchste Stufe treiben. Die Zeitgrenze wächst über rund fünf Minuten, der objektive Druck zusätzlich mit Upgrades und Reichweite.

## Überlastung und ein anderer Weg
Nach mindestens 90 aktiven Spielsekunden, mindestens 14 Upgrades und 16 gesammelten Sekunden auf sehr hohem Druckniveau (durch den neuen Aufbau regulär erst deutlich später) erscheint einmalig **SYSTEM / ERROR_429**. Die Musik wird abgesenkt und Eingaben in der Stadt pausieren. Dieses Ereignis ist eine inszenierte Spielmeldung, kein echter Gerätefehler.

«Einen anderen Weg suchen» zeigt einen Wegweiser auf der Karte. Ein Klick darauf führt aufs Land. «Trotzdem weitermachen» setzt die Stadt fort; der Ausgang bleibt verfügbar. Escape entspricht dem Fortsetzen. Es gibt keine Sackgasse. Auch «Es reicht» führt jederzeit direkt in denselben Ausstieg.

Der Übergang dauert rund 13,5 Sekunden: Die Stadt zieht vorbei, die Farben werden heller, die Figur geht ins Grüne. Die Sequenz lässt sich über «Ankommen» überspringen und dauert bei reduzierter Bewegung nur kurz. Im Outro steht: **Dein Weg. Deine Zeit. Nimm dir Zeit für dich. Deine mentale Gesundheit zählt.** Man kann in der ruhigen Landschaft bleiben, ein PNG speichern oder die eigene Runde ansehen.

## Bewusster Rückweg in die Stadt
Im Outro gibt es «Zurück in die Stadt». Die Nachfrage lautet «Willst du wirklich zurück in den Stress?». Nein lässt die Landschaft offen. Ja führt zunächst auf `achtsam.html`: ein ausführlicher Text zu Zielen, Leistungsdruck, Selbstfürsorge und dem eigenen Massstab.

Dort kannst du auf dem Land bleiben oder bewusst zurück in die Stadt gehen. Erst dieser letzte Klick setzt die vorhandene Runde fort. Rückkehr bedeutet höheren Druck, schnellere Musik und dichtere Mitteilungen. Der Ausgang bleibt sichtbar; ein Neuladen erhöht die Rückkehrstufe nicht erneut. Auch «Weiterspielen» in der optionalen Auswertung nutzt dieselbe Nachfrage. Die Textseite ist ausserdem direkt vom Outro aus erreichbar.

## Stillstand
Nach vier Sekunden ohne Aktion beginnt die Karte langsam dunkler zu werden. Nach rund 36 Sekunden ist die maximale zusätzliche Verdunklung erreicht. Das System kommentiert die Pause provokant. Kontostand, Follower und Besitz verfallen dabei **nicht**. Ein Klick hellt die Welt wieder auf. Die Spielregeln inszenieren Druck, ohne einen echten Ressourcenverlust zu erzeugen. «Es reicht» bleibt jederzeit erreichbar, auch ohne einen einzigen Klick.

## Musik und Effekte
Ein im Browser erzeugter 8-Bit-Sequencer mit Square-Wave-Arpeggio, Bass, Kick, Hi-Hats und später dissonanten Zusatzstimmen. Das Tempo wächst bei einer regulären ersten Runde langsam von knapp 100 auf höchstens 258 BPM. Nach einer bewussten Rückkehr steigt es darüber hinaus, begrenzt auf 320 BPM. Lautstärke und Klangdichte steigen mit dem Fortschritt. Im Stillstand kommt ein tiefer Sägezahnklang hinzu. Die Musik ist absichtlich aufdringlich.

Wiederholtes Klicken startet oder verschiebt die Musik nicht mehr. Ein sehr kurzer, leiser und tief gefilterter Geräuschimpuls ersetzt den melodischen Klickton. Er liegt auf einem separaten Effektkanal, damit die Musik ihren Rhythmus behält.

Auf dem Land wechselt die Tonspur zu sehr leisen, langsam anschwellenden Sinusklängen. Spielmusik und Puls werden ausgeblendet. Stummschaltung ist auch im Outro erreichbar.

Sound startet nur nach Auswahl und der ersten Aktion im Spiel. Der Schalter oben rechts und der Lautstärkeregler bleiben erreichbar. Ein Kompressor begrenzt den technischen Pegel; die tatsächliche Lautstärke hängt von Gerät und Systemlautstärke ab. Bei ausgeschaltetem Sound und ausgeblendetem Tab wird der Audioausgang abgesenkt. Einzelne Noten und Percussion-Stimmen enden nach ihrem Klang; es entstehen keine endlos gestapelten Stimmen.

«FX AUS» schaltet Regenbewegung, Kamerazittern, Markerbewegung und weitere CSS-Animationen ab. Die Systemeinstellung für reduzierte Bewegung wird berücksichtigt. Kaufmöglichkeiten und Spielmechanik bleiben bedienbar.

## Abschluss
«Es reicht» stoppt den Druck und führt in die Landschaft. «Deine Runde ansehen» öffnet anschliessend optional Klicks, Upgrades, Follower und aktive Zeit. Die Reflexion greift die eigene Wohnentwicklung oder das Weiterklicken nach Meilensteinen auf. Bis zu drei Anschaffungen lassen sich symbolisch behalten. Der ruhige Moment oder die Spielauswertung kann als PNG heruntergeladen werden; beim Fortsetzen bleiben alle Anschaffungen erhalten.

## Dateien und Technik
- `index.html`: Einstieg und Anleitung ohne Vorwegnahme der Eskalation.
- `start.js`: Soundwahl und Fortsetzen der Runde.
- `spielen.html`: HUD, grosses Canvas-Spielfeld, Baumöglichkeiten, Mitteilungen und Abschluss.
- `city.js`: Pixel-Renderer der Stadt (ersetzt die Zeichenfunktionen aus `script.js`: Himmel, Boden, Gebäude, Autos, Ansicht des Spielstands).
- `script.js`: Spielwirtschaft, Aufstiegsketten, Pixelrenderer, Kartensteuerung, Sequencer, Sitzungsspeicher (der PNG-Export wurde entfernt).
- `style.css`: dunkles Interface, responsive Ansichten und Effekte.
- `pixel.ttf`: eigene lokal gebündelte Bitmap-Schrift; wird ohne externe Abfragen geladen.
- `idee.html`: separater Hintergrund zu Konzept und Daten.
- `achtsam.html`: eigene Leseseite zu Erfolg, Leistungsdruck, Zeit und mentaler Gesundheit.
- `achtsam.js`: bestätigt den bewussten Rückweg in die Stadt.
- `favicon.svg`: Tab-Symbol.

Die Pixelstadt ist vollständig mit Canvas-Code gezeichnet; keine Bild-API oder generierten Hintergrundbilder erforderlich. Alle Inhalte und Fonts liegen im Projektordner. Es werden keine Daten übertragen. Der Fortschritt liegt im Sitzungsspeicher (`genug-v3`) des Tabs. Sound und Bewegungswahl werden ebenfalls dort gespeichert. Version 5 nutzt denselben Sitzungsschlüssel wie Version 3/4 und übernimmt bestehende Runden. Neue Dramaturgiefelder erhalten Standardwerte. Ein abgeschlossener Spielstand öffnet direkt das ruhige Outro.

## Anpassen
`products` in `script.js` enthält Preise, Erträge, Kartenpositionen, Aufstiegsketten und zugehörige Provokationen. `price()`, `rates()` und `unlocked()` steuern die Wirtschaft. `earlyPhase()`, `pressure()` und `darkness()` steuern Erfolgsphase, zeitlich begrenzte Eskalation und Stillstand. `state.returns` erhöht den Druck nach bestätigten Rückwegen. `state.goal`, `checkPersonalGoal()` und `chooseGoal()` steuern eigene Ziele. `state.practice` und `routineBonus()` bilden spielinterne Erfahrung ab. `citySites()` erhält bereits gebaute Nachbarschaften und ergänzt neue. `provocations` enthält allgemeine Mitteilungen. `tempo()`, `scheduleMusic()`, `clickTap()` und `updateAudio()` steuern Musik und Effektkanäle. `triggerOverload()` und die Schwellenwerte in `tick()` steuern die Fehlermeldung. `drawDistricts()`, `drawLife()` und `drawConstruction()` steuern Stadtwachstum und Animationen. `beginCountry()`, `drawCountry()` und `scheduleCountryAudio()` steuern Landschaft, Übergang und ruhigen Sound. `home()`, `block()` und `drawObject()` zeichnen die Gebäude. Kartenpositionen werden isometrisch aus `a` und `b` abgeleitet. Hauptfarben und Layouts stehen in `style.css`.

## Validierung
Version 6 zusätzlich geprüft: Zielauswahl vor dem Start, eigenes Ziel erreichen, Erfolgsdialog, weitere Zielrichtung setzen oder Pause wählen, Routinebonus bei moderatem Druck, Wachstum auf 23 × 23 Felder, Erhalt vorhandener Nachbargebäude, Zoom und Zentrieren, ausgewogene Botschaft im Outro, Rückkehr mit erhaltenen Erfolgen, entfernte Linienoverlays und Layouts bei 390/768 Pixeln. Keine JavaScript-Laufzeitfehler in diesen Abläufen.

Version 5 zusätzlich geprüft: «Mehr», CHF-Kontostand und Abbuchung, langsamer steigendes Tempo, positive erste Erfolge, sichtbarer Investitionsbutton, kompakte Markierungen, Bebauung im Vordergrund, Nein/Ja-Nachfrage, Leseseite und Rückkehr zum Land, bewusst hektischere Stadt, einmalige Rückkehrstufe pro Bestätigung, Rückweg auch aus der Auswertung und Layouts bei 390/768 Pixeln. Keine JavaScript-Laufzeitfehler in diesen Abläufen. Für einen Vergleich des neuen Einstiegs «Neue Runde» wählen; bestehende Runden werden übernommen.

Version 4 zusätzlich geprüft: Geländevergrösserung, Bauanimation, stabiler Musikzeitgeber bei wiederholtem Klick, Überlastungsschwelle, Sperre während der Fehlermeldung, beide Fehlerdialog-Optionen, dauerhaft verfügbarer Weg, Übergang und Überspringen, Outro, ruhiges Verweilen, Landschafts-PNG, Stummschaltung, optionale Auswertung, Rückkehr aufs Land, Neuladen eines abgeschlossenen Spielstands, Neustart, Abschluss ohne Aktionen, Fortsetzen und Layouts bei 390 und 768 Pixeln. Keine JavaScript-Laufzeitfehler in diesen Abläufen.

In Chromium geprüft: Abschluss ohne Aktionen, Kauf direkt auf der Karte, Wohnung–Reihenhaus–Haus, Karrierenachrichten, Freischaltungen, Kauf über das Baumenü, Escape, Reichweiten-Meilensteine, 280-BPM-Sequencer, optische Eskalation, Stillstand/Verdunklung ohne Ressourcenverlust, Lautstärkeregler und Stummschaltung, Seitenwechsel mit Spielstand, PNG-Download, Neustart, reduzierte Bewegung, Ziehen/Zentrieren der Karte und Layouts bei 390 und 768 Pixel Breite. Keine JavaScript-Laufzeitfehler in diesen Abläufen.

Vor einer Award-Einreichung empfehlen sich Tests mit mehreren Personen, um Spielbalance und die subjektive Klangwirkung abzustimmen. Eigenen Entstehungsprozess dokumentieren, KI-Unterstützung offenlegen und MMP-Bezug sowie Einreichungsbedingungen prüfen.


## Version 8 — Schönere Stadt, Spielstand nur ansehen
- **Stadt:** Neuer Pixel-Renderer in `city.js`. Abendhimmel (färbt sich mit dem Druck von warm zu rot), Mond, Wolken, ferne Hochhäuser mit Fensterlicht, Strassen mit Gehsteig, Mittelstrich und Strassenlampen mit Lichtkegel, Bäume, Büsche, Bänke, Autos in beiden Spuren, weiche Schatten, Umrisse und Kantenlicht an allen Gebäuden. Alle zwölf Aufstiegsketten haben klar erkennbare Wahrzeichen: Wohnhaus bis Privatinsel, Glas-Hochhaus, Autos bis Privatjet, Studio mit Bildschirm und Sendemast, Möbelladen, Uhrenturm mit laufender Uhr, Herz-Neon, Werbetafel mit wechselndem Text, Pool, Pokalhalle, Bühne mit Scheinwerfern, Palast mit Krone. Je höher der Druck, desto mehr Fenster leuchten: Die Stadt schläft nicht mehr.
- **Spielstand:** Es gibt keinen Download und keinen Versand mehr. «Deine Runde ansehen» zeigt eine Ansicht deiner Stadt (`window.snapshotCity()`) mit den Zahlen. Es werden weiterhin keine Daten übertragen.
- **Hauptziel und Tempo:** siehe oben (Stufe 15, Bogen von 9 bis 10 Minuten).


## Version 9 — Pausen zählen
- **Entfernt:** Der Zielmoment vor dem Absturz (aufhören / weitermachen / Ziel anpassen), die Zielauswahl und der Button «Ziel wählen». Das Hauptziel meldet sich nur noch leise im Feed.
- **Entfernt:** Atem-Anzeige und Timer im Outro.
- **Neu:** Die Länge der Pause bestimmt die Rückkehr in die Stadt (ohne sichtbaren Timer). Unter 25 Sekunden kommt der Druck sofort zurück. Ab 25 Sekunden kommst du ruhiger zurück, bei etwa 90 Sekunden mit viel Luft. Erholung erhöht den Ertrag leicht («Routine + Erholung») und senkt das Hauptziel pro 30 Sekunden gesammelter Pause um eine Stufe (bis Stufe 5).

## Version 10 — Früherer Crash, Ende ist Ende
- **Crash:** Der Dialog «Das System ist überlastet» ist entfernt. Der Crash kommt direkt: «ERROR_429» als Vollbild-Schlag mit Wackeln und Fehlerton, danach die Nimm-dir-Zeit-Meldungen.
- **Tempo:** Wer sehr schnell wächst (ab 1 Mio. Follower und 8 Upgrades, frühestens nach 40 s), crasht nach wenigen Sekunden. Gemächliche Runden crashen weiterhin über den Druck (ab ca. 200 s). Chaos und Tempo steigen bei schnellem Wachstum ebenfalls früher.
- **Ende:** Wer das Ende erreicht hat, kann Stadt und Pause weiter wechseln. Geht er zur Startseite, ist das Spiel abgeschlossen: kein neuer Start, keine Neustart-Buttons. Zum Testen: `index.html?neu=1` setzt zurück.

## Version 11 — Fliessender Absturz, Startseite im Ende
- **Absturz:** Der Crash baut sich jetzt über etwa 9 Sekunden auf. Zuerst einzelne Pop-ups («Termin verpasst», «Verpasster Anruf», «Freunde: Lange nichts gehört»), dann immer schneller, mit wachsendem Beben. Danach folgt «ERROR_429», dann die «Nimm dir Zeit»-Meldungen und der Kollaps.
- **Ende:** Im Outro und in der Auswertung gibt es den Button «Zur Startseite». Dort zeigt die Startseite, dass die Runde abgeschlossen ist.
- Favicon als SVG, PNG und ICO (favicon-r.svg, favicon-32.png, favicon.ico, apple-touch-icon.png) mit Versionsparameter, damit Browser das alte G nicht aus dem Cache laden.
