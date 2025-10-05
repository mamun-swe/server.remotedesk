import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const wss = new WebSocketServer({ port: PORT });
const rooms = new Map<string, Set<WebSocket>>();

function joinRoom(roomId: string, ws: WebSocket) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId)!.add(ws);
  (ws as any).roomId = roomId;
}

function leaveRoom(ws: WebSocket) {
  const roomId = (ws as any).roomId as string | undefined;
  if (!roomId) return;
  const set = rooms.get(roomId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) rooms.delete(roomId);
}

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(String(msg));
      if (data.type === 'join') {
        joinRoom(data.roomId, ws);
        rooms.get(data.roomId)?.forEach((peer) => {
          if (peer !== ws) peer.send(JSON.stringify({ type: 'peer-join' }));
        });
        return;
      }
      const roomId = (ws as any).roomId as string | undefined;
      if (!roomId) return;
      rooms.get(roomId)?.forEach((peer) => {
        if (peer !== ws) peer.send(JSON.stringify(data));
      });
    } catch (e) {
      console.error('Invalid message', e);
    }
  });

  ws.on('close', () => {
    const roomId = (ws as any).roomId as string | undefined;
    leaveRoom(ws);
    if (roomId) {
      rooms.get(roomId)?.forEach((peer) => {
        try {
          peer.send(JSON.stringify({ type: 'peer-leave' }));
        } catch {}
      });
    }
  });
});

console.log(`Signaling server listening on ws://localhost:${PORT}`);
