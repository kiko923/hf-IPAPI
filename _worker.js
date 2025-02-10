export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let userIP = request.headers.get("CF-Connecting-IP") || "unknown";

    // 处理 GET 请求中的 `ip` 参数
    const queryIP = url.searchParams.get("ip");

    // 处理 POST 请求（表单提交）
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const postIP = formData.get("ip");

        if (postIP) {
          userIP = postIP; // 使用 POST 传入的 IP
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid Form Data" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 如果 `?ip=` 存在，则优先使用它
    if (queryIP) {
      userIP = queryIP;
    }

    // IP 格式校验（仅允许 IPv4 或 IPv6）
    if (!isValidIP(userIP)) {
      return new Response(JSON.stringify({ error: "Invalid IP format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
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

// IP 地址格式校验函数
function isValidIP(ip) {
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}$/;
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
