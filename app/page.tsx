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
    tag: "стены",
    image: "./project-apartment.jpg",
    imageAlt: "Подготовленное помещение после демонтажа перегородок",
  },
  {
    number: "02",
    title: "Демонтаж сантехнической кабины",
    text: "Полный разбор кабины с сохранением стояков и общедомовых коммуникаций.",
    tag: "санузел",
    image: "./project-bathroom.jpg",
    imageAlt: "Помещение ванной комнаты перед демонтажными работами",
  },
  {
    number: "03",
    title: "Демонтаж стяжки",
    text: "Снимаем старую стяжку, собираем бой в мешки и готовим основание.",
    tag: "пол",
    image: "./hero-interior.jpg",
    imageAlt: "Основание пола во время внутреннего демонтажа",
  },
  {
    number: "04",
    title: "Демонтаж потолочных конструкций",
    text: "Натяжные, подвесные, реечные потолки и сложные каркасы.",
    tag: "потолок",
    image: "./project-commercial.jpg",
    imageAlt: "Потолочные конструкции коммерческого помещения",
  },
  {
    number: "05",
    title: "Демонтаж квартиры под ключ",
    text: "Комплексный разбор до бетона: отделка, перегородки, сантехника и вывоз.",
    tag: "под ключ",
    image: "./hero-interior.jpg",
    imageAlt: "Квартира в процессе комплексного демонтажа",
  },
  {
    number: "06",
    title: "Демонтаж ванной комнаты",
    text: "Плитка, сантехника, короба и старая разводка — аккуратно и поэтапно.",
    tag: "ванная",
    image: "./project-bathroom.jpg",
    imageAlt: "Ванная комната перед аккуратным демонтажом",
  },
  {
    number: "07",
    title: "Демонтаж квартиры",
    text: "Частичный или полный демонтаж под новый ремонт и перепланировку.",
    tag: "квартира",
    image: "./project-apartment.jpg",
    imageAlt: "Квартира после демонтажа старой отделки",
  },
  {
    number: "08",
    title: "Демонтаж коммерческих помещений",
    text: "Магазины, салоны, склады и другие помещения: перегородки, потолки и полы.",
    tag: "коммерция",
    image: "./project-commercial.jpg",
    imageAlt: "Коммерческое помещение для демонтажных работ",
  },
];

const process = [
  ["Заявка и фото", "Вы присылаете адрес, площадь и несколько фотографий в Telegram."],
  ["Осмотр объекта", "Уточняем конструктив, доступ, объём мусора и ограничения по шуму."],
  ["Фиксированная смета", "Согласовываем состав работ, сроки и стоимость до начала демонтажа."],
  ["Демонтаж", "Защищаем общие зоны, разбираем, сортируем и упаковываем отходы."],
  ["Вывоз и сдача", "Грузим мусор, подметаем площадку и сдаём готовый объект."],
];

const faq = [
  ["Можно оценить объект только по фотографиям?", "Да. Для предварительной оценки обычно достаточно 5–10 фото, площади и короткого описания. Если конструктив сложный, согласуем бесплатный осмотр."],
  ["Вывоз строительного мусора входит в работу?", "Вывоз рассчитывается отдельно или включается в общую смету — как удобнее. До начала работ вы будете видеть обе части стоимости."],
  ["Работаете с квартирами в жилых домах?", "Да. Учитываем разрешённое время шумных работ, защищаем лифт и общие зоны, мусор выносим в мешках."],
  ["Можно демонтировать только одну стену или ванную?", "Можно. Берём как комплексные объекты под ключ, так и локальные задачи из каталога выше."],
  ["Какие документы выдаёте?", "В рабочей версии сайта укажем согласованный пакет: смета, договор, акт и документы по вывозу — если они требуются для объекта."],
];

function telegramUrl(text: string) {
  return `https://t.me/+${TELEGRAM_PHONE}?text=${encodeURIComponent(text)}`;
}

