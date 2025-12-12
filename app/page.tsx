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
  // Lördagen under 20–26 juni
  for (let d = 20; d <= 26; d++) {
    const dt = new Date(Date.UTC(year, 5, d));
    if (dt.getUTCDay() === 6) return dt;
  }
  return new Date(Date.UTC(year, 5, 20));
}

function allSaintsDay(year: number): Date {
  // Lördagen under 31 okt – 6 nov
  for (let dd = 31; dd <= 31 + 6; dd++) {
    const month = dd <= 31 ? 9 : 10; // okt/nov
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

// =========================
// OB-kategorier
// =========================

type Keys =
  | "baseWD"
  | "eveWD"
  | "nightWD"
  | "baseWE"
  | "eveWE"
  | "nightWE"
  | "daySH"
  | "nightSH";

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

    // Storhelg start 18:00 på afton, slut 07:00 dagen efter
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

// =========================
// Prislistor 2026 (Bilaga v1.3_2026) – sjuksköterskor
// =========================
const BASE_PRICES_2026 = {
  "SSK": { z1: 616, z2: 660, z3: 715 },
  "SSK Spec": { z1: 715, z2: 770, z3: 824 },
  "Spec ANE/IVA/OP/BM": { z1: 770, z2: 824, z3: 880 },
} as const;

const OB_KUND_2026: Record<Keys, number> = {
  baseWD: 0,
  eveWD: 37,
  nightWD: 82,
  baseWE: 96,
  eveWE: 96,
  nightWE: 109,
  daySH: 184,
  nightSH: 222,
};

export default function App() {
  // === FLÄKAR ===
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

  // Pension – gör 30%-delen justerbar (t.ex. 0% om nationella avtalet ändras)
  const [pensionHighPct, setPensionHighPct] = useState<number>(30);

  const [tbSplitPct, setTbSplitPct] = useState<number>(60);
  const [turnoverFeePct, setTurnoverFeePct] = useState<number>(0);

  const [housingCost, setHousingCost] = useState<number>(0);
  const [travelRevenue, setTravelRevenue] = useState<number>(0);

  const [uploadInfo, setUploadInfo] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState<string>("");

  const [obKund, setObKund] = useState<Record<Keys, number>>({ ...OB_KUND_2026 });
  const [obKonsult, setObKonsult] = useState<Record<Keys, number>>({
    baseWD: 0,
    eveWD: 20,
    nightWD: 40,
    baseWE: 50,
    eveWE: 50,
    nightWE: 50,
    daySH: 100,
    nightSH: 150,
  });

  const [obHours, setObHours] = useState<Record<Keys, number>>({
    baseWD: 0,
    eveWD: 0,
    nightWD: 0,
    baseWE: 0,
    eveWE: 0,
    nightWE: 0,
    daySH: 0,
    nightSH: 0,
  });

  // Auto-basa priser när man väljer Region + zon + spec
  useEffect(() => {
    // Sociala avgifter
    if (taxProfile === "Normal") setSocialRate(31.42);
    if (taxProfile === "Pensionär") setSocialRate(10.21);
    if (taxProfile === "Äldre") setSocialRate(10.21);
    if (taxProfile === "Underkonsult") setSocialRate(0);

    // Pension default
    if (taxProfile === "Pensionär" || taxProfile === "Underkonsult") setIncludePension(false);
    else setIncludePension(true);
  }, [taxProfile]);

  // 🔁 Uppdatera baspris automatiskt när zon / kompetens / år ändras
  useEffect(() => {
    if (priceModel !== "Region") return;
    const z = zone === "1" ? "z1" : zone === "2" ? "z2" : "z3";
    const next = BASE_PRICES_2026[spec][z];
    setBasePrice(next);
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
      const iBreak = cols.findIndex((c) =>
        ["breakmin", "break", "breaktime", "breattime", "rast", "rastmin", "paus", "pause", "rest"].includes(c)
      );

      if (iDate < 0 || iStart < 0 || iEnd < 0) throw new Error("CSV måste innehålla kolumnerna date,start,end (alt starttime/endtime)");

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

        // dra rast
        let restH = (breakMin || 0) / 60;
        const order: Keys[] = ["baseWD", "eveWD", "nightWD", "baseWE", "eveWE", "nightWE", "daySH", "nightSH"];
        for (const k of order) {
          if (restH <= 0) break;
          const take = Math.min(split[k], restH);
          split[k] -= take;
          restH -= take;
        }

        (Object.keys(split) as Keys[]).forEach((k) => (agg[k] += split[k]));
        rows++;
      }

      setObHours(agg);
      const totalH = Object.values(agg).reduce((a, b) => a + b, 0);
      setUploadInfo(`Importerade ${rows} rader (år ${year}). Timmar totalt: ${totalH.toFixed(2)} h`);
    } catch (err: any) {
      setUploadInfo(`Fel vid import: ${err?.message || String(err)}`);
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
        key: r.key,
        label: r.label,
        h,
        obKundDisplay: r.key === "baseWD" ? basePrice : obKundRate,
        obKonsultDisplay: r.key === "baseWD" ? wage : obKonsultRate,
        rev,
        cost,
        saRow,
        tbInclSA,
      };
    });
  }, [ROWS, obHours, obKund, obKonsult, basePrice, wage, socialRate]);

  const totals = useMemo(() => {
    let rev = 0,
      cost = 0,
      h = 0,
      sa = 0;
    for (const r of rowsCalc) {
      rev += r.rev;
      cost += r.cost;
      h += r.h;
      sa += r.saRow;
    }

    const bruttoLon = cost;
    const tak = 50812;
    const pLowBase = Math.min(bruttoLon, tak);
    const pHighBase = Math.max(bruttoLon - tak, 0);

    const pLow = includePension ? pLowBase * 0.045 : 0;
    const pHigh = includePension ? pHighBase * (pensionHighPct / 100) : 0;
    const pension = pLow + pHigh;

    const sll = pension * 0.2426; // blir 0 när pension=0 (t.ex. pensionär/underkonsult)

    const totalCost = cost + sa + pension + sll + housingCost;
    const revTotal = rev + travelRevenue;
    const tb = revTotal - totalCost;

    const tbChef = tb * (tbSplitPct / 100);
    const tbPartner = tb - tbChef;

    const turnoverFee = revTotal * (turnoverFeePct / 100);
    const tbPartnerNet = tbPartner - turnoverFee;

    return {
      h,
      rev,
      revTotal,
      bruttoLon,
      sa,
      pension,
      pLow,
      pHigh,
      sll,
      totalCost,
      tb,
      tbChef,
      tbPartner,
      turnoverFee,
      tbPartnerNet,
    };
  }, [rowsCalc, includePension, pensionHighPct, housingCost, travelRevenue, tbSplitPct, turnoverFeePct]);

  const fmt = (v: number) => new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(v || 0));

  // Enkla testfall (syns i console)
  useEffect(() => {
    const s1 = splitWithCalendar("2026-02-02", 6 * 60, 14 * 60, 2026);
    console.assert(Math.abs(s1.baseWD - 8) < 1e-6, "test: baseWD 8h");

    const s2 = splitWithCalendar("2026-01-16", 21 * 60 + 10, 7 * 60 + 10, 2026);
    const total2 = Object.values(s2).reduce((a, b) => a + b, 0);
    console.assert(Math.abs(total2 - 10) < 1e-2, "test: nattpass 10h");
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans space-y-6">
      <h1 className="text-2xl font-bold">Offertsnurra – Sjuksköterskor (2026)</h1>

      {/* Flikar */}
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-lg border ${mode === "Anställd" ? "bg-slate-200" : "bg-white"}`}
          onClick={() => {
            setMode("Anställd");
            setTaxProfile("Normal");
          }}
        >
          Anställd / Pensionär
        </button>
        <button
          className={`px-4 py-2 rounded-lg border ${mode === "Underkonsult" ? "bg-slate-200" : "bg-white"}`}
          onClick={() => {
            setMode("Underkonsult");
            setTaxProfile("Underkonsult");
          }}
        >
          Underkonsult
        </button>
      </div>

      <section className="rounded-xl border p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Region/Kommun/Privat</span>
          <select className="rounded-lg border p-2" value={priceModel} onChange={(e) => setPriceModel(e.target.value as any)}>
            <option value="Region">Region</option>
            <option value="Kommun">Kommun</option>
            <option value="Privat">Privat</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Zon (Region)</span>
          <select className="rounded-lg border p-2" value={zone} onChange={(e) => setZone(e.target.value as any)} disabled={priceModel !== "Region"}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Kompetens</span>
          <select className="rounded-lg border p-2" value={spec} onChange={(e) => setSpec(e.target.value as any)}>
            <option value="SSK">SSK</option>
            <option value="SSK Spec">SSK Spec</option>
            <option value="Spec ANE/IVA/OP/BM">Spec ANE/IVA/OP/BM</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">År</span>
          <select className="rounded-lg border p-2" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
            <option value={2026}>2026</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Baspris kund (kr/h)</span>
          <input type="number" className="rounded-lg border p-2 text-right" value={basePrice} onChange={(e) => setBasePrice(+e.target.value || 0)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Timlön konsult (kr/h)</span>
          <input type="number" className="rounded-lg border p-2 text-right" value={wage} onChange={(e) => setWage(+e.target.value || 0)} />
        </label>

        {mode === "Anställd" && (
          <label className="flex flex-col gap-1 lg:col-span-2">
            <span className="text-sm text-slate-600">Skattekategori (sociala avgifter)</span>
            <select className="rounded-lg border p-2" value={taxProfile} onChange={(e) => setTaxProfile(e.target.value as any)}>
              <option value="Normal">Anställd (31,42%)</option>
              <option value="Pensionär">Pensionär (10,21%)</option>
              <option value="Äldre">Född ≤ 1958 (10,21%)</option>
            </select>
          </label>
        )}

        {mode === "Underkonsult" && (
          <div className="lg:col-span-2 text-sm text-slate-600">
            Underkonsult: inga sociala avgifter, ingen pension, ingen SLP. Resor, boende och SITHS betalas normalt av konsulten.
          </div>
        )}

        <label className="flex items-center gap-2 lg:col-span-2">
          <input
            type="checkbox"
            checked={includePension}
            onChange={(e) => setIncludePension(e.target.checked)}
            disabled={taxProfile === "Pensionär" || taxProfile === "Underkonsult"}
          />
          <span className="text-sm text-slate-700">Ta med pension</span>
          {(taxProfile === "Pensionär" || taxProfile === "Underkonsult") && (
            <span className="text-xs text-slate-500">(default av)</span>
          )}
        </label>

        <div className="text-xs text-slate-500 lg:col-span-2">OB-kund/h på Vardag dag är alltid = baspris kund (låst). Övriga rader visar pristillägg.</div>
      </section>

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
          <h2 className="font-semibold mb-2">Timmar</h2>
          <div className="space-y-2">
            {ROWS.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-2">
                <span className="text-sm w-56">{r.label}</span>
                <input type="number" step="0.01" className="w-28 text-right rounded-lg border p-1" value={obHours[r.key]} onChange={(e) => setObHours((o) => ({ ...o, [r.key]: +e.target.value || 0 }))} />
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && handleCsvUpload(e.target.files[0])} />
            {uploadInfo && <span className="text-xs text-slate-600">{uploadInfo}</span>}
          </div>

          <div className="mt-3">
            <label className="text-sm text-slate-600 block mb-1">Klistra in schema (CSV)</label>
            <textarea className="w-full rounded-lg border p-2 text-xs h-28" value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder={`date,start,end,breakMin\n2026-02-02,06:45,16:30,30`} />
            <div className="mt-2 flex items-center gap-2">
              <button className="rounded-xl border px-3 py-1.5 hover:bg-slate-50" onClick={() => pasteText.trim() && parseScheduleText(pasteText)}>
                Tolka schema
              </button>
              <button
                className="rounded-xl border px-3 py-1.5 hover:bg-slate-50"
                onClick={() => {
                  setPasteText("");
                  setUploadInfo(null);
                }}
              >
                Rensa
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-lg border p-3 bg-slate-50 text-sm space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700">Boende/resa/övrigt (kostnad, kr)</span>
              <input type="number" className="w-32 text-right rounded-lg border p-1" value={housingCost} onChange={(e) => setHousingCost(+e.target.value || 0)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700">Reseschablon (intäkt, kr)</span>
              <input type="number" className="w-32 text-right rounded-lg border p-1" value={travelRevenue} onChange={(e) => setTravelRevenue(+e.target.value || 0)} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-semibold mb-2">OB-fördelning (inkl sociala avgifter, exkl pension på raderna)</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-2 text-left">Kategori</th>
              <th className="p-2 text-right">Timmar</th>
              <th className="p-2 text-right">OB-kund kr/h</th>
              <th className="p-2 text-right">OB-konsult kr/h</th>
              <th className="p-2 text-right">Intäkt</th>
              <th className="p-2 text-right">Kostnad</th>
              <th className="p-2 text-right">TB inkl SA, exkl pension</th>
              <th className="p-2 text-right">TB % (rad)</th>
            </tr>
          </thead>
          <tbody>
            {rowsCalc.map((r) => (
              <tr key={r.key}>
                <td className="p-2 border-t text-left">{r.label}</td>
                <td className="p-2 border-t text-right">{r.h.toFixed(2)}</td>
                <td className="p-2 border-t text-right">{Math.round(r.obKundDisplay)}</td>
                <td className="p-2 border-t text-right">{Math.round(r.obKonsultDisplay)}</td>
                <td className="p-2 border-t text-right">{fmt(r.rev)}</td>
                <td className="p-2 border-t text-right">{fmt(r.cost)}</td>
                <td className="p-2 border-t text-right">{fmt(r.tbInclSA)}</td>
                <td className="p-2 border-t text-right">{r.rev > 0 ? ((r.tbInclSA / r.rev) * 100).toFixed(1) + "%" : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border p-4 bg-slate-50">
        <h2 className="font-semibold mb-3">Summering</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Antal timmar:</strong> {totals.h.toFixed(2)}
          </div>
          <div>
            <strong>Total intäkt (vård):</strong> {fmt(totals.rev)}
          </div>
          <div>
            <strong>Reseschablon (intäkt):</strong> {fmt(travelRevenue)}
          </div>
          <div>
            <strong>Total intäkt inkl reseersättning:</strong> {fmt(totals.revTotal)}
          </div>
          <div>
            <strong>Total bruttolön konsult:</strong> {fmt(totals.bruttoLon)}
          </div>
          <div>
            <strong>Sociala avgifter:</strong> {fmt(totals.sa)}
          </div>
          <div>
            <strong>Pension 4,5% upp till tak:</strong> {fmt(totals.pLow)}
          </div>
          <div>
            <strong>Pension över tak:</strong> {fmt(totals.pHigh)}
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
              <span>Procentsats över tak</span>
              <input
                type="number"
                className="w-20 rounded-lg border p-1 text-right"
                value={pensionHighPct}
                onChange={(e) => setPensionHighPct(Math.max(0, +e.target.value || 0))}
              />
              <span>%</span>
              <span className="text-slate-500">(sätt 0 om ni bara kör 4,5%)</span>
            </div>
          </div>
          <div>
            <strong>Total pension till konsult:</strong> {fmt(totals.pension)}
          </div>
          <div>
            <strong>Särskild löneskatt (24,26% på pension):</strong> {fmt(totals.sll)}
          </div>
          <div>
            <strong>Boende/resa/övrigt (kostnad):</strong> {fmt(housingCost)}
          </div>
          <div>
            <strong>Total kostnad inkl. SA, pension, SLP & boende:</strong> {fmt(totals.totalCost)}
          </div>

          <div className="col-span-full border-t pt-2" />

          <div className="col-span-full flex items-center gap-3 flex-wrap">
            <label className="text-sm text-slate-600">TB-split – Konsultchef %</label>
            <input type="number" className="w-20 rounded-lg border p-1 text-right" value={tbSplitPct} onChange={(e) => setTbSplitPct(Math.max(0, Math.min(100, +e.target.value || 0)))} />
            <span className="mx-2">|</span>
            <label className="text-sm text-slate-600">Omsättningsavgift %</label>
            <input type="number" className="w-20 rounded-lg border p-1 text-right" value={turnoverFeePct} onChange={(e) => setTurnoverFeePct(Math.max(0, +e.target.value || 0))} />
          </div>

          <div>
            <strong>TB totalt:</strong> {fmt(totals.tb)}
          </div>
          <div>
            <strong>TB % totalt:</strong> {totals.revTotal > 0 ? ((totals.tb / totals.revTotal) * 100).toFixed(1) + "%" : "–"}
          </div>
          <div>
            <strong>Konsultchef tjänar:</strong> {fmt(totals.tbChef)}
          </div>
          <div>
            <strong>Partner/Bolag (före omsättningsavgift):</strong> {fmt(totals.tbPartner)}
          </div>
          <div>
            <strong>Omsättningsavgift:</strong> {fmt(totals.turnoverFee)}
          </div>
          <div>
            <strong>Partner/Bolag (efter omsättningsavgift):</strong> {fmt(totals.tbPartnerNet)}
          </div>
        </div>
      </section>

      <p className="text-xs text-slate-500">
        2026-priser & OB är förifyllt. Vardag dag-raden visar baspris kund och timlön konsult. Övriga rader visar endast OB-tilläggen.
      </p>
    </div>
  );
}
