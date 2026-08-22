"use client";

import { FormEvent, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import styles from "./landing.module.css";

const PHONE_DISPLAY = "+7 985 358-49-78";
const PHONE_HREF = "tel:+79853584978";
const TELEGRAM_PHONE = "79853584978";
const CONSENT_VERSION = "17.08.2026";
const COOKIE_PREFERENCE_VERSION = "22.08.2026";
const COOKIE_PREFERENCE_KEY = "naumenko_cookie_preference";
const COOKIE_PREFERENCE_EVENT = "naumenko-cookie-preference";
let volatileCookiePreferenceVersion: string | null = null;

const services = [
  {
    number: "01",
    title: "Демонтаж стен и перегородок",
    text: "Кирпич, пеноблок, гипсокартон и ненесущие бетонные конструкции.",
    price: "от 699 ₽ / м²",
    tag: "стены",
    image: "./media/work-partition-action.webp",
    imageAlt: "Рабочий демонтирует межкомнатную перегородку",
  },
  {
    number: "02",
    title: "Демонтаж сантехнической кабины",
    text: "Полный разбор кабины с сохранением стояков и общедомовых коммуникаций.",
    price: "от 35 900 ₽",
    tag: "санузел",
    image: "./media/work-bathroom.jpg",
    imageAlt: "Сантехническая кабина после снятия старой отделки",
  },
  {
    number: "03",
    title: "Демонтаж стяжки",
    text: "Снимаем старую стяжку, собираем бой в мешки и готовим основание.",
    price: "от 499 ₽ / м²",
    tag: "пол",
    image: "./media/work-floor-demo.webp",
    imageAlt: "Разбор деревянного пола и старого основания в квартире",
  },
  {
    number: "04",
    title: "Демонтаж потолочных конструкций",
    text: "Натяжные, подвесные, реечные потолки и сложные каркасы.",
    price: "от 699 ₽",
    tag: "потолок",
    image: "./media/work-ceiling-action.webp",
    imageAlt: "Рабочий снимает старую отделку у потолка",
  },
  {
    number: "05",
    title: "Демонтаж квартиры под ключ",
    text: "Комплексный разбор до бетона: отделка, перегородки, сантехника и вывоз.",
    price: "от 999 ₽ / м²",
    tag: "под ключ",
    image: "./media/work-apartment.jpg",
    imageAlt: "Квартира в процессе комплексного внутреннего демонтажа",
  },
  {
    number: "06",
    title: "Демонтаж ванной комнаты",
    text: "Плитка, сантехника, короба и старая разводка. Разбираем в заданной последовательности.",
    price: "от 19 999 ₽",
    tag: "ванная",
    image: "./media/work-bathroom.jpg",
    imageAlt: "Ванная комната после аккуратного снятия отделки",
  },
  {
    number: "07",
    title: "Демонтаж квартиры",
    text: "Частичный или полный демонтаж под новый ремонт и перепланировку.",
    price: "от 1 199 ₽ / метр",
    tag: "квартира",
    image: "./media/work-before.jpg",
    imageAlt: "Квартира перед началом демонтажных работ",
  },
  {
    number: "08",
    title: "Демонтаж коммерческих помещений",
    text: "Магазины, салоны, склады и другие помещения: перегородки, потолки и полы.",
    price: "от 799 ₽ / м²",
    tag: "коммерция",
    image: "./media/work-commercial-hall.webp",
    imageAlt: "Коммерческое помещение после основного демонтажа",
  },
];

const process = [
  ["Заявка и предварительная оценка", "Вы оставляете заявку на сайте или связываетесь с нами по телефону. При необходимости присылаете фотографии объекта — по ним мы можем предварительно оценить объём работ и ориентировочную стоимость."],
  ["Осмотр объекта и расчёт", "Специалист оценивает квартиру, определяет состав и объём демонтажных работ, после чего рассчитывается точная стоимость и сроки."],
  ["Смета и договор", "Согласовываем с вами перечень работ, стоимость и сроки. Все основные условия фиксируем в договоре."],
  ["Демонтаж квартиры", "Бригада приступает к работе в согласованный срок. Выполняем демонтаж отделки, стен и перегородок, пола и стяжки, потолков, сантехники и других конструкций — в соответствии с задачей конкретного объекта."],
  ["Вынос и вывоз строительного мусора", "После демонтажа организуем сбор, вынос, погрузку и вывоз образовавшегося строительного мусора."],
  ["Сдача объекта", "После завершения работ проверяем объект и передаём квартиру заказчику подготовленной к следующему этапу — ремонту."],
];

const costFactors = [
  ["Площадь квартиры", "Чем больше площадь и объём конструкций, тем больше времени и ресурсов требуется на демонтаж."],
  ["Что необходимо демонтировать", "Цена зависит от состава работ: стены и перегородки, стяжка, напольные покрытия, плитка, сантехника, потолки, двери и другие элементы."],
  ["Материал конструкций", "Кирпич, бетон, газоблок, гипсокартон и другие материалы требуют разного подхода, инструмента и времени на демонтаж."],
  ["Сложность работ", "Учитываем особенности квартиры: расположение конструкций, необходимость аккуратного демонтажа и наличие элементов, которые нужно сохранить."],
  ["Этаж и условия выноса", "На стоимость влияет этаж, наличие лифта, возможность подъезда к дому и расстояние от квартиры до места погрузки."],
  ["Вывоз строительного мусора", "Если демонтаж выполняем под ключ, рассчитываем объём мусора, его вынос, погрузку и вывоз с объекта."],
];

const tools = [
  {
    number: "01",
    title: "Большие и малые болгарки",
    text: "Используем для резки металла, арматуры, труб и других материалов. Размер инструмента подбираем под конкретную задачу и условия на объекте.",
    image: "./media/tool-dust-cutting.jpg",
    imageAlt: "Профессиональная болгарка на объекте",
  },
  {
    number: "02",
    title: "Перфораторы",
    text: "Для сверления, штробления и демонтажа отдельных участков стен, перегородок, плитки и других конструкций.",
    image: "./media/tool-jackhammer.jpg",
    imageAlt: "Перфоратор на объекте",
  },
  {
    number: "03",
    title: "Отбойные молотки",
    text: "Используем для тяжёлого демонтажа бетона, стяжки, кирпича и других прочных конструкций.",
    image: "./media/work-floor.jpg",
    imageAlt: "Отбойный молоток во время демонтажа пола",
  },
  {
    number: "04",
    title: "Ручной инструмент",
    text: "Лом, монтажки, кувалды и другой ручной инструмент используем там, где важны точность, контроль и аккуратный демонтаж.",
    image: "./media/tool-hand-tools.jpg",
    imageAlt: "Набор ручного инструмента для внутреннего демонтажа",
  },
  {
    number: "05",
    title: "Кувалды",
    text: "Для демонтажа кирпичных, бетонных и других прочных конструкций, когда требуется высокая ударная нагрузка.",
    image: "./media/tool-sledgehammer.jpg",
    imageAlt: "Кувалда на слегка запылённом объекте",
  },
];

const reviews = [
  ["Другов А.", "27 июля 2026", "Бригада приехала вовремя, отработали аккуратно и профессионально.", "Демонтаж"],
  ["Smirnovandreas", "1 июля 2026", "Все за собой убрали. Остались только положительные впечатления.", "Демонтаж с вывозом"],
  ["Любовь", "17 июня 2026", "За один день разобрали полностью сантехническую кабину.", "Сантехкабина"],
];

const faq = [
  ["Как рассчитывается стоимость демонтажа?", "Стоимость зависит от площади, объёма и сложности работ, материалов, этажа, условий выноса и необходимости вывоза строительного мусора. Предварительно можем оценить объект по фотографиям, а точную стоимость согласовываем после оценки."],
  ["Может ли стоимость измениться после начала демонтажа?", "Нет, если объём работ остаётся согласованным. Перед началом демонтажа мы фиксируем перечень работ и их стоимость в смете. Если в процессе появляются дополнительные работы, которых не было в первоначальной заявке, мы заранее согласовываем их с вами."],
  ["Можно ли рассчитать стоимость по фотографиям?", "Да. Отправьте фото или видео, площадь, адрес и желаемую дату начала работ. По этим данным мы сможем предварительно оценить объём работ и сориентировать вас по стоимости."],
  ["Что входит в демонтаж под ключ?", "Мы берём на себя весь процесс: демонтаж согласованных конструкций и отделки, сбор и вынос строительного мусора, погрузку и его вывоз. Состав работ заранее фиксируется в смете."],
  ["Работаете ли вы по договору?", "Да. Перед началом работ согласовываем перечень работ, стоимость и сроки. Основные условия фиксируются в договоре и смете."],
  ["Входит ли вывоз строительного мусора в стоимость?", "Если вы заказываете демонтаж под ключ, мы можем взять на себя сбор, вынос, погрузку и вывоз строительного мусора. Условия и стоимость заранее учитываются в смете."],
];

const trustReasons = [
  ["Всё в одних руках", "Один подрядчик берёт на себя весь процесс — от оценки объекта до его полного освобождения. Вам не нужно отдельно искать демонтажников, грузчиков и транспорт."],
  ["Знаем, как работать с разными объектами", "За годы работы сталкивались с разными конструкциями, материалами и условиями на объектах. Поэтому заранее учитываем особенности помещения и подбираем оптимальный способ демонтажа."],
  ["Понятная смета до начала работ", "Перед стартом согласовываем перечень работ, стоимость и сроки. Вы заранее понимаете, что входит в работу и за что платите."],
  ["Бережное отношение к объекту", "«Ломать — не строить» — не про нас. Демонтаж — это ответственный этап подготовки объекта к дальнейшим работам. Мы берём на себя весь процесс и закрываем головную боль клиента, чтобы после нас можно было спокойно переходить к следующему этапу."],
];

function telegramUrl(text: string) {
  return `https://t.me/+${TELEGRAM_PHONE}?text=${encodeURIComponent(text)}`;
}

function whatsappUrl(text: string) {
  return `https://wa.me/${TELEGRAM_PHONE}?text=${encodeURIComponent(text)}`;
}

function maxUrl(text: string) {
  return `https://max.ru/:share?text=${encodeURIComponent(text)}`;
}

function subscribeCookiePreference(callback: () => void) {
  window.addEventListener(COOKIE_PREFERENCE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(COOKIE_PREFERENCE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function cookiePreferencePending() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCE_KEY) || "null") as { version?: string } | null;
    return saved?.version !== COOKIE_PREFERENCE_VERSION && volatileCookiePreferenceVersion !== COOKIE_PREFERENCE_VERSION;
  } catch {
    return volatileCookiePreferenceVersion !== COOKIE_PREFERENCE_VERSION;
  }
}