export default function Home() {
  const [selectedService, setSelectedService] = useState(services[4].title);
  const [openedTelegram, setOpenedTelegram] = useState(false);
  const [serviceSlide, setServiceSlide] = useState(0);
  const serviceTouchStart = useRef<number | null>(null);

  const directTelegram = useMemo(
    () => telegramUrl("Здравствуйте! Хочу рассчитать стоимость демонтажа. Подскажите, какие фото и данные прислать?"),
    [],
  );

  const chooseService = (title: string) => {
    setSelectedService(title);
    document.querySelector("#estimate")?.scrollIntoView({ behavior: "smooth" });
  };

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
    ].filter(Boolean).join("\n");

    setOpenedTelegram(true);
    window.open(telegramUrl(message), "_blank", "noopener,noreferrer");
  };

  return (
    <main className={styles.site}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Демонтаж под ключ — наверх">
          <span className={styles.brandMark}><img src="./logo.jpg" alt="Демонтаж под ключ" /></span>
          <span className={styles.brandText}>Демонтаж<br /><small>под ключ</small></span>
        </a>
        <nav aria-label="Основная навигация">
          <a href="#services">Услуги</a>
          <a href="#projects">Объекты</a>
          <a href="#process">Этапы</a>
          <a href="#faq">Вопросы</a>
        </nav>
        <div className={styles.headerContact}>
          <span>Москва и область</span>
          <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
        </div>
      </header>

      <section className={styles.hero} id="top">
        <img className={styles.heroImage} src="./hero-interior.jpg" alt="Демонтаж перегородок внутри квартиры" />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span /> Москва и Московская область</div>
          <h1>Демонтаж<br /><em>под ключ</em></h1>
          <p>Квартиры, ванные комнаты, коммерческие помещения, стены и стяжка. Разберём, упакуем и вывезем — по согласованной смете.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href={directTelegram} target="_blank" rel="noreferrer">Рассчитать в Telegram <span>↗</span></a>
            <a className={styles.textButton} href={PHONE_HREF}>Позвонить {PHONE_DISPLAY}</a>
          </div>
        </div>
        <aside className={styles.heroPanel}>
          <span>Предварительная оценка</span>
          <strong>по фото</strong>
          <p>Пришлите фотографии и площадь — соберём исходные данные для расчёта.</p>
          <a href="#estimate">Заполнить за 1 минуту ↓</a>
        </aside>
        <div className={styles.heroIndex}>01 / 08</div>
      </section>

      <section className={styles.proof} aria-label="Преимущества">
        <div><strong>01</strong><span>Смета до начала работ</span></div>
        <div><strong>02</strong><span>Вывоз мусора с объекта</span></div>
        <div><strong>03</strong><span>Соблюдение режима тишины</span></div>
        <div><strong>04</strong><span>Фотоотчёт по этапам</span></div>
      </section>

      <section className={styles.about} id="about">
        <div className={styles.sectionLabel}>О компании / 01</div>
        <div className={styles.aboutTitle}>
          <h2>Убираем лишнее.<br /><span>Сохраняем важное.</span></h2>
        </div>
        <div className={styles.aboutText}>
          <p>Демонтаж — это не хаотичная ломка. Сначала определяем, что можно разбирать, защищаем лифт, стены и коммуникации, после этого начинаем работу.</p>
          <p>Берём локальные задачи и комплексный демонтаж под ключ в квартирах и коммерческих помещениях Москвы и области.</p>
          <div className={styles.documentLine}><span>Смета</span><span>Договор</span><span>Акт</span><span>Фотоотчёт</span></div>
        </div>
      </section>

      <section className={styles.services} id="services">
        <div className={styles.servicesHeading}>
          <h2>Наши услуги демонтажа</h2>
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
                  aria-hidden={offset !== 0}
                  aria-label={`${index + 1} из ${services.length}: ${service.title}`}
                  key={service.number}
                >
                  <div className={styles.serviceContent}>
                    <div className={styles.serviceTop}><span>{service.number}</span><b>{service.tag}</b></div>
                    <div className={styles.serviceTicks} aria-hidden="true"><i /><i /><i /><i /><i /></div>
                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                    <button
                      type="button"
                      tabIndex={offset === 0 ? 0 : -1}
                      onClick={() => chooseService(service.title)}
                      aria-label={`Выбрать услугу: ${service.title}`}
                    >
                      Рассчитать услугу <span>↗</span>
                    </button>
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

      <section className={styles.estimate} id="estimate">
        <div className={styles.estimateCopy}>
          <div className={styles.sectionLabel}>Расчёт / 04</div>
          <h2>Опишите объект — заявка откроется сразу в Telegram.</h2>
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
          <small>{openedTelegram ? "Telegram открыт — текст заявки уже подготовлен." : "Сообщение не отправится без вашего подтверждения в Telegram."}</small>
        </form>
      </section>

      <section className={styles.projects} id="projects">
        <div className={styles.projectsHeader}>
          <div>
            <div className={styles.sectionLabel}>Объекты / 05</div>
            <h2>География работ и фотоотчёты</h2>
          </div>
          <p>Слева отмечены выполненные объекты по Москве и области. Справа — фотографии работ; отзывы и похожие примеры отправим по запросу.</p>
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

      <section className={styles.process} id="process">
        <div className={styles.processIntro}>
          <div className={styles.sectionLabel}>Этапы / 06</div>
          <h2>Понятный процесс без сюрпризов.</h2>
        </div>
        <ol>
          {process.map(([title, text], index) => (
            <li key={title}><b>0{index + 1}</b><h3>{title}</h3><p>{text}</p></li>
          ))}
        </ol>
      </section>

      <section className={styles.guides}>
        <div className={styles.guidesTitle}><div className={styles.sectionLabel}>Полезно / 07</div><h2>До начала демонтажа</h2></div>
        <div className={styles.guideGrid}>
          <article><span>01</span><h3>Что можно демонтировать без согласования</h3><a href={directTelegram} target="_blank" rel="noreferrer">Спросить по своему объекту ↗</a></article>
          <article><span>02</span><h3>Как подготовить квартиру и общие зоны</h3><a href="#faq">Читать кратко ↓</a></article>
          <article><span>03</span><h3>От чего зависит смета и объём вывоза</h3><a href="#estimate">Перейти к расчёту ↓</a></article>
        </div>
      </section>

      <section className={styles.faq} id="faq">
        <div className={styles.faqIntro}><div className={styles.sectionLabel}>FAQ / 08</div><h2>Частые вопросы</h2><p>Если вашего вопроса нет в списке — напишите напрямую в Telegram.</p></div>
        <div className={styles.faqList}>
          {faq.map(([question, answer], index) => (
            <details key={question}><summary><b>0{index + 1}</b><span>{question}</span><i>+</i></summary><p>{answer}</p></details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} id="contacts">
        <div>
          <span>Есть объект?</span>
          <h2>Пришлите фото.<br />Начнём с расчёта.</h2>
        </div>
        <div className={styles.finalActions}>
          <a className={styles.primaryButton} href={directTelegram} target="_blank" rel="noreferrer">Написать в Telegram <span>↗</span></a>
          <a className={styles.finalPhone} href={PHONE_HREF}>{PHONE_DISPLAY}</a>
          <p>Москва и Московская область<br />Ежедневно, время выезда — по договорённости</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <a className={styles.brand} href="#top">
          <span className={styles.brandMark}><img src="./logo.jpg" alt="" /></span>
          <span className={styles.brandText}>Демонтаж<br /><small>под ключ</small></span>
        </a>
        <p>Демонтаж квартир, коммерческих помещений и отдельных конструкций в Москве и Московской области.</p>
        <div><a href={PHONE_HREF}>{PHONE_DISPLAY}</a><a href={directTelegram} target="_blank" rel="noreferrer">Telegram ↗</a></div>
        <small>© 2026 · Фото прототипа: <a href="https://unsplash.com/photos/Te48TPzdcU8" target="_blank" rel="noreferrer">Milivoj Kuhar</a>, <a href="https://unsplash.com/photos/pBZBbCqyW8M" target="_blank" rel="noreferrer">Steffen Lemmerzahl</a>, <a href="https://unsplash.com/photos/3nROCRjZiFQ" target="_blank" rel="noreferrer">Razlan Hanafiah</a>.</small>
      </footer>

      <a className={styles.mobileTelegram} href={directTelegram} target="_blank" rel="noreferrer">Рассчитать в Telegram <span>↗</span></a>
    </main>
  );
}
