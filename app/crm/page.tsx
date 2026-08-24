"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./crm.module.css";

type Deal = { id: number; stage: string; title: string; contact: string; phone: string; amount: number; source: string; task: string; date: string };
type Lead = { id: number; title: string; contact: string; phone: string; source: string; status: "new" | "qualified"; age: string };
type WorkTask = { id: number; title: string; client: string; due: string; priority: "Срочно" | "Сегодня" | "На неделе"; done: boolean };
type ChatMessage = { from: "client" | "me"; text: string; time: string };
type Chat = { id: number; name: string; phone: string; channel: string; unread: number; messages: ChatMessage[] };
type Company = { id: number; name: string; contact: string; phone: string; objects: number; revenue: number; search: string };
type Activity = { id: number; type: "CRM" | "Задачи" | "Чаты"; title: string; text: string; time: string };
type ViewMode = "kanban" | "list" | "calendar";
type Modal = "help" | "settings" | null;

const stages = [
  { id: "new", name: "Новая заявка", color: "#49a8e8" }, { id: "contact", name: "Связались", color: "#33c2c9" },
  { id: "measure", name: "Выезд / замер", color: "#9d77db" }, { id: "estimate", name: "Смета отправлена", color: "#efaa42" },
  { id: "approve", name: "Согласование", color: "#e07e57" }, { id: "work", name: "В работе", color: "#7fbe4c" },
  { id: "paid", name: "Оплачено", color: "#3ead72" },
];

const initialDeals: Deal[] = [
  { id: 1048, stage: "new", title: "Демонтаж квартиры 68 м²", contact: "Алексей Морозов", phone: "+7 999 410-22-18", amount: 182000, source: "Сайт", task: "Перезвонить в течение 5 минут", date: "сегодня, 12:43" },
  { id: 1047, stage: "new", title: "Снести перегородку", contact: "Марина", phone: "+7 926 810-03-55", amount: 38000, source: "Авито", task: "Уточнить материал стены", date: "сегодня, 11:19" },
  { id: 1043, stage: "contact", title: "Коммерческое помещение после арендатора", contact: "ООО «Сфера»", phone: "+7 495 170-42-11", amount: 315000, source: "Яндекс", task: "Запросить план помещения", date: "вчера, 18:10" },
  { id: 1040, stage: "measure", title: "Дом 140 м² — полный разбор", contact: "Дмитрий К.", phone: "+7 903 544-11-70", amount: 680000, source: "Рекомендация", task: "Замер завтра в 10:00", date: "19 июл." },
  { id: 1038, stage: "measure", title: "Демонтаж стяжки 92 м²", contact: "Ирина Романова", phone: "+7 916 333-18-21", amount: 126000, source: "Сайт", task: "Инженер: Александр Науменко", date: "18 июл." },
  { id: 1032, stage: "estimate", title: "Магазин 340 м²", contact: "Андрей / Retail Group", phone: "+7 985 311-88-09", amount: 890000, source: "Повторный", task: "Дожать согласование сметы", date: "17 июл." },
  { id: 1029, stage: "approve", title: "Квартира 54 м² до бетона", contact: "Николай", phone: "+7 925 610-17-04", amount: 149000, source: "Яндекс", task: "Отправить договор", date: "16 июл." },
  { id: 1021, stage: "work", title: "Склад — перегородки", contact: "АО «Вектор»", phone: "+7 495 801-34-50", amount: 440000, source: "Рекомендация", task: "Фотоотчёт до 18:00", date: "14 июл." },
  { id: 1015, stage: "paid", title: "Демонтаж санузла", contact: "Елена", phone: "+7 916 413-28-70", amount: 72000, source: "Авито", task: "Запросить отзыв", date: "11 июл." },
];

const initialLeads: Lead[] = [
  { id: 501, title: "Разобрать дачный дом", contact: "Сергей", phone: "+7 903 755-18-41", source: "Сайт", status: "new", age: "3 минуты" },
  { id: 500, title: "Демонтаж плитки 46 м²", contact: "Ольга", phone: "+7 916 008-23-71", source: "Яндекс", status: "qualified", age: "28 минут" },
  { id: 499, title: "Освободить склад", contact: "ООО «Рубеж»", phone: "+7 495 410-77-18", source: "Звонок", status: "new", age: "1 час" },
];

const initialTasks: WorkTask[] = [
  { id: 1, title: "Перезвонить по заявке", client: "Алексей Морозов", due: "12:50", priority: "Срочно", done: false },
  { id: 2, title: "Отправить смету", client: "Retail Group", due: "15:00", priority: "Сегодня", done: false },
  { id: 3, title: "Подтвердить время замера", client: "Дмитрий К.", due: "17:30", priority: "Сегодня", done: false },
  { id: 4, title: "Запросить отзыв", client: "Елена", due: "пятница", priority: "На неделе", done: true },
];

