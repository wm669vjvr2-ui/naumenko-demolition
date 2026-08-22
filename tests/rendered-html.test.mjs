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
  assert.match(html, /data-price="от 699 ₽ \/ м²"/);
  assert.match(html, /data-price="от 699 ₽"/);
  assert.match(html, /data-price="от 999 ₽ \/ м²"/);
  assert.match(html, /data-price="от 1 199 ₽ \/ метр"/);
  assert.match(html, /data-price="от 799 ₽ \/ м²"/);
  assert.doesNotMatch(html, /Объекты \/ 05|id="projects"/);
  assert.match(html, /500\+/);
  assert.match(html, /выполненных объектов в Москве и Московской области/);
  assert.match(html, /href="#estimate">Расчёт</);
  assert.match(html, /href="#cost">Цены</);
  assert.doesNotMatch(html, /href="#projects">Портфолио</);
  assert.match(html, /href="#surveyor">Бесплатная оценка</);
  assert.match(html, /href="#about">О компании</);
  assert.match(html, /href="#reviews">Отзывы</);
  assert.match(html, /href="#tools">Оборудование</);
  assert.doesNotMatch(html, /href="#process">Порядок работ</);
  assert.match(html, /Заказать звонок/);
  assert.match(html, /aria-label="Написать в Telegram"/);
  assert.match(html, /aria-label="Написать в WhatsApp"/);
  assert.match(html, /aria-label="Открыть чат в MAX"/);
  assert.match(html, /Фотоотчёт на всех этапах работ\./);
  assert.match(html, /Порядок оказания услуг/);
  assert.match(html, /От чего зависит цена работ/);
  assert.match(html, /Расскажите о вашей объекте — рассчитаем стоимость/);
  assert.doesNotMatch(html, /Что подготовить|5–10 фото · площадь · адрес · желаемая дата/);
  assert.match(html, /Остались вопросы\?/);
  assert.match(html, /Бесплатная оценка объекта/);
  assert.match(html, /Более 10 лет выполняем демонтажные работы/);
  assert.match(html, />10\+</);
  assert.match(html, /Почему нам доверяют/);
  assert.match(html, /82 оценки на Яндекс Услугах/);
  assert.match(html, /AleksandrNaumenko-1865243#reviews/);
  assert.match(html, /Отбойные молотки/);
  assert.match(html, /Большие и малые болгарки/);
  assert.match(html, /Перфораторы/);
  assert.match(html, /Сабельные пилы/);
  assert.match(html, /Кувалды/);
  assert.doesNotMatch(html, /Резка с пылеудалением/);
  assert.match(html, /Куда отправить заявку\?/);
  assert.match(html, /value="telegram"/);
  assert.match(html, /value="whatsapp"/);
  assert.match(html, /value="max"/);
  assert.match(html, /aria-label="Вернуться наверх"/);
  assert.match(html, /<h1>Демонтаж<\/h1>/);
  assert.match(html, /media\/work-floor-process\.mp4/);
  assert.match(html, /media\/work-partition-action\.webp/);
  assert.match(html, /media\/work-commercial-hall\.webp/);
  assert.doesNotMatch(html, /media\/portfolio-commercial-wide\.webp/);
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
  assert.match(html, /согласие на обработку персональных данных/);
  assert.match(html, /href="\/consent"/);
  assert.match(html, /href="\/privacy"/);
  assert.match(html, /href="\/legal"/);
  assert.match(html, /href="\/terms"/);
  assert.match(html, /href="\/cookies"/);
  assert.match(html, /Cookies и персональные данные/);
  assert.match(html, /Только необходимые/);
  assert.match(html, /Настройки cookies/);
  assert.match(html, /Согласие на обработку данных заявки запрашивается отдельно/);
  assert.match(html, /Информация и цены не являются публичной офертой/);

  const processPosition = html.indexOf("Порядок оказания услуг");
  const servicesPosition = html.indexOf("Наши услуги демонтажа");
  const costPosition = html.indexOf("От чего зависит цена работ");
  const estimatePosition = html.indexOf("Расчёт / 04");
  const faqPosition = html.indexOf("Остались вопросы?");
  const surveyorPosition = html.indexOf("Бесплатная оценка объекта");
  const aboutPosition = html.indexOf("О компании / 07");
  const reviewsPosition = html.indexOf("Что говорят клиенты");
  const toolsPosition = html.indexOf("Оборудование и инструмент");
  assert.ok(processPosition < servicesPosition);
  assert.ok(servicesPosition < costPosition);
  assert.ok(costPosition < estimatePosition);
  assert.ok(estimatePosition < faqPosition);
  assert.ok(faqPosition < surveyorPosition);
  assert.ok(surveyorPosition < aboutPosition);
  assert.ok(aboutPosition < reviewsPosition);
  assert.ok(reviewsPosition < toolsPosition);
});

test("renders separate legal documents", async () => {
  const privacy = await render("/privacy");
  assert.equal(privacy.status, 200);
  const privacyHtml = await privacy.text();
  assert.match(privacyHtml, /Политика конфиденциальности и обработки персональных данных/);
  assert.match(privacyHtml, /Сайт не отправляет заполненные поля в собственную базу данных/);
  assert.match(privacyHtml, /не обрабатывает специальные категории персональных данных или биометрические данные/);
  assert.match(privacyHtml, /Роскомнадзоре или в суде/);

  const consent = await render("/consent");
  assert.equal(consent.status, 200);
  const consentHtml = await consent.text();
  assert.match(consentHtml, /Согласие на обработку персональных данных/);
  assert.match(consentHtml, /конкретное, предметное, информированное/);
  assert.match(consentHtml, /Редакция согласия: 17\.08\.2026/);
  assert.match(consentHtml, /не даю согласия на распространение персональных данных/);

  const legal = await render("/legal");
  assert.equal(legal.status, 200);
  const legalHtml = await legal.text();
  assert.match(legalHtml, /Реквизиты и условия оказания услуг/);
  assert.match(legalHtml, /не являются публичной офертой/);
  assert.match(legalHtml, /Как заключается договор/);

  const terms = await render("/terms");
  assert.equal(terms.status, 200);
  const termsHtml = await terms.text();
  assert.match(termsHtml, /Пользовательское соглашение/);
  assert.match(termsHtml, /Заявка не является акцептом оферты/);

  const cookies = await render("/cookies");
  assert.equal(cookies.status, 200);
  const cookiesHtml = await cookies.text();
  assert.match(cookiesHtml, /Cookies и технические данные/);
  assert.match(cookiesHtml, /не устанавливает собственные аналитические или рекламные cookies/);
  assert.match(cookiesHtml, /сохраняет сделанный выбор только в локальном хранилище браузера/);
  assert.match(cookiesHtml, /Этот выбор не заменяет отдельное согласие на обработку персональных данных/);
});

test("renders the CRM prototype", async () => {
  const response = await render("/crm");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Сводка бизнеса/);
  assert.match(html, /noindex/);
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
  assert.match(html, /noindex/);
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
