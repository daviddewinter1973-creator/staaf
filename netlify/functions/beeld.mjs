// Serveert foto's van werken die David zelf in /beheer heeft toegevoegd.
import { images } from './lib/state.mjs';

export default async (req) => {
  const key = decodeURIComponent(new URL(req.url).pathname.split('/').pop() || '');
  if (!/^[a-z0-9-]+\.webp$/.test(key)) return new Response('Niet gevonden', { status: 404 });
  const data = await images().get(key, { type: 'arrayBuffer' });
  if (!data) return new Response('Niet gevonden', { status: 404 });
  return new Response(data, {
    headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' }
  });
};
