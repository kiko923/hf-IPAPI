addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  let clientIP = url.searchParams.get("ip") || request.headers.get('cf-connecting-ip');

  // 正则匹配 IPv4 和 IPv6
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$|^(?:[a-fA-F0-9:]+:+)+[a-fA-F0-9]+$/;

  if (!clientIP || !ipRegex.test(clientIP)) {
    return new Response(JSON.stringify({ code: 0, message: "无效的 IP 地址" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const ipInfoResponse = await fetch(`https://kiko923-ip.hf.space/${clientIP}`);
    const ipInfo = await ipInfoResponse.json();

    return new Response(JSON.stringify({ code: 1, data: ipInfo }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ code: 0, message: `获取 IP 信息失败: ${error.message}` }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
