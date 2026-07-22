/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  DGIS_API_KEY?: string;
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

type MapLead = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviews: number;
  point: { lat: number; lon: number };
  source: "demo" | "2gis";
  priority: number;
};

const demoMapLeads: MapLead[] = [
  { id: "demo-01", name: "Монолит Проект", category: "Строительные компании", address: "Москва, ул. Складочная, 18", phone: "+7 495 000-11-01", website: "monolit.example", rating: 4.8, reviews: 126, point: { lat: 55.804, lon: 37.594 }, source: "demo", priority: 96 },
  { id: "demo-02", name: "Городская управляющая компания", category: "Управляющие компании", address: "Москва, Дмитровское ш., 42", phone: "+7 495 000-11-02", website: "guk.example", rating: 4.5, reviews: 84, point: { lat: 55.838, lon: 37.571 }, source: "demo", priority: 92 },
  { id: "demo-03", name: "Ремонт Бюро", category: "Ремонт помещений", address: "Москва, ул. Большая Тульская, 10", phone: "+7 495 000-11-03", website: "remont-buro.example", rating: 4.9, reviews: 211, point: { lat: 55.708, lon: 37.622 }, source: "demo", priority: 90 },
  { id: "demo-04", name: "Квадрат Недвижимость", category: "Агентства недвижимости", address: "Москва, ул. Пятницкая, 31", phone: "+7 495 000-11-04", website: "kvadrat.example", rating: 4.7, reviews: 97, point: { lat: 55.738, lon: 37.628 }, source: "demo", priority: 87 },
  { id: "demo-05", name: "Архитектура Среды", category: "Архитектурные бюро", address: "Москва, Нижняя Сыромятническая, 10", phone: "+7 495 000-11-05", website: "sreda.example", rating: 4.8, reviews: 64, point: { lat: 55.752, lon: 37.669 }, source: "demo", priority: 85 },
  { id: "demo-06", name: "Склад Регион", category: "Складские комплексы", address: "Химки, Вашутинское ш., 24", phone: "+7 495 000-11-06", website: "sklad-region.example", rating: 4.3, reviews: 48, point: { lat: 55.914, lon: 37.43 }, source: "demo", priority: 82 },
  { id: "demo-07", name: "Новый Контур", category: "Ремонт помещений", address: "Красногорск, Ильинское ш., 6", phone: "+7 495 000-11-07", website: "kontur.example", rating: 4.6, reviews: 71, point: { lat: 55.82, lon: 37.33 }, source: "demo", priority: 81 },
  { id: "demo-08", name: "ДомСервис", category: "Управляющие компании", address: "Мытищи, Новомытищинский пр., 30", phone: "+7 495 000-11-08", website: "domservice.example", rating: 4.2, reviews: 132, point: { lat: 55.91, lon: 37.73 }, source: "demo", priority: 78 },
  { id: "demo-09", name: "ПромПлощадка", category: "Складские комплексы", address: "Подольск, Домодедовское ш., 12", phone: "+7 495 000-11-09", website: "prom.example", rating: 4.1, reviews: 38, point: { lat: 55.44, lon: 37.58 }, source: "demo", priority: 76 },
  { id: "demo-10", name: "Линия Интерьера", category: "Архитектурные бюро", address: "Москва, Ленинградский пр., 37", phone: "+7 495 000-11-10", website: "line.example", rating: 4.7, reviews: 56, point: { lat: 55.791, lon: 37.558 }, source: "demo", priority: 74 },
  { id: "demo-11", name: "Партнёр Строй", category: "Строительные компании", address: "Балашиха, ш. Энтузиастов, 80", phone: "+7 495 000-11-11", website: "partner-stroy.example", rating: 4.4, reviews: 43, point: { lat: 55.795, lon: 37.94 }, source: "demo", priority: 72 },
  { id: "demo-12", name: "Метр Капитал", category: "Агентства недвижимости", address: "Одинцово, Можайское ш., 71", phone: "+7 495 000-11-12", website: "metr.example", rating: 4.5, reviews: 89, point: { lat: 55.678, lon: 37.27 }, source: "demo", priority: 70 },
];

const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

