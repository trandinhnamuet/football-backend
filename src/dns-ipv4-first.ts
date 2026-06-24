import { setDefaultResultOrder } from 'node:dns';

// Prefer IPv4 when resolving hostnames (notably the Supabase pooler host).
// Node defaults to IPv6-first; on a host that advertises an AAAA record but
// cannot route IPv6, connections hang until CONNECT_TIMEOUT instead of failing
// over to IPv4. This server is currently IPv4-only, but Supabase's Pooler V2
// can re-add AAAA records at any time — this makes us resilient regardless.
//
// Imported as the very first line of main.ts so it takes effect before any
// module performs a DNS lookup.
setDefaultResultOrder('ipv4first');
