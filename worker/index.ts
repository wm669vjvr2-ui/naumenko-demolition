/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

const allowedOrigins = new Set([
  "https://wm669vjvr2-ui.github.io",
  "https://naumenko-demolition.daniilsedic.chatgpt.site",
]);

const corsHeaders = (request: Request) => {
  const origin = request.headers.get("Origin");
  return origin && allowedOrigins.has(origin)
    ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" }
    : {};
};

const json = (request: Request, body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(request) },
});

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

async function handleLead(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  if (origin && !allowedOrigins.has(origin)) return json(request, { ok: false }, 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== "POST") return json(request, { ok: false }, 405);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return json(request, { ok: false, error: "Некорректная заявка" }, 400);
  }

  if (clean(payload.website, 100)) return json(request, { ok: true });
  const name = clean(payload.name, 80);
  const phone = clean(payload.phone, 40);
  const task = clean(payload.task, 1200);
  const page = clean(payload.page, 300);
  if (name.length < 2 || phone.replace(/\D/g, "").length < 10 || task.length < 3) {
    return json(request, { ok: false, error: "Заполните имя, телефон и задачу" }, 400);
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json(request, { ok: false, error: "Уведомления ещё настраиваются" }, 503);
  }

  const text = [
    "🧱 Новая заявка на демонтаж",
    "",
    `Клиент: ${name}`,
    `Телефон: ${phone}`,
    `Задача: ${task}`,
    page ? `Страница: ${page}` : "",
    `Время: ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} МСК`,
  ].filter(Boolean).join("\n");

  const telegram = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
  });
  if (!telegram.ok) return json(request, { ok: false, error: "Уведомление не доставлено" }, 502);
  return json(request, { ok: true });
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/lead") return handleLead(request, env);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
