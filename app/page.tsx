"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import styles from "./landing.module.css";

const PHONE_DISPLAY = "+7 985 358-49-78";
const PHONE_HREF = "tel:+79853584978";
const TELEGRAM_PHONE = "79853584978";

const services = [
  {
    number: "01",
    title: "Демонтаж стен и перегородок",
    text: "Кирпич, пеноблок, гипсокартон и ненесущие бетонные конструкции.",
    price: "от 699 ₽ / м²",
    tag: "стены",
    image: "./project-apartment.jpg",
    imageAlt: "Подготовленное помещение после демонтажа перегородок",
  },
  {
    number: "02",
    title: "Демонтаж сантехнической кабины",
    text: "Полный разбор кабины с сохранением стояков и общедомовых коммуникаций.",
    price: "от 35 900 ₽",
    tag: "санузел",
    image: "./project-bathroom.jpg",
    imageAlt: "Помещение ванной комнаты перед демонтажными работами",
  },
  {
    number: "03",
    title: "Демонтаж стяжки",
    text: "Снимаем старую стяжку, собираем бой в мешки и готовим основание.",
    price: "от 499 ₽ / м²",
    tag: "пол",
    image: "./hero-interior.jpg",
    imageAlt: "Основание пола во время внутреннего демонтажа",
  },
  {
    number: "04",
    title: "Демонтаж потолочных конструкций",
    text: "Натяжные, подвесные, реечные потолки и сложные каркасы.",
    price: "от 699 ₽",
    tag: "потолок",
    image: "./project-commercial.jpg",
    imageAlt: "Потолочные конструкции коммерческого помещения",
  },
  {
    number: "05",
    title: "Демонтаж квартиры под ключ",
    text: "Комплексный разбор до бетона: отделка, перегородки, сантехника и вывоз.",
    price: "от 999 ₽ / м²",
    tag: "под ключ",
    image: "./hero-interior.jpg",
    imageAlt: "Квартира в процессе комплексного демонтажа",
  },
  {
    number: "06",
    title: "Демонтаж ванной комнаты",
    text: "Плитка, сантехника, короба и старая разводка. Разбираем в заданной последовательности.",
    price: "от 19 999 ₽",
    tag: "ванная",
    image: "./project-bathroom.jpg",
    imageAlt: "Ванная комната перед аккуратным демонтажом",
  },
  {
    number: "07",
    title: "Демонтаж квартиры",
    text: "Частичный или полный демонтаж под новый ремонт и перепланировку.",
    price: "от 1 199 ₽ / метр",
    tag: "квартира",
    image: "./project-apartment.jpg",
    imageAlt: "Квартира после демонтажа старой отделки",
  },
  {
    number: "08",
    title: "Демонтаж коммерческих помещений",
    text: "Магазины, салоны, склады и другие помещения: перегородки, потолки и полы.",
    price: "от 799 ₽ / м²",
    tag: "коммерция",
    image: "./project-commercial.jpg",
    imageAlt: "Коммерческое помещение для демонтажных работ",
  },
];

const process = [
  ["Заявка и фото", "Вы присылаете адрес, площадь и 5–10 фотографий объекта в Telegram."],
  ["Предварительная оценка", "По фотографиям называем ориентир по стоимости и задаём уточняющие вопросы."],
  ["Бесплатный осмотр", "Замерщик приезжает на объект, проверяет конструктив, доступ и объём мусора."],
  ["Смета и договор", "Фиксируем состав работ, сроки и стоимость до выхода бригады."],
  ["Подготовка объекта", "Защищаем лифт, стены, полы в общих зонах и отключаем нужные коммуникации."],
  ["Демонтаж", "Разбираем конструкции, соблюдаем режим тишины и требования объекта."],
  ["Сортировка и вывоз", "Собираем отходы в мешки, сортируем, грузим и вывозим с объекта."],
  ["Уборка и сдача", "Подметаем рабочую зону, делаем фотоотчёт и сдаём готовое помещение."],
];

const costFactors = [
  ["Материал и толщина", "Кирпич, бетон, пеноблок, плитка и стяжка требуют разного инструмента и времени."],
  ["Площадь и объём", "Считаем не только метры, но и фактический объём конструкций, которые нужно разобрать."],
  ["Этаж и лифт", "Учитываем этаж, наличие грузового лифта и расстояние до места погрузки."],
  ["Доступ к объекту", "Пропускной режим, парковка, защита общих зон и часы шумных работ влияют на организацию."],
  ["Количество мусора", "Заранее рассчитываем мешки, спуск, погрузку, транспорт и утилизацию."],
  ["Сохранение элементов", "Закрываем коммуникации, двери, окна и чистовые зоны, которые нужно сохранить."],
];

