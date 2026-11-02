# Automatischer Strava-Upload einrichten

Nach der Einrichtung tippst du nach dem Training in der Speed-Race-App auf **„Zu Strava hochladen“**. Die Fahrt landet mit Watt, Puls, Trittfrequenz und Runden als Indoor-Fahrt in deinem Strava-Profil.

**Dauer:** einmalig etwa 15–20 Minuten.
**Empfehlung:** Teil A bis C am Laptop machen, Teil D am Handy. Script-Adresse und Schlüssel schickst du dir dafür am einfachsten per E-Mail an dich selbst oder legst sie in Google Keep ab.

So hängt alles zusammen:

```
Speed-Race-App (Handy)  →  dein Google Apps Script  →  Strava
                           (bewahrt den Strava-Zugang sicher auf)
```

---

## Teil A – Strava-API-Anwendung anlegen (ca. 5 Min)

1. Bei Strava im Browser anmelden und **https://www.strava.com/settings/api** öffnen.
2. Das Formular ausfüllen:

   | Feld | Eintrag |
   |---|---|
   | Anwendungsname | `Speed Race X` |
   | Kategorie | `Training` (oder eine andere passende) |
   | Club | leer lassen |
   | Website | `https://andreaskimmig13.github.io/Speedbike-Race-X/` |
   | Anwendungsbeschreibung | z. B. `Upload meiner Indoor-Fahrten` |
   | **Autorisierungs-Callback-Domain** | **`script.google.com`** (genau so, ohne https:// und ohne Schrägstrich) |

3. Den Nutzungsbedingungen zustimmen und **Erstellen** tippen.
4. Strava verlangt danach ein **Symbolbild** für die Anwendung. Lade irgendein Bild hoch (z. B. ein Foto vom Bike).
5. Auf der Seite „Meine API-Anwendung“ stehen jetzt:
   - **Client-ID** – eine Zahl, z. B. `123456`
   - **Client Secret** – auf **„Anzeigen“** tippen, dann erscheint eine lange Zeichenfolge

   Lass die Seite offen, du brauchst beide Werte in Teil B.

> Das Client Secret ist wie ein Passwort. Es kommt nur in die Skripteigenschaften deines Apps Scripts, nirgendwo sonst hin.

---

## Teil B – Apps Script anlegen (ca. 10 Min)

### B1. Projekt anlegen und Code einfügen

1. **https://script.google.com** öffnen und links oben **„Neues Projekt“** tippen.
2. Oben auf **„Unbenanntes Projekt“** tippen und es **`Speed Race X Upload`** nennen.
3. Den Code holen: **https://github.com/andreaskimmig13/Speedbike-Race-X/blob/main/apps-script/Code.gs** öffnen und rechts oben über der Datei auf das Symbol **„Copy raw file“** (zwei Rechtecke) tippen.
4. Zurück im Script-Editor: in der Datei `Code.gs` den vorhandenen Inhalt (`function myFunction() {…}`) **komplett löschen** und den kopierten Code einfügen.
5. Speichern (Disketten-Symbol oder `Strg+S`).

### B2. Als Web-App bereitstellen

1. Rechts oben **„Bereitstellen“ → „Neue Bereitstellung“**.
2. Links neben „Typ auswählen“ auf das **Zahnrad** tippen und **„Web-App“** wählen.
3. Einstellungen:
   - Beschreibung: `Strava Upload`
   - **Ausführen als: „Ich“** (deine E-Mail-Adresse)
   - **Zugriff: „Jeder“** – nötig, damit die App auf dem Handy das Script ohne Google-Anmeldung erreicht. Geschützt ist es über den Schlüssel aus Teil C.
4. **„Bereitstellen“** tippen.
5. Google fragt nach Berechtigungen:
   - **„Zugriff autorisieren“** → dein Google-Konto wählen
   - Bei „Google hat diese App nicht überprüft“: **„Erweitert“** → **„Zu Speed Race X Upload (unsicher) wechseln“** → **„Zulassen“**.
     Das ist normal bei eigenen Scripts. Das Script braucht nur die Erlaubnis, externe Dienste (Strava) aufzurufen.
6. Die **Web-App-URL** kopieren. Sie sieht so aus:
   `https://script.google.com/macros/s/AKfycb…lange Zeichenfolge…/exec`
   Wichtig: Sie muss auf **`/exec`** enden.

### B3. Skripteigenschaften eintragen

1. Links in der Leiste auf das **Zahnrad „Projekteinstellungen“** tippen.
2. Ganz unten bei **„Skripteigenschaften“** auf **„Skripteigenschaft hinzufügen“** und diese drei Einträge anlegen:

   | Property | Wert |
   |---|---|
   | `STRAVA_CLIENT_ID` | die Client-ID aus Teil A |
   | `STRAVA_CLIENT_SECRET` | das Client Secret aus Teil A |
   | `WEBAPP_URL` | die Web-App-URL aus B2 (endet auf `/exec`) |

   Die Namen genau so schreiben, in Großbuchstaben, ohne Leerzeichen.
3. **„Skripteigenschaften speichern“**.

---

## Teil C – Mit Strava verbinden (ca. 2 Min)

1. Links in der Leiste auf **„Editor“** (`< >`) wechseln.
2. Oben in der Werkzeugleiste in der Auswahlliste der Funktionen **`einrichten`** wählen und **„Ausführen“** tippen.
   Beim ersten Mal fragt Google eventuell noch einmal nach Berechtigungen, wie in B2 Schritt 5.
3. Unten öffnet sich das **Ausführungsprotokoll** mit drei Einträgen:
   - **SCHRITT 1 – Link:** beginnt mit `https://www.strava.com/oauth/authorize?…`
   - **SCHRITT 2 – Schlüssel:** 32 Zeichen, z. B. `3f9a…`
   - **Script-Adresse** für die App
4. Den **Link aus Schritt 1** kopieren und in einem neuen Browser-Tab öffnen.
5. Strava zeigt „Speed Race X möchte auf dein Konto zugreifen“. **Alle Häkchen gesetzt lassen** (vor allem „Aktivitäten hochladen“) und **„Autorisieren“** tippen.
6. Es erscheint die Seite **„Mit Strava verbunden – Verbunden als Andreas …“**. Fertig, das Fenster kannst du schließen.

**Schlüssel und Script-Adresse** aus dem Protokoll jetzt an dich selbst schicken (E-Mail oder Google Keep), damit du sie am Handy einfügen kannst.

> Optional zur Kontrolle: Funktion **`verbindungTesten`** ausführen. Im Protokoll steht dann `{"ok":true,"athlete":"Andreas …"}`.

---

## Teil D – In der Speed-Race-App eintragen (ca. 2 Min)

1. Die App am Handy öffnen: **https://andreaskimmig13.github.io/Speedbike-Race-X/** und einmal neu laden.
2. Nach unten zur Karte **„Fahrt“** scrollen und **„Strava-Upload einrichten“** aufklappen.
3. **Script-Adresse** (endet auf `/exec`) und **Schlüssel** einfügen.
4. **„Verbindung prüfen“** tippen. Es erscheint: **„Verbindung steht. Strava-Konto: Andreas …“**.

Die Einträge merkt sich die App auf diesem Handy.

---

## So nutzt du es

1. Training fahren und auf **„Beenden“** tippen.
2. **„Zu Strava hochladen“** tippen. Nach 10–30 Sekunden erscheint **„Hochgeladen. In Strava öffnen“**.

Was in Strava ankommt:

- **Name:** z. B. `Woche 2 · A: Schwelle 3 × 10'` oder `Indoor: Zielwatt`
- **Beschreibung:** Ø Watt, Ø Puls, Arbeit (kJ), Dauer und der Hinweis, dass die Watt aus der Tabelle geschätzt sind
- **Daten pro Sekunde:** Watt, Puls, Trittfrequenz, virtuelles Tempo und Distanz
- **Runden:** jeder Trainingsabschnitt als eigene Runde
- **Markierung als Indoor-Fahrt** (Trainer)

Die Schaltfläche „TCX-Datei speichern“ bleibt als Reserve, falls der Upload einmal nicht klappt.

---

## Wenn etwas nicht klappt

| Meldung | Ursache und Lösung |
|---|---|
| *Script nicht erreichbar* | Script-Adresse prüfen (muss auf `/exec` enden). In Apps Script unter „Bereitstellen → Bereitstellungen verwalten“ prüfen, dass **Zugriff: Jeder** eingestellt ist. |
| *Falscher Schlüssel* | Schlüssel in der App neu einfügen, ohne Leerzeichen am Anfang oder Ende. Den aktuellen Schlüssel zeigt die Funktion `einrichten` jederzeit wieder an. |
| *Noch nicht mit Strava verbunden* | Teil C wiederholen. |
| *Strava-Anmeldung fehlgeschlagen … Client-ID und Secret prüfen* | `STRAVA_CLIENT_ID` und `STRAVA_CLIENT_SECRET` in den Skripteigenschaften prüfen, dann Teil C wiederholen. |
| Strava zeigt beim Link *„redirect_uri invalid“* | In der Strava-API-Anwendung muss die Callback-Domain genau `script.google.com` sein, und `WEBAPP_URL` muss die `/exec`-Adresse sein. |
| Seite *„Recht fehlt“* nach dem Autorisieren | Beim Autorisieren wurde das Häkchen „Aktivitäten hochladen“ entfernt. Link aus `einrichten` erneut öffnen und alle Häkchen gesetzt lassen. |
| *Diese Fahrt ist schon in Strava* | Die Fahrt wurde schon hochgeladen. Der Link führt zur vorhandenen Aktivität. |
| *Strava verarbeitet die Fahrt noch* | Kein Fehler. Die Fahrt erscheint nach ein paar Minuten im Profil. |

---

## Wenn der Script-Code aktualisiert wird

Ändert sich `apps-script/Code.gs` auf GitHub:

1. Den neuen Code wie in B1 kopieren und in `Code.gs` ersetzen, speichern.
2. **„Bereitstellen“ → „Bereitstellungen verwalten“** → bei der vorhandenen Bereitstellung auf den **Stift (Bearbeiten)** tippen.
3. Bei **„Version“** auf **„Neue Version“** stellen und **„Bereitstellen“** tippen.

So bleibt die Web-App-URL gleich, und in der App musst du nichts ändern. Lege keine „Neue Bereitstellung“ an, sonst bekommst du eine neue URL.

---

## Sicherheit

- Client Secret und Strava-Zugang liegen nur in den Skripteigenschaften deines Google-Kontos. Im Code auf GitHub stehen keine Zugangsdaten.
- Hochladen kann nur, wer den Schlüssel kennt. Neuen Schlüssel erzeugen: Funktion **`schluesselErneuern`** ausführen und den neuen Schlüssel in der App eintragen.
- Zugriff komplett entziehen: bei Strava unter **https://www.strava.com/settings/apps** die Anwendung „Speed Race X“ widerrufen.