function saveCookiePreference(choice: "accepted" | "necessary") {
  volatileCookiePreferenceVersion = COOKIE_PREFERENCE_VERSION;
  try {
    window.localStorage.setItem(
      COOKIE_PREFERENCE_KEY,
      JSON.stringify({ choice, version: COOKIE_PREFERENCE_VERSION }),
    );
  } catch {
    // The in-memory preference still dismisses the notice for the current page.
  }
  window.dispatchEvent(new Event(COOKIE_PREFERENCE_EVENT));
}

function reopenCookiePreferences() {
  volatileCookiePreferenceVersion = null;
  try {
    window.localStorage.removeItem(COOKIE_PREFERENCE_KEY);
  } catch {
    // The custom event still reopens the notice when storage is unavailable.
  }
  window.dispatchEvent(new Event(COOKIE_PREFERENCE_EVENT));
}

export default function Home() {
  const [selectedService, setSelectedService] = useState(services[4].title);
  const [estimateMessenger, setEstimateMessenger] = useState<"telegram" | "whatsapp" | "max">("telegram");
  const [openedMessenger, setOpenedMessenger] = useState("");
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [serviceSlide, setServiceSlide] = useState(0);
  const serviceTouchStart = useRef<number | null>(null);
  const showCookieNotice = useSyncExternalStore(
    subscribeCookiePreference,
    cookiePreferencePending,
    () => true,
  );

  const directTelegram = useMemo(
    () => telegramUrl("Здравствуйте! Хочу рассчитать стоимость демонтажа. Подскажите, какие фото и данные прислать?"),
    [],
  );
  const directWhatsApp = useMemo(
    () => whatsappUrl("Здравствуйте! Хочу рассчитать стоимость демонтажа."),
    [],
  );
  const directMax = useMemo(
    () => maxUrl(`Здравствуйте! Хочу рассчитать стоимость демонтажа. Контакт: ${PHONE_DISPLAY}`),
    [],
  );

  const moveServices = (direction: -1 | 1) => {
    setServiceSlide((current) => (current + direction + services.length) % services.length);
  };

  const serviceOffset = (index: number) => {
    let offset = index - serviceSlide;
    const half = Math.floor(services.length / 2);
    if (offset > half) offset -= services.length;
    if (offset < -half) offset += services.length;
    return offset;
  };

  const submitEstimate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = [
      "Здравствуйте! Хочу получить расчёт демонтажа.",
      `Услуга: ${form.get("service")}`,
      `Площадь: ${form.get("area")} м²`,
      `Адрес / район: ${form.get("location")}`,
      `Вывоз мусора: ${form.get("waste")}`,
      `Как обращаться: ${form.get("name")}`,
      `Телефон: ${form.get("phone")}`,
      form.get("comment") ? `Комментарий: ${form.get("comment")}` : "",
      `Согласие на обработку персональных данных: подтверждено отдельной отметкой в форме сайта (редакция ${CONSENT_VERSION}).`,
    ].filter(Boolean).join("\n");

    const destination = estimateMessenger === "whatsapp"
      ? whatsappUrl(message)
      : estimateMessenger === "max"
        ? maxUrl(`${message}\nКонтакт: ${PHONE_DISPLAY}`)
        : telegramUrl(message);
    const messengerName = estimateMessenger === "whatsapp" ? "WhatsApp" : estimateMessenger === "max" ? "MAX" : "Telegram";

    setOpenedMessenger(messengerName);
    window.open(destination, "_blank", "noopener,noreferrer");
  };

  const submitCallback = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = [
      "Здравствуйте! Закажите мне обратный звонок.",
      `Имя: ${form.get("callback-name")}`,
      `Телефон: ${form.get("callback-phone")}`,
      `Согласие на обработку персональных данных: подтверждено отдельной отметкой в форме сайта (редакция ${CONSENT_VERSION}).`,
    ].join("\n");

    setCallbackOpen(false);
    window.open(telegramUrl(message), "_blank", "noopener,noreferrer");
  };

  return (
    <main className={styles.site}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Демонтаж под ключ, наверх">
          <span className={styles.brandText}>Демонтаж<br /><span>под ключ</span></span>
          <span className={styles.brandLocation}><i aria-hidden="true" /><span>Москва и<br />Московская область</span></span>
        </a>
        <a className={styles.headerPhone} href={PHONE_HREF}>{PHONE_DISPLAY}</a>
        <div className={styles.headerActions}>
          <a className={styles.headerRating} href="#reviews" aria-label="Отзывы: рейтинг 5,0, 82 оценки">
            <span aria-hidden="true">★★★★★</span>
            <strong>5,0</strong>
            <small>82 оценки</small>
          </a>
          <div className={styles.headerSocials} aria-label="Написать в мессенджер">
            <a href={directTelegram} target="_blank" rel="noreferrer" aria-label="Написать в Telegram" title="Telegram">TG</a>
            <a href={directWhatsApp} target="_blank" rel="noreferrer" aria-label="Написать в WhatsApp" title="WhatsApp">WA</a>
            <a href={directMax} target="_blank" rel="noreferrer" aria-label="Открыть чат в MAX" title="MAX">M</a>
          </div>
          <button className={styles.callbackButton} type="button" onClick={() => setCallbackOpen(true)}>Заказать звонок</button>
        </div>
        <nav aria-label="Основная навигация">
          <a href="#services">Услуги</a>
          <a href="#cost">Цены</a>
          <a href="#estimate">Расчёт</a>
          <a href="#faq">Вопросы</a>
          <a href="#surveyor">Бесплатная оценка</a>
          <a href="#about">О компании</a>
          <a href="#reviews">Отзывы</a>
          <a href="#tools">Оборудование</a>
        </nav>
      </header>

      {callbackOpen && (
        <div className={styles.callbackBackdrop} role="presentation" onMouseDown={() => setCallbackOpen(false)}>
          <section className={styles.callbackModal} role="dialog" aria-modal="true" aria-labelledby="callback-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.callbackClose} type="button" onClick={() => setCallbackOpen(false)} aria-label="Закрыть окно">×</button>
            <span>Обратный звонок</span>
            <h2 id="callback-title">Оставьте номер — мы перезвоним</h2>
            <p>Уточним задачу и подскажем, какие данные нужны для предварительной оценки.</p>
            <form onSubmit={submitCallback}>
              <label>Имя<input name="callback-name" type="text" placeholder="Алексей" autoComplete="name" required /></label>
              <label>Номер телефона<input name="callback-phone" type="tel" inputMode="tel" placeholder="+7 999 000-00-00" autoComplete="tel" required /></label>
              <label className={styles.consentRow}><input name="callback-consent" type="checkbox" required /><span>Даю <Link href="/consent" target="_blank" rel="noopener noreferrer">согласие на обработку персональных данных</Link>.</span></label>
              <button type="submit">Оставить заявку</button>
              <small>После нажатия откроется Telegram с готовой заявкой. <Link href="/privacy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</Link>.</small>
            </form>
          </section>
        </div>
      )}

      <section className={styles.hero} id="top">
        <video className={styles.heroVideo} autoPlay loop muted playsInline preload="metadata" poster="./media/work-floor.jpg" aria-hidden="true">
          <source src="./media/work-floor-process.mp4" type="video/mp4" />
        </video>
        <img className={styles.heroPoster} src="./media/work-floor.jpg" alt="" aria-hidden="true" />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <h1>Демонтаж</h1>
          <p className={styles.heroServiceLine}>Квартир и коммерческих помещений</p>
          <p className={styles.heroDescription}>Ванные комнаты, стены, перегородки и стяжка. Разберём, упакуем и вывезем по согласованной смете.</p>
        </div>
        <div className={styles.heroIndex}>01 / 09</div>
      </section>

      <section className={styles.proof} aria-label="Преимущества">
        <div><strong>01</strong><span>Смета до начала работ</span></div>
        <div><strong>02</strong><span>Вывоз мусора с объекта</span></div>
        <div><strong>03</strong><span>Соблюдение режима тишины</span></div>
        <div><strong>04</strong><span>Фотоотчёт на всех этапах работ.</span></div>
      </section>

      <section className={styles.process} id="process">
        <div className={styles.processIntro}>
          <div className={styles.sectionLabel}>Порядок оказания услуг / 01</div>
          <h2>Порядок оказания услуг</h2>
          <p>Мы выполняем демонтаж квартир под ключ — от оценки объекта и составления сметы до полного освобождения помещения и вывоза строительного мусора.</p>
          <p>Вам не нужно отдельно искать рабочих, грузчиков и транспорт. Мы берём на себя весь процесс демонтажа, соблюдаем согласованный объём и порядок работ и передаём вам подготовленную квартиру для дальнейшего ремонта.</p>
        </div>
        <ol>
          {process.map(([title, text], index) => (
            <li key={title}><b>{String(index + 1).padStart(2, "0")}</b><h3>{title}</h3><p>{text}</p></li>
          ))}
        </ol>
      </section>

      <section className={styles.services} id="services">
        <div className={styles.servicesHeading}>
          <div className={styles.sectionLabel}>Услуги / 02</div>
          <h2>Наши услуги демонтажа</h2>
          <p>Листайте каталог: стоимость каждой услуги сразу указана в карточке.</p>
        </div>
        <div
          className={styles.serviceCarousel}
          role="region"
          aria-roledescription="карусель"
          aria-label="Каталог услуг демонтажа"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") moveServices(-1);
            if (event.key === "ArrowRight") moveServices(1);
          }}
          onTouchStart={(event) => { serviceTouchStart.current = event.changedTouches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            const start = serviceTouchStart.current;
            const end = event.changedTouches[0]?.clientX;
            serviceTouchStart.current = null;
            if (start == null || end == null || Math.abs(start - end) < 42) return;
            moveServices(start > end ? 1 : -1);
          }}
        >
          <div className={styles.serviceStage}>
            {services.map((service, index) => {
              const offset = serviceOffset(index);
              return (
                <article
                  className={styles.serviceCard}
                  data-offset={offset}
                  data-price={service.price}
                  aria-hidden={offset !== 0}
                  aria-label={`${index + 1} из ${services.length}: ${service.title}`}
                  key={service.number}
                >
                  <div className={styles.serviceContent}>
                    <div className={styles.serviceTop}><span>{service.number}</span><b>{service.tag}</b></div>
                    <div className={styles.serviceTicks} aria-hidden="true"><i /><i /><i /><i /><i /></div>
                    <h3>{service.title}</h3>
                    <div className={styles.servicePrice}>
                      <span>Стоимость услуги</span>
                      <strong>{service.price}</strong>
                    </div>
                    <p>{service.text}</p>
                  </div>
                  <div className={styles.serviceVisual}>
                    <img src={service.image} alt={service.imageAlt} loading="lazy" decoding="async" />
                    <strong>{service.number}</strong>
                  </div>
                </article>
              );
            })}
          </div>
          <div className={styles.serviceNavigation}>
            <span className={styles.serviceCounter} aria-live="polite">
              {serviceSlide + 1} / {services.length}
            </span>
            <button className={styles.servicePrev} type="button" onClick={() => moveServices(-1)} aria-label="Предыдущая услуга">‹</button>
            <button className={styles.serviceNext} type="button" onClick={() => moveServices(1)} aria-label="Следующая услуга">›</button>
            <div className={styles.serviceDots} aria-label="Выбор услуги">
              {services.map((service, index) => (
                <button
                  type="button"
                  className={index === serviceSlide ? styles.serviceDotActive : undefined}
                  onClick={() => setServiceSlide(index)}
                  aria-label={`Показать услугу ${index + 1}: ${service.title}`}
                  aria-current={index === serviceSlide ? "true" : undefined}
                  key={service.number}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cost} id="cost">
        <div className={styles.costHeading}>
          <div className={styles.sectionLabel}>Цена / 03</div>
          <h2>От чего зависит цена работ</h2>
          <p>Стоимость демонтажа рассчитываем индивидуально — с учётом особенностей квартиры, объёма работ и условий на объекте. Перед началом работ согласовываем стоимость и составляем подробную смету.</p>
        </div>
        <div className={styles.costGrid}>
          {costFactors.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.estimate} id="estimate">
        <div className={styles.estimateCopy}>
          <div className={styles.sectionLabel}>Расчёт / 04</div>
          <h2>Расскажите о вашей объекте — рассчитаем стоимость</h2>
          <p>Отправьте нам несколько фотографий, укажите площадь и адрес. Мы оценим объём демонтажа, рассчитаем стоимость работ и подготовим предварительную смету.</p>
        </div>
        <form className={styles.form} onSubmit={submitEstimate}>
          <label>Услуга
            <select name="service" value={selectedService} onChange={(event) => setSelectedService(event.target.value)}>
              {services.map((service) => <option key={service.number}>{service.title}</option>)}
            </select>
          </label>
          <div className={styles.formRow}>
            <label>Площадь, м²<input name="area" type="number" min="1" placeholder="68" required /></label>
            <label>Адрес или район<input name="location" placeholder="Москва, САО" required /></label>
          </div>
          <div className={styles.formRow}>
            <label>Как обращаться<input name="name" placeholder="Алексей" autoComplete="name" required /></label>
            <label>Ваш телефон<input name="phone" type="tel" inputMode="tel" placeholder="+7 999 000-00-00" autoComplete="tel" required /></label>
          </div>
          <fieldset>
            <legend>Нужен вывоз мусора?</legend>
            <label><input type="radio" name="waste" value="Да" defaultChecked /> Да</label>
            <label><input type="radio" name="waste" value="Нет" /> Нет</label>
            <label><input type="radio" name="waste" value="Нужно обсудить" /> Обсудить</label>
          </fieldset>
          <fieldset className={styles.messengerChoice}>
            <legend>Куда отправить заявку?</legend>
            <label><input type="radio" name="messenger" value="telegram" checked={estimateMessenger === "telegram"} onChange={() => setEstimateMessenger("telegram")} /> Telegram</label>
            <label><input type="radio" name="messenger" value="whatsapp" checked={estimateMessenger === "whatsapp"} onChange={() => setEstimateMessenger("whatsapp")} /> WhatsApp</label>
            <label><input type="radio" name="messenger" value="max" checked={estimateMessenger === "max"} onChange={() => setEstimateMessenger("max")} /> MAX</label>
          </fieldset>
          <label>Комментарий<textarea name="comment" placeholder="Что нужно сохранить, этаж, есть ли грузовой лифт…" /></label>
          <label className={styles.consentRow}><input name="estimate-consent" type="checkbox" required /><span>Даю <Link href="/consent" target="_blank" rel="noopener noreferrer">согласие на обработку персональных данных</Link>.</span></label>
          <button className={styles.formButton} type="submit">Открыть заявку в {estimateMessenger === "whatsapp" ? "WhatsApp" : estimateMessenger === "max" ? "MAX" : "Telegram"} <span>↗</span></button>
          <small>{openedMessenger ? `${openedMessenger} открыт. Текст заявки уже подготовлен.` : "Выберите удобный мессенджер. Сообщение отправится только после вашего подтверждения."} <Link href="/privacy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</Link>.</small>
        </form>
      </section>

      <section className={styles.faq} id="faq">
        <div className={styles.faqIntro}><div className={styles.sectionLabel}>Вопросы / 05</div><h2>Остались вопросы?</h2><p>Собрали ответы на вопросы, которые чаще всего возникают перед демонтажом.</p></div>
        <div className={styles.faqList}>
          {faq.map(([question, answer], index) => (
            <details key={question}><summary><b>0{index + 1}</b><span>{question}</span><i aria-hidden="true">+</i></summary><p>{answer}</p></details>
          ))}
        </div>
      </section>

      <section className={styles.surveyor} id="surveyor">
        <div className={styles.surveyorVisual} aria-hidden="true">
          <span>Бесплатно</span>
          <strong>0 ₽</strong>
          <i>Москва + область</i>
        </div>
        <div className={styles.surveyorCopy}>
          <div className={styles.sectionLabel}>Оценка / 06</div>
          <h2>Бесплатная оценка объекта</h2>
          <p>Специалист приедет на объект, оценит объём и сложность демонтажных работ, условия доступа и вывоза строительного мусора. После осмотра подготовим понятную смету и согласуем стоимость и сроки работ.</p>
          <div className={styles.surveyorActions}>
            <a className={styles.primaryButton} href={telegramUrl("Здравствуйте! Хочу пригласить специалиста для бесплатной оценки объекта.")} target="_blank" rel="noreferrer">Пригласить специалиста <span>↗</span></a>
            <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
          </div>
        </div>
      </section>

      <section className={styles.about} id="about">
        <div className={styles.aboutHeading}>
          <div className={styles.sectionLabel}>О компании / 07</div>
          <h2>О компании</h2>
        </div>
        <div className={styles.aboutOverview}>
          <div className={styles.aboutCopy}>
            <p><strong>Демонтаж под ключ — берём на себя весь процесс от оценки объекта до полного освобождения помещения.</strong></p>
            <p>Более 10 лет выполняем демонтажные работы в Москве и Московской области. Специализируемся на квартирах и коммерческих помещениях — от отдельных видов работ до полного демонтажа перед ремонтом или реконструкцией.</p>
            <p>Оцениваем объект, рассчитываем объём работ, согласовываем смету и сроки, после чего выполняем демонтаж и организуем вынос, погрузку и вывоз строительного мусора. Вы получаете готовое к следующему этапу помещение без необходимости искать нескольких подрядчиков.</p>
            <div className={styles.aboutStats}>
              <div><strong>10+</strong><span>лет опыта</span></div>
              <div><strong>500+</strong><span>выполненных объектов</span></div>
              <div><strong>Под ключ</strong><span>весь процесс</span></div>
              <div><strong>Москва + МО</strong><span>география работ</span></div>
            </div>
          </div>
          <div className={styles.companyMap}>
            <div className={styles.mapCircle} aria-label="Карта выполненных объектов в Москве и Московской области">
              <img className={styles.mapImage} src="./moscow-region-map.png" alt="Карта Москвы и Московской области" />
              <span className={styles.mapDotField} aria-hidden="true" />
              <span className={styles.mapHotspots} aria-hidden="true" />
              <span className={`${styles.mapPhotoPin} ${styles.mapPinNorth}`}><img src="./media/work-commercial-hall.webp" alt="Объект на севере Москвы" loading="lazy" /></span>
              <span className={`${styles.mapPhotoPin} ${styles.mapPinNorthWest}`}><img src="./media/work-bathroom.jpg" alt="Объект на северо-западе Москвы" loading="lazy" /></span>
              <span className={`${styles.mapPhotoPin} ${styles.mapPinWest}`}><img src="./media/work-before.jpg" alt="Объект на западе Москвы" loading="lazy" /></span>
              <span className={`${styles.mapPhotoPin} ${styles.mapPinEast}`}><img src="./media/work-prepared.jpg" alt="Объект на востоке Москвы" loading="lazy" /></span>
              <span className={`${styles.mapPhotoPin} ${styles.mapPinSouth}`}><img src="./media/work-floor.jpg" alt="Объект на юге Москвы" loading="lazy" /></span>
              <span className={`${styles.mapPhotoPin} ${styles.mapPinSouthWest}`}><img src="./media/work-waste.jpg" alt="Объект на юго-западе Москвы" loading="lazy" /></span>
              <span className={styles.mapCenterPin} aria-label="Москва"><b>Д</b></span>
            </div>
            <div className={styles.mapCounter}>
              <strong>500+</strong>
              <span>выполненных объектов в Москве и Московской области</span>
            </div>
            <a className={styles.mapCredit} href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
          </div>
        </div>
        <div className={styles.trustHeading}>
          <span>Наш подход</span>
          <h3>Почему нам доверяют</h3>
        </div>
        <div className={styles.trustGrid}>
          {trustReasons.map(([title, text], index) => (
            <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h4>{title}</h4><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className={styles.reviews} id="reviews">
        <div className={styles.reviewsHeading}>
          <div>
            <div className={styles.sectionLabel}>Отзывы / 08</div>
            <h2>Что говорят клиенты</h2>
          </div>
          <div className={styles.reviewRating}>
            <strong>5,0</strong>
            <span>★★★★★</span>
            <small>82 оценки на Яндекс Услугах</small>
          </div>
        </div>
        <div className={styles.phoneReviews}>
          {reviews.map(([name, date, text, service], index) => (
            <article className={styles.phoneReview} key={name}>
              <div className={styles.phoneBar}><i /><span>Яндекс Услуги</span><b>•••</b></div>
              <div className={styles.phoneScreen}>
                <div className={styles.reviewAuthor}><span>{name.slice(0, 1)}</span><div><strong>{name}</strong><small>{date}</small></div></div>
                <div className={styles.reviewStars}>★★★★★</div>
                <p>«{text}»</p>
                <div className={styles.reviewService}><span>Услуга</span><strong>{service}</strong></div>
                <small>Отзыв {String(index + 1).padStart(2, "0")}</small>
              </div>
            </article>
          ))}
        </div>
        <a className={styles.reviewsLink} href="https://uslugi.yandex.ru/profile/AleksandrNaumenko-1865243#reviews" target="_blank" rel="noreferrer">Смотреть все отзывы на Яндекс Услугах ↗</a>
      </section>

      <section className={styles.tools} id="tools">
        <div className={styles.toolsHeading}>
          <div className={styles.sectionLabel}>Оборудование / 09</div>
          <h2>Оборудование и инструмент</h2>
          <p>Используем профессиональный инструмент для разных видов демонтажных работ — от аккуратного разбора отделки до демонтажа бетонных и кирпичных конструкций.</p>
        </div>
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <article key={tool.number}>
              <div className={styles.toolGraphic}>
                <img src={tool.image} alt={tool.imageAlt} loading="lazy" decoding="async" />
                <span aria-hidden="true">{tool.number}</span>
              </div>
              <h3>{tool.title}</h3>
              <p>{tool.text}</p>
            </article>
          ))}
        </div>
      </section>

      {showCookieNotice && (
        <section
          className={styles.cookieNotice}
          role="dialog"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-description"
        >
          <div>
            <span>Конфиденциальность</span>
            <h2 id="cookie-title">Cookies и персональные данные</h2>
            <p id="cookie-description">
              Сайт использует только необходимые технические данные для корректной работы.
              Рекламные и аналитические cookies не установлены. Согласие на обработку данных
              заявки запрашивается отдельно перед её отправкой.
            </p>
            <nav aria-label="Документы о конфиденциальности">
              <Link href="/cookies">О cookies</Link>
              <Link href="/privacy">Политика конфиденциальности</Link>
              <Link href="/consent">Согласие на обработку данных</Link>
            </nav>
          </div>
          <div className={styles.cookieActions}>
            <button type="button" onClick={() => saveCookiePreference("accepted")}>Принять</button>
            <button type="button" onClick={() => saveCookiePreference("necessary")}>Только необходимые</button>
          </div>
        </section>
      )}

      <a className={styles.backToTop} href="#top" aria-label="Вернуться наверх">
        <span aria-hidden="true">↑</span>
      </a>

      <footer className={styles.footer}>
        <a className={styles.brand} href="#top">
          <span className={styles.brandText}>Демонтаж<br /><span>под ключ</span></span>
        </a>
        <p>Демонтаж квартир, коммерческих помещений и отдельных конструкций в Москве и Московской области.</p>
        <div className={styles.footerContacts}><a href={PHONE_HREF}>{PHONE_DISPLAY}</a><a href={directTelegram} target="_blank" rel="noreferrer">Telegram ↗</a></div>
        <nav className={styles.footerLegal} aria-label="Правовая информация">
          <Link href="/legal">Реквизиты и правовая информация</Link>
          <Link href="/privacy">Политика конфиденциальности</Link>
          <Link href="/consent">Согласие на обработку персональных данных</Link>
          <Link href="/terms">Условия использования сайта</Link>
          <Link href="/cookies">Cookies и технические данные</Link>
          <button className={styles.footerCookieButton} type="button" onClick={reopenCookiePreferences}>Настройки cookies</button>
        </nav>
        <small>© 2026 · Информация и цены не являются публичной офертой. Фотографии выполненных объектов — из архива бригады. Иллюстрации отдельных инструментов подготовлены для сайта.</small>
      </footer>
    </main>
  );
}