const initialChats: Chat[] = [
  { id: 1, name: "Алексей Морозов", phone: "+7 999 410-22-18", channel: "Telegram", unread: 2, messages: [{ from: "client", text: "Добрый день! Отправил фотографии квартиры.", time: "12:41" }, { from: "me", text: "Спасибо. Смотрю объём и вернусь с расчётом.", time: "12:42" }, { from: "client", text: "Нужно начать на следующей неделе.", time: "12:43" }] },
  { id: 2, name: "Марина", phone: "+7 926 810-03-55", channel: "WhatsApp", unread: 0, messages: [{ from: "client", text: "Перегородка из пеноблока, 12 см.", time: "11:19" }, { from: "me", text: "Понял. Пришлите, пожалуйста, длину стены.", time: "11:24" }] },
  { id: 3, name: "ООО «Сфера»", phone: "+7 495 170-42-11", channel: "Открытая линия", unread: 1, messages: [{ from: "client", text: "Можно работать ночью после 22:00?", time: "вчера" }] },
];

const initialCompanies: Company[] = [
  { id: 1, name: "Retail Group", contact: "Андрей", phone: "+7 985 311-88-09", objects: 3, revenue: 1240000, search: "Retail Group" },
  { id: 2, name: "ООО «Сфера»", contact: "Виктор", phone: "+7 495 170-42-11", objects: 2, revenue: 520000, search: "Сфера" },
  { id: 3, name: "АО «Вектор»", contact: "Михаил", phone: "+7 495 801-34-50", objects: 4, revenue: 980000, search: "Вектор" },
];

const initialActivity: Activity[] = [
  { id: 1, type: "CRM", title: "Новая заявка с сайта", text: "Алексей Морозов · квартира 68 м²", time: "12:43" },
  { id: 2, type: "Чаты", title: "Новое сообщение", text: "Алексей: нужно начать на следующей неделе", time: "12:43" },
  { id: 3, type: "Задачи", title: "Робот поставил задачу", text: "Перезвонить по новой заявке за 5 минут", time: "12:44" },
  { id: 4, type: "CRM", title: "Смета просмотрена", text: "Retail Group открыл документ №1032", time: "11:58" },
];

const sidebarItems = [["Активность", "⌁"], ["CRM", "▦"], ["Задачи", "✓"], ["Чаты", "◫"], ["Аналитика", "⌁"]];
const crmTabs = ["Обзор", "Лиды", "Сделки", "Контакты", "Компании", "Аналитика"];
const money = (value: number) => new Intl.NumberFormat("ru-RU").format(value) + " ₽";
const phoneHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

