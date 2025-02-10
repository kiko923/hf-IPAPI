export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 只在根路径 `https://你的域名/` 触发
    if (url.pathname === "/") {
      return fetch("https://kiko923-ip.hf.space/1.1.1.1", {
        method: "GET",
        headers: {
          "User-Agent": "Cloudflare-Worker",
          "Accept": "application/json",
        },
      }).then(response => response.json())
        .then(data => new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        }))
        .catch(error => new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }));
    }

    return new Response("Not Found", { status: 404 });
  }
};
