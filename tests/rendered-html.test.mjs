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
