"use client";
import React, { useEffect, useMemo, useState } from "react";

// =========================
// Datum & tid-hjälpare (Kalender 2026)
// =========================
function iso(d: Date): string { 
  return d.toISOString().slice(0, 10); 
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function easterSunday(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = 1 + ((h + l - 7 * m + 114) % 31);
  return new Date(Date.UTC(year, month - 1, day));
}

function midsummerDay(year: number): Date {
  for (let d = 20; d <= 26; d++) {
    const dt = new Date(Date.UTC(year, 5, d));
    if (dt.getUTCDay() === 6) return dt;
  }
  return new Date(Date.UTC(year, 5, 20));
}

function allSaintsDay(year: number): Date {
  for (let dd = 31; dd <= 31 + 6; dd++) {
    const month = dd <= 31 ? 9 : 10, day = dd <= 31 ? dd : dd - 31;
    const dt = new Date(Date.UTC(year, month, day));
    if (dt.getUTCDay() === 6) return dt;
  }
  return new Date(Date.UTC(year, 10, 1));
}

function buildCalendars(year: number) {
  const easter = easterSunday(year);
  const goodFriday = addDays(easter, -2);
  const easterMon = addDays(easter, 1);
  const ascension = addDays(easter, 39);
  const midsDay = midsummerDay(year);
  const midsEve = addDays(midsDay, -1);
  const allSaints = allSaintsDay(year);

  const helgdagar = new Set<string>([
    iso(new Date(Date.UTC(year, 0, 1))), iso(new Date(Date.UTC(year, 0, 6))),
    iso(goodFriday), iso(easter), iso(easterMon), iso(new Date(Date.UTC(year, 4, 1))),
    iso(ascension), iso(new Date(Date.UTC(year, 5, 6))), iso(allSaints),
    iso(new Date(Date.UTC(year, 11, 25))), iso(new Date(Date.UTC(year, 11, 26))),
  ]);

  const storhelgDagar = new Set<string>([
    iso(new Date(Date.UTC(year, 0, 1))), iso(new Date(Date.UTC(year, 0, 6))),
    iso(goodFriday), iso(easter), iso(easterMon), iso(midsDay),
    iso(new Date(Date.UTC(year, 11, 25))), iso(new Date(Date.UTC(year, 11, 26))),
  ]);

  const storhelgAftnar = new Set<string>([
    iso(midsEve), iso(addDays(easter, -1)),
    iso(new Date(Date.UTC(year, 11, 24))), iso(new Date(Date.UTC(year, 11, 31))),
  ]);

  return { helgdagar, storhelgDagar, storhelgAftnar };
}

function parseTimeToMinutes(s?: string): number | null {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

type Keys = "baseWD" | "eveWD" | "nightWD" | "baseWE" | "eveWE" | "nightWE" | "daySH" | "nightSH";
type Split = Record<Keys, number>;

function splitWithCalendar(dateISO: string, startMin: number, endMin: number, year: number): Split {
  const { helgdagar, storhelgDagar, storhelgAftnar } = buildCalendars(year);
  const out: Split = { baseWD: 0, eveWD: 0, nightWD: 0, baseWE: 0, eveWE: 0, nightWE: 0, daySH: 0, nightSH: 0 };

  let adjEnd = endMin;
  if (endMin <= startMin) adjEnd += 24 * 60;
  const base = new Date(`${dateISO}T00:00:00Z`);

  for (let m = startMin; m < adjEnd; m++) {
    const dayOffset = Math.floor(m / 1440);
    const minOfDay = m % 1440;
    const curDate = addDays(base, dayOffset);
    const curISO = iso(curDate);
    const dow = curDate.getUTCDay();

    let isStorhelg = false;
    if (storhelgAftnar.has(curISO) && minOfDay >= 18 * 60) isStorhelg = true;
    if (storhelgDagar.has(curISO)) isStorhelg = true;
    const prevISO = iso(addDays(curDate, -1));
    if (storhelgAftnar.has(prevISO) && minOfDay < 7 * 60) isStorhelg = true;

    if (isStorhelg) {
      if (minOfDay >= 22 * 60 || minOfDay < 7 * 60) out.nightSH += 1 / 60;
      else out.daySH += 1 / 60;
      continue;
    }

    const isHelg = dow === 0 || dow === 6 || helgdagar.has(curISO);
    if (isHelg) {
      if (minOfDay >= 6 * 60 && minOfDay < 19 * 60) out.baseWE += 1 / 60;
      else if (minOfDay >= 19 * 60 && minOfDay < 22 * 60) out.eveWE += 1 / 60;
      else out.nightWE += 1 / 60;
    } else {
      if (minOfDay >= 6 * 60 && minOfDay < 19 * 60) out.baseWD += 1 / 60;
      else if (minOfDay >= 19 * 60 && minOfDay < 22 * 60) out.eveWD += 1 / 60;
      else out.nightWD += 1 / 60;
    }
  }
  return out;
}

const BASE_PRICES_2026 = {
  "SSK": { z1: 616, z2: 660, z3: 715 },
  "SSK Spec": { z1: 715, z2: 770, z3: 824 },
  "Spec ANE/IVA/OP/BM": { z1: 770, z2: 824, z3: 880 },
} as const;

const OB_KUND_2026: Record<Keys, number> = {
  baseWD: 0, eveWD: 37, nightWD: 82, baseWE: 96, eveWE: 96, nightWE: 109, daySH: 184, nightSH: 222,
};

const ROWS = [
  { key: "baseWD", label: "Vardag dag (06–19)" },
  { key: "eveWD", label: "Vardag kväll (19–22)" },
  { key: "nightWD", label: "Vardag natt (22–06)" },
  { key: "baseWE", label: "Helg dag (06–19)" },
  { key: "eveWE", label: "Helg kväll (19–22)" },
  { key: "nightWE", label: "Helg natt (22–06)" },
  { key: "daySH", label: "Storhelg dag/kväll (07–22)" },
  { key: "nightSH", label: "Storhelg natt (22–07)" },
];

export default function App() {
  const [mode, setMode] = useState<"Anställd" | "Underkonsult">("Anställd");
  const [priceModel, setPriceModel] = useState<"Region" | "Kommun" | "Privat">("Region");
  const [zone, setZone] = useState<"1" | "2" | "3">("1");
  const [spec, setSpec] = useState<keyof typeof BASE_PRICES_2026>("Spec ANE/IVA/OP/BM");
  const [year, setYear] = useState<number>(2026);

  const [basePrice, setBasePrice] = useState<number>(770);
  const [wage, setWage] = useState<number>(470);

  const [taxProfile, setTaxProfile] = useState<"Normal" | "Pensionär" | "Äldre" | "Underkonsult">("Normal");
  const [socialRate, setSocialRate] = useState<number>(31.42);
  const [includePension, setIncludePension] = useState<boolean>(true);
  const [pensionHighPct, setPensionHighPct] = useState<number>(30);

  const [tbSplitPct, setTbSplitPct] = useState<number>(60);
  const [turnoverFeePct, setTurnoverFeePct] = useState<number>(0);

  const [housingCost, setHousingCost] = useState<number>(0);
  
  // ÖPPNA RUTOR FÖR KOSTNADER & ERSÄTTNINGAR
  const [taxFreeMil, setTaxFreeMil] = useState<number>(4800);
  const [sithsSetupCost, setSithsSetupCost] = useState<number>(0);
  const [sithsMonthlyCost, setSithsMonthlyCost] = useState<number>(0);

  const [introHours, setIntroHours] = useState<number>(0);
  const [sickHours, setSickHours] = useState<number>(24);
  const [maxViteTak, setMaxViteTak] = useState<number>(40000);
  const [lonevaxling, setLonevaxling] = useState<number>(0);
  
  const [schablonCount, setSchablonCount] = useState<number>(0);
  const [schablonAmount, setSchablonAmount] = useState<number>(3500);

  const [bostadToggle, setBostadToggle] = useState<boolean>(false);
  const [bostadKvm, setBostadKvm] = useState<number>(25);
  const [bostadDygn, setBostadDygn] = useState<number>(0);

  const [uploadInfo, setUploadInfo] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState<string>("");

  const [obKund, setObKund] = useState<Record<Keys, number>>({ ...OB_KUND_2026 });
  const [obKonsult, setObKonsult] = useState<Record<Keys, number>>({
    baseWD: 0, eveWD: 20, nightWD: 40, baseWE: 50, eveWE: 50, nightWE: 50, daySH: 100, nightSH: 150,
  });

  const [obHours, setObHours] = useState<Record<Keys, number>>({
    baseWD: 76.5, eveWD: 18, nightWD: 0, baseWE: 24, eveWE: 8, nightWE: 0, daySH: 0, nightSH: 0,
  });

  useEffect(() => {
    if (taxProfile === "Normal") setSocialRate(31.42);
    if (taxProfile === "Pensionär" || taxProfile === "Äldre") setSocialRate(10.21);
    if (taxProfile === "Underkonsult") setSocialRate(0);
    if (taxProfile === "Pensionär" || taxProfile === "Underkonsult") setIncludePension(false);
    else setIncludePension(true);
  }, [taxProfile]);

  useEffect(() => {
    if (priceModel !== "Region") return;
    const zKey = zone === "1" ? "z1" : zone === "2" ? "z2" : "z3";
    setBasePrice(BASE_PRICES_2026[spec][zKey]);
  }, [zone, spec, year, priceModel]);

  function parseScheduleText(text: string) {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (!lines.length) throw new Error("Ingen data");
      const head = (lines.shift() || "").trim();
      const sep = head.includes(";") ? ";" : ",";
      const cols = head.split(sep).map((s) => s.trim().toLowerCase());

      const iDate = cols.indexOf("date");
      const iStart = cols.indexOf("start") >= 0 ? cols.indexOf("start") : cols.indexOf("starttime");
      const iEnd = cols.indexOf("end") >= 0 ? cols.indexOf("end") : cols.indexOf("endtime");
      const iBreak = cols.findIndex((c) => ["breakmin", "break", "rast", "paus"].includes(c));

      if (iDate < 0 || iStart < 0 || iEnd < 0) throw new Error("CSV saknar rätt kolumner");

      let agg: Split = { baseWD: 0, eveWD: 0, nightWD: 0, baseWE: 0, eveWE: 0, nightWE: 0, daySH: 0, nightSH: 0 };
      let rows = 0;

      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(sep);
        const dISO = (parts[iDate] || "").trim();
        const startM = parseTimeToMinutes(parts[iStart]);
        const endM = parseTimeToMinutes(parts[iEnd]);
        const breakMin = iBreak >= 0 ? parseInt((parts[iBreak] || "0").trim() || "0", 10) : 0;
        if (!dISO || startM == null || endM == null) continue;

        let split = splitWithCalendar(dISO, startM, endM, year);
        let passTotalMin = (endM <= startM ? endM + 1440 : endM) - startM;
        
        if (passTotalMin > 0 && breakMin > 0) {
          const reduceringsFaktor = (passTotalMin - breakMin) / passTotalMin;
          (Object.keys(split) as Keys[]).forEach((k) => { split[k] *= reduceringsFaktor; });
        }
        (Object.keys(split) as Keys[]).forEach((k) => (agg[k] += split[k]));
        rows++;
      }
      setObHours(agg);
      setUploadInfo(`Importerade ${rows} rader.`);
    } catch (err: any) {
      setUploadInfo("Fel: " + (err?.message || String(err)));
    }
  }

  const rowsCalc = useMemo(() => {
    return ROWS.map((r) => {
      const h = obHours[r.key] || 0;
      const obKundRate = r.key === "baseWD" ? 0 : obKund[r.key] || 0;
      const obKonsultRate = r.key === "baseWD" ? 0 : obKonsult[r.key] || 0;
      const rev = h * (basePrice + obKundRate);
      const cost = h * (wage + obKonsultRate);
      return { key: r.key, label: r.label, h, rev, cost };
    });
  }, [obHours, obKund, obKonsult, basePrice, wage]);

  const totals = useMemo(() => {
    let totalHours = 0, totalRevFromHours = 0, totalCostFromHours = 0;
    rowsCalc.forEach((r) => {
      totalHours += r.h;
      totalRevFromHours += r.rev;
      totalCostFromHours += r.cost;
    });

    // Sjukavdrag & Sjuklön
    const fullArbetadKostnad = totalCostFromHours;
    const timkostnadSnitt = totalHours > 0 ? fullArbetadKostnad / totalHours : wage;
    const sjukAvdraget = sickHours * timkostnadSnitt; 
    const faktisktArbetadGundlon = Math.max(0, totalCostFromHours - sjukAvdraget);

    const sjukLonTimmar = Math.max(0, sickHours - 8); 
    const sjukLonBelopp = sjukLonTimmar * (wage * 0.8);

    const grossWageBeforeVaxling = faktisktArbetadGundlon + sjukLonBelopp;
    const finalBruttoLon = Math.max(0, grossWageBeforeVaxling - lonevaxling);

    // Regionalt Vite
    const hourlyViteRate = spec !== "SSK" ? 1000 : 625;
    const totalVite = Math.min(maxViteTak, sickHours * hourlyViteRate);
    
    const netVardRev = Math.max(0, totalRevFromHours - totalVite);
    const totalSchablonRevenue = schablonCount * schablonAmount;
    const revTotal = netVardRev + totalSchablonRevenue; 

    // Sociala Avgifter
    let bostadSchablonPerDygn = bostadKvm <= 25 ? 29 : (bostadKvm >= 70 ? 59 : 36);
    const totalBostadForman = bostadToggle ? (bostadSchablonPerDygn * bostadDygn) : 0;
    const sa = (finalBruttoLon + totalBostadForman) * (socialRate / 100);

    // Pension (Tröskelvärde 2026: 52125 kr)
    const tak2026 = 52125;
    const pLow = includePension ? Math.min(finalBruttoLon, tak2026) * 0.045 : 0;
    const pHigh = includePension ? Math.max(finalBruttoLon - tak2026, 0) * (pensionHighPct / 100) : 0;
    const pensionVaxlingBonus = lonevaxling * 1.06;
    const pension = pLow + pHigh + pensionVaxlingBonus;
    const sll = pension * 0.2426;

    // TOTAL UTGIFT (Alla fasta kostnader belastar sista raden på rätt sätt)
    const totalCost = finalBruttoLon + sa + pension + sll + housingCost + taxFreeMil + sithsSetupCost + sithsMonthlyCost;
    const tb = revTotal - totalCost;

    return {
      h: totalHours, revTotal, bruttoLon: finalBruttoLon, sa, pension,
      sll, totalCost, tb, tbChef: tb * (tbSplitPct / 100),
      totalVite, totalBostadForman, pensionVaxlingBonus, totalSchablonRevenue, sjukLonBelopp
    };
  }, [rowsCalc, includePension, pensionHighPct, housingCost, taxFreeMil, sithsSetupCost, sithsMonthlyCost, tbSplitPct, sickHours, maxViteTak, lonevaxling, schablonCount, schablonAmount, bostadToggle, bostadKvm, bostadDygn, spec, wage, socialRate]);

  const fmt = (v: number) => new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(v || 0));

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans space-y-6 bg-white text-slate-900">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🌸 KLARA Master Offertsnurra Pro (2026)</h1>
          <p className="text-xs text-slate-500 mt-1">Version 3.0: Fullständigt ombyggda inmatningsrutor för ersättningar och SITHS-kort</p>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Guldstandard Live v3</span>
      </div>

      {/* RÄKNEPANEL INPUTS */}
      <section className="rounded-xl border bg-slate-50/50 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Kompetens</span>
          <select className="rounded-lg border bg-white p-2 text-sm" value={spec} onChange={(e) => setSpec(e.target.value as any)}>
            <option value="SSK">Allmän SSK</option>
            <option value="SSK Spec">SSK Spec</option>
            <option value="Spec ANE/IVA/OP/BM">Spec ANE/IVA/OP/BM (770 kr/h)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Baspris kund (kr/h)</span>
          <input type="number" className="rounded-lg border bg-white p-2 text-sm text-right font-medium" value={basePrice} onChange={(e) => setBasePrice(+e.target.value || 0)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Timlön till Nina (kr/h)</span>
          <input type="number" className="rounded-lg border bg-white p-2 text-sm text-right font-medium text-blue-600" value={wage} onChange={(e) => setWage(+e.target.value || 0)} />
        </label>
      </section>

      {/* NY SEKTION: ÖPPNA TEXTRUTOR FÖR ERSÄTTNINGAR OCH SITHS */}
      <section className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 space-y-3">
        <h3 className="font-bold text-sm text-emerald-800 border-b border-emerald-200 pb-1">🚗 Övriga Kostnader & Ersättningar (Rena utgifter som dras från vinsten)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-700">Skattefri milersättning (kr totalt)</span>
            <input type="number" className="rounded-lg border border-emerald-300 bg-white p-2 text-sm text-right font-bold text-emerald-700" value={taxFreeMil} onChange={(e) => setTaxFreeMil(Math.max(0, +e.target.value || 0))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-700">SITHS-kort (Engångskostnad, kr)</span>
            <input type="number" className="rounded-lg border border-slate-300 bg-white p-2 text-sm text-right font-medium text-slate-700" value={sithsSetupCost} onChange={(e) => setSithsSetupCost(Math.max(0, +e.target.value || 0))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-700">SITHS-kort (Löpande månadskostnad, kr)</span>
            <input type="number" className="rounded-lg border border-slate-300 bg-white p-2 text-sm text-right font-medium text-slate-700" value={sithsMonthlyCost} onChange={(e) => setSithsMonthlyCost(Math.max(0, +e.target.value || 0))} />
          </label>
        </div>
      </section>

      {/* LÖNEVÄXLING & SJUKDOMS-PANEL */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl border p-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-700 border-b pb-1">⚙️ Löneväxlings-testare</h3>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">Testa Löneväxling (kr/månad)</span>
            <input type="number" step="1000" className="rounded-lg border bg-white p-1.5 text-sm text-right text-emerald-600 font-bold" value={lonevaxling} onChange={(e) => setLonevaxling(Math.max(0, +e.target.value || 0))} />
          </label>
          <p className="text-[11px] text-slate-500">Minskar bruttolönen och sänker den statliga skatten för konsulten. Bolaget sparar 7,16% i sociala avgifter vilket skjuts till som extra bonus.</p>
        </div>

        <div className="space-y-3 border-x px-4">
          <h3 className="font-bold text-sm text-rose-700 border-b pb-1">🚨 Sjukfrånvaro & Vites-simulering</h3>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">Registrera sjukfrånvaro (timmar)</span>
            <input type="number" className="rounded-lg border bg-rose-50 p-1.5 text-sm text-right text-rose-600 font-bold" value={sickHours} onChange={(e) => setSickHours(Math.max(0, +e.target.value || 0))} />
          </label>
          <p className="text-[11px] text-slate-500">Exempel: 24 timmar = 3 missade pass. Drar bort arbetad tid, lägger till 80% sjuklön (efter karensdag) och utlöser {spec !== "SSK" ? "1 000" : "625"} kr/h i regionalt vite.</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-700 border-b pb-1">📋 Manuella Timmar i systemet</h3>
          <div className="text-xs space-y-1">
            <div className="flex justify-between"><span>Vardag dag:</span><span className="font-bold">{obHours.baseWD} h</span></div>
            <div className="flex justify-between"><span>Vardag kväll:</span><span className="font-bold">{obHours.eveWD} h</span></div>
            <div className="flex justify-between"><span>Helg dag:</span><span className="font-bold">{obHours.baseWE} h</span></div>
            <div className="flex justify-between"><span>Helg kväll:</span><span className="font-bold">{obHours.eveWE} h</span></div>
            <div className="bg-slate-200 h-[1px] my-1"/>
            <div className="flex justify-between text-slate-700 font-medium"><span>Totalt inlagt schema:</span><span>126.50 h</span></div>
          </div>
        </div>
      </section>

      {/* SCHEMA INMATNING TEXTRUTA */}
      <section className="rounded-xl border p-4 bg-slate-50">
        <h3 className="font-bold text-sm text-slate-700 mb-2">📥 Klistra in råtext/CSV från schema</h3>
        <textarea className="w-full h-24 p-2 text-xs font-mono border rounded-lg bg-white" placeholder="date,start,end..." value={pasteText} onChange={(e) => setPasteText(e.target.value)} />
        <div className="flex gap-2 mt-2">
          <button className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-1.5 px-4 rounded" onClick={() => parseScheduleText(pasteText)}>Tolka text</button>
          <button className="border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs py-1.5 px-4 rounded" onClick={() => { setObHours({baseWD:0,eveWD:0,nightWD:0,baseWE:0,eveWE:0,nightWE:0,daySH:0,nightSH:0}); setUploadInfo(null); setPasteText(""); }}>Rensa</button>
        </div>
        {uploadInfo && <p className="text-xs mt-2 text-blue-600 font-medium">{uploadInfo}</p>}
      </section>

      {/* EKONOMISK SAMMANFATTNING */}
      <section className="rounded-xl border p-4 bg-slate-800 text-white shadow-lg space-y-4">
        <h2 className="font-bold text-base tracking-wide border-b border-slate-700 pb-2">
          📊 SYSTEMETS VERKLIGA UTKOMST (100 % KORRIGERAD)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-xs font-mono">
          <div><span className="text-slate-400">Regionalt Vite (Kostnadsavdrag):</span> <span className="font-bold text-rose-400">-{fmt(totals.totalVite)} kr</span></div>
          <div><span className="text-slate-400">Utbetald Sjuklön (80%):</span> <span className="font-bold text-amber-300">+{fmt(totals.sjukLonBelopp)} kr</span></div>
          <div><span className="text-slate-400">Skattefri milersättning (Utgift):</span> <span className="font-bold text-rose-300">-{fmt(taxFreeMil)} kr</span></div>
          
          <div><span className="text-slate-400">SITHS-kort Uppstart (Utgift):</span> <span className="font-bold text-rose-300">-{fmt(sithsSetupCost)} kr</span></div>
          <div><span className="text-slate-400">SITHS-kort Löpande (Utgift):</span> <span className="font-bold text-rose-300">-{fmt(sithsMonthlyCost)} kr</span></div>
          <div/>

          <div className="border-t border-slate-700/50 my-1 col-span-full" />
          
          <div><span className="text-slate-400">Faktiska Bruttointäkter:</span> <span className="font-bold text-emerald-400 text-sm">{fmt(totals.revTotal)} kr</span></div>
          <div><span className="text-slate-400">Slutgiltig Bruttolön till Nina:</span> <span className="font-bold text-amber-300 text-sm">{fmt(totals.bruttoLon)} kr</span></div>
          <div><span className="text-slate-400">Sociala Avgifter:</span> <span className="font-bold">{fmt(totals.sa)} kr</span></div>

          <div className="border-t border-slate-700/50 my-1 col-span-full" />

          <div><span className="text-slate-400">Total tjänstepension till Avanza:</span> <span className="font-bold">{fmt(totals.pension)} kr</span></div>
          {lonevaxling > 0 && <div><span className="text-slate-400">Varav extra löneväxling (+6%):</span> <span className="text-emerald-400">{fmt(totals.pensionVaxlingBonus)} kr</span></div>}
          <div><span className="text-slate-400">TOTAL UTGIFT FÖR BOLAGET:</span> <span className="font-bold text-sm text-rose-300">{fmt(totals.totalCost)} kr</span></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 font-mono text-center border-t border-slate-700">
          <div className={`p-3 rounded-xl border ${totals.tb >= 0 ? "bg-emerald-950/80 border-emerald-500/30" : "bg-rose-950/80 border-rose-500/30"}`}>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Verklig Vinst (Täckningsbidrag)</div>
            <div className={`text-xl font-bold ${totals.tb >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{fmt(totals.tb)} kr</div>
          </div>
          <div className="bg-indigo-950/80 border border-indigo-500/30 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Din Provision (Konsultchefdel)</div>
            <div className="text-xl font-bold text-indigo-400">{fmt(totals.tbChef)} kr</div>
          </div>
        </div>
      </section>
    </div>
  );
}
