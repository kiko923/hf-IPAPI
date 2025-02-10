export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let userIP = request.headers.get("CF-Connecting-IP") || "unknown";

    // 处理 GET 请求中的 `ip` 参数
    const queryIP = url.searchParams.get("ip");

    // 处理 POST 请求
    if (request.method === "POST") {
      try {
        const requestBody = await request.json();
        if (requestBody.ip) {
          userIP = requestBody.ip; // 使用 POST 传入的 IP
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 如果 `?ip=` 存在，则优先使用它
    if (queryIP) {
      userIP = queryIP;
    }

    // 拼接 IP 到目标 API
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
        status: 200, // 仍然返回 200，但带上错误信息
        headers: { "Content-Type": "application/json" },
      });
    }
  }
};
