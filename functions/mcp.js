// Compatibility shim: the MCP bridge lives beside the API it serves, in
// trustsight-feed/worker/mcp.js, and is reached at
// https://watcher.trustsight.org/mcp.
//
// This path still answers because it was published first, in a server card and
// in auth.md, and MCP clients are configured by URL. Forwarding keeps those
// configurations working without keeping a second copy of the tool schemas:
// nothing here knows what a tool is.

const UPSTREAM = 'https://watcher.trustsight.org/mcp'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, MCP-Protocol-Version',
}

function error(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...CORS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export async function onRequest(context) {
  const { request } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'This is a Streamable HTTP MCP endpoint. Send JSON-RPC over POST.',
        canonical: UPSTREAM,
      }),
      { status: 405, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST, OPTIONS' } },
    )
  }

  try {
    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: request.headers.get('Accept') || 'application/json, text/event-stream',
      },
      body: await request.text(),
    })
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...CORS,
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return error('upstream unavailable', 502)
  }
}
