export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 获取用户 IP（Cloudflare 提供的 `CF-Connecting-IP` 头）
    const userIP = request.headers.get("CF-Connecting-IP") || "unknown";

    // 拼接 IP 参数到目标 API
    const targetURL = `https://kiko923-ip.hf.space/?ip=${encodeURIComponent(userIP)}`;

    try {
      const response = await fetch(targetURL, {
        method: "GET",
        headers: {
          "User-Agent": "Cloudflare-Worker",
          "Accept": "application/json",
        },
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
};
