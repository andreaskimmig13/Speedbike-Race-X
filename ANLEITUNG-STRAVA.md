# Automatischer Strava-Upload – Schritt für Schritt

Am Ende tippst du nach dem Training in der Speed-Race-App auf **„Zu Strava hochladen“**, und die Fahrt erscheint mit Watt, Puls, Trittfrequenz und Runden als Indoor-Fahrt in deinem Strava-Profil.

---

## Bevor du anfängst

**Was du brauchst**
- einen **Laptop oder PC** mit Chrome (Teil 1 bis 4 gehen am Laptop viel einfacher)
- dein **Handy** mit der Speed-Race-App (für Teil 5)
- deine Zugangsdaten für **Strava** und dein **Google-Konto**
- etwa **20 Minuten**

**Wie es funktioniert**

```
Speed-Race-App (Handy)  ──Fahrt──▶  dein Google Apps Script  ──Upload──▶  Strava
                                    (hat den Strava-Zugang,
                                     prüft den Schlüssel)
```

Strava erlaubt Uploads nur über eine registrierte „API-Anwendung“ mit geheimen Zugangsdaten. Diese Daten dürfen nicht in der App stehen, weil die App öffentlich auf GitHub liegt. Deshalb übernimmt ein kleines Google Apps Script in deinem Google-Konto den Upload.

**Notizzettel**
Während der Einrichtung sammelst du drei Werte. Leg dir dafür eine Notiz an, zum Beispiel in Google Keep oder einer Textdatei:

| Wert | Woher | Beispiel |
|---|---|---|
| Client-ID | Teil 1 | `123456` |
| Client Secret | Teil 1 | `a1b2c3d4e5…` (40 Zeichen) |
| Web-App-URL | Teil 2 | `https://script.google.com/macros/s/AKfycb…/exec` |

---

## Teil 1 – Strava-API-Anwendung anlegen (ca. 5 Minuten)

Damit meldest du bei Strava an, dass ein eigenes Programm Fahrten für dich hochladen darf.

### 1.1 Seite öffnen
1. Am Laptop in Chrome **https://www.strava.com/settings/api** öffnen.
2. Falls nötig mit deinem Strava-Konto anmelden.
3. Du siehst die Seite **„Meine API-Anwendung“** (englisch „My API Application“) mit einem leeren Formular.

> Falls dort schon eine Anwendung steht, hast du früher einmal eine angelegt. Strava erlaubt nur eine pro Konto. Du kannst sie weiterverwenden: Prüfe dann nur in 1.2 das Feld „Autorisierungs-Callback-Domain“ (über „Bearbeiten“) und mach mit 1.4 weiter.

### 1.2 Formular ausfüllen

| Feld (deutsch / englisch) | Was du einträgst | Erklärung |
|---|---|---|
| **Anwendungsname** / Application Name | `Speed Race X` | Taucht später bei der Strava-Freigabe auf. |
| **Kategorie** / Category | `Training` wählen (oder „Sonstiges“/Other) | Spielt keine Rolle. |
| **Club** | leer lassen | |
| **Website** | `https://andreaskimmig13.github.io/Speedbike-Race-X/` | Strava verlangt hier irgendeine Webseite. Deine App-Adresse passt. |
| **Anwendungsbeschreibung** / Application Description | `Upload meiner Indoor-Fahrten vom Speed Race X` | Frei wählbar. |
| **Autorisierungs-Callback-Domain** / Authorization Callback Domain | **`script.google.com`** | **Wichtig.** Genau so schreiben: ohne `https://`, ohne `www`, ohne Schrägstrich am Ende. Hierhin schickt Strava dich nach der Freigabe zurück. |

### 1.3 Erstellen
1. Das Häkchen bei der **API-Vereinbarung** setzen.
2. Auf **„Erstellen“** (Create) klicken.
3. Strava verlangt jetzt ein **Symbolbild** (App-Icon). Klick auf das Bildfeld und lade irgendein Bild hoch, zum Beispiel ein Foto vom Bike oder einen Screenshot. Ohne Bild lässt sich die Anwendung nicht fertigstellen.
4. Bestätige mit **„Speichern“**.

### 1.4 Client-ID und Client Secret notieren
Auf der Seite stehen jetzt mehrere Werte. Du brauchst nur zwei:

- **Client-ID**: eine Zahl, meist 5–6 Stellen. In den Notizzettel kopieren.
- **Client Secret**: ist verdeckt. Auf **„Anzeigen“** (Show) klicken, die 40 Zeichen lange Zeichenfolge kopieren und in den Notizzettel einfügen.

Die Felder „Zugriffstoken“ und „Aktualisierungstoken“ auf derselben Seite brauchst du **nicht**.

> Das Client Secret ist wie ein Passwort. Gib es nirgendwo anders ein als in Teil 3 in die Skripteigenschaften.

