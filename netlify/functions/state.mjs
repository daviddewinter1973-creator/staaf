// Publiek: de actuele status van alle werken en de printvoorraad.
import { currentState } from './lib/state.mjs';

export default async (req) => {
  const { works, extra, prints } = await currentState(new URL(req.url).origin);
  return new Response(JSON.stringify({ works, extra, prints }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
};
