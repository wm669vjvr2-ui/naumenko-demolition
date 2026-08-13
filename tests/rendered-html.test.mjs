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
  assert.match(html, /Демонтаж под ключ в Москве и области/);
  assert.match(html, /Москва и.*Московская область/s);
  assert.doesNotMatch(html, />Москва и Московская область</);
  assert.match(html, /Наши услуги/);
  assert.match(html, /Демонтаж сантехнической кабины/);
  assert.match(html, /Демонтаж коммерческих помещений/);
  assert.doesNotMatch(html, /Показать цену/);
  assert.doesNotMatch(html, /Рассчитать точную стоимость/);
  assert.match(html, /Стоимость услуги/);
  assert.match(html, /data-price="от 499 ₽ \/ м²"/);
  assert.match(html, /data-price="от 35 900 ₽"/);
  assert.match(html, /data-price="от 19 999 ₽"/);
  assert.match(html, /Объекты \/ 05/);
  assert.match(html, /528/);
  assert.match(html, /объектов в Москве и Московской области/);
  assert.match(html, /href="#estimate">Расчёт</);
  assert.match(html, /href="#cost">Цены</);
  assert.match(html, /href="#projects">Портфолио</);
  assert.match(html, /href="#surveyor">Бесплатный замер</);
  assert.match(html, /href="#about">О компании</);
  assert.match(html, /href="#reviews">Отзывы</);
  assert.doesNotMatch(html, /href="#process">Порядок работ</);
  assert.doesNotMatch(html, /href="#tools">Инструменты</);
  assert.match(html, /Заказать звонок/);
  assert.match(html, /aria-label="Написать в Telegram"/);
  assert.match(html, /aria-label="Написать в WhatsApp"/);
  assert.match(html, /aria-label="Открыть чат в MAX"/);
  assert.match(html, /Фотоотчёт на всех этапах работ\./);
  assert.match(html, /Порядок оказания работ/);
  assert.match(html, /От чего зависит стоимость/);
  assert.match(html, /Остались вопросы\?/);
  assert.match(html, /Бесплатный выезд замерщика на объект/);
  assert.match(html, /Более пяти лет/);
  assert.match(html, />5\+</);
  assert.match(html, /82 оценки на Яндекс Услугах/);
  assert.match(html, /AleksandrNaumenko-1865243#reviews/);
  assert.match(html, /Отбойные молотки/);
  assert.match(html, /Резка с пылеудалением/);
  assert.match(html, /Кувалды/);
  assert.match(html, /aria-label="Вернуться наверх"/);
  assert.match(html, /<h1>Демонтаж<\/h1>/);
  assert.match(html, /media\/work-floor-process\.mp4/);
  assert.match(html, /media\/work-partition-action\.webp/);
  assert.match(html, /media\/work-commercial-hall\.webp/);
  assert.match(html, /media\/portfolio-commercial-wide\.webp/);
  assert.match(html, /media\/tool-sledgehammer\.jpg/);
  assert.match(html, /\+7 985 358-49-78/);
  assert.doesNotMatch(html, /<img[^>]+logo\.jpg/);
  assert.doesNotMatch(html, /Типы объектов \/ 03|Работаем там, где нужен аккуратный разбор/);
  assert.doesNotMatch(html, /Рассчитать в Telegram|Позвонить \+7 985/);
  assert.doesNotMatch(html, /Отдельная вкладка|Открыть расчёт/);
  assert.doesNotMatch(html, /экскаватор/i);
  assert.doesNotMatch(html, /Промышленные пылесосы/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
  assert.match(html, /Квартир и коммерческих помещений/);

  const processPosition = html.indexOf("Порядок оказания работ");
  const servicesPosition = html.indexOf("Наши услуги демонтажа");
  const costPosition = html.indexOf("От чего зависит стоимость");
  const estimatePosition = html.indexOf("Расчёт / 04");
  const projectsPosition = html.indexOf("Объекты / 05");
  const faqPosition = html.indexOf("Остались вопросы?");
  const surveyorPosition = html.indexOf("Бесплатный выезд замерщика на объект");
  const aboutPosition = html.indexOf("О компании / 08");
  const reviewsPosition = html.indexOf("Что говорят клиенты");
  const toolsPosition = html.indexOf("Работаем своим инструментом");
  assert.ok(processPosition < servicesPosition);
  assert.ok(servicesPosition < costPosition);
  assert.ok(costPosition < estimatePosition);
  assert.ok(estimatePosition < projectsPosition);
  assert.ok(projectsPosition < faqPosition);
  assert.ok(faqPosition < surveyorPosition);
  assert.ok(surveyorPosition < aboutPosition);
  assert.ok(aboutPosition < reviewsPosition);
  assert.ok(reviewsPosition < toolsPosition);
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
