export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname.slice(1); // strip leading slash
    const key = `${path}/index.html`;

    const object = await env.STATIC_PAGES.get(key);
    if (!object) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=3600"
      }
    });
  }
};