✅ **Ergebnis Teil 1:** Client-ID und Client Secret stehen im Notizzettel.

---

## Teil 2 – Apps Script anlegen und bereitstellen (ca. 8 Minuten)

### 2.1 Neues Projekt
1. In Chrome **https://script.google.com** öffnen. Du landest auf „Meine Projekte“ (deine anderen Scripts wie Belegarchiv stehen dort auch).
2. Links oben auf **„+ Neues Projekt“** klicken.
3. Es öffnet sich der Editor mit einer Datei **`Code.gs`**, darin steht:
   ```
   function myFunction() {

   }
   ```
4. Ganz oben links steht **„Unbenanntes Projekt“**. Draufklicken, **`Speed Race X Upload`** eintippen und **„Umbenennen“** klicken.

### 2.2 Code einfügen
1. In einem **neuen Tab** öffnen:
   **https://github.com/andreaskimmig13/Speedbike-Race-X/blob/main/apps-script/Code.gs**
2. Rechts oben über dem Code gibt es mehrere kleine Symbole. Klick auf **„Copy raw file“** (Symbol mit zwei übereinanderliegenden Rechtecken). Jetzt ist der ganze Code in der Zwischenablage.
3. Zurück zum Tab mit dem Script-Editor.
4. In `Code.gs` klicken, mit **Strg+A** alles markieren und mit **Entf** löschen. Die Datei muss komplett leer sein.
5. Mit **Strg+V** den kopierten Code einfügen. Er beginnt mit `/**` und `Speed Race X → Strava Upload`.
6. Mit **Strg+S** speichern (oder oben auf das Disketten-Symbol). Neben dem Dateinamen verschwindet der orange Punkt.

### 2.3 Als Web-App bereitstellen
1. Rechts oben auf den blauen Knopf **„Bereitstellen“** klicken und **„Neue Bereitstellung“** wählen.
2. Es öffnet sich ein Fenster. Links steht „Typ auswählen“ mit einem **Zahnrad**. Aufs Zahnrad klicken und **„Web-App“** wählen.
3. Rechts erscheinen die Einstellungen:

   | Feld | Einstellung |
   |---|---|
   | **Beschreibung** | `Strava Upload` |
   | **Ausführen als** | **„Ich (deine E-Mail-Adresse)“** |
   | **Zugriff** / „Wer hat Zugriff“ | **„Jeder“** – nicht „Jeder mit Google-Konto“ und nicht „Nur ich“ |

   „Jeder“ ist nötig, damit die App am Handy das Script ohne Google-Anmeldung erreicht. Abgesichert ist es trotzdem: Ohne den geheimen Schlüssel aus Teil 4 lehnt das Script jede Anfrage ab.
4. Unten rechts auf **„Bereitstellen“** klicken.

### 2.4 Zugriff erlauben
Google fragt jetzt, ob das Script auf Dienste zugreifen darf:

1. **„Zugriff autorisieren“** klicken.
2. Dein **Google-Konto** auswählen.
3. Es erscheint **„Google hat diese App nicht überprüft“**. Das ist bei eigenen Scripts normal.
   - Links unten auf **„Erweitert“** klicken.
   - Ganz unten auf **„Zu Speed Race X Upload (unsicher) wechseln“** klicken.
4. Google listet die Berechtigungen auf, unter anderem **„Verbindung zu einem externen Dienst herstellen“**. Das braucht das Script, um mit Strava zu sprechen. Auf **„Zulassen“** klicken.

### 2.5 Web-App-URL kopieren
1. Das Fenster zeigt jetzt **„Neue Bereitstellung“** mit einer **Bereitstellungs-ID** und darunter der **Web-App-URL**.
2. Bei der **Web-App-URL** auf **„Kopieren“** klicken und in den Notizzettel einfügen.
   Sie muss so aussehen: `https://script.google.com/macros/s/AKfycb…sehr lang…/exec`. Wichtig ist das **`/exec`** am Ende.
3. Auf **„Fertig“** klicken.

> Die Web-App-URL findest du später jederzeit wieder unter **„Bereitstellen“ → „Bereitstellungen verwalten“**.

✅ **Ergebnis Teil 2:** Das Script ist bereitgestellt, und die Web-App-URL steht im Notizzettel.

---

## Teil 3 – Skripteigenschaften eintragen (ca. 3 Minuten)

Hier hinterlegst du die Zugangsdaten so, dass sie nur in deinem Google-Konto liegen und nicht im Code.

