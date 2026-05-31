"use client";
import React, { useEffect, useMemo, useState } from "react";

function iso(d: Date): string { return d.toISOString().slice(0, 10); }
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

    let isStorhelg