function mapDgisItem(value: unknown, query: string): MapLead | null {
  const item = asRecord(value);
  const id = clean(item.id, 100);
  const name = clean(item.name, 180);
  if (!id || !name) return null;
  const rubrics = asArray(item.rubrics).map((rubric) => clean(asRecord(rubric).name, 100)).filter(Boolean);
  const reviews = asRecord(item.reviews);
  const point = asRecord(item.point);
  const contacts = asArray(item.contact_groups).flatMap((group) => asArray(asRecord(group).contacts).map(asRecord));
  const phoneContact = contacts.find((contact) => clean(contact.type, 40).includes("phone"));
  const siteContact = contacts.find((contact) => ["website", "web", "url"].includes(clean(contact.type, 40)));
  const phone = clean(phoneContact?.text ?? phoneContact?.value, 80);
  const website = clean(siteContact?.url ?? siteContact?.text ?? siteContact?.value, 200);
  const rating = Number(reviews.rating ?? reviews.general_rating ?? 0) || 0;
  const reviewCount = Number(reviews.general_review_count ?? reviews.review_count ?? 0) || 0;
  const lat = Number(point.lat ?? 55.7558) || 55.7558;
  const lon = Number(point.lon ?? 37.6173) || 37.6173;
  const priority = Math.min(99, Math.round(42 + (phone ? 22 : 0) + (website ? 10 : 0) + rating * 4 + Math.min(reviewCount, 150) / 15));
  return { id, name, category: rubrics[0] || query, address: clean(item.full_address_name ?? item.address_name, 240), phone, website, rating, reviews: reviewCount, point: { lat, lon }, source: "2gis", priority };
}

async function handleMapLeads(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  if (origin && !allowedOrigins.has(origin)) return json(request, { ok: false }, 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== "POST") return json(request, { ok: false }, 405);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return json(request, { ok: false, error: "Некорректные параметры поиска" }, 400);
  }

  const demo = payload.demo === true;
  const region = clean(payload.region, 80) || "Москва";
  const requested = asArray(payload.queries).map((query) => clean(query, 100)).filter(Boolean).slice(0, 6);
  const queries = requested.length ? requested : ["Строительные компании"];
  if (demo) {
    const matching = demoMapLeads.filter((lead) => queries.includes(lead.category) && (region === "Москва и область" || (region === "Москва" ? lead.address.startsWith("Москва") : !lead.address.startsWith("Москва"))));
    return json(request, { ok: true, mode: "demo", total: matching.length, items: matching });
  }
  if (!env.DGIS_API_KEY) return json(request, { ok: false, error: "DGIS_API_KEY_MISSING", message: "Добавьте ключ Places API 2ГИС" }, 503);

  try {
    const responses = await Promise.all(queries.map(async (query) => {
      const requestCatalog = async (includeContacts: boolean) => {
        const url = new URL("https://catalog.api.2gis.com/3.0/items");
        url.searchParams.set("q", `${region} ${query}`);
        url.searchParams.set("type", "branch");
        url.searchParams.set("region_id", "32");
        url.searchParams.set("page_size", "10");
        url.searchParams.set("page", "1");
        url.searchParams.set("sort", "rating");
        url.searchParams.set("locale", "ru_RU");
        url.searchParams.set("fields", `items.point,items.rubrics,items.reviews,items.full_address_name${includeContacts ? ",items.contact_groups" : ""}`);
        url.searchParams.set("key", env.DGIS_API_KEY as string);
        const response = await fetch(url, { headers: { "Accept": "application/json" } });
        const data = asRecord(await response.json());
        const meta = asRecord(data.meta);
        return { response, data, meta };
      };

      let result = await requestCatalog(true);
      if (!result.response.ok || Number(result.meta.code) !== 200) result = await requestCatalog(false);
      if (!result.response.ok || Number(result.meta.code) !== 200) throw new Error(clean(String(result.meta.error ?? ""), 160) || `2GIS ${result.response.status}`);
      const data = result.data;
      return asArray(asRecord(data.result).items).map((item) => mapDgisItem(item, query)).filter((item): item is MapLead => Boolean(item));
    }));
    const unique = new Map<string, MapLead>();
    responses.flat().forEach((lead) => unique.set(lead.id, lead));
    const items = Array.from(unique.values()).sort((a, b) => b.priority - a.priority);
    return json(request, { ok: true, mode: "live", total: items.length, items });
  } catch (error) {
    return json(request, { ok: false, error: "DGIS_REQUEST_FAILED", message: error instanceof Error ? error.message : "Ошибка Places API" }, 502);
  }
}

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
    if (url.pathname === "/api/map-leads") return handleMapLeads(request, env);

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