1. Im Script-Editor ganz links ist eine schmale Leiste mit Symbolen. Fahr mit der Maus darüber, dann erscheinen die Namen: Übersicht, Editor, Trigger, Ausführungen, **Projekteinstellungen** (Zahnrad). Auf das **Zahnrad „Projekteinstellungen“** klicken.
2. Ganz nach unten scrollen bis zum Abschnitt **„Skripteigenschaften“**.
3. Auf **„Skripteigenschaft hinzufügen“** klicken (bei manchen Ansichten zuerst „Skripteigenschaften bearbeiten“).
4. Es erscheinen zwei Felder: links **„Property“**, rechts **„Wert“**. Trag die erste Zeile ein, klick dann erneut auf „Skripteigenschaft hinzufügen“ für die nächste:

   | Property (links, genau so schreiben) | Wert (rechts) |
   |---|---|
   | `STRAVA_CLIENT_ID` | Client-ID aus dem Notizzettel |
   | `STRAVA_CLIENT_SECRET` | Client Secret aus dem Notizzettel |
   | `WEBAPP_URL` | Web-App-URL aus dem Notizzettel (mit `/exec` am Ende) |

   Achte darauf: Großbuchstaben, Unterstriche statt Leerzeichen, keine Leerzeichen vor oder nach den Werten.
5. Auf **„Skripteigenschaften speichern“** klicken.

✅ **Ergebnis Teil 3:** Unter „Skripteigenschaften“ stehen drei Zeilen.

---

## Teil 4 – Mit Strava verbinden (ca. 3 Minuten)

### 4.1 Funktion „einrichten“ ausführen
1. Links in der Leiste auf **„Editor“** (Symbol `< >`) klicken, damit du wieder den Code siehst.
2. Oben über dem Code ist eine Werkzeugleiste mit: ↶ ↷, Speichern, **▷ Ausführen**, Fehler beheben und einer **Auswahlliste mit einem Funktionsnamen**.
3. Die Auswahlliste anklicken und **`einrichten`** wählen.
4. Auf **„▷ Ausführen“** klicken.
5. Falls Google noch einmal nach Berechtigungen fragt: wie in Teil 2.4 zulassen.
6. Unten öffnet sich das **„Ausführungsprotokoll“**. Nach ein paar Sekunden siehst du:
   - `Hinweis  Ausführung gestartet`
   - `Info  SCHRITT 1 – diesen Link im Browser öffnen …` und darunter einen langen Link, der mit `https://www.strava.com/oauth/authorize?` beginnt
   - weitere Infos mit Script-Adresse, Schlüssel und Einrichtungslink
   - `Hinweis  Ausführung abgeschlossen`

> Kommt stattdessen eine **rote Fehlermeldung** wie „Bitte zuerst in den Skripteigenschaften eintragen: …“, fehlt dort ein Eintrag oder er ist falsch geschrieben. Zurück zu Teil 3.

### 4.2 Strava-Freigabe erteilen
1. Den Link aus **SCHRITT 1** komplett markieren (er ist lang und geht ggf. über mehrere Zeilen) und kopieren.
2. Einen **neuen Tab** öffnen, den Link einfügen und Enter drücken.
3. Strava zeigt: **„Speed Race X“ möchte auf dein Strava-Konto zugreifen**, mit Häkchen wie „Öffentliche Daten anzeigen“ und **„Aktivitäten hochladen“**.
   **Alle Häkchen gesetzt lassen** und auf **„Autorisieren“** klicken.
4. Du landest auf der Seite **„Mit Strava verbunden“** mit deinem Namen und einem **QR-Code**. Diese Seite offen lassen.

✅ **Ergebnis Teil 4:** Das Script darf jetzt Fahrten in dein Strava-Konto hochladen.

---

## Teil 5 – App am Handy einrichten (ca. 1 Minute)

### Variante A: mit dem QR-Code (am einfachsten)
1. Am Handy die **Kamera-App** öffnen und auf den QR-Code auf dem Laptop-Bildschirm richten. Alternativ Google Lens oder den QR-Scanner in den Schnelleinstellungen verwenden.
2. Über dem QR-Code erscheint ein Link zu `andreaskimmig13.github.io`. Antippen. Die Speed-Race-App öffnet sich in **Chrome**.
3. Oben in der App erscheint **„Strava-Upload eingerichtet“**. Auf **„Jetzt prüfen“** tippen.
4. Nach ein paar Sekunden steht unten: **„Verbindung steht. Strava-Konto: Andreas …“**. Fertig.

### Variante B: ohne QR-Code
1. Auf der Seite „Mit Strava verbunden“ steht unter dem QR-Code ein langer Link. Den schickst du dir per E-Mail oder Google Keep aufs Handy und öffnest ihn dort in Chrome. Weiter wie in Variante A ab Schritt 3.
2. Oder von Hand: In der App unten bei **„Fahrt“** → **„Strava-Upload einrichten“** aufklappen, die **Script-Adresse** (Web-App-URL) und den **Schlüssel** aus dem Ausführungsprotokoll eintragen und auf **„Verbindung prüfen“** tippen.

