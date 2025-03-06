// import { LRUCache } from "lru-cache";
import crypto from "crypto"

import { NextRequest, NextResponse } from "next/server";

type AppRouteHandlers = Record<
  "GET" | "POST",
  (req: NextRequest) => Promise<Response>
>

type LimiterConfig = {
  max: number,
  ttl: number
}


// export const getRateLimiter = async (conf?: LimiterConfig) => {
//   const limiter = new LRUCache<string, number>(conf ?? {
//     max: 100,
//     ttl: 60 * 1000,
//   });

//   const withRateLimit = async (handler: AppRouteHandlers["POST"]) => {
//     return async (req: NextRequest) => {
//       const requestHeaders = new Headers(req.headers)
//       const ip = requestHeaders.get("x-forwarded-for")

//       if (!ip) {
//         return handler(req);
//       }
      
//       if (limiter.has(ip)) {
//         return Response.json({ error: "Too many requests" }, { status: 429 });
//       }

//       limiter.set(ip, Date.now());

//       return handler(req);
//     };
//   }
//   return withRateLimit
// }


export const withWebhook = (handler: AppRouteHandlers["POST"]) => {
  const middleware: AppRouteHandlers["POST"] =  async (req: NextRequest) => {
    if (req.method !== "POST") return NextResponse.json({}, { status: 405 });

    const requestHeaders = new Headers(req.headers)
    const signature = requestHeaders.get("x-signature")
    const timestamp = requestHeaders.get("x-timestamp")
    
    const body = JSON.stringify(req.body);

    if (!signature || !timestamp) {
      return Response.json({ error: "Missing headers" }, { status: 403 });
    }

    // Проверяем возраст запроса (не старше 5 минут)
    if (Date.now() - parseInt(timestamp) > 5 * 60 * 1000) {
      return Response.json({ error: "Request too old" }, { status: 400 });
    }

    // Проверяем подпись
    const secret = process.env.WEBHOOK_SECRET!;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${timestamp}.${body}`);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) {
      return Response.json({}, { status: 403 });
    }

    console.log("Webhook verified");
    
    return handler(req);
  };
  
  return middleware
}
