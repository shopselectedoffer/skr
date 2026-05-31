"use client";
import React, { useEffect, useMemo, useState } from "react";

// =========================
// Datum & tid-hjälpare
// =========================
function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

// Meeus/Jones/Butcher – beräkna påskdag (UTC)
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
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
    const month = dd <= 31 ? 9 : 10;
    const day = dd <= 31 ? dd : dd - 31;
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
    iso(new Date(Date.UTC(year, 0, 1))),
    iso(new Date(Date.UTC(year, 0, 6))),
    iso(goodFriday),
    iso(easter),
    iso(easterMon),
    iso(new Date(Date.UTC(year, 4, 1))),
    iso(ascension),
    iso(new Date(Date.UTC(year, 5, 6))),
    iso(allSaints),
    iso(new Date(Date.UTC(year, 11, 25))),
    iso(new Date(Date.UTC(year, 11, 26))),
  ]);

  const storhelgDagar = new Set<string>([
    iso(new Date(Date.UTC(year, 0, 1))),
    iso(new Date(Date.UTC(year, 0, 6))),
    iso(goodFriday),
    iso(easter),
    iso(easterMon),
    iso(midsDay),
    iso(new Date(Date.UTC(year, 11, 25))),
    iso(new Date(Date.UTC(year, 11, 26))),
  ]);

  const storhelgAftnar = new Set<string>([
    iso(midsEve),
    iso(addDays(easter, -1)),
    iso(new Date(Date.UTC(year, 11, 24))),
    iso(new Date(Date.UTC(year, 11, 31))),
  ]);

  return { helgdagar, storhelgDagar, storhelgAftnar };
}

