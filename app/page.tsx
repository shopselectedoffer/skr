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

// Lördagen under 31 okt – 6 nov
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
  const [travelRevenue, setTravelRevenue] = useState<number>(0);

  // Advanced States
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