const tools = [
  ["01", "Отбойные молотки", "Для бетона, стяжки и прочных перегородок. Подбираем мощность под конкретную конструкцию."],
  ["02", "Резка с пылеудалением", "Аккуратный рез материалов с подключением промышленного пылесоса."],
  ["03", "Промышленные пылесосы", "Собираем мелкую пыль во время работ и перед сдачей помещения."],
  ["04", "Ручной инструмент", "Ломы, перфораторы, тележки и расходники для контролируемого разбора и выноса."],
];

const reviews = [
  ["Другов А.", "27 июля 2026", "Бригада приехала вовремя, отработали аккуратно и профессионально.", "Демонтаж"],
  ["Smirnovandreas", "1 июля 2026", "Все за собой убрали. Остались только положительные впечатления.", "Демонтаж с вывозом"],
  ["Любовь", "17 июня 2026", "За один день разобрали полностью сантехническую кабину.", "Сантехкабина"],
];

const faq = [
  ["Можно оценить объект только по фотографиям?", "Да. Для предварительной оценки пришлите 5–10 фото, площадь и короткое описание. Для сложной конструкции согласуем бесплатный осмотр."],
  ["Вывоз строительного мусора входит в работу?", "Вывоз можем включить в общую смету или вынести отдельной строкой. Обе части стоимости согласуем до начала работ."],
  ["Работаете с квартирами в жилых домах?", "Да. Учитываем разрешённое время шумных работ, защищаем лифт и общие зоны, мусор выносим в мешках."],
  ["Можно демонтировать только одну стену или ванную?", "Можно. Берём как комплексные объекты под ключ, так и локальные задачи из каталога выше."],
  ["Какие документы выдаёте?", "Состав документов согласуем перед работой. Подготовим смету, договор, акт и документы по вывозу, если их требует объект."],
];

function telegramUrl(text: string) {
  return `https://t.me/+${TELEGRAM_PHONE}?text=${encodeURIComponent(text)}`;
}

