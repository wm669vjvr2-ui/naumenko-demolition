"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./crm.module.css";

type Deal = {
  id: number;
  stage: string;
  title: string;
  contact: string;
  phone: string;
  amount: number;
  source: string;
  task: string;
  date: string;
};

const stages = [
  { id: "new", name: "Новая заявка", color: "#49a8e8" },
  { id: "contact", name: "Связались", color: "#33c2c9" },
  { id: "measure", name: "Выезд / замер", color: "#9d77db" },
  { id: "estimate", name: "Смета отправлена", color: "#efaa42" },
  { id: "approve", name: "Согласование", color: "#e07e57" },
  { id: "work", name: "В работе", color: "#7fbe4c" },
  { id: "paid", name: "Оплачено", color: "#3ead72" },
];

const initialDeals: Deal[] = [
  { id: 1048, stage: "new", title: "Демонтаж квартиры 68 м²", contact: "Алексей Морозов", phone: "+7 999 410-22-18", amount: 182000, source: "Сайт", task: "Перезвонить в течение 5 минут", date: "сегодня, 12:43" },
  { id: 1047, stage: "new", title: "Снести перегородку", contact: "Марина", phone: "+7 926 810-03-55", amount: 38000, source: "Авито", task: "Уточнить материал стены", date: "сегодня, 11:19" },
  { id: 1043, stage: "contact", title: "Офис после арендатора", contact: "ООО «Сфера»", phone: "+7 495 170-42-11", amount: 315000, source: "Яндекс", task: "Запросить план помещения", date: "вчера, 18:10" },
  { id: 1040, stage: "measure", title: "Дом 140 м² — полный разбор", contact: "Дмитрий К.", phone: "+7 903 544-11-70", amount: 680000, source: "Рекомендация", task: "Замер завтра в 10:00", date: "19 июл." },
  { id: 1038, stage: "measure", title: "Демонтаж стяжки 92 м²", contact: "Ирина Романова", phone: "+7 916 333-18-21", amount: 126000, source: "Сайт", task: "Инженер: Александр Науменко", date: "18 июл." },
  { id: 1032, stage: "estimate", title: "Магазин 340 м²", contact: "Андрей / Retail Group", phone: "+7 985 311-88-09", amount: 890000, source: "Повторный", task: "Дожать согласование сметы", date: "17 июл." },
  { id: 1029, stage: "approve", title: "Квартира 54 м² до бетона", contact: "Николай", phone: "+7 925 610-17-04", amount: 149000, source: "Яндекс", task: "Отправить договор", date: "16 июл." },
  { id: 1021, stage: "work", title: "Склад — перегородки", contact: "АО «Вектор»", phone: "+7 495 801-34-50", amount: 440000, source: "Рекомендация", task: "Фотоотчёт до 18:00", date: "14 июл." },
  { id: 1015, stage: "paid", title: "Демонтаж санузла", contact: "Елена", phone: "+7 916 413-28-70", amount: 72000, source: "Авито", task: "Запросить отзыв", date: "11 июл." },
];

const money = (value: number) => new Intl.NumberFormat("ru-RU").format(value) + " ₽";

