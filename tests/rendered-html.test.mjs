import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

async function callApi(body) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-api-${body.demo}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/api/map-leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the demolition landing page", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Александр Науменко — демонтаж в Москве и области/);
  assert.match(html, /ОСВОБОЖДАЕМ/);
  assert.match(html, /ПРОСТРАНСТВО/);
  assert.match(html, /\+7 \(985\) 358-49-78/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders the CRM prototype", async () => {
  const response = await render("/crm");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Сводка бизнеса/);
  assert.match(html, /ОТКРЫТЬ ВОРОНКУ/);
  assert.match(html, /Обзор/);
  assert.match(html, /Лиды/);
  assert.match(html, /Контакты/);
  assert.match(html, /Компании/);
  assert.match(html, /Задачи/);
  assert.match(html, /Чаты/);
  assert.match(html, /Аналитика/);
});

test("renders the map lead parser", async () => {
  const response = await render("/parser");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Поиск клиентов/);
  assert.match(html, /НАЙТИ КЛИЕНТОВ/);
  assert.match(html, /Демо/);
  assert.match(html, /Строительные компании/);
});

test("map lead parser API serves demo data", async () => {
  const response = await callApi({ demo: true, region: "Москва и область", queries: ["Строительные компании"] });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.ok, true);
  assert.equal(data.mode, "demo");
  assert.ok(data.items.length > 0);
});

test("map lead parser API reports the missing live key", async () => {
  const response = await callApi({ demo: false, region: "Москва", queries: ["Строительные компании"] });
  assert.equal(response.status, 503);
  const data = await response.json();
  assert.equal(data.error, "DGIS_API_KEY_MISSING");
});