export default function Home() {
  const [selectedService, setSelectedService] = useState(services[4].title);
  const [openedTelegram, setOpenedTelegram] = useState(false);
  const [serviceSlide, setServiceSlide] = useState(0);
  const [revealedService, setRevealedService] = useState<string | null>(null);
  const serviceTouchStart = useRef<number | null>(null);

  const directTelegram = useMemo(
    () => telegramUrl("Здравствуйте! Хочу рассчитать стоимость демонтажа. Подскажите, какие фото и данные прислать?"),
    [],
  );

  const chooseService = (title: string) => {
    setSelectedService(title);
    document.querySelector("#estimate")?.scrollIntoView({ behavior: "smooth" });
  };

  const revealServicePrice = (title: string) => {
    setSelectedService(title);
    setRevealedService(title);
  };

  const moveServices = (direction: -1 | 1) => {
    setRevealedService(null);
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
    ].filter(Boolean).join("\n");

    setOpenedTelegram(true);
    window.open(telegramUrl(message), "_blank", "noopener,noreferrer");
  };

  return (
    <main className={styles.site}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Демонтаж под ключ, наверх">
          <span className={styles.brandText}>Демонтаж<br /><span>под ключ</span></span>
          <span className={styles.brandLocation}><i aria-hidden="true" /><span>Москва и<br />Московская область</span></span>
        </a>
        <nav aria-label="Основная навигация">
          <a href="#process">Этапы</a>
          <a href="#services">Услуги</a>
          <a href="#estimate">Расчёт</a>
          <a href="#projects">Объекты</a>
          <a href="#faq">Вопросы</a>
        </nav>
      </header>

      <section className={styles.hero} id="top">
        <img className={styles.heroImage} src="./hero-interior.jpg" alt="Демонтаж перегородок внутри квартиры" />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <h1>Демонтаж<br /><em>под ключ</em></h1>
          <p>Квартиры, ванные комнаты, коммерческие помещения, стены и стяжка. Разберём, упакуем и вывезем по согласованной смете.</p>
        </div>
        <div className={styles.heroIndex}>01 / 10</div>
      </section>

      <section className={styles.proof} aria-label="Преимущества">
        <div><strong>01</strong><span>Смета до начала работ</span></div>
        <div><strong>02</strong><span>Вывоз мусора с объекта</span></div>
        <div><strong>03</strong><span>Соблюдение режима тишины</span></div>
        <div><strong>04</strong><span>Фотоотчёт по этапам</span></div>
      </section>

      <section className={styles.process} id="process">
        <div className={styles.processIntro}>
          <div className={styles.sectionLabel}>Порядок работ / 01</div>
          <h2>Порядок оказания работ.</h2>
          <p>От первого сообщения до сдачи помещения. Состав работ и стоимость согласуем до выхода бригады.</p>
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
          <p>Листайте каталог и нажмите «Показать цену»: стоимость откроется в карточке.</p>
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
                    {revealedService === service.title ? (
                      <div className={styles.servicePrice} aria-live="polite">
                        <span>Стоимость услуги</span>
                        <strong>{service.price}</strong>
                        <button type="button" onClick={() => chooseService(service.title)}>
                          Рассчитать точную стоимость <span>↗</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <p>{service.text}</p>
                        <button
                          type="button"
                          tabIndex={offset === 0 ? 0 : -1}
                          onClick={() => revealServicePrice(service.title)}
                          aria-label={`Показать цену услуги: ${service.title}`}
                        >
                          Показать цену <span>↓</span>
                        </button>
                      </>
                    )}
                  </div>
                  <div className={styles.serviceVisual}>
                    <img src={service.image} alt={service.imageAlt} />
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
                  onClick={() => { setRevealedService(null); setServiceSlide(index); }}
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
          <div className={styles.sectionLabel}>Стоимость / 03</div>
          <h2>От чего зависит стоимость</h2>
          <p>Итоговую цену считаем по реальному объёму работ. До начала демонтажа показываем, из чего складывается смета.</p>
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
          <h2>Опишите объект. Заявка откроется в Telegram.</h2>
          <p>Мы не показываем случайную цену: на стоимость влияют материал, толщина, этаж, доступ, объём и вывоз. После фото согласуем точную смету.</p>
          <div className={styles.estimateNote}><strong>Что подготовить</strong><span>5–10 фото · площадь · адрес · желаемая дата</span></div>
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
            <label>Как обращаться<input name="name" placeholder="Алексей" required /></label>
            <label>Ваш телефон<input name="phone" type="tel" placeholder="+7 999 000-00-00" required /></label>
          </div>
          <fieldset>
            <legend>Нужен вывоз мусора?</legend>
            <label><input type="radio" name="waste" value="Да" defaultChecked /> Да</label>
            <label><input type="radio" name="waste" value="Нет" /> Нет</label>
            <label><input type="radio" name="waste" value="Нужно обсудить" /> Обсудить</label>
          </fieldset>
          <label>Комментарий<textarea name="comment" placeholder="Что нужно сохранить, этаж, есть ли грузовой лифт…" /></label>
          <button className={styles.formButton} type="submit">Открыть заявку в Telegram <span>↗</span></button>
          <small>{openedTelegram ? "Telegram открыт. Текст заявки уже подготовлен." : "Сообщение не отправится без вашего подтверждения в Telegram."}</small>
        </form>
      </section>

      <section className={styles.projects} id="projects">
        <div className={styles.projectsHeader}>
          <div>
            <div className={styles.sectionLabel}>Объекты / 05</div>
            <h2>География работ и фотоотчёты</h2>
          </div>
          <p>Слева отмечены выполненные объекты по Москве и области. Справа находятся фотографии работ. Отзывы и похожие примеры отправим по запросу.</p>
        </div>
        <div className={styles.portfolioGrid}>
          <div className={styles.portfolioMap}>
            <div className={styles.mapCircle} aria-label="Карта выполненных объектов в Москве и Московской области">
              <img className={styles.mapImage} src="./moscow-region-map.png" alt="Карта Москвы и Московской области" />
              <span className={styles.mapDotField} aria-hidden="true" />
              <span className={styles.mapHotspots} aria-hidden="true" />
              <span className={`${styles.mapPhotoPin} ${styles.mapPinNorth}`}><img src="./project-commercial.jpg" alt="Объект на севере Москвы" /></span>
              <span className={`${styles.mapPhotoPin} ${styles.mapPinNorthWest}`}><img src="./project-bathroom.jpg" alt="Объект на северо-западе Москвы" /></span>
              <span className={`${styles.mapPhotoPin} ${styles.mapPinWest}`}><img src="./project-apartment.jpg" alt="Объект на западе Москвы" /></span>
              <span className={`${styles.mapPhotoPin} ${styles.mapPinEast}`}><img src="./project-bathroom.jpg" alt="Объект на востоке Москвы" /></span>
              <span className={`${styles.mapPhotoPin} ${styles.mapPinSouth}`}><img src="./hero-interior.jpg" alt="Объект на юге Москвы" /></span>
              <span className={`${styles.mapPhotoPin} ${styles.mapPinSouthWest}`}><img src="./project-commercial.jpg" alt="Объект на юго-западе Москвы" /></span>
              <span className={styles.mapCenterPin} aria-label="Москва"><b>Д</b></span>
            </div>
            <div className={styles.mapCounter}>
              <strong>528</strong>
              <span>объектов в Москве и Московской области</span>
              <small>уже сделали</small>
            </div>
            <a className={styles.mapCredit} href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
          </div>

          <div className={styles.portfolioStories}>
            <article className={`${styles.portfolioPhoto} ${styles.portfolioPhotoLarge}`}>
              <img src="./project-commercial.jpg" alt="Демонтаж коммерческого помещения" />
              <div><span>Коммерческое помещение</span><h3>Перегородки, потолок и подготовка к ремонту</h3></div>
            </article>
            <article className={styles.portfolioPhoto}>
              <img src="./project-apartment.jpg" alt="Демонтаж в квартире" />
              <div><span>Квартира</span><h3>Демонтаж до бетона</h3></div>
            </article>
            <article className={styles.portfolioPhoto}>
              <img src="./project-bathroom.jpg" alt="Демонтаж ванной комнаты" />
              <div><span>Ванная</span><h3>Разбор сантехкабины</h3></div>
            </article>
            <article className={styles.portfolioReviews}>
              <span>Фото и отзывы</span>
              <h3>Покажем похожие объекты</h3>
              <p>Пришлём в Telegram фото до и после, состав работ и отзывы по вашему типу демонтажа.</p>
              <a href={telegramUrl("Здравствуйте! Пришлите, пожалуйста, фото выполненных объектов и отзывы по похожему демонтажу.")} target="_blank" rel="noreferrer">Запросить подборку ↗</a>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.faq} id="faq">
        <div className={styles.faqIntro}><div className={styles.sectionLabel}>Вопросы / 06</div><h2>Остались вопросы?</h2><p>Ответили на частые вопросы. Свою ситуацию можно описать в Telegram.</p></div>
        <div className={styles.faqList}>
          {faq.map(([question, answer], index) => (
            <details key={question}><summary><b>0{index + 1}</b><span>{question}</span><i>+</i></summary><p>{answer}</p></details>
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
          <div className={styles.sectionLabel}>Замерщик / 07</div>
          <h2>Бесплатный выезд замерщика на объект.</h2>
          <p>Специалист осмотрит помещение, уточнит объём демонтажа и вывоза, сделает замеры и подготовит понятную смету. Время выезда согласуем заранее.</p>
          <div className={styles.surveyorActions}>
            <a className={styles.primaryButton} href={telegramUrl("Здравствуйте! Хочу пригласить замерщика на объект. Подскажите ближайшее свободное время?")} target="_blank" rel="noreferrer">Пригласить замерщика <span>↗</span></a>
            <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
          </div>
        </div>
      </section>

      <section className={styles.about} id="about">
        <div className={styles.aboutHeading}>
          <div className={styles.sectionLabel}>О компании / 08</div>
          <h2>Точно разбираем помещения.</h2>
        </div>
        <div className={styles.aboutBody}>
          <div className={styles.aboutImage}>
            <img src="./hero-interior.jpg" alt="Внутренний демонтаж помещения" />
          </div>
          <div className={styles.aboutCopy}>
            <p>Более 10 лет выполняем внутренний демонтаж в квартирах и коммерческих помещениях Москвы и Московской области.</p>
            <p>Перед началом разбираемся в конструкции объекта, защищаем то, что нужно сохранить, фиксируем смету и только после этого выходим на работы. Берём на себя демонтаж, упаковку, спуск и вывоз строительного мусора.</p>
            <div className={styles.aboutStats}>
              <div><strong>10+</strong><span>лет опыта</span></div>
              <div><strong>528</strong><span>объектов</span></div>
              <div><strong>5,0</strong><span>рейтинг на Яндекс Услугах</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.reviews} id="reviews">
        <div className={styles.reviewsHeading}>
          <div>
            <div className={styles.sectionLabel}>Отзывы / 09</div>
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
          <div className={styles.sectionLabel}>Инструменты / 10</div>
          <h2>Работаем своим инструментом.</h2>
          <p>На объект приезжает укомплектованная бригада. Подбираем инструмент под материал, объём и условия помещения.</p>
        </div>
        <div className={styles.toolsGrid}>
          {tools.map(([number, title, text]) => (
            <article key={number}>
              <div className={styles.toolGraphic} aria-hidden="true"><span>{number}</span><i /><i /><i /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <a className={styles.brand} href="#top">
          <span className={styles.brandText}>Демонтаж<br /><span>под ключ</span></span>
        </a>
        <p>Демонтаж квартир, коммерческих помещений и отдельных конструкций в Москве и Московской области.</p>
        <div><a href={PHONE_HREF}>{PHONE_DISPLAY}</a><a href={directTelegram} target="_blank" rel="noreferrer">Telegram ↗</a></div>
        <small>© 2026 · Фото прототипа: <a href="https://unsplash.com/photos/Te48TPzdcU8" target="_blank" rel="noreferrer">Milivoj Kuhar</a>, <a href="https://unsplash.com/photos/pBZBbCqyW8M" target="_blank" rel="noreferrer">Steffen Lemmerzahl</a>, <a href="https://unsplash.com/photos/3nROCRjZiFQ" target="_blank" rel="noreferrer">Razlan Hanafiah</a>.</small>
      </footer>
    </main>
  );
}
