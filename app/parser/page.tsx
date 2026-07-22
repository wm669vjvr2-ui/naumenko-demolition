"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./parser.module.css";

type MapLead = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviews: number;
  point: { lat: number; lon: number };
  source: "demo" | "2gis";
  priority: number;
};

const categories = ["Строительные компании", "Управляющие компании", "Ремонт помещений", "Агентства недвижимости", "Архитектурные бюро", "Складские комплексы"];
const hashId = (value: string) => 800000 + Math.abs(Array.from(value).reduce((sum, char) => ((sum << 5) - sum) + char.charCodeAt(0), 0)) % 199999;
const cleanCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export default function ParserPage() {
  const [selectedCategories, setSelectedCategories] = useState(categories);
  const [region, setRegion] = useState("Москва и область");
  const [minRating, setMinRating] = useState(4);
  const [onlyPhone, setOnlyPhone] = useState(false);
  const [onlySite, setOnlySite] = useState(false);
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [resultsMode, setResultsMode] = useState<"demo" | "live">("demo");
  const [sortBy, setSortBy] = useState<"priority" | "rating" | "name">("priority");
  const [leads, setLeads] = useState<MapLead[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [activeLead, setActiveLead] = useState<MapLead | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [lastSearch, setLastSearch] = useState("не запускался");

  const endpoint = typeof window !== "undefined" && window.location.hostname.endsWith("github.io")
    ? "https://naumenko-demolition.daniilsedic.chatgpt.site/api/map-leads"
    : "/api/map-leads";

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };

  const runSearch = async (searchMode = mode) => {
    if (!selectedCategories.length) { setError("Выберите хотя бы одну категорию"); return; }
    setScanning(true); setProgress(8); setError(""); setSelected(new Set()); setActiveLead(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: searchMode === "demo", region, queries: selectedCategories }),
      });
      const data = await response.json() as { ok?: boolean; mode?: "demo" | "live"; items?: MapLead[]; message?: string; error?: string };
      if (!response.ok || !data.ok) {
        if (data.error === "DGIS_API_KEY_MISSING") throw new Error("Ключ 2ГИС ещё не добавлен. Переключитесь в деморежим или добавьте DGIS_API_KEY.");
        throw new Error(data.message || "Не удалось выполнить поиск");
      }
      setProgress(100); setLeads(data.items || []); setResultsMode(data.mode || searchMode); setLastSearch(new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
      notify(`Найдено организаций: ${(data.items || []).length}`);
    } catch (searchError) {
      setLeads([]); setError(searchError instanceof Error ? searchError.message : "Ошибка поиска");
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("naumenko_parser_sent");
    if (stored) try { setSentIds(new Set(JSON.parse(stored) as string[])); } catch { /* ignore invalid local demo state */ }
    void runSearch("demo");
    // Initial demo search intentionally runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!scanning) return;
    const timer = window.setInterval(() => setProgress((value) => Math.min(92, value + 7)), 160);
    return () => window.clearInterval(timer);
  }, [scanning]);

  const filtered = useMemo(() => {
    const items = leads.filter((lead) => lead.rating >= minRating && (!onlyPhone || Boolean(lead.phone)) && (!onlySite || Boolean(lead.website)));
    return [...items].sort((a, b) => sortBy === "rating" ? b.rating - a.rating : sortBy === "name" ? a.name.localeCompare(b.name, "ru") : b.priority - a.priority);
  }, [leads, minRating, onlyPhone, onlySite, sortBy]);

  const selectedLeads = filtered.filter((lead) => selected.has(lead.id));
  const toggleCategory = (category: string) => setSelectedCategories((items) => items.includes(category) ? items.filter((item) => item !== category) : [...items, category]);
  const toggleLead = (id: string) => setSelected((items) => { const next = new Set(items); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((lead) => lead.id)));

  const saveSearch = () => {
    localStorage.setItem("naumenko_parser_search", JSON.stringify({ selectedCategories, region, minRating, onlyPhone, onlySite, mode }));
    notify("Настройки поиска сохранены на этом устройстве");
  };

  const exportCsv = () => {
    const rows = (selectedLeads.length ? selectedLeads : filtered).map((lead) => [lead.name, lead.category, lead.address, lead.phone, lead.website, lead.rating, lead.priority, lead.source].map(cleanCsv).join(";"));
    const csv = `\uFEFF${["Компания", "Категория", "Адрес", "Телефон", "Сайт", "Рейтинг", "Приоритет", "Источник"].map(cleanCsv).join(";")}\n${rows.join("\n")}`;
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); link.download = "leads-map-parser.csv"; link.click(); URL.revokeObjectURL(link.href);
    notify(`CSV подготовлен: ${rows.length} строк`);
  };

  const sendToCrm = () => {
    if (!selectedLeads.length) { notify("Сначала выберите организации"); return; }
    const existing = (() => { try { return JSON.parse(localStorage.getItem("naumenko_parser_leads") || "[]") as unknown[]; } catch { return []; } })();
    const prepared = selectedLeads.map((lead) => ({ id: hashId(lead.id), title: `Партнёрство: ${lead.category}`, contact: lead.name, phone: lead.phone || "Телефон требует доступа API", source: "Парсер карт", status: "new", age: "только что" }));
    const ids = new Set(prepared.map((lead) => lead.id));
    localStorage.setItem("naumenko_parser_leads", JSON.stringify([...prepared, ...existing.filter((value) => !ids.has(Number((value as { id?: unknown }).id)))]));
    const nextSent = new Set([...sentIds, ...selectedLeads.map((lead) => lead.id)]); setSentIds(nextSent); localStorage.setItem("naumenko_parser_sent", JSON.stringify(Array.from(nextSent))); setSelected(new Set());
    notify(`В CRM передано лидов: ${prepared.length}`);
  };

  const markerStyle = (lead: MapLead) => {
    const x = Math.max(6, Math.min(94, 50 + (lead.point.lon - 37.6173) * 76));
    const y = Math.max(7, Math.min(92, 50 - (lead.point.lat - 55.7558) * 112));
    return { left: `${x}%`, top: `${y}%` };
  };

  return <main className={styles.parser}>
    <aside className={styles.sidebar}>
      <Link href="/crm" className={styles.brand}><i>24</i><span>РАЗВЕДКА<br />ЛИДОВ</span></Link>
      <nav><Link href="/crm">▦<span>CRM</span></Link><Link className={styles.navActive} href="/parser">⌖<span>Парсер</span></Link><Link href="/">↗<span>Сайт</span></Link></nav>
      <div className={styles.avatar}>АН</div>
    </aside>

    <section className={styles.workspace}>
      <header className={styles.topbar}>
        <div><span>ИНСТРУМЕНТ ПРОДАЖ</span><h1>ПАРСЕР КАРТ</h1></div>
        <div className={styles.apiState}><i className={mode === "live" ? styles.liveDot : ""} /><span>{mode === "demo" ? "Демоданные" : "Places API 2ГИС"}<small>{mode === "demo" ? "Без реальных контактов" : "Нужен DGIS_API_KEY"}</small></span></div>
        <button onClick={saveSearch}>СОХРАНИТЬ ПОИСК</button>
        <Link href="/crm">← В CRM</Link>
      </header>

      <div className={styles.body}>
        <aside className={styles.filters}>
          <div className={styles.filterTitle}><span>ПАРАМЕТРЫ</span><b>{selectedCategories.length} категорий</b></div>
          <label>Режим данных<div className={styles.modeSwitch}><button className={mode === "demo" ? styles.modeActive : ""} onClick={() => setMode("demo")}>Демо</button><button className={mode === "live" ? styles.modeActive : ""} onClick={() => setMode("live")}>Живой API</button></div></label>
          <label>Территория<select value={region} onChange={(event) => setRegion(event.target.value)}><option>Москва и область</option><option>Москва</option><option>Московская область</option></select></label>
          <fieldset><legend>Кого искать</legend>{categories.map((category) => <label key={category} className={styles.check}><input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} /><span>{category}</span></label>)}</fieldset>
          <label>Рейтинг от <b>{minRating.toFixed(1)}</b><input type="range" min="0" max="5" step="0.1" value={minRating} onChange={(event) => setMinRating(Number(event.target.value))} /></label>
          <label className={styles.check}><input type="checkbox" checked={onlyPhone} onChange={(event) => setOnlyPhone(event.target.checked)} /><span>Только с телефоном</span></label>
          <label className={styles.check}><input type="checkbox" checked={onlySite} onChange={(event) => setOnlySite(event.target.checked)} /><span>Только с сайтом</span></label>
          <button className={styles.searchButton} onClick={() => void runSearch()} disabled={scanning}>{scanning ? `ИЩЕМ… ${progress}%` : "ЗАПУСТИТЬ ПОИСК →"}</button>
          <div className={styles.progress}><i style={{ width: `${progress}%` }} /></div>
          <small>Последний поиск: {lastSearch}</small>
        </aside>

        <section className={styles.content}>
          {error && <div className={styles.error}><b>Поиск не запущен</b><span>{error}</span><button onClick={() => { setMode("demo"); void runSearch("demo"); }}>ОТКРЫТЬ ДЕМОРЕЖИМ</button></div>}
          <div className={styles.stats}>
            <article><span>НАЙДЕНО</span><b>{filtered.length}</b><small>организаций</small></article>
            <article><span>ВЫСОКИЙ ПРИОРИТЕТ</span><b>{filtered.filter((lead) => lead.priority >= 85).length}</b><small>позвонить первыми</small></article>
            <article><span>С ТЕЛЕФОНОМ</span><b>{filtered.filter((lead) => lead.phone).length}</b><small>{resultsMode === "live" ? "зависит от тарифа API" : "демоданные"}</small></article>
            <article><span>В CRM</span><b>{filtered.filter((lead) => sentIds.has(lead.id)).length}</b><small>на этом устройстве</small></article>
          </div>

          <div className={styles.mapPanel}>
            <header><div><b>МОСКВА И МОСКОВСКАЯ ОБЛАСТЬ</b><span>{resultsMode === "demo" ? "Схематичная карта · демонстрационные организации" : "Результаты Places API 2ГИС"}</span></div><strong>{scanning ? "СКАНИРОВАНИЕ" : "ГОТОВО"}<i /></strong></header>
            <div className={styles.map}>
              <div className={styles.river} /><div className={styles.ring} /><div className={styles.centerRing} />
              {Array.from({ length: 13 }).map((_, index) => <i className={styles.road} key={index} style={{ transform: `rotate(${index * 27}deg)` }} />)}
              {filtered.map((lead, index) => <button key={lead.id} className={`${styles.marker} ${selected.has(lead.id) ? styles.markerSelected : ""} ${sentIds.has(lead.id) ? styles.markerSent : ""}`} style={markerStyle(lead)} onClick={() => { toggleLead(lead.id); setActiveLead(lead); }} title={lead.name}><span>{index + 1}</span></button>)}
              {scanning && <div className={styles.scanPulse} />}
              <div className={styles.mapLegend}><span><i /> Найдено</span><span><i /> Выбрано</span><span><i /> В CRM</span></div>
            </div>
          </div>

          <div className={styles.resultsHeader}>
            <div><button onClick={toggleAll}>{selected.size === filtered.length && filtered.length ? "СНЯТЬ ВЫБОР" : "ВЫБРАТЬ ВСЕ"}</button><span>Выбрано: <b>{selected.size}</b></span></div>
            <div><label>Сортировка<select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}><option value="priority">По приоритету</option><option value="rating">По рейтингу</option><option value="name">По названию</option></select></label><button onClick={exportCsv}>CSV ↓</button><button className={styles.crmButton} onClick={sendToCrm}>В CRM: {selected.size} →</button></div>
          </div>

          <div className={styles.table}>
            <header><span /><span>Организация</span><span>Категория</span><span>Контакты</span><span>Рейтинг</span><span>Приоритет</span><span /></header>
            {filtered.map((lead) => <article key={lead.id} className={selected.has(lead.id) ? styles.rowSelected : ""}>
              <label><input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleLead(lead.id)} /></label>
              <div><b>{lead.name}</b><small>{lead.address}</small></div><span>{lead.category}</span><div><b>{lead.phone || "Нет в тарифе API"}</b><small>{lead.website || "Сайт не указан"}</small></div>
              <strong>★ {lead.rating.toFixed(1)}<small>{lead.reviews} отзывов</small></strong><i className={lead.priority >= 85 ? styles.hot : ""}>{lead.priority}</i><button onClick={() => setActiveLead(lead)}>Открыть →</button>
            </article>)}
            {!filtered.length && !scanning && <div className={styles.empty}>По заданным фильтрам организаций нет.</div>}
          </div>
        </section>
      </div>
    </section>

    {activeLead && <aside className={styles.drawer}>
      <header><span>{activeLead.source === "demo" ? "ДЕМО-КАРТОЧКА" : "2ГИС · ОРГАНИЗАЦИЯ"}</span><button onClick={() => setActiveLead(null)}>×</button></header>
      <div className={styles.drawerScore}><i>{activeLead.priority}</i><span>приоритет лида</span></div><h2>{activeLead.name}</h2><p>{activeLead.category}</p>
      <dl><div><dt>Адрес</dt><dd>{activeLead.address}</dd></div><div><dt>Телефон</dt><dd>{activeLead.phone || "Нужен расширенный доступ API"}</dd></div><div><dt>Сайт</dt><dd>{activeLead.website || "Не указан"}</dd></div><div><dt>Рейтинг</dt><dd>{activeLead.rating.toFixed(1)} · {activeLead.reviews} отзывов</dd></div><div><dt>Источник</dt><dd>{activeLead.source === "demo" ? "Демонстрационные данные" : "Places API 2ГИС"}</dd></div></dl>
      <div className={styles.reason}><b>ПОЧЕМУ В ПРИОРИТЕТЕ</b><span>Подходит для партнёрства по демонтажу, есть публичный контакт и активная карточка организации.</span></div>
      <footer>{activeLead.phone && <a href={`tel:${activeLead.phone.replace(/[^+\d]/g, "")}`}>ПОЗВОНИТЬ</a>}<button onClick={() => { if (!selected.has(activeLead.id)) toggleLead(activeLead.id); setActiveLead(null); notify("Лид добавлен в выборку"); }}>ДОБАВИТЬ В ВЫБОРКУ →</button></footer>
    </aside>}
    {toast && <div className={styles.toast}>{toast}</div>}
  </main>;
}
