"use client";

import Link from "next/link";
import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
import styles from "./landing.module.css";

const services = [
  { number: "01", title: "Демонтаж квартир", text: "Снимаем всё до несущих конструкций. Сортируем и вывозим мусор." },
  { number: "02", title: "Стены и перегородки", text: "Кирпич, бетон, блоки. Работаем по проекту и сохраняем нужные коммуникации." },
  { number: "03", title: "Полы и стяжка", text: "Аккуратный демонтаж без повреждения перекрытий. Профессиональный инструмент." },
  { number: "04", title: "Коммерческие объекты", text: "Офисы, магазины, склады и производства. Поэтапная сдача и документы." },
];

const projects = [
  { type: "Квартира", title: "92 м² до бетона", meta: "5 дней · 7 тонн", tone: "warm" },
  { type: "Ритейл", title: "Магазин 340 м²", meta: "8 дней · ночные смены", tone: "cold" },
  { type: "Дом", title: "Разбор кровли", meta: "4 дня · с вывозом", tone: "stone" },
];

function Machine({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${styles.machine} ${compact ? styles.machineCompact : ""}`} aria-hidden="true">
      <div className={styles.arm}><i /></div>
      <div className={styles.bucket} />
      <div className={styles.cab}><span /></div>
      <div className={styles.engine} />
      <div className={styles.track}><i /><i /><i /><i /></div>
    </div>
  );
}

export default function Home() {
  const [transitioning, setTransitioning] = useState(false);
  const [sent, setSent] = useState(false);
  const cursor = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add(styles.visible)),
      { threshold: 0.14 }
    );
    document.querySelectorAll(`.${styles.reveal}`).forEach((node) => reveal.observe(node));

    const onMove = (event: globalThis.MouseEvent) => {
      if (cursor.current) cursor.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      reveal.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const demolishTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    if (transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => document.querySelector(id)?.scrollIntoView({ behavior: "instant" }), 720);
    window.setTimeout(() => setTransitioning(false), 1450);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className={styles.site}>
      <div className={styles.progress} ref={progress} />
      <div className={styles.cursor} ref={cursor} aria-hidden="true" />
      <div className={`${styles.demolitionTransition} ${transitioning ? styles.transitionActive : ""}`} aria-hidden="true">
        <div className={styles.transitionWall}>
          {Array.from({ length: 24 }).map((_, index) => <i key={index} />)}
        </div>
        <Machine />
        <div className={styles.dust} />
        <strong>ОСВОБОЖДАЕМ<br />ПРОСТРАНСТВО</strong>
      </div>

      <header className={styles.header}>
        <Link href="#top" className={styles.logo}>НК<span>/</span>ДМ</Link>
        <nav>
          <Link href="#services">Услуги</Link>
          <Link href="#projects">Объекты</Link>
          <Link href="#process">Как работаем</Link>
        </nav>
        <a className={styles.headerPhone} href="tel:+79853584978">+7 (985) 358-49-78</a>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.noise} aria-hidden="true" />
        <div className={styles.heroEyebrow}><span /> АЛЕКСАНДР НАУМЕНКО · МОСКВА И ОБЛАСТЬ</div>
        <h1>
          <span className={styles.line}><i>ОСВОБОЖДАЕМ</i></span>
          <span className={`${styles.line} ${styles.outline}`}><i>ПРОСТРАНСТВО</i></span>
        </h1>
        <div className={styles.heroBottom}>
          <p><strong>Александр Науменко</strong><br /><a href="tel:+79853584978">+7 (985) 358-49-78</a><br />Москва и Московская область</p>
          <a href="#services" onClick={(event) => demolishTo(event, "#services")} className={styles.demolishButton}>
            <span>СНЕСТИ ЭКРАН</span><b>↓</b>
          </a>
          <div className={styles.heroStat}><b>24</b><span>часа<br />до старта</span></div>
        </div>
        <div className={styles.heroMachine}><Machine compact /></div>
        <div className={styles.groundLine} />
      </section>

      <div className={styles.ticker} aria-label="Наши преимущества">
        <div>БЕЗОПАСНОСТЬ <span>✦</span> ЧИСТАЯ РАБОТА <span>✦</span> ТОЧНАЯ СМЕТА <span>✦</span> ВЫВОЗ МУСОРА <span>✦</span> БЕЗОПАСНОСТЬ <span>✦</span> ЧИСТАЯ РАБОТА <span>✦</span> ТОЧНАЯ СМЕТА <span>✦</span> ВЫВОЗ МУСОРА <span>✦</span></div>
      </div>

      <section className={styles.services} id="services">
        <div className={`${styles.sectionHeading} ${styles.reveal}`}>
          <span>01 / ЧТО СНОСИМ</span>
          <h2>РАЗБИРАЕМ<br />ТОЧНО.</h2>
          <p>Не ломаем наугад. Изучаем объект, защищаем то, что должно остаться, и только потом включаем технику.</p>
        </div>
        <div className={styles.serviceList}>
          {services.map((service) => (
            <article className={`${styles.serviceRow} ${styles.reveal}`} key={service.number}>
              <span>{service.number}</span><h3>{service.title}</h3><p>{service.text}</p><b>↗</b>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.statement}>
        <div className={styles.statementRail} aria-hidden="true"><span>КОНТРОЛЬ</span><span>ТОЧНОСТЬ</span><span>СКОРОСТЬ</span></div>
        <div className={`${styles.statementText} ${styles.reveal}`}>
          <span>СТЕНА — ЭТО НЕ ПРОБЛЕМА.</span>
          <strong>ПРОБЛЕМА — КОГДА<br />НЕ ЗНАЕШЬ, ЧТО ЗА НЕЙ.</strong>
          <p>Поэтому каждый объект начинается с осмотра, плана работ и прозрачной сметы.</p>
        </div>
      </section>

      <section className={styles.projects} id="projects">
        <div className={`${styles.projectHeader} ${styles.reveal}`}><span>02 / ПОСЛЕДНИЕ ОБЪЕКТЫ</span><h2>БЫЛО.<br />СТАЛО.</h2></div>
        <div className={styles.projectGrid}>
          {projects.map((project, index) => (
            <article className={`${styles.projectCard} ${styles[project.tone]} ${styles.reveal}`} key={project.title}>
              <div className={styles.projectScene}>
                <span className={styles.projectNumber}>0{index + 1}</span>
                <div className={styles.fakeBuilding}>{Array.from({ length: 12 }).map((_, i) => <i key={i} />)}</div>
                <div className={styles.projectGlow} />
              </div>
              <div><span>{project.type}</span><h3>{project.title}</h3><p>{project.meta}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.process} id="process">
        <div className={`${styles.processIntro} ${styles.reveal}`}><span>03 / ПРОЦЕСС</span><h2>ПЯТЬ ШАГОВ.<br />НИ ОДНОГО<br />ЛИШНЕГО.</h2></div>
        <ol>
          {[
            ["Заявка", "Фото, адрес и короткое описание задачи."],
            ["Осмотр", "Инженер приезжает и фиксирует объём."],
            ["Смета", "Стоимость и сроки закрепляем в договоре."],
            ["Работа", "Демонтаж, сортировка и погрузка."],
            ["Чистый объект", "Вывозим мусор и сдаём площадку."],
          ].map(([title, text], index) => <li className={styles.reveal} key={title}><b>0{index + 1}</b><h3>{title}</h3><p>{text}</p></li>)}
        </ol>
      </section>

      <section className={styles.contact} id="contact">
        <div className={styles.contactCopy}>
          <span>ГОТОВЫ НАЧАТЬ?</span>
          <h2>ПОКАЖИТЕ,<br />ЧТО НУЖНО<br />УБРАТЬ.</h2>
          <p>Предварительный расчёт по фотографиям — в течение 15 минут.</p>
          <a className={styles.contactPhone} href="tel:+79853584978">+7 (985) 358-49-78 <span>↗</span></a>
        </div>
        <form onSubmit={submit} className={styles.form}>
          <label>Как к вам обращаться?<input required name="name" placeholder="Алексей" /></label>
          <label>Телефон<input required name="phone" type="tel" placeholder="+7 999 000-00-00" /></label>
          <label>Что нужно демонтировать?<textarea name="task" placeholder="Квартира 70 м², полный демонтаж..." /></label>
          <button type="submit">{sent ? "ЗАЯВКА ПРИНЯТА ✓" : "ПОЛУЧИТЬ РАСЧЁТ →"}</button>
          <small>{sent ? "Это демонстрация формы — подключим отправку заявок при запуске." : "Нажимая кнопку, вы соглашаетесь с обработкой данных."}</small>
        </form>
      </section>

      <footer className={styles.footer}>
        <Link href="#top" className={styles.logo}>НК<span>/</span>ДМ</Link>
        <p>АЛЕКСАНДР НАУМЕНКО<br />МОСКВА И МОСКОВСКАЯ ОБЛАСТЬ</p>
        <a href="tel:+79853584978">+7 (985) 358-49-78</a>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
