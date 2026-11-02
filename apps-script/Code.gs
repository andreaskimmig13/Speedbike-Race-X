/**
 * Speed Race X → Strava Upload
 *
 * Nimmt Fahrten aus der Speed-Race-X-App entgegen und lädt sie bei Strava hoch.
 * Einrichtung: siehe ANLEITUNG-STRAVA.md im Repository.
 *
 * Skripteigenschaften (Projekteinstellungen → Skripteigenschaften):
 *   STRAVA_CLIENT_ID      Client-ID deiner Strava-API-Anwendung
 *   STRAVA_CLIENT_SECRET  Client-Secret deiner Strava-API-Anwendung
 *   WEBAPP_URL            Adresse dieser Web-App (endet auf /exec)
 * Diese Werte legt das Script selbst an:
 *   UPLOAD_KEY, ACCESS_TOKEN, REFRESH_TOKEN, EXPIRES_AT
 */

const PROPS = PropertiesService.getScriptProperties();
const cfg_ = k => PROPS.getProperty(k);

/** Im Editor ausführen: zeigt den Strava-Link und den Schlüssel für die App im Ausführungsprotokoll. */
function einrichten() {
  const id = cfg_('STRAVA_CLIENT_ID'), secret = cfg_('STRAVA_CLIENT_SECRET'), url = cfg_('WEBAPP_URL');
  const fehlt = [];
  if (!id) fehlt.push('STRAVA_CLIENT_ID');
  if (!secret) fehlt.push('STRAVA_CLIENT_SECRET');
  if (!url) fehlt.push('WEBAPP_URL');
  if (fehlt.length) throw new Error('Bitte zuerst in den Skripteigenschaften eintragen: ' + fehlt.join(', '));
  if (!/\/exec$/.test(url)) throw new Error('WEBAPP_URL muss auf /exec enden. Bitte die Adresse aus „Bereitstellungen verwalten“ kopieren.');
  const key = uploadKey_();
  const link = 'https://www.strava.com/oauth/authorize'
    + '?client_id=' + encodeURIComponent(id)
    + '&response_type=code&approval_prompt=force&scope=read,activity:write'
    + '&redirect_uri=' + encodeURIComponent(url)
    + '&state=' + key;
  Logger.log('SCHRITT 1 – diesen Link im Browser öffnen und bei Strava „Autorisieren“ tippen:\n\n' + link);
  Logger.log('SCHRITT 2 – diesen Schlüssel in der Speed-Race-App eintragen:\n\n' + key);
  Logger.log('Script-Adresse für die App:\n\n' + url);
}

/** Optional im Editor ausführen: prüft, ob die Verbindung zu Strava steht. */
function verbindungTesten() {
  Logger.log(JSON.stringify(ping_()));
}

/** Optional: neuen Schlüssel erzeugen (danach in der App neu eintragen). */
function schluesselErneuern() {
  PROPS.deleteProperty('UPLOAD_KEY');
  Logger.log('Neuer Schlüssel:\n\n' + uploadKey_());
}

function uploadKey_() {
  let k = cfg_('UPLOAD_KEY');
  if (!k) { k = Utilities.getUuid().replace(/-/g, ''); PROPS.setProperty('UPLOAD_KEY', k); }
  return k;
}

/* ---------- Web-App: Rückkehr von Strava ---------- */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.code || p.error) {
    if (!p.state || p.state !== cfg_('UPLOAD_KEY')) {
      return page_('Ungültiger Link', 'Dieser Link passt nicht zu deinem Script. Bitte den Link verwenden, den die Funktion „einrichten“ im Ausführungsprotokoll anzeigt.');
    }
    if (p.error) return page_('Nicht verbunden', 'Strava hat den Zugriff nicht erlaubt (' + p.error + '). Öffne den Link erneut und tippe auf „Autorisieren“.');
    if (String(p.scope || '').indexOf('activity:write') < 0) {
      return page_('Recht fehlt', 'Das Häkchen „Aktivitäten hochladen“ wurde entfernt. Öffne den Link erneut und lass alle Häkchen gesetzt.');
    }
    try {
      const t = tokenRequest_({ code: p.code, grant_type: 'authorization_code' });
      saveTokens_(t);
      const name = t.athlete ? ((t.athlete.firstname || '') + ' ' + (t.athlete.lastname || '')).trim() : '';
      return page_('Mit Strava verbunden', 'Verbunden' + (name ? ' als ' + name : '') + '. Du kannst dieses Fenster schließen. In der Speed-Race-App jetzt „Verbindung prüfen“ tippen.');
    } catch (err) {
      return page_('Fehler', String(err.message || err));
    }
  }
  return page_('Speed Race X Upload', 'Das Upload-Script ist bereitgestellt. Die Einrichtung startest du im Script-Editor mit der Funktion „einrichten“.');
}

