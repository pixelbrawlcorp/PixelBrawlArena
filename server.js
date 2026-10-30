/* Pixel Brawl Arena - online relay server
 *
 * What it does
 *   - Serves the game file (index.html) at "/" and its scripts (js/*.js)  -> one deployment = game + online
 *   - Relays messages between the 2 players of a room over WebSocket ("/ws")
 *   - The game itself stays host-authoritative: the HOST simulates the fight and sends
 *     snapshots, the GUEST sends inputs. This server only forwards bytes, it knows
 *     nothing about the game rules.
 *
 * Run:   npm install && node server.js        (PORT env var, default 8080)
 * Game:  put the game html next to this file as index.html (or set GAME_FILE).
 *
 * Optional env vars
 *   PORT             port to listen on (hosting platforms set this for you)
 *   GAME_FILE        path of the game html (default ./index.html)
 *   ALLOWED_ORIGINS  comma separated list, e.g. https://mygame.itch.io,https://me.github.io
 *                    (empty = any origin; needed only when the html is hosted elsewhere)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = +process.env.PORT || 8080;
const GAME_FILE = process.env.GAME_FILE || path.join(__dirname, 'index.html');
const ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const MAX_MSG = 16 * 1024;          // bytes per message (a snapshot is ~1-2 KB)
const MAX_RATE = 200;               // messages per second per player
const IDLE_MS = 45000;              // drop a socket that sends nothing / does not answer pings
const ROOM_TTL_MS = 30 * 60 * 1000; // a room that never got a guest is removed after 30 min

const rooms = new Map();            // code -> { host, guest, born }

const JS_DIR = path.join(path.dirname(path.resolve(GAME_FILE)), 'js');   // game scripts: <game folder>/js/*.js

const server = http.createServer((req, res) => {
  const mjs = /^\/js\/([a-z0-9_-]+\.js)(\?.*)?$/i.exec(req.url);             // static: only js/<name>.js, no path tricks
  if (mjs) {
    fs.readFile(path.join(JS_DIR, mjs[1]), (err, buf) => {
      if (err) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('not found'); }
      res.writeHead(200, { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-cache' });
      res.end(buf);
    });
    return;
  }
  if (req.url === '/health') { res.writeHead(200, { 'content-type': 'text/plain' }); return res.end('ok ' + rooms.size + ' rooms'); }
  if (req.url === '/' || req.url.startsWith('/?') || req.url === '/index.html') {
    fs.readFile(GAME_FILE, (err, buf) => {
      if (err) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('game file not found: put index.html next to server.js'); }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
      res.end(buf);
    });
    return;
  }
  res.writeHead(404); res.end();
});

const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MSG });

server.on('upgrade', (req, socket, head) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname !== '/ws') return socket.destroy();
  const origin = req.headers.origin;
  if (ORIGINS.length && origin && !ORIGINS.includes(origin)) { socket.write('HTTP/1.1 403 Forbidden\r\n\r\n'); return socket.destroy(); }
  wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, u));
});

const send = (ws, e, d) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(d === undefined ? { e } : { e, d })); };

wss.on('connection', (ws, u) => {
  const code = (u.searchParams.get('room') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);
  const role = u.searchParams.get('role') === 'host' ? 'host' : 'guest';
  if (!code) { send(ws, '__err', 'bad'); return ws.close(); }

  let room = rooms.get(code);
  if (role === 'host') {
    if (room && room.host && room.host.readyState === 1) { send(ws, '__err', 'taken'); return ws.close(); }
    room = { host: ws, guest: null, born: Date.now() };
    rooms.set(code, room);
  } else {
    if (!room || !room.host || room.host.readyState !== 1) { send(ws, '__err', 'noroom'); return ws.close(); }
    if (room.guest && room.guest.readyState === 1) { send(ws, '__err', 'full'); return ws.close(); }
    room.guest = ws;
  }
  ws.role = role; ws.code = code; ws.alive = true; ws.last = Date.now(); ws.n = 0; ws.t0 = Date.now();
  send(ws, '__ok', role);
  const other = () => (role === 'host' ? room.guest : room.host);
  if (role === 'guest') send(room.host, '__peer', 1);

  ws.on('pong', () => { ws.alive = true; ws.last = Date.now(); });
  ws.on('message', buf => {
    ws.last = Date.now(); ws.alive = true;
    const now = Date.now();
    if (now - ws.t0 > 1000) { ws.t0 = now; ws.n = 0; }
    if (++ws.n > MAX_RATE) return;                         // flood protection: just drop
    const o = other();
    if (o && o.readyState === 1) o.send(buf.toString());   // forward untouched
  });
  ws.on('close', () => {
    const r = rooms.get(code);
    if (!r) return;
    if (role === 'host' && r.host === ws) { send(r.guest, '__left'); if (r.guest) r.guest.close(); rooms.delete(code); }
    else if (role === 'guest' && r.guest === ws) { r.guest = null; send(r.host, '__left'); }
  });
  ws.on('error', () => {});
});

/* keep-alive + cleanup */
setInterval(() => {
  const now = Date.now();
  for (const ws of wss.clients) {
    if (!ws.alive || now - ws.last > IDLE_MS) { ws.terminate(); continue; }
    ws.alive = false; try { ws.ping(); } catch (e) {}
  }
  for (const [c, r] of rooms) if (!r.guest && now - r.born > ROOM_TTL_MS) { try { r.host.close(); } catch (e) {} rooms.delete(c); }
}, 15000).unref();

server.listen(PORT, () => console.log('Pixel Brawl Arena relay on :' + PORT + '  (game: ' + GAME_FILE + ')'));