export default function CrmPrototype() {
  const [deals, setDeals] = useState(initialDeals);
  const [selected, setSelected] = useState<Deal | null>(initialDeals[0]);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => deals.filter((deal) => `${deal.title} ${deal.contact} ${deal.phone}`.toLowerCase().includes(query.toLowerCase())), [deals, query]);
  const total = deals.reduce((sum, deal) => sum + deal.amount, 0);

  const moveNext = (deal: Deal) => {
    const index = stages.findIndex((stage) => stage.id === deal.stage);
    if (index < 0 || index === stages.length - 1) return;
    const updated = { ...deal, stage: stages[index + 1].id };
    setDeals((items) => items.map((item) => item.id === deal.id ? updated : item));
    setSelected(updated);
  };

  const addDeal = () => {
    const deal: Deal = { id: Date.now(), stage: "new", title: "Новая заявка с сайта", contact: "Новый клиент", phone: "+7 999 000-00-00", amount: 0, source: "Сайт", task: "Позвонить за 5 минут", date: "только что" };
    setDeals((items) => [deal, ...items]);
    setSelected(deal);
  };

  return (
    <main className={styles.crm}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.bitrix}><i>24</i><span>битрикс</span></Link>
        <nav>
          <button title="Активность">⌁</button>
          <button className={styles.active} title="CRM">▦</button>
          <button title="Задачи">✓</button>
          <button title="Чаты">◫</button>
          <button title="Аналитика">⌁</button>
        </nav>
        <div className={styles.avatar}>Н</div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div><b>АЛЕКСАНДР НАУМЕНКО</b><span>Москва и Московская область</span></div>
          <label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по сделкам" /></label>
          <button className={styles.help}>?</button>
          <div className={styles.user}><i>АН</i><span>Александр Науменко<br /><small>Администратор</small></span></div>
        </header>

        <div className={styles.crmNav}>
          <div><b>CRM</b><span>Обзор</span><span>Лиды</span><span className={styles.tabActive}>Сделки</span><span>Контакты</span><span>Компании</span><span>Аналитика</span></div>
          <Link href="/">← Вернуться на сайт</Link>
        </div>

        <div className={styles.contentHeader}>
          <div><h1>Сделки</h1><span>Основная воронка</span></div>
          <div className={styles.stats}>
            <span><b>{deals.length}</b> сделок</span>
            <span><b>{money(total)}</b> в работе</span>
            <span className={styles.live}><i /> CRM работает</span>
          </div>
          <button onClick={addDeal}>+ ДОБАВИТЬ СДЕЛКУ</button>
        </div>

        <div className={styles.tools}>
          <button className={styles.kanban}>▦ Канбан</button><button>☷ Список</button><button>◫ Календарь</button>
          <span /><button>Фильтр +</button><button>⚙</button>
        </div>

        <div className={styles.board}>
          {stages.map((stage) => {
            const stageDeals = filtered.filter((deal) => deal.stage === stage.id);
            const sum = stageDeals.reduce((value, deal) => value + deal.amount, 0);
            return (
              <section className={styles.column} key={stage.id}>
                <header style={{ "--stage": stage.color } as React.CSSProperties}>
                  <div><b>{stage.name}</b><span>{stageDeals.length}</span></div><small>{money(sum)}</small>
                </header>
                <div className={styles.cards}>
                  {stageDeals.map((deal) => (
                    <button className={`${styles.deal} ${selected?.id === deal.id ? styles.selected : ""}`} onClick={() => setSelected(deal)} key={deal.id}>
                      <span className={styles.source}>{deal.source}</span>
                      <h3>{deal.title}</h3>
                      <p>{deal.contact}</p>
                      <strong>{money(deal.amount)}</strong>
                      <div><span>◷ {deal.task}</span><small>{deal.date}</small></div>
                    </button>
                  ))}
                  <button onClick={addDeal} className={styles.quickAdd}>+ Быстрая сделка</button>
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {selected && (
        <aside className={styles.drawer}>
          <header><span>СДЕЛКА №{selected.id}</span><button onClick={() => setSelected(null)}>×</button></header>
          <div className={styles.drawerTitle}><span>{selected.source}</span><h2>{selected.title}</h2><strong>{money(selected.amount)}</strong></div>
          <div className={styles.stageTrack}>
            {stages.map((stage) => <i key={stage.id} className={stages.findIndex((s) => s.id === stage.id) <= stages.findIndex((s) => s.id === selected.stage) ? styles.done : ""} />)}
          </div>
          <div className={styles.taskBox}><small>БЛИЖАЙШЕЕ ДЕЛО</small><b>{selected.task}</b><span>Сегодня · Ответственный: Александр Науменко</span></div>
          <dl>
            <div><dt>Клиент</dt><dd>{selected.contact}</dd></div>
            <div><dt>Телефон</dt><dd>{selected.phone}</dd></div>
            <div><dt>Источник</dt><dd>{selected.source}</dd></div>
            <div><dt>Тип объекта</dt><dd>Жилое помещение</dd></div>
            <div><dt>Вывоз мусора</dt><dd>Да, включён</dd></div>
            <div><dt>Ответственный</dt><dd>Александр Науменко</dd></div>
          </dl>
          <div className={styles.timeline}><b>История</b><p><i /> Сделка создана · {selected.date}</p><p><i /> Запущен робот «Перезвонить»</p></div>
          <footer><button>ПОЗВОНИТЬ</button><button onClick={() => moveNext(selected)} disabled={selected.stage === "paid"}>{selected.stage === "paid" ? "СДЕЛКА ЗАВЕРШЕНА ✓" : "НА СЛЕДУЮЩУЮ СТАДИЮ →"}</button></footer>
        </aside>
      )}
    </main>
  );
}