function page_(title, text) {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return HtmlService.createHtmlOutput(
    '<div style="font:16px/1.5 system-ui,sans-serif;max-width:560px;margin:40px auto;padding:0 16px">' +
    '<h1 style="font-size:22px">' + esc(title) + '</h1><p>' + esc(text) + '</p></div>'
  ).setTitle(title).addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ---------- Web-App: Anfragen aus der Speed-Race-App ---------- */
function doPost(e) {
  let out;
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!body.key || body.key !== cfg_('UPLOAD_KEY')) throw new Error('Falscher Schlüssel. Bitte den Schlüssel aus „einrichten“ in der App eintragen.');
    if (body.action === 'ping') out = ping_();
    else if (body.action === 'upload') out = upload_(body);
    else throw new Error('Unbekannte Aktion.');
  } catch (err) {
    out = { ok: false, error: String(err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Strava ---------- */
function tokenRequest_(extra) {
  const payload = Object.assign({ client_id: cfg_('STRAVA_CLIENT_ID'), client_secret: cfg_('STRAVA_CLIENT_SECRET') }, extra);
  const r = UrlFetchApp.fetch('https://www.strava.com/oauth/token', { method: 'post', payload: payload, muteHttpExceptions: true });
  let j = {};
  try { j = JSON.parse(r.getContentText()); } catch (x) {}
  if (r.getResponseCode() !== 200) {
    throw new Error('Strava-Anmeldung fehlgeschlagen (' + r.getResponseCode() + (j.message ? ': ' + j.message : '') + '). Client-ID und Secret prüfen.');
  }
  return j;
}

function saveTokens_(t) {
  PROPS.setProperties({ ACCESS_TOKEN: t.access_token, REFRESH_TOKEN: t.refresh_token, EXPIRES_AT: String(t.expires_at) });
}

function accessToken_() {
  const rt = cfg_('REFRESH_TOKEN');
  if (!rt) throw new Error('Noch nicht mit Strava verbunden. Im Script-Editor „einrichten“ ausführen und den Link öffnen.');
  if (Number(cfg_('EXPIRES_AT') || 0) - 300 > Date.now() / 1000) return cfg_('ACCESS_TOKEN');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (Number(cfg_('EXPIRES_AT') || 0) - 300 > Date.now() / 1000) return cfg_('ACCESS_TOKEN');
    const t = tokenRequest_({ grant_type: 'refresh_token', refresh_token: rt });
    saveTokens_(t);
    return t.access_token;
  } finally {
    lock.releaseLock();
  }
}

function api_(method, path, opts) {
  const r = UrlFetchApp.fetch('https://www.strava.com/api/v3' + path, Object.assign({
    method: method, headers: { Authorization: 'Bearer ' + accessToken_() }, muteHttpExceptions: true
  }, opts || {}));
  let j = {};
  try { j = JSON.parse(r.getContentText()); } catch (x) {}
  return { code: r.getResponseCode(), json: j };
}

function ping_() {
  const r = api_('get', '/athlete');
  if (r.code !== 200) throw new Error('Strava antwortet mit ' + r.code + (r.json.message ? ': ' + r.json.message : '') + '.');
  return { ok: true, athlete: ((r.json.firstname || '') + ' ' + (r.json.lastname || '')).trim() };
}

function upload_(b) {
  if (!b.tcx || String(b.tcx).length < 200) throw new Error('Keine Fahrtdaten erhalten.');
  const ext = String(b.externalId || ('speedrace-' + Date.now())).replace(/[^\w.-]/g, '');
  const blob = Utilities.newBlob(String(b.tcx), 'application/xml', ext + '.tcx');
  const payload = {
    file: blob,
    data_type: 'tcx',
    name: String(b.name || 'Indoor-Fahrt').slice(0, 200),
    description: String(b.description || '').slice(0, 2000),
    trainer: '1',
    external_id: ext
  };
  let r = api_('post', '/uploads', { payload: payload });
  if (r.code !== 201 && r.code !== 200) {
    throw new Error('Upload abgelehnt (' + r.code + ')' + (r.json.message ? ': ' + r.json.message : '') + (r.json.errors ? ' ' + JSON.stringify(r.json.errors) : ''));
  }
  const id = r.json.id_str || r.json.id;
  for (let i = 0; i < 12; i++) {
    if (r.json.activity_id) return { ok: true, activityId: String(r.json.activity_id) };
    if (r.json.error) {
      const dup = /duplicate of.*?(\d{6,})/i.exec(r.json.error);
      if (dup) return { ok: true, duplicate: true, activityId: dup[1] };
      throw new Error('Strava: ' + String(r.json.error).replace(/<[^>]+>/g, ''));
    }
    Utilities.sleep(2000);
    r = api_('get', '/uploads/' + id);
  }
  return { ok: true, pending: true, message: 'Strava verarbeitet die Fahrt noch. Sie erscheint in ein paar Minuten in deinem Profil.' };
}