> Den Einrichtungslink bekommst du jederzeit wieder, zum Beispiel für ein neues Handy: im Script-Editor die Funktion **`appLinkAnzeigen`** ausführen.

✅ **Ergebnis Teil 5:** Die App kennt Script-Adresse und Schlüssel und hat die Verbindung geprüft.

---

## So nutzt du es ab jetzt

1. Training in der App fahren und auf **„Beenden“** tippen.
2. Auf **„Zu Strava hochladen“** tippen.
3. Nach 10–30 Sekunden erscheint **„Hochgeladen. In Strava öffnen“**.

Was in Strava ankommt:
- **Name**: z. B. `Woche 2 · A: Schwelle 3 × 10'` oder `Indoor: Zielwatt`
- **Beschreibung**: Ø Watt, Ø Puls, Arbeit in kJ, Dauer und der Hinweis, dass die Watt aus der Tabelle geschätzt sind
- **Daten pro Sekunde**: Watt, Puls, Trittfrequenz, virtuelles Tempo, Distanz
- **Runden**: jeder Trainingsabschnitt einzeln
- **Indoor-Markierung** (Trainer)

„TCX-Datei speichern“ bleibt als Reserve, falls ein Upload einmal nicht klappt.

---

## Wenn etwas nicht klappt

| Wo | Meldung | Lösung |
|---|---|---|
| Ausführungsprotokoll | *Bitte zuerst in den Skripteigenschaften eintragen: …* | Der genannte Eintrag fehlt oder ist falsch geschrieben (Teil 3). |
| Ausführungsprotokoll | *WEBAPP_URL muss auf /exec enden* | Die Adresse aus „Bereitstellen → Bereitstellungen verwalten“ kopieren, nicht die aus der Adresszeile des Editors. |
| Strava nach Klick auf den Link | *redirect_uri invalid* / „Ungültige Weiterleitung“ | In der Strava-API-Anwendung (Teil 1) die Callback-Domain auf genau `script.google.com` setzen. |
| Seite nach dem Autorisieren | *Recht fehlt* | Beim Autorisieren wurde das Häkchen „Aktivitäten hochladen“ entfernt. Teil 4 wiederholen. |
| Seite nach dem Autorisieren | *Strava-Anmeldung fehlgeschlagen … Client-ID und Secret prüfen* | Client-ID oder Client Secret in den Skripteigenschaften falsch. Korrigieren, dann Teil 4 wiederholen. |
| Seite nach dem Autorisieren | *Ungültiger Link* | Nur den Link aus dem aktuellen Ausführungsprotokoll verwenden. |
| QR-Code-Feld | *QR-Code konnte nicht geladen werden* | Variante B in Teil 5 verwenden. |
| App | *Script nicht erreichbar* | Script-Adresse prüfen. Unter „Bereitstellungen verwalten“ muss **Zugriff: Jeder** stehen. |
| App | *Falscher Schlüssel* | Einrichtungslink neu öffnen (`appLinkAnzeigen`) oder Schlüssel ohne Leerzeichen neu eintragen. |
| App | *Noch nicht mit Strava verbunden* | Teil 4 wiederholen. |
| App | *Diese Fahrt ist schon in Strava* | Kein Fehler, der Link führt zur vorhandenen Aktivität. |
| App | *Strava verarbeitet die Fahrt noch* | Kein Fehler, die Fahrt erscheint in ein paar Minuten. |

---

## Wenn der Script-Code aktualisiert wird

Falls Claude den Code in `apps-script/Code.gs` später ändert:

1. Den neuen Code wie in Teil 2.2 kopieren, in `Code.gs` alles ersetzen und speichern.
2. **„Bereitstellen“ → „Bereitstellungen verwalten“** öffnen.
3. Links die vorhandene Bereitstellung „Strava Upload“ wählen und oben auf den **Stift (Bearbeiten)** klicken.
4. Bei **„Version“** die Auswahl auf **„Neue Version“** stellen und **„Bereitstellen“** klicken.

So bleibt die Web-App-URL gleich, und in der App musst du nichts ändern. Lege **keine „Neue Bereitstellung“** an, sonst entsteht eine neue URL.

---

## Sicherheit

- Client Secret und Strava-Zugang liegen nur in den Skripteigenschaften deines Google-Kontos. Im Code auf GitHub stehen keine Zugangsdaten.
- Hochladen kann nur, wer den Schlüssel kennt. Neuen Schlüssel erzeugen: Funktion **`schluesselErneuern`** ausführen, danach mit **`appLinkAnzeigen`** den neuen Einrichtungslink holen.
- Zugriff komplett entziehen: bei Strava unter **https://www.strava.com/settings/apps** die Anwendung „Speed Race X“ widerrufen.
