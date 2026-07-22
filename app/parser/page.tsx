"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
  const [category, setCategory] = useState(categories[0]);
  const [region, setRegion] = useState("Москва и область");
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [leads, setLeads] = useState<MapLead[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [activeLead, setActiveLead] = useState<MapLead | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const endpoint = typeof window !== "undefined" && window.location.hostname.endsWith("github.io")
    ? "https://naumenko-demolition.daniilsedic.chatgpt.site/api/map-leads"
    : "/api/map-leads";

  const sortedLeads = useMemo(() => [...leads].sort((a, b) => b.priority - a.priority), [leads]);
  const selectedLeads = sortedLeads.filter((lead) => selected.has(lead.id));
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };

  const runSearch = async (searchMode = mode) => {
    setScanning(true);
    setProgress(12);
    setError("");
    setSelected(new Set());
    setActiveLead(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: searchMode === "demo", region, queries: [category] }),
      });
      const data = await response.json() as { ok?: boolean; items?: MapLead[]; message?: string; error?: string };
      if (!response.ok || !data.ok) {
        if (data.error === "DGIS_API_KEY_MISSING") throw new Error("Для живого поиска осталось добавить ключ 2ГИС. Деморежим уже работает.");
        throw new Error(data.message || "Не удалось выполнить поиск");
      }
      setProgress(100);
      setLeads(data.items || []);
      notify(`Найдено компаний: ${(data.items || []).length}`);
    } catch (searchError) {
      setLeads([]);
      setError(searchError instanceof Error ? searchError.message : "Ошибка поиска");
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("naumenko_parser_sent");
    if (stored) try { setSentIds(new Set(JSON.parse(stored) as string[])); } catch { /* ignore invalid local prototype state */ }
    void runSearch("demo");
    // The first screen opens with useful demo results.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!scanning) return;
    const timer = window.setInterval(() => setProgress((value) => Math.min(92, value + 8)), 150);
    return () => window.clearInterval(timer);
  }, [scanning]);

  const submitSearch = (event: FormEvent) => { event.preventDefault(); void runSearch(); };
  const toggleLead = (id: string) => setSelected((items) => { const next = new Set(items); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const sendToCrm = (chosen: MapLead[]) => {
    if (!chosen.length) { notify("Сначала выберите хотя бы одну компанию"); return; }
    const existing = (() => { try { return JSON.parse(localStorage.getItem("naumenko_parser_leads") || "[]") as unknown[]; } catch { return []; } })();
    const prepared = chosen.map((lead) => ({ id: hashId(lead.id), title: `Партнёрство: ${lead.category}`, contact: lead.name, phone: lead.phone || "Телефон требует доступа API", source: "Парсер карт", status: "new", age: "только что" }));
    const preparedIds = new Set(prepared.map((lead) => lead.id));
    localStorage.setItem("naumenko_parser_leads", JSON.stringify([...prepared, ...existing.filter((value) => !preparedIds.has(Number((value as { id?: unknown }).id)))]));
    const nextSent = new Set([...sentIds, ...chosen.map((lead) => lead.id)]);
    setSentIds(nextSent);
    setSelected((items) => new Set([...items].filter((id) => !nextSent.has(id))));
    localStorage.setItem("naumenko_parser_sent", JSON.stringify(Array.from(nextSent)));
    notify(chosen.length === 1 ? "Компания добавлена в лиды CRM" : `В CRM добавлено лидов: ${chosen.length}`);
  };

  const exportCsv = () => {
    const rows = sortedLeads.map((lead) => [lead.name, lead.category, lead.address, lead.phone, lead.website, lead.rating, lead.priority, lead.source].map(cleanCsv).join(";"));
    const csv = `\uFEFF${["Компания", "Категория", "Адрес", "Телефон", "Сайт", "Рейтинг", "Приоритет", "Источник"].map(cleanCsv).join(";")}\n${rows.join("\n")}`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "leads-map-parser.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    notify(`Скачано компаний: ${rows.length}`);
  };

  const markerStyle = (lead: MapLead) => {
    const x = Math.max(6, Math.min(94, 50 + (lead.point.lon - 37.6173) * 76));
    const y = Math.max(7, Math.min(92, 50 - (lead.point.lat - 55.7558) * 112));
    return { left: `${x}%`, top: `${y}%` };
  };

  return <main className={styles.parser}>
    <aside className={styles.sidebar}>
      <Link href="/parser" className={styles.brand}><i>24</i><span>ЛИДЫ</span></Link>
      <nav><Link className={styles.navActive} href="/parser"><b>⌖</b><span>Поиск</span></Link><button onClick={exportCsv}><b>☷</b><span>Списки</span></button><Link href="/crm"><b>▦</b><span>CRM</span></Link></nav>
      <div className={styles.avatar}>АН</div>
    </aside>

    <section className={styles.workspace}>
      <header className={styles.topbar}>
        <div><span>ИНСТРУМЕНТ ПРОДАЖ</span><h1>Поиск клиентов</h1></div>
        <div className={styles.modeSwitch} aria-label="Режим поиска"><button className={mode === "demo" ? styles.modeActive : ""} onClick={() => setMode("demo")}>Демо</button><button className={mode === "live" ? styles.modeActive : ""} onClick={() => setMode("live")}>2ГИС API</button></div>
        <div className={styles.topAvatar}>АН</div>
      </header>

      <div className={styles.page}>
        <form className={styles.searchPanel} onSubmit={submitSearch}>
          <strong>НАСТРОЙТЕ ПОИСК ЗА 10 СЕКУНД</strong>
          <label><span>1. КОГО ИЩЕМ</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>2. ГДЕ ИЩЕМ</span><select value={region} onChange={(event) => setRegion(event.target.value)}><option>Москва и область</option><option>Москва</option><option>Московская область</option></select></label>
          <button type="submit" disabled={scanning}><i />{scanning ? `ИЩЕМ КЛИЕНТОВ · ${progress}%` : "НАЙТИ КЛИЕНТОВ"}</button>
          {scanning && <div className={styles.progress}><i style={{ width: `${progress}%` }} /></div>}
        </form>

        {error && <div className={styles.error}><span><b>Живой поиск пока не подключён</b>{error}</span><button onClick={() => { setMode("demo"); void runSearch("demo"); }}>ОТКРЫТЬ ДЕМОРЕЖИМ</button></div>}

        <div className={styles.resultsLayout}>
          <section className={styles.mapCard}>
            <header><div><span>КАРТА</span><b>{region}</b></div><strong><i /> {sortedLeads.length} найдено</strong></header>
            <div className={styles.map}>
              <div className={styles.river} /><div className={styles.ring} /><div className={styles.centerRing} />
              {Array.from({ length: 10 }).map((_, index) => <i className={styles.road} key={index} style={{ transform: `rotate(${index * 36}deg)` }} />)}
              {sortedLeads.map((lead, index) => <button key={lead.id} aria-label={`Открыть ${lead.name}`} className={`${styles.marker} ${selected.has(lead.id) ? styles.markerSelected : ""} ${sentIds.has(lead.id) ? styles.markerSent : ""}`} style={markerStyle(lead)} onClick={() => setActiveLead(lead)}><span>{index + 1}</span></button>)}
              {scanning && <div className={styles.scanPulse} />}
              <div className={styles.mapLegend}><span><i /> Найдено</span><span><i /> Выбрано</span><span><i /> В CRM</span></div>
            </div>
          </section>

          <section className={styles.resultsCard}>
            <header><div><span>РЕЗУЛЬТАТЫ</span><h2>Найдено {sortedLeads.length} компаний</h2></div><button onClick={exportCsv}>Скачать CSV ↓</button></header>
            <div className={styles.leadList}>
              {sortedLeads.map((lead) => <article key={lead.id} className={selected.has(lead.id) ? styles.leadSelected : ""}>
                <label><input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleLead(lead.id)} /><i /></label>
                <button className={styles.leadInfo} onClick={() => setActiveLead(lead)}><b>{lead.name}</b><small>{lead.address}</small><span><strong>★ {lead.rating.toFixed(1)}</strong>{lead.reviews} отзывов</span><em>{lead.phone || "Телефон доступен в расширенном API"}</em></button>
                <button className={styles.addButton} disabled={sentIds.has(lead.id)} onClick={() => sendToCrm([lead])}>{sentIds.has(lead.id) ? "В CRM ✓" : "ДОБАВИТЬ В CRM"}</button>
              </article>)}
              {!sortedLeads.length && !scanning && !error && <div className={styles.empty}>По этому запросу компаний не найдено. Попробуйте другую категорию.</div>}
            </div>
            <footer className={styles.selectionBar}><span>Выбрано: <b>{selectedLeads.length}</b></span><button onClick={() => sendToCrm(selectedLeads)} disabled={!selectedLeads.length}>ДОБАВИТЬ {selectedLeads.length || ""} {selectedLeads.length === 1 ? "ЛИД" : "ЛИДА"} В CRM</button></footer>
          </section>
        </div>
      </div>
    </section>

    {activeLead && <aside className={styles.drawer}>
      <header><span>{activeLead.source === "demo" ? "ДЕМО-КАРТОЧКА" : "2ГИС · ОРГАНИЗАЦИЯ"}</span><button onClick={() => setActiveLead(null)}>×</button></header>
      <div className={styles.drawerScore}><i>{activeLead.priority}</i><span>приоритет лида</span></div>
      <h2>{activeLead.name}</h2><p>{activeLead.category}</p>
      <dl><div><dt>Адрес</dt><dd>{activeLead.address}</dd></div><div><dt>Телефон</dt><dd>{activeLead.phone || "Нужен расширенный доступ API"}</dd></div><div><dt>Сайт</dt><dd>{activeLead.website || "Не указан"}</dd></div><div><dt>Рейтинг</dt><dd>{activeLead.rating.toFixed(1)} · {activeLead.reviews} отзывов</dd></div></dl>
      <footer>{activeLead.phone && <a href={`tel:${activeLead.phone.replace(/[^+\d]/g, "")}`}>ПОЗВОНИТЬ</a>}<button disabled={sentIds.has(activeLead.id)} onClick={() => { sendToCrm([activeLead]); setActiveLead(null); }}>{sentIds.has(activeLead.id) ? "УЖЕ В CRM ✓" : "ДОБАВИТЬ В CRM →"}</button></footer>
    </aside>}
    {toast && <div className={styles.toast}>{toast}</div>}
  </main>;
}