export default function CrmPrototype() {
  const [deals, setDeals] = useState(initialDeals);
  const [leads, setLeads] = useState(initialLeads);
  const [tasks, setTasks] = useState(initialTasks);
  const [chats, setChats] = useState(initialChats);
  const [companies, setCompanies] = useState(initialCompanies);
  const [activities, setActivities] = useState(initialActivity);
  const [manualContacts, setManualContacts] = useState<{ name: string; phone: string; source: string }[]>([]);
  const [selected, setSelected] = useState<Deal | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedChatId, setSelectedChatId] = useState(1);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [source, setSource] = useState("Все источники");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeArea, setActiveArea] = useState("CRM");
  const [activeTab, setActiveTab] = useState("Обзор");
  const [leadFilter, setLeadFilter] = useState("Все");
  const [taskFilter, setTaskFilter] = useState("Открытые");
  const [activityFilter, setActivityFilter] = useState("Все");
  const [analyticsPeriod, setAnalyticsPeriod] = useState("Месяц");
  const [taskDraft, setTaskDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("naumenko_parser_leads") || "[]") as Lead[];
      setLeads((current) => {
        const known = new Set(current.map((lead) => lead.id));
        return [...stored.filter((lead) => Number.isFinite(lead.id) && !known.has(lead.id)), ...current];
      });
    } catch {
      // Invalid local prototype data should not prevent the CRM from opening.
    }
  }, []);

  const sources = useMemo(() => ["Все источники", ...Array.from(new Set(deals.map((deal) => deal.source)))], [deals]);
  const filteredDeals = useMemo(() => deals.filter((deal) => `${deal.title} ${deal.contact} ${deal.phone}`.toLowerCase().includes(query.toLowerCase()) && (source === "Все источники" || deal.source === source)), [deals, query, source]);
  const contacts = useMemo(() => {
    const unique = new Map<string, { name: string; phone: string; source: string; deals: number; amount: number }>();
    deals.forEach((deal) => {
      const current = unique.get(deal.phone);
      unique.set(deal.phone, { name: deal.contact, phone: deal.phone, source: deal.source, deals: (current?.deals || 0) + 1, amount: (current?.amount || 0) + deal.amount });
    });
    manualContacts.forEach((contact) => unique.set(contact.phone, { ...contact, deals: 0, amount: 0 }));
    return Array.from(unique.values()).filter((contact) => `${contact.name} ${contact.phone}`.toLowerCase().includes(query.toLowerCase()));
  }, [deals, manualContacts, query]);
  const total = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const workTotal = deals.filter((deal) => deal.stage !== "paid").reduce((sum, deal) => sum + deal.amount, 0);
  const selectedChat = chats.find((chat) => chat.id === selectedChatId) || chats[0];

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200); };
  const logActivity = (type: Activity["type"], title: string, text: string) => setActivities((items) => [{ id: Date.now(), type, title, text, time: "только что" }, ...items].slice(0, 20));

  const chooseArea = (name: string) => { setActiveArea(name); setQuery(""); setSelected(null); };
  const chooseTab = (name: string) => { setActiveArea("CRM"); setActiveTab(name); setQuery(""); setSelected(null); };
  const openDeals = (search = "") => { setActiveArea("CRM"); setActiveTab("Сделки"); setSource("Все источники"); setQuery(search); setSelectedCompany(null); };

  const addDeal = () => {
    const deal: Deal = { id: Date.now(), stage: "new", title: "Новая заявка с сайта", contact: "Новый клиент", phone: "+7 999 000-00-00", amount: 0, source: "Сайт", task: "Позвонить за 5 минут", date: "только что" };
    setDeals((items) => [deal, ...items]); setSelected(deal); setActiveTab("Сделки");
    logActivity("CRM", "Создана новая сделка", deal.title); notify("Новая сделка создана");
  };

  const moveNext = (deal: Deal) => {
    const index = stages.findIndex((stage) => stage.id === deal.stage);
    if (index < 0 || index === stages.length - 1) return;
    const updated = { ...deal, stage: stages[index + 1].id };
    setDeals((items) => items.map((item) => item.id === deal.id ? updated : item)); setSelected(updated);
    logActivity("CRM", "Сделка перемещена", `${deal.title} → ${stages[index + 1].name}`); notify(`Сделка перенесена: ${stages[index + 1].name}`);
  };

  const addLead = () => {
    const lead: Lead = { id: Date.now(), title: "Новый объект на оценку", contact: "Новый лид", phone: "+7 999 000-00-00", source: "Сайт", status: "new", age: "только что" };
    setLeads((items) => [lead, ...items]); logActivity("CRM", "Добавлен лид", lead.title); notify("Новый лид добавлен");
  };

  const acceptLead = (lead: Lead) => {
    const deal: Deal = { id: Date.now(), stage: "new", title: lead.title, contact: lead.contact, phone: lead.phone, amount: 0, source: lead.source, task: "Уточнить объём и назначить замер", date: "только что" };
    setLeads((items) => items.filter((item) => item.id !== lead.id)); setDeals((items) => [deal, ...items]);
    logActivity("CRM", "Лид превращён в сделку", `${lead.contact} · ${lead.title}`); openDeals(); setSelected(deal); notify("Лид принят в работу");
  };

  const addTask = (event: FormEvent) => {
    event.preventDefault(); if (!taskDraft.trim()) return;
    const task: WorkTask = { id: Date.now(), title: taskDraft.trim(), client: "Без привязки", due: "сегодня", priority: "Сегодня", done: false };
    setTasks((items) => [task, ...items]); setTaskDraft(""); logActivity("Задачи", "Создана задача", task.title); notify("Задача добавлена");
  };

  const toggleTask = (id: number) => {
    const task = tasks.find((item) => item.id === id); if (!task) return;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, done: !item.done } : item));
    logActivity("Задачи", task.done ? "Задача возвращена" : "Задача выполнена", task.title); notify(task.done ? "Задача снова открыта" : "Задача выполнена");
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault(); if (!messageDraft.trim() || !selectedChat) return;
    const message = { from: "me" as const, text: messageDraft.trim(), time: "сейчас" };
    setChats((items) => items.map((chat) => chat.id === selectedChat.id ? { ...chat, unread: 0, messages: [...chat.messages, message] } : chat));
    logActivity("Чаты", "Сообщение отправлено", `${selectedChat.name}: ${message.text}`); setMessageDraft(""); notify("Сообщение добавлено в диалог");
  };

  const addChat = () => {
    const chat: Chat = { id: Date.now(), name: "Новый клиент", phone: "+7 999 000-00-00", channel: "Telegram", unread: 0, messages: [{ from: "me", text: "Здравствуйте! Чем можем помочь?", time: "сейчас" }] };
    setChats((items) => [chat, ...items]); setSelectedChatId(chat.id); notify("Новый чат открыт");
  };

  const exportReport = () => {
    const report = `Отчёт CRM Александра Науменко\nПериод: ${analyticsPeriod}\nСделок: ${deals.length}\nСумма в работе: ${money(workTotal)}\nОплачено: ${money(deals.filter((deal) => deal.stage === "paid").reduce((sum, deal) => sum + deal.amount, 0))}`;
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([report], { type: "text/plain;charset=utf-8" })); link.download = "crm-report.txt"; link.click(); URL.revokeObjectURL(link.href); notify("Отчёт подготовлен");
  };

  const renderDeals = () => {
    if (viewMode === "list") return <div className={styles.listView}><header><span>Сделка</span><span>Клиент</span><span>Стадия</span><span>Сумма</span><span>Дело</span></header>{filteredDeals.map((deal) => <button key={deal.id} onClick={() => setSelected(deal)}><span><small>№{deal.id} · {deal.source}</small><b>{deal.title}</b></span><span>{deal.contact}<small>{deal.phone}</small></span><span>{stages.find((stage) => stage.id === deal.stage)?.name}</span><strong>{money(deal.amount)}</strong><span>{deal.task}<small>{deal.date}</small></span></button>)}</div>;
    if (viewMode === "calendar") return <div className={styles.calendarView}>{stages.slice(0, 6).map((stage, index) => <section key={stage.id}><header><b>{22 + index} ИЮЛЯ</b><span>{stage.name}</span></header>{filteredDeals.filter((deal) => deal.stage === stage.id).map((deal) => <button key={deal.id} onClick={() => setSelected(deal)} style={{ "--stage": stage.color } as CSSProperties}><small>{deal.date}</small><b>{deal.title}</b><span>{deal.contact}</span></button>)}</section>)}</div>;
    return <div className={styles.board}>{stages.map((stage) => { const stageDeals = filteredDeals.filter((deal) => deal.stage === stage.id); const sum = stageDeals.reduce((value, deal) => value + deal.amount, 0); return <section className={styles.column} key={stage.id}><header style={{ "--stage": stage.color } as CSSProperties}><div><b>{stage.name}</b><span>{stageDeals.length}</span></div><small>{money(sum)}</small></header><div className={styles.cards}>{stageDeals.map((deal) => <button className={`${styles.deal} ${selected?.id === deal.id ? styles.selected : ""}`} onClick={() => setSelected(deal)} key={deal.id}><span className={styles.source}>{deal.source}</span><h3>{deal.title}</h3><p>{deal.contact}</p><strong>{money(deal.amount)}</strong><div><span>◷ {deal.task}</span><small>{deal.date}</small></div></button>)}<button onClick={addDeal} className={styles.quickAdd}>+ Быстрая сделка</button></div></section>; })}</div>;
  };

  const renderOverview = () => <div className={styles.dashboardScreen}>
    <div className={styles.kpiGrid}>
      <button onClick={() => chooseTab("Лиды")}><small>НОВЫЕ ЛИДЫ</small><b>{leads.length}</b><span>+2 за сегодня →</span></button>
      <button onClick={() => openDeals()}><small>СДЕЛКИ В РАБОТЕ</small><b>{deals.filter((deal) => deal.stage !== "paid").length}</b><span>{money(workTotal)} →</span></button>
      <button onClick={() => chooseArea("Задачи")}><small>ЗАДАЧИ НА СЕГОДНЯ</small><b>{tasks.filter((task) => !task.done).length}</b><span>1 срочная →</span></button>
      <button onClick={() => chooseTab("Аналитика")}><small>КОНВЕРСИЯ</small><b>36%</b><span>+4% за месяц →</span></button>
    </div>
    <section className={styles.overviewPipeline}><header><div><b>ВОРОНКА ПРОДАЖ</b><span>Нажмите стадию, чтобы открыть сделки</span></div><strong>{money(total)}</strong></header><div>{stages.map((stage) => { const count = deals.filter((deal) => deal.stage === stage.id).length; return <button key={stage.id} onClick={() => openDeals()} style={{ "--stage": stage.color, "--width": `${Math.max(16, count * 24)}%` } as CSSProperties}><span>{stage.name}</span><b>{count}</b><i /></button>; })}</div></section>
    <section className={styles.overviewBottom}><div><header><b>ПОСЛЕДНЯЯ АКТИВНОСТЬ</b><button onClick={() => chooseArea("Активность")}>Все события →</button></header>{activities.slice(0, 4).map((item) => <p key={item.id}><i /> <span><b>{item.title}</b>{item.text}</span><small>{item.time}</small></p>)}</div><div><header><b>БЫСТРЫЕ ДЕЙСТВИЯ</b></header><Link href="/parser">⌖ Найти клиентов на карте →</Link><button onClick={addDeal}>+ Новая сделка</button><button onClick={addLead}>+ Новый лид</button><button onClick={() => chooseArea("Чаты")}>Открыть чаты →</button></div></section>
  </div>;

  const renderLeads = () => { const visible = leads.filter((lead) => (leadFilter === "Все" || (leadFilter === "Новые" ? lead.status === "new" : lead.status === "qualified")) && `${lead.title} ${lead.contact}`.toLowerCase().includes(query.toLowerCase())); return <div className={styles.dataScreen}><div className={styles.segmented}>{["Все", "Новые", "Квалифицированные"].map((filter) => <button key={filter} className={leadFilter === filter ? styles.segmentActive : ""} onClick={() => setLeadFilter(filter)}>{filter}</button>)}</div><div className={styles.leadTable}><header><span>Лид</span><span>Контакт</span><span>Источник</span><span>Возраст</span><span>Действия</span></header>{visible.map((lead) => <article key={lead.id}><div><small>ЛИД #{lead.id}</small><b>{lead.title}</b></div><div><b>{lead.contact}</b><span>{lead.phone}</span></div><span>{lead.source}</span><span>{lead.age}</span><div><a href={phoneHref(lead.phone)}>Позвонить</a><button onClick={() => acceptLead(lead)}>В работу →</button></div></article>)}{visible.length === 0 && <p className={styles.empty}>Здесь пока нет лидов.</p>}</div></div>; };

  const renderContacts = () => <div className={styles.contactGrid}>{contacts.map((contact) => <article key={contact.phone}><header><i>{contact.name.slice(0, 1)}</i><span><b>{contact.name}</b><small>{contact.source}</small></span></header><p>{contact.phone}</p><div><span><b>{contact.deals}</b> сделок</span><span><b>{money(contact.amount)}</b> сумма</span></div><footer><a href={phoneHref(contact.phone)}>Позвонить</a><button onClick={() => openDeals(contact.name)}>Сделки →</button></footer></article>)}</div>;

  const renderCompanies = () => <div className={styles.companyLayout}><div className={styles.companyList}><header><span>Компания</span><span>Контакт</span><span>Объекты</span><span>Оборот</span><span /></header>{companies.filter((company) => `${company.name} ${company.contact}`.toLowerCase().includes(query.toLowerCase())).map((company) => <article key={company.id}><b>{company.name}</b><span>{company.contact}<small>{company.phone}</small></span><strong>{company.objects}</strong><strong>{money(company.revenue)}</strong><button onClick={() => setSelectedCompany(company)}>Открыть →</button></article>)}</div>{selectedCompany && <aside className={styles.companyCard}><header><span>КАРТОЧКА КОМПАНИИ</span><button onClick={() => setSelectedCompany(null)}>×</button></header><h2>{selectedCompany.name}</h2><p>Основной контакт: <b>{selectedCompany.contact}</b></p><p>{selectedCompany.phone}</p><div><span>Объектов</span><b>{selectedCompany.objects}</b></div><div><span>Оборот</span><b>{money(selectedCompany.revenue)}</b></div><a href={phoneHref(selectedCompany.phone)}>ПОЗВОНИТЬ</a><button onClick={() => openDeals(selectedCompany.search)}>СДЕЛКИ КОМПАНИИ →</button></aside>}</div>;

  const renderAnalytics = () => { const factor = analyticsPeriod === "Неделя" ? .42 : analyticsPeriod === "Квартал" ? 2.4 : 1; const sourceStats = [{ name: "Сайт", value: 42, amount: 884000 }, { name: "Яндекс", value: 26, amount: 464000 }, { name: "Рекомендация", value: 21, amount: 1120000 }, { name: "Авито", value: 11, amount: 110000 }]; return <div className={styles.analyticsScreen}><div className={styles.segmented}>{["Неделя", "Месяц", "Квартал"].map((period) => <button key={period} className={analyticsPeriod === period ? styles.segmentActive : ""} onClick={() => setAnalyticsPeriod(period)}>{period}</button>)}</div><div className={styles.analyticsKpis}><article><small>ВЫРУЧКА</small><b>{money(Math.round(2548000 * factor))}</b><span>↑ 18% к прошлому периоду</span></article><article><small>СРЕДНИЙ ЧЕК</small><b>{money(Math.round(283000 * factor))}</b><span>9 оплаченных объектов</span></article><article><small>КОНВЕРСИЯ В СДЕЛКУ</small><b>36%</b><span>Цель: 40%</span></article></div><section className={styles.revenueChart}><header><b>ДИНАМИКА ВЫРУЧКИ</b><span>{analyticsPeriod}</span></header><div>{[38, 62, 45, 78, 58, 92, 73, 100].map((height, index) => <i key={index} style={{ height: `${height}%` }}><span>{Math.round(height * factor * 24)}к</span></i>)}</div></section><section className={styles.sourceAnalytics}><header><b>ИСТОЧНИКИ ЗАЯВОК</b><span>Нажмите источник, чтобы открыть сделки</span></header>{sourceStats.map((item) => <button key={item.name} onClick={() => { setSource(item.name); openDeals(); setSource(item.name); }}><span>{item.name}</span><i><b style={{ width: `${item.value}%` }} /></i><strong>{item.value}%</strong><small>{money(Math.round(item.amount * factor))}</small></button>)}</section></div>; };

  const renderActivity = () => { const visible = activities.filter((item) => activityFilter === "Все" || item.type === activityFilter); return <div className={styles.activityScreen}><div className={styles.segmented}>{["Все", "CRM", "Задачи", "Чаты"].map((filter) => <button key={filter} className={activityFilter === filter ? styles.segmentActive : ""} onClick={() => setActivityFilter(filter)}>{filter}</button>)}</div><div className={styles.activityFeed}>{visible.map((item) => <button key={item.id} onClick={() => item.type === "CRM" ? openDeals() : chooseArea(item.type)}><i>{item.type === "CRM" ? "▦" : item.type === "Задачи" ? "✓" : "◫"}</i><span><small>{item.type}</small><b>{item.title}</b><p>{item.text}</p></span><time>{item.time}</time></button>)}</div></div>; };

  const renderTasks = () => { const visible = tasks.filter((task) => (taskFilter === "Все" || (taskFilter === "Открытые" ? !task.done : task.done)) && `${task.title} ${task.client}`.toLowerCase().includes(query.toLowerCase())); return <div className={styles.taskScreen}><form onSubmit={addTask}><input value={taskDraft} onChange={(event) => setTaskDraft(event.target.value)} placeholder="Новая задача..." /><button type="submit">+ ДОБАВИТЬ</button></form><div className={styles.segmented}>{["Открытые", "Выполненные", "Все"].map((filter) => <button key={filter} className={taskFilter === filter ? styles.segmentActive : ""} onClick={() => setTaskFilter(filter)}>{filter}</button>)}</div><div className={styles.taskList}>{visible.map((task) => <article key={task.id} className={task.done ? styles.taskDone : ""}><button onClick={() => toggleTask(task.id)} aria-label={task.done ? "Вернуть задачу" : "Выполнить задачу"}>{task.done ? "✓" : ""}</button><span><b>{task.title}</b><small>{task.client}</small></span><i className={task.priority === "Срочно" ? styles.urgent : ""}>{task.priority}</i><time>{task.due}</time><button onClick={() => toggleTask(task.id)}>{task.done ? "Вернуть" : "Выполнить"}</button></article>)}</div></div>; };

  const renderChats = () => <div className={styles.chatScreen}><aside>{chats.filter((chat) => chat.name.toLowerCase().includes(query.toLowerCase())).map((chat) => <button key={chat.id} className={selectedChat?.id === chat.id ? styles.chatActive : ""} onClick={() => { setSelectedChatId(chat.id); setChats((items) => items.map((item) => item.id === chat.id ? { ...item, unread: 0 } : item)); }}><i>{chat.name.slice(0, 1)}</i><span><b>{chat.name}</b><small>{chat.channel} · {chat.messages.at(-1)?.text}</small></span>{chat.unread > 0 && <strong>{chat.unread}</strong>}</button>)}</aside>{selectedChat && <section><header><div><b>{selectedChat.name}</b><span>{selectedChat.channel} · {selectedChat.phone}</span></div><a href={phoneHref(selectedChat.phone)}>Позвонить</a></header><div className={styles.messages}>{selectedChat.messages.map((message, index) => <p key={`${message.time}-${index}`} className={message.from === "me" ? styles.messageMine : ""}><span>{message.text}</span><small>{message.time}</small></p>)}</div><div className={styles.quickReplies}><button onClick={() => setMessageDraft("Пришлите, пожалуйста, фотографии объекта.")}>Запросить фото</button><button onClick={() => setMessageDraft("Предлагаю назначить выезд на замер.")}>Назначить выезд</button></div><form onSubmit={sendMessage}><input value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Напишите сообщение..." /><button type="submit">ОТПРАВИТЬ →</button></form></section>}</div>;

  const crmSubtitle: Record<string, string> = { "Обзор": "Сводка бизнеса", "Лиды": "Неразобранные обращения", "Сделки": "Основная воронка", "Контакты": "Клиентская база", "Компании": "Корпоративные заказчики", "Аналитика": "Продажи и источники" };
  const renderCrmContent = () => activeTab === "Обзор" ? renderOverview() : activeTab === "Лиды" ? renderLeads() : activeTab === "Сделки" ? <><div className={styles.tools}><button onClick={() => setViewMode("kanban")} className={viewMode === "kanban" ? styles.kanban : ""}>▦ Канбан</button><button onClick={() => setViewMode("list")} className={viewMode === "list" ? styles.kanban : ""}>☷ Список</button><button onClick={() => setViewMode("calendar")} className={viewMode === "calendar" ? styles.kanban : ""}>◫ Календарь</button><span /><div className={styles.filterWrap}><button onClick={() => setFilterOpen((open) => !open)}>Фильтр{source === "Все источники" ? " +" : `: ${source}`}</button>{filterOpen && <div className={styles.filterMenu}>{sources.map((item) => <button key={item} onClick={() => { setSource(item); setFilterOpen(false); }}>{item}{source === item ? " ✓" : ""}</button>)}</div>}</div><button onClick={() => setModal("settings")} title="Настройки">⚙</button></div>{renderDeals()}</> : activeTab === "Контакты" ? renderContacts() : activeTab === "Компании" ? renderCompanies() : renderAnalytics();

  const crmHeaderAction = () => activeTab === "Обзор" ? <button onClick={() => openDeals()}>ОТКРЫТЬ ВОРОНКУ →</button> : activeTab === "Лиды" ? <button onClick={addLead}>+ ДОБАВИТЬ ЛИД</button> : activeTab === "Сделки" ? <button onClick={addDeal}>+ ДОБАВИТЬ СДЕЛКУ</button> : activeTab === "Контакты" ? <button onClick={() => { const contact = { name: "Новый контакт", phone: `+7 999 000-${String(manualContacts.length + 1).padStart(2, "0")}-00`, source: "Вручную" }; setManualContacts((items) => [contact, ...items]); notify("Контакт добавлен"); }}>+ ДОБАВИТЬ КОНТАКТ</button> : activeTab === "Компании" ? <button onClick={() => { const company: Company = { id: Date.now(), name: "Новая компания", contact: "Новый контакт", phone: "+7 495 000-00-00", objects: 0, revenue: 0, search: "Новая компания" }; setCompanies((items) => [company, ...items]); setSelectedCompany(company); notify("Компания добавлена"); }}>+ ДОБАВИТЬ КОМПАНИЮ</button> : <button onClick={exportReport}>СКАЧАТЬ ОТЧЁТ ↓</button>;

  const areaTitle = activeArea === "Активность" ? ["Активность", "Все события CRM"] : activeArea === "Задачи" ? ["Задачи", `${tasks.filter((task) => !task.done).length} открытых задач`] : activeArea === "Чаты" ? ["Чаты", `${chats.reduce((sum, chat) => sum + chat.unread, 0)} непрочитанных`] : ["Аналитика", "Сводный отчёт продаж"];

  return <main className={styles.crm}>
    <aside className={styles.sidebar}><Link href="/" className={styles.bitrix}><i>24</i><span>битрикс</span></Link><nav>{sidebarItems.map(([name, icon]) => <button key={name} onClick={() => chooseArea(name)} className={activeArea === name ? styles.active : ""} title={name}><span>{icon}</span><small>{name}</small></button>)}</nav><div className={styles.avatar}>Н</div></aside>
    <section className={styles.workspace}>
      <header className={styles.topbar}><div><b>АЛЕКСАНДР НАУМЕНКО</b><span>Москва и Московская область</span></div><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск в CRM" /></label><button onClick={() => setModal("help")} className={styles.help} title="Помощь">?</button><div className={styles.user}><i>АН</i><span>Александр Науменко<br /><small>Администратор</small></span></div></header>
      {activeArea === "CRM" ? <div className={styles.crmNav}><div><b>CRM</b>{crmTabs.map((tab) => <button key={tab} onClick={() => chooseTab(tab)} className={activeTab === tab ? styles.tabActive : ""}>{tab}</button>)}</div><Link href="/">← Вернуться на сайт</Link></div> : <div className={styles.crmNav}><div><b>{activeArea}</b></div><Link href="/">← Вернуться на сайт</Link></div>}
      <div className={styles.contentHeader}><div><h1>{activeArea === "CRM" ? activeTab : areaTitle[0]}</h1><span>{activeArea === "CRM" ? crmSubtitle[activeTab] : areaTitle[1]}</span></div><div className={styles.stats}><span><b>{deals.length}</b> сделок</span><span><b>{money(workTotal)}</b> в работе</span><span className={styles.live}><i /> CRM работает</span></div>{activeArea === "CRM" ? crmHeaderAction() : activeArea === "Активность" ? <button onClick={() => { logActivity("CRM", "Синхронизация выполнена", "Все данные актуальны"); notify("Активность обновлена"); }}>ОБНОВИТЬ ↻</button> : activeArea === "Чаты" ? <button onClick={addChat}>+ НОВЫЙ ЧАТ</button> : activeArea === "Аналитика" ? <button onClick={exportReport}>СКАЧАТЬ ОТЧЁТ ↓</button> : <button onClick={() => setTaskDraft("Позвонить новому клиенту")}>+ НОВАЯ ЗАДАЧА</button>}</div>
      {activeArea === "CRM" ? renderCrmContent() : activeArea === "Активность" ? renderActivity() : activeArea === "Задачи" ? renderTasks() : activeArea === "Чаты" ? renderChats() : renderAnalytics()}
    </section>

    {selected && <aside className={styles.drawer}><header><span>СДЕЛКА №{selected.id}</span><button onClick={() => setSelected(null)}>×</button></header><div className={styles.drawerTitle}><span>{selected.source}</span><h2>{selected.title}</h2><strong>{money(selected.amount)}</strong></div><div className={styles.stageTrack}>{stages.map((stage) => <i key={stage.id} className={stages.findIndex((item) => item.id === stage.id) <= stages.findIndex((item) => item.id === selected.stage) ? styles.done : ""} />)}</div><div className={styles.taskBox}><small>БЛИЖАЙШЕЕ ДЕЛО</small><b>{selected.task}</b><span>Сегодня · Ответственный: Александр Науменко</span></div><dl><div><dt>Клиент</dt><dd>{selected.contact}</dd></div><div><dt>Телефон</dt><dd>{selected.phone}</dd></div><div><dt>Источник</dt><dd>{selected.source}</dd></div><div><dt>Тип объекта</dt><dd>Жилое помещение</dd></div><div><dt>Вывоз мусора</dt><dd>Да, включён</dd></div><div><dt>Ответственный</dt><dd>Александр Науменко</dd></div></dl><div className={styles.timeline}><b>История</b><p><i /> Сделка создана · {selected.date}</p><p><i /> Запущен робот «Перезвонить»</p></div><footer><a href={phoneHref(selected.phone)}>ПОЗВОНИТЬ</a><button onClick={() => moveNext(selected)} disabled={selected.stage === "paid"}>{selected.stage === "paid" ? "СДЕЛКА ЗАВЕРШЕНА ✓" : "НА СЛЕДУЮЩУЮ СТАДИЮ →"}</button></footer></aside>}
    {modal && <div className={styles.modalBackdrop} onMouseDown={() => setModal(null)}><section className={styles.modal} onMouseDown={(event) => event.stopPropagation()}><header><b>{modal === "help" ? "Помощь по CRM" : "Настройки воронки"}</b><button onClick={() => setModal(null)}>×</button></header>{modal === "help" ? <><p>Все разделы прототипа интерактивны: лиды превращаются в сделки, задачи закрываются, сообщения добавляются в чаты, а отчёт можно скачать.</p><a href="tel:+79853584978">Позвонить Александру: +7 (985) 358-49-78</a></> : <><label><input type="checkbox" defaultChecked /> Уведомлять о новой заявке</label><label><input type="checkbox" defaultChecked /> Ставить задачу «Перезвонить»</label><label><input type="checkbox" defaultChecked /> Показывать сумму воронки</label></>}<button className={styles.modalSave} onClick={() => { setModal(null); notify(modal === "help" ? "Помощь закрыта" : "Настройки сохранены"); }}>{modal === "help" ? "ПОНЯТНО" : "СОХРАНИТЬ"}</button></section></div>}
    {toast && <div className={styles.toast}>{toast}</div>}
  </main>;
}
