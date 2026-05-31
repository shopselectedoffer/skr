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
  const [spec, setSpec] = useState<keyof typeof BASE_PRICES_2026>("Spec ANE/IVA/OP/BM");
  const [basePrice, setBasePrice] = useState<number>(770);
  const [wage, setWage] = useState<number>(470);
  const [socialRate, setSocialRate] = useState<number>(31.42);

  // NYA INPUTRUTOR FÖR AUTOMATISK MILBERÄKNING
  const [milCount, setMilCount] = useState<number>(192); // Exempel: 192 mil för september
  const [milRate, setMilRate] = useState<number>(18);   // Användarens exempel: 18 kr/milen

  // SITHS-KORT
  const [sithsSetupCost, setSithsSetupCost] = useState<number>(0);
  const [sithsMonthlyCost, setSithsMonthlyCost] = useState<number>(0);

  const [sickHours, setSickHours] = useState<number>(0);
  const [lonevaxling, setLonevaxling] = useState<number>(10000); // Sparar ditt lyckade val på 10 000 kr
  
  const [pasteText, setPasteText] = useState<string>("");
  const [uploadInfo, setUploadInfo] = useState<string | null>(null);

  const [obHours, setObHours] = useState<Record<Keys, number>>({
    baseWD: 116, eveWD: 24, nightWD: 0, baseWE: 24, eveWE: 12, nightWE: 0, daySH: 0, nightSH: 0,
  });

  const rowsCalc = useMemo(() => {
    return ROWS.map((r) => {
      const h = obHours[r.key] || 0;
      const obKundRate = r.key === "baseWD" ? 0 : OB_KUND_2026[r.key] || 0;
      const rev = h * (basePrice + obKundRate);
      const cost = h * wage;
      return { key: r.key, label: r.label, h, rev, cost };
    });
  }, [obHours, basePrice, wage]);

  const totals = useMemo(() => {
    let totalHours = 0, totalRevFromHours = 0, totalCostFromHours = 0;
    rowsCalc.forEach((r) => {
      totalHours += r.h;
      totalRevFromHours += r.rev;
      totalCostFromHours += r.cost;
    });

    // Sjukavdrag
    const timkostnadSnitt = totalHours > 0 ? totalCostFromHours / totalHours : wage;
    const sjukAvdraget = sickHours * timkostnadSnitt; 
    const faktisktArbetadGundlon = Math.max(0, totalCostFromHours - sjukAvdraget);
    const sjukLonTimmar = Math.max(0, sickHours - 8); 
    const sjukLonBelopp = sjukLonTimmar * (wage * 0.8);

    const finalBruttoLon = Math.max(0, faktisktArbetadGundlon + sjukLonBelopp - lonevaxling);

    // Regionalt Vite
    const hourlyViteRate = spec !== "SSK" ? 1000 : 625;
    const totalVite = sickHours * hourlyViteRate;
    
    // Intäkter är RENA timintäkter minus vite
    const revTotal = Math.max(0, totalRevFromHours - totalVite);

    // Milersättning (Antal mil * kr per mil)
    const totalMilersattning = milCount * milRate;

    // Avgifter & Pension
    const sa = finalBruttoLon * (socialRate / 100);
    const tak2026 = 52125;
    const pLow = Math.min(finalBruttoLon, tak2026) * 0.045;
    const pHigh = Math.max(finalBruttoLon - tak2026, 0) * 0.30;
    const pensionVaxlingBonus = lonevaxling * 1.06;
    const pension = pLow + pHigh + pensionVaxlingBonus;
    const sll = pension * 0.2426;

    // TOTAL KOSTNAD (Milersättningen adderas som ren utgift)
    const totalCost = finalBruttoLon + sa + pension + sll + totalMilersattning + sithsSetupCost + sithsMonthlyCost;
    const tb = revTotal - totalCost;

    return {
      h: totalHours, revTotal, bruttoLon: finalBruttoLon, sa, pension,
      sll, totalCost, tb, tbChef: tb * 0.60,
      totalVite, sjukLonBelopp, totalMilersattning
    };
  }, [rowsCalc, milCount, milRate, sithsSetupCost, sithsMonthlyCost, sickHours, lonevaxling, spec, wage, socialRate]);

  const fmt = (v: number) => new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(v || 0));

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans space-y-6 bg-white text-slate-900">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🌸 KLARA Master Offertsnurra Pro (2026)</h1>
          <p className="text-xs text-slate-500 mt-1">Sandbox-läge (/pro) — Version 4.0 Automatisk kalkyl per mil</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Korrigerad v4</span>
      </div>

      {/* RÄKNEPANEL */}
      <section className="rounded-xl border bg-slate-50/50 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Kompetens</span>
          <select className="rounded-lg border bg-white p-2 text-sm" value={spec} onChange={(e) => setSpec(e.target.value as any)}>
            <option value="Spec ANE/IVA/OP/BM">Spec ANE/IVA/OP/BM</option>
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
      </section>

      {/* 🚗 MILERSÄTTNING AUTOMATISK MATEMATIK */}
      <section className="rounded-xl border border-emerald-300 bg-emerald-50/30 p-4 space-y-3">
        <h3 className="font-bold text-sm text-emerald-800 border-b border-emerald-200 pb-1">🚗 Specifik Milersättning (Dras av helt automatiskt som utgift)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-700">Antal körda mil (st)</span>
            <input type="number" className="rounded-lg border border-emerald-300 bg-white p-2 text-sm text-right font-bold text-emerald-800" value={milCount} onChange={(e) => setMilCount(Math.max(0, +e.target.value || 0))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-700">Ersättning per mil (kr/mil)</span>
            <input type="number" className="rounded-lg border border-emerald-300 bg-white p-2 text-sm text-right font-bold text-emerald-800" value={milRate} onChange={(e) => setMilRate(Math.max(0, +e.target.value || 0))} />
          </label>
        </div>
        <div className="text-xs text-emerald-700 font-medium pt-1">
          Uträkning på skärmen: {milCount} mil × {milRate} kr = <strong>{fmt(totals.totalMilersattning)} kr</strong> dras från bolagets vinst.
        </div>
      </section>

      {/* SITHS-KORT OCH DRIFT */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border p-4 bg-slate-50">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">SITHS-kort (Engångs kr)</span>
          <input type="number" className="rounded-lg border bg-white p-2 text-sm text-right" value={sithsSetupCost} onChange={(e) => setSithsSetupCost(Math.max(0, +e.target.value || 0))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">SITHS-kort (Löpande kr)</span>
          <input type="number" className="rounded-lg border bg-white p-2 text-sm text-right" value={sithsMonthlyCost} onChange={(e) => setSithsMonthlyCost(Math.max(0, +e.target.value || 0))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Löneväxlingsbelopp (kr/mån)</span>
          <input type="number" className="rounded-lg border bg-white p-2 text-sm text-right text-emerald-600 font-bold" value={lonevaxling} onChange={(e) => setLonevaxling(Math.max(0, +e.target.value || 0))} />
        </label>
      </section>

      {/* SAMMANFATTNING */}
      <section className="rounded-xl border p-4 bg-slate-800 text-white shadow-lg space-y-4">
        <h2 className="font-bold text-base tracking-wide border-b border-slate-700 pb-2">
          📊 SLUTGILTIG EKONOMISK SAMMANFATTNING
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-xs font-mono">
          <div><span className="text-slate-400">Totala Bruttointäkter:</span> <span className="font-bold text-emerald-400 text-sm">{fmt(totals.revTotal)} kr</span></div>
          <div><span className="text-slate-400">Skattepliktig Bruttolön:</span> <span className="font-bold text-amber-300 text-sm">{fmt(totals.bruttoLon)} kr</span></div>
          <div><span className="text-slate-400">Sociala Avgifter (SA):</span> <span className="font-bold">{fmt(totals.sa)} kr</span></div>
          
          <div className="border-t border-slate-700/50 my-1 col-span-full" />
          
          <div><span className="text-slate-400">Milersättning ({milCount} mil × {milRate} kr):</span> <span className="font-bold text-rose-400">-{fmt(totals.totalMilersattning)} kr</span></div>
          {sithsSetupCost > 0 && <div><span className="text-slate-400">SITHS Engångsutgift:</span> <span className="font-bold text-rose-400">-{fmt(sithsSetupCost)} kr</span></div>}
          {sithsMonthlyCost > 0 && <div><span className="text-slate-400">SITHS Löpande utgift:</span> <span className="font-bold text-rose-400">-{fmt(sithsMonthlyCost)} kr</span></div>}
          
          <div className="border-t border-slate-700/50 my-1 col-span-full" />
          
          <div><span className="text-slate-400">Total tjänstepension:</span> <span className="font-bold">{fmt(totals.pension)} kr</span></div>
          <div><span className="text-slate-400">Särskild Löneskatt:</span> <span className="font-bold">{fmt(totals.sll)} kr</span></div>
          <div><span className="text-slate-400">TOTAL SJÄLVKOSTNAD BOLAGET:</span> <span className="font-bold text-sm text-rose-300">{fmt(totals.totalCost)} kr</span></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 font-mono text-center border-t border-slate-700">
          <div className="p-3 rounded-xl border bg-emerald-950/80 border-emerald-500/30">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Täckningsbidrag (Vinst)</div>
            <div className="text-xl font-bold text-emerald-400">{fmt(totals.tb)} kr</div>
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