function parseTimeToMinutes(s?: string): number | null {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  return hh * 60 + mm;
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

export default function App() {
  const [mode, setMode] = useState<"Anställd" | "Underkonsult">("Anställd");
  const [priceModel, setPriceModel] = useState<"Region" | "Kommun" | "Privat">("Region");
  const [zone, setZone] = useState<"1" | "2" | "3">("1");
  const [spec, setSpec] = useState<keyof typeof BASE_PRICES_2026>("SSK");
  const [year, setYear] = useState<number>(2026);

  const [basePrice, setBasePrice] = useState<number>(BASE_PRICES_2026.SSK.z1);
  const [wage, setWage] = useState<number>(335);

  const [taxProfile, setTaxProfile] = useState<"Normal" | "Pensionär" | "Äldre" | "Underkonsult">("Normal");
  const [socialRate, setSocialRate] = useState<number>(31.42);
  const [includePension, setIncludePension] = useState<boolean>(true);
  const [pensionHighPct, setPensionHighPct] = useState<number>(30);

  const [tbSplitPct, setTbSplitPct] = useState<number>(60);
  const [turnoverFeePct, setTurnoverFeePct] = useState<number>(0);

  const [housingCost, setHousingCost] = useState<number>(0);
  const [travelCost, setTravelCost] = useState<number>(0);

  // Advanced States fylls i live
  const [introHours, setIntroHours] = useState<number>(0);
  const [sickHours, setSickHours] = useState<number>(0);
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
    baseWD: 0, eveWD: 0, nightWD: 0, baseWE: 0, eveWE: 0, nightWE: 0, daySH: 0, nightSH: 0,
  });

  useEffect(() => {
    if (taxProfile === "Normal") setSocialRate(31.42);
    if (taxProfile === "Pensionär") setSocialRate(10.21);
    if (taxProfile === "Äldre") setSocialRate(10.21);
    if (taxProfile === "Underkonsult") setSocialRate(0);

    if (taxProfile === "Pensionär" || taxProfile === "Underkonsult") setIncludePension(false);
    else setIncludePension(true);
  }, [taxProfile]);

  useEffect(() => {
    if (priceModel !== "Region") return;
    const zKey = zone === "1" ? "z1" : zone === "2" ? "z2" : "z3";
    const next = BASE_PRICES_2026[spec][zKey];
    setBasePrice(next);
  }, [zone, spec, year, priceModel]);

  // Proportioneell rastavräkning baserat på passets faktiska OB-innehåll
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
      const iBreak = cols.findIndex((c) =>
        ["breakmin", "break", "breaktime", "breattime", "rast", "rastmin", "paus", "pause", "rest"].includes(c)
      );

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
          (Object.keys(split) as Keys[]).forEach((k) => {
            split[k] *= reduceringsFaktor;
          });
        }

        (Object.keys(split) as Keys[]).forEach((k) => (agg[k] += split[k]));
        rows++;
      }

      setObHours(agg);
      const totalH = Object.values(agg).reduce((a, b) => a + b, 0);
      setUploadInfo(`Importerade ${rows} rader. Nettoarbetstid: ${totalH.toFixed(2)} h`);
    } catch (err: any) {
      setUploadInfo("Fel: " + (err?.message || String(err)));
    }
  }

  function handleCsvUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => parseScheduleText(String(reader.result || ""));
    reader.readAsText(file);
  }

  const ROWS: { key: Keys; label: string }[] = [
    { key: "baseWD", label: "Vardag dag (06–19)" },
    { key: "eveWD", label: "Vardag kväll (19–22)" },
    { key: "nightWD", label: "Vardag natt (22–06)" },
    { key: "baseWE", label: "Helg dag (06–19)" },
    { key: "eveWE", label: "Helg kväll (19–22)" },
    { key: "nightWE", label: "Helg natt (22–06)" },
    { key: "daySH", label: "Storhelg dag/kväll (07–22)" },
    { key: "nightSH", label: "Storhelg natt (22–07)" },
  ];

  const rowsCalc = useMemo(() => {
    return ROWS.map((r) => {
      const h = obHours[r.key] || 0;
      const obKundRate = r.key === "baseWD" ? 0 : obKund[r.key] || 0;
      const obKonsultRate = r.key === "baseWD" ? 0 : obKonsult[r.key] || 0;

      const kundRate = basePrice + obKundRate;
      const konsultRate = wage + obKonsultRate;

      const rev = h * kundRate;
      const cost = h * konsultRate;
      const saRow = cost * (socialRate / 100);
      const tbInclSA = rev - cost - saRow;

      return {
        key: r.key, label: r.label, h,
        obKundDisplay: r.key === "baseWD" ? basePrice : obKundRate,
        obKonsultDisplay: r.key === "baseWD" ? wage : obKonsultRate,
        rev, cost, saRow, tbInclSA,
      };
    });
  }, [ROWS, obHours, obKund, obKonsult, basePrice, wage, socialRate]);

  // Beräkningsmotorn
  const totals = useMemo(() => {
    let baseRev = 0, baseCost = 0, totalHours = 0;
    for (const r of rowsCalc) {
      baseRev += r.rev;
      baseCost += r.cost;
      totalHours += r.h;
    }

    const introRevDeduction = introHours * basePrice;
    const netVardRev = Math.max(0, baseRev - introRevDeduction);

    const isSpecialist = spec !== "SSK";
    const hourlyViteRate = isSpecialist ? 1000 : 625; 
    const calculatedVite = sickHours * hourlyViteRate;
    const totalVite = Math.min(maxViteTak, calculatedVite);

    const sickDeduction = sickHours * wage;
    const sickPayHours = Math.max(0, sickHours - 8); 
    const totalSjuklon = sickPayHours * (wage * 0.8); 

    const grossWageBeforeVaxling = baseCost - (sickHours === 0 ? 0 : (sickDeduction - totalSjuklon));
    const maxRecommendedLonevaxling = Math.max(0, grossWageBeforeVaxling - 56087);
    const appliedLonevaxling = Math.min(lonevaxling, grossWageBeforeVaxling);
    const finalBruttoLon = Math.max(0, grossWageBeforeVaxling - appliedLonevaxling);

    const totalSchablonRevenue = schablonCount * schablonAmount;
    const revTotal = netVardRev + totalSchablonRevenue;

    let bostadSchablonPerDygn = 36; 
    if (bostadKvm <= 25) bostadSchablonPerDygn = 29;
    else if (bostadKvm >= 70) bostadSchablonPerDygn = 59;
    
    const totalBostadForman = bostadToggle ? (bostadSchablonPerDygn * bostadDygn) : 0;
    const saUnderlag = finalBruttoLon + totalBostadForman;
    const sa = saUnderlag * (socialRate / 100);

    const tak2026 = 52125;
    const pLowBase = Math.min(finalBruttoLon, tak2026);
    const pHighBase = Math.max(finalBruttoLon - tak2026, 0);

    const pLow = includePension ? pLowBase * 0.045 : 0;
    const pHigh = includePension ? pHighBase * (pensionHighPct / 100) : 0;
    
    const pensionVaxlingBonus = appliedLonevaxling * 1.06; 
    const pension = pLow + pHigh + pensionVaxlingBonus;
    const sll = pension * 0.2426; 

    const totalCost = finalBruttoLon + sa + pension + sll + housingCost + travelCost + totalVite;
    const tb = revTotal - totalCost;

    const tbChef = tb * (tbSplitPct / 100);
    const tbPartner = tb - tbChef;
    const turnoverFee = revTotal * (turnoverFeePct / 100);
    const tbPartnerNet = tbPartner - turnoverFee;

    return {
      h: totalHours, rev: baseRev, revTotal, bruttoLon: finalBruttoLon, sa, pension,
      pLow, pHigh, sll, totalCost, tb, tbChef, tbPartner, turnoverFee, tbPartnerNet,
      totalVite, totalBostadForman, pensionVaxlingBonus, totalSchablonRevenue,
      grossWageBeforeVaxling, maxRecommendedLonevaxling, appliedLonevaxling, travelCost
    };
  }, [rowsCalc, includePension, pensionHighPct, housingCost, travelCost, tbSplitPct, turnoverFeePct, introHours, sickHours, maxViteTak, lonevaxling, schablonCount, schablonAmount, bostadToggle, bostadKvm, bostadDygn, spec, wage, basePrice, socialRate]);

  const fmt = (v: number) => new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(v || 0));

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans space-y-6 bg-white text-slate-900">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-800">🌸 KLARA Master Offertsnurra Pro (2026)</h1>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Guldstandard Live</span>
      </div>

      <div className="flex gap-2">
        <button className={`px-4 py-2 rounded-lg border font-medium ${mode === "Anställd" ? "bg-slate-800 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`} onClick={() => { setMode("Anställd"); setTaxProfile("Normal"); }}>
          Anställd / Pensionär
        </button>
        <button className={`px-4 py-2 rounded-lg border font-medium ${mode === "Underkonsult" ? "bg-slate-800 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`} onClick={() => { setMode("Underkonsult"); setTaxProfile("Underkonsult"); }}>
          Underkonsult
        </button>
      </div>

      <section className="rounded-xl border bg-slate-50/50 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Region/Kommun/Privat</span>
          <select className="rounded-lg border bg-white p-2 text-sm" value={priceModel} onChange={(e) => setPriceModel(e.target.value as any)}>
            <option value="Region">Region</option>
            <option value="Kommun">Kommun</option>
            <option value="Privat">Privat</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Zon (Region)</span>
          <select className="rounded-lg border bg-white p-2 text-sm" value={zone} onChange={(e) => setZone(e.target.value as any)} disabled={priceModel !== "Region"}>
            <option value="1">Zon 1</option>
            <option value="2">Zon 2</option>
            <option value="3">Zon 3 (Norrland)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Kompetens</span>
          <select className="rounded-lg border bg-white p-2 text-sm" value={spec} onChange={(e) => setSpec(e.target.value as any)}>
            <option value="SSK">Allmän SSK</option>
            <option value="SSK Spec">SSK Spec</option>
            <option value="Spec ANE/IVA/OP/BM">Spec ANE/IVA/OP/BM</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">År</span>
          <select className="rounded-lg border bg-white p-2 text-sm" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
            <option value={2026}>2026</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Baspris kund (kr/h)</span>
          <input type="number" className="rounded-lg border bg-white p-2 text-sm text-right font-medium" value={basePrice} onChange={(e) => setBasePrice(+e.target.value || 0)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Timlön inkl sem (kr/h)</span>
          <input type="number" className="rounded-lg border bg-white p-2 text-sm text-right font-medium text-blue-600" value={wage} onChange={(e) => setWage(+e.target.value || 0)} />
        </label>

        {mode === "Anställd" && (
          <label className="flex flex-col gap-1 lg:col-span-2">
            <span className="text-xs font-semibold text-slate-600">Skattekategori</span>
            <select className="rounded-lg border bg-white p-2 text-sm" value={taxProfile} onChange={(e) => setTaxProfile(e.target.value as any)}>
              <option value="Normal">Anställd (31,42%)</option>
              <option value="Pensionär">Pensionär (10,21%)</option>
              <option value="Äldre">Född ≤ 1958 (10,21%)</option>
            </select>
          </label>
        )}

        <label className="flex items-center gap-2 lg:col-span-2 pb-2">
          <input type="checkbox" className="rounded border-slate-300 text-slate-800" checked={includePension} onChange={(e) => setIncludePension(e.target.checked)} disabled={taxProfile === "Pensionär" || taxProfile === "Underkonsult"} />
          <span className="text-sm font-medium text-slate-700">Tjänstepension Aktiv</span>
        </label>
      </section>

      {/* DET NYA SÄKRA KONTROLLBLOCKET */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl border p-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-700 border-b pb-1">⚙️ Avrop & Löneväxling</h3>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">Antal introtimmar (0 kr intäkt, full lön)</span>
            <input type="number" className="rounded-lg border bg-white p-1.5 text-sm text-right" value={introHours} onChange={(e) => setIntroHours(Math.max(0, +e.target.value || 0))} />
          </label>
        </div>

        <div className="space-y-4 border-x px-4">
          <h3 className="font-bold text-sm text-slate-700 border-b pb-1">🚨 Sjukdom & Vitesrisk</h3>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">Frånvarotimmar totalt (sjukdom)</span>
            <input type="number" className="rounded-lg border bg-white p-1.5 text-sm text-right text-rose-600 font-semibold" value={sickHours} onChange={(e) => setSickHours(Math.max(0, +e.target.value || 0))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">Maximalt vites-tak hos regionen (kr)</span>
            <input type="number" className="rounded-lg border bg-white p-1.5 text-sm text-right" value={maxViteTak} onChange={(e) => setMaxViteTak(Math.max(0, +e.target.value || 0))} />
          </label>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-700 border-b pb-1">🗺️ Reseschablon & Bostadsförmån</h3>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-600">Reseschabloner (st)</span>
              <input type="number" className="rounded-lg border bg-white p-1.5 text-sm text-right text-blue-600 font-semibold" value={schablonCount} onChange={(e) => setSchablonCount(Math.max(0, +e.target.value || 0))} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-600">Belopp/st (Zon)</span>
              <input type="number" className="rounded-lg border bg-white p-1.5 text-sm text-right" value={schablonAmount} onChange={(e) => setSchablonAmount(Math.max(0, +e.target.value || 0))} />
            </label>
          </div>

          <div className="border-t pt-2 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300" checked={bostadToggle} onChange={(e) => setBostadToggle(e.target.checked)} />
              <span className="text-xs font-semibold text-slate-700">Aktivera Skatteverkets bostadsförmån</span>
            </label>
            {bostadToggle && (
              <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <label className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500">Storlek (kvm)</span>
                  <input type="number" className="border rounded p-1 text-xs text-right" value={bostadKvm} onChange={(e) => setBostadKvm(+e.target.value || 0)} />
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500">Antal dygn</span>
                  <input type="number" className="border rounded p-1 text-xs text-right" value={bostadDygn} onChange={(e) => setBostadDygn(+e.target.value || 0)} />
                </label>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ursprungliga OB-inputs */}
      <section className="rounded-xl border p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-2">OB enligt avtal (kund) – kr/h</h2>
          <div className="space-y-2">
            {ROWS.map((r) => {
              const ro = r.key === "baseWD";
              return (
                <div key={r.key} className="flex items-center justify-between gap-2">
                  <span className="text-sm w-56">{r.label}</span>
                  <input
                    type="number"
                    className="w-28 text-right rounded-lg border p-1"
                    value={ro ? basePrice : obKund[r.key]}
                    readOnly={ro}
                    disabled={ro}
                    onChange={(e) => {
                      if (ro) return;
                      setObKund((o) => ({ ...o, [r.key]: +e.target.value || 0 }));
                    }}
                  />
                </div>
              );
            })}
          </div>

          <h2 className="font-semibold mt-4 mb-2">OB – konsult</h2>
          <div className="space-y-2">
            {ROWS.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-2">
                <span className="text-sm w-56">{r.label}</span>
                <input
                  type="number"
                  className="w-28 text-right rounded-lg border p-1"
                  value={r.key === "baseWD" ? wage : obKonsult[r.key]}
                  onChange={(e) => (r.key === "baseWD" ? setWage(+e.target.value || 0) : setObKonsult((o) => ({ ...o, [r.key]: +e.target.value || 0 })))}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2 text-sm text-slate-700">Inmatning av schematimmar</h2>
          <div className="space-y-1.5">
            {ROWS.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-600 w-56">{r.label}</span>
                <input type="number" step="0.01" className="w-24 text-right rounded-lg border p-1 text-xs" value={obHours[r.key]} onChange={(e) => setObHours((o) => ({ ...o, [r.key]: +e.target.value || 0 }))} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t pt-2">
            <input type="file" className="text-xs" accept=".csv" onChange={(e) => e.target.files?.[0] && handleCsvUpload(e.target.files[0])} />
            {uploadInfo && <span className="text-[10px] bg-slate-100 p-1 rounded font-mono text-slate-600">{uploadInfo}</span>}
          </div>

          <div className="mt-3">
            <label className="text-xs font-semibold text-slate-600 block mb-1">Klistra in råtext/CSV från schema</label>
            <textarea className="w-full rounded-lg border p-2 text-[11px] h-24 font-mono" value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder={`date,start,end,breakMin\n2026-02-02,06:45,16:30,30`} />
            <div className="mt-1 flex gap-1.5">
              <button className="rounded-lg border px-3 py-1 text-xs font-medium bg-slate-800 text-white hover:bg-slate-700" onClick={() => pasteText.trim() && parseScheduleText(pasteText)}>Tolka text</button>
              <button className="rounded-lg border px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50" onClick={() => { setPasteText(""); setUploadInfo(null); }}>Rensa</button>
            </div>
          </div>

          <div className="mt-2 rounded-lg border p-2 bg-slate-50 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Direkt hyra/boende (Stensjö-utgift, kr)</span>
              <input type="number" className="w-24 text-right rounded border p-0.5 text-xs font-medium" value={housingCost} onChange={(e) => setHousingCost(+e.target.value || 0)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Övriga resekostnader/tåg (utgift, kr)</span>
              <input type="number" className="w-24 text-right rounded border p-0.5 text-xs font-medium" value={travelCost} onChange={(e) => setTravelCost(Math.max(0, +e.target.value || 0))} />
            </div>
          </div>
        </div>
      </section>

      {/* Tabell */}
      <section className="rounded-xl border overflow-hidden">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="p-2 text-left">Kategori</th>
              <th className="p-2 text-right">Timmar</th>
              <th className="p-2 text-right">Kund kr/h</th>
              <th className="p-2 text-right">Konsult kr/h</th>
              <th className="p-2 text-right">Intäkt</th>
              <th className="p-2 text-right">Kostnad</th>
              <th className="p-2 text-right">TB (exkl pen)</th>
              <th className="p-2 text-right">Rad %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rowsCalc.map((r) => (
              <tr key={r.key} className="hover:bg-slate-50/50">
                <td className="p-2 text-left font-medium text-slate-700">{r.label}</td>
                <td className="p-2 text-right font-mono">{r.h.toFixed(2)}</td>
                <td className="p-2 text-right font-mono">{Math.round(r.obKundDisplay)}</td>
                <td className="p-2 text-right font-mono text-blue-600">{Math.round(r.obKonsultDisplay)}</td>
                <td className="p-2 text-right font-mono">{fmt(r.rev)}</td>
                <td className="p-2 text-right font-mono">{fmt(r.cost)}</td>
                <td className="p-2 text-right font-mono text-slate-600">{fmt(r.tbInclSA)}</td>
                <td className="p-2 text-right font-mono font-medium">{r.rev > 0 ? ((r.tbInclSA / r.rev) * 100).toFixed(1) + "%" : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* EKONOMISK SAMMANFATTNING */}
      <section className="rounded-xl border p-4 bg-slate-800 text-white shadow-lg space-y-4">
        <h2 className="font-bold text-base tracking-wide border-b border-slate-700 pb-2 flex justify-between items-center">
          <span>📊 SLUTGILTIG EKONOMISK SAMMANFATTNING</span>
          <span className="text-xs text-slate-400 font-mono">Index 2026</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-xs font-mono">
          <div><span className="text-slate-400">Totala schematimmar:</span> <span className="font-bold text-sm">{totals.h.toFixed(2)} h</span></div>
          <div><span className="text-slate-400">Regionalt Vite avdrag:</span> <span className="font-bold text-rose-400">-{fmt(totals.totalVite)} kr</span></div>
          <div><span className="text-slate-400">Reseschabloner intäkt:</span> <span className="font-bold text-blue-400">+{fmt(totals.totalSchablonRevenue)} kr</span></div>
          
          <div className="border-t border-slate-700/50 my-1 col-span-full" />
          
          <div><span className="text-slate-400">Totala Bruttointäkter:</span> <span className="font-bold text-emerald-400 text-sm">{fmt(totals.revTotal)} kr</span></div>
          <div><span className="text-slate-400">Skattepliktig Bruttolön:</span> <span className="font-bold text-amber-300 text-sm">{fmt(totals.bruttoLon)} kr</span></div>
          <div><span className="text-slate-400">Sociala Avgifter (SA):</span> <span className="font-bold">{fmt(totals.sa)} kr</span></div>

          {totals.totalBostadForman > 0 && (
            <div className="col-span-full text-[11px] text-amber-200">
              ℹ️ Medräknat dolt förmånsvärde för boende på {fmt(totals.totalBostadForman)} kr i underlaget för sociala avgifter.
            </div>
          )}

          <div className="border-t border-slate-700/50 my-1 col-span-full" />

          <div><span className="text-slate-400">Pension upp till 52 125 kr:</span> <span>{fmt(totals.pLow)} kr</span></div>
          <div><span className="text-slate-400">Pension över tröskeln:</span> <span>{fmt(totals.pHigh)} kr</span></div>
          <div><span className="text-slate-400">Löneväxling insatt (+6%):</span> <span className="text-emerald-400 font-bold">{fmt(totals.pensionVaxlingBonus)} kr</span></div>
          <div><span className="text-slate-400">Särskild Löneskatt (Pension):</span> <span>{fmt(totals.sll)} kr</span></div>
          <div><span className="text-slate-400">Faktisk boendehyra (utgift):</span> <span>{fmt(housingCost)} kr</span></div>
          <div><span className="text-slate-400">Övriga resekostnader/tåg:</span> <span>{fmt(totals.travelCost)} kr</span></div>
          <div><span className="text-slate-400">Max rekommenderad löneväxling i detta scenario:</span> <span className="font-bold text-emerald-400">{fmt(totals.maxRecommendedLonevaxling)} kr</span></div>
          <div><span className="text-slate-400">Valt löneväxlingsbelopp:</span> <span className="font-bold text-emerald-400">{fmt(totals.appliedLonevaxling)} kr</span></div>
          <div><span className="text-slate-400">TOTAL SJÄLVKOSTNAD BOLAGET:</span> <span className="font-bold text-sm text-rose-300">{fmt(totals.totalCost)} kr</span></div>
        </div>

        {lonevaxling > totals.maxRecommendedLonevaxling && (
          <div className="text-[11px] text-amber-200 bg-amber-950/40 border border-amber-500/30 rounded-lg p-2">
            Varning: vald löneväxling är högre än rekommenderat max i detta scenario. Kontrollera att bruttolönen efter löneväxling inte hamnar under 56 087 kr/mån.
          </div>
        )}

        <div className="pt-4 border-t border-slate-700 flex flex-wrap gap-4 items-center bg-slate-900/50 p-3 rounded-xl text-xs">
          <label className="flex items-center gap-2">
            <span className="text-slate-300">Löneväxlingsbelopp (kr/månad)</span>
            <input type="number" className="w-28 rounded border border-slate-600 bg-slate-800 p-1 text-right font-bold text-white" value={lonevaxling} onChange={(e) => setLonevaxling(Math.max(0, +e.target.value || 0))} />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-slate-300">Konsultchef split %</span>
            <input type="number" className="w-16 rounded border border-slate-600 bg-slate-800 p-1 text-right font-bold text-white" value={tbSplitPct} onChange={(e) => setTbSplitPct(Math.max(0, Math.min(100, +e.target.value || 0)))} />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-slate-300">Omsättningsavgift %</span>
            <input type="number" className="w-16 rounded border border-slate-600 bg-slate-800 p-1 text-right font-bold text-white" value={turnoverFeePct} onChange={(e) => setTurnoverFeePct(Math.max(0, +e.target.value || 0))} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-center">
          <div className="bg-emerald-950/80 border border-emerald-500/30 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Täckningsbidrag (Vinst)</div>
            <div className="text-xl font-bold text-emerald-400">{fmt(totals.tb)} kr</div>
          </div>
          <div className="bg-blue-950/80 border border-blue-500/30 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Slutgiltig Marginal %</div>
            <div className="text-xl font-bold text-blue-400">{totals.revTotal > 0 ? ((totals.tb / totals.revTotal) * 100).toFixed(1) + "%" : "–"}</div>
          </div>
          <div className="bg-indigo-950/80 border border-indigo-500/30 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Din Provision (Chefdel)</div>
            <div className="text-xl font-bold text-indigo-400">{fmt(totals.tbChef)} kr</div>
          </div>
        </div>
      </section>
    </div>
  );
}
