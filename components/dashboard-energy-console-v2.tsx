"use client";

import { useMemo, useState } from "react";
import { Activity, BarChart3, FileText, Zap } from "lucide-react";

export type EnergyHistoryPoint = {
  id: string;
  date: string;
  electricityKwh: number | null;
  applianceKwh: number | null;
};

type Mode = "electricity" | "appliances";

type Point = { x: number; y: number; value: number; date: string };

function safeValue(value: number | null) {
  return value !== null && Number.isFinite(value) && value > 0 ? value : null;
}

function formatKwh(value: number | null) {
  if (value === null) return "Not estimated";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value) + " kWh";
}

function smoothPath(points: Point[]) {
  if (points.length === 0) return "";
  let result = "M " + points[0].x + " " + points[0].y;
  for (let i = 1; i < points.length; i++) {
    const p = points[i - 1];
    const next = points[i];
    const control = (p.x + next.x) / 2;
    result += " C " + control + " " + p.y + " " + control + " " + next.y + " " + next.x + " " + next.y;
  }
  return result;
}

export default function DashboardEnergyConsoleV2({
  history,
  latestDate,
  reportCount,
}: {
  history: EnergyHistoryPoint[];
  latestDate: string;
  reportCount: number;
}) {
  const [mode, setMode] = useState<Mode>("electricity");
  const visibleHistory = useMemo(() => history.slice(-8), [history]);
  const eligible = useMemo(
    () => visibleHistory
      .map((entry) => ({
        id: entry.id,
        date: entry.date,
        value: safeValue(mode === "electricity" ? entry.electricityKwh : entry.applianceKwh),
      }))
      .filter((entry): entry is { id: string; date: string; value: number } => entry.value !== null),
    [visibleHistory, mode]
  );
  const latest = eligible.length ? eligible[eligible.length - 1].value : null;
  const chart = useMemo(() => {
    if (!eligible.length) return [] as Point[];
    const values = eligible.map((entry) => entry.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const equal = min === max;
    const bottom = 152;
    const top = 35;
    const span = equal ? 1 : max - min;
    return eligible.map((entry, index) => ({
      x: eligible.length === 1 ? 263 : 28 + (470 * index) / (eligible.length - 1),
      y: equal ? 99 : bottom - ((entry.value - min) / span) * (bottom - top),
      value: entry.value,
      date: entry.date,
    }));
  }, [eligible]);
  const path = useMemo(() => smoothPath(chart), [chart]);
  const area = chart.length > 1 ? path + " L " + chart[chart.length - 1].x + " 166 L " + chart[0].x + " 166 Z" : "";
  const maxLabel = chart.length ? formatKwh(Math.max(...chart.map((entry) => entry.value))) : null;
  const measureLabel = mode === "electricity" ? "Estimated electricity" : "Estimated appliance use";

  return (
    <div className="sy-v2-console">
      <div className="sy-v2-console-bg" aria-hidden="true" />
      <header className="sy-v2-console-header">
        <span className="sy-v2-console-brand"><span className="sy-v2-console-pulse" /> ENERGY INTELLIGENCE</span>
        <span className="sy-v2-console-system">REPORT DATA <span>↗</span></span>
      </header>

      <div className="sy-v2-console-main">
        <div className="sy-v2-console-label"><Activity size={14} aria-hidden="true" /> YOUR SNAPSHOT</div>

        <div className="sy-v2-console-metrics">
          <div className="sy-v2-console-count">
            <span>SAVED REPORTS</span>
            <strong>{reportCount.toLocaleString("en-US")}</strong>
          </div>
          <div className="sy-v2-console-date">
            <FileText size={18} aria-hidden="true" />
            <span>LATEST ASSESSMENT</span>
            <strong>{latestDate}</strong>
          </div>
        </div>

        <div className="sy-v2-console-chart">
          <div className="sy-v2-console-chart-head">
            <div>
              <span className="sy-v2-console-mini-label">ENERGY PROFILE / HISTORICAL ESTIMATES</span>
              <strong>{measureLabel}</strong>
            </div>
            <BarChart3 size={19} aria-hidden="true" />
          </div>
          <div className="sy-v2-console-reading">
            <strong>{latest === null ? "No estimate yet" : formatKwh(latest)}</strong>
            <span>Latest available saved estimate</span>
          </div>
          <div className="sy-v2-console-graph" aria-label={eligible.length >= 2 ? "Trend across " + eligible.length + " saved energy estimates" : "Trend not yet available"}>
            <svg viewBox="0 0 526 188" role="img" aria-label={eligible.length >= 2 ? measureLabel + " across saved assessments" : "Energy data trend area, awaiting saved assessments"} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sy-v2-console-area" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#4CCAF8" stopOpacity=".42" />
                  <stop offset="1" stopColor="#4CCAF8" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="sy-v2-console-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop stopColor="#61D4FC" />
                  <stop offset=".75" stopColor="#7FDEFF" />
                  <stop offset="1" stopColor="#FFD400" />
                </linearGradient>
                <filter id="sy-v2-console-lineglow" x="-60%" y="-100%" width="220%" height="320%">
                  <feGaussianBlur stdDeviation="4.5" />
                </filter>
              </defs>
              <g fill="none" stroke="#9EDBFF" strokeOpacity=".22" strokeWidth="1">
                <path d="M25 35H500M25 74H500M25 113H500M25 152H500" strokeDasharray="4 8" />
                <path d="M25 24V168M143 24V168M263 24V168M383 24V168M500 24V168" strokeDasharray="3 10" />
              </g>
              <path d="M25 166H500" fill="none" stroke="#A8DDFC" strokeOpacity=".42" strokeWidth="1.2" />
              {chart.length > 1 && (
                <>
                  <path d={area} fill="url(#sy-v2-console-area)" className="sy-v2-console-area" />
                  <path d={path} fill="none" stroke="#52CEFC" strokeOpacity=".65" strokeWidth="11" strokeLinecap="round" filter="url(#sy-v2-console-lineglow)" />
                  <path d={path} fill="none" stroke="url(#sy-v2-console-stroke)" strokeWidth="4" strokeLinecap="round" className="sy-v2-console-drawing" />
                </>
              )}
              {chart.map((entry, index) => (
                <g key={entry.date + "-" + index} className="sy-v2-console-chart-dot">
                  <circle cx={entry.x} cy={entry.y} r="10" fill="#FFD400" fillOpacity=".14" />
                  <circle cx={entry.x} cy={entry.y} r="4.5" fill={index === chart.length - 1 ? "#FFD400" : "#A4EAFF"} stroke="#09264B" strokeWidth="1.7" />
                </g>
              ))}
              {chart.length === 0 && (
                <g fill="none" stroke="#6BCDF5" strokeWidth="1.8" strokeOpacity=".32">
                  <path d="M34 129L113 122L160 142L238 94L294 111L379 67L455 91L496 55" strokeDasharray="7 15" />
                  <circle cx="238" cy="94" r="7" stroke="#FFD400" />
                  <circle cx="379" cy="67" r="7" stroke="#FFD400" />
                </g>
              )}
            </svg>
            {eligible.length < 2 && (
              <div className="sy-v2-console-no-trend">
                {eligible.length === 1 ? "Save another assessment to see a trend." : "Estimates will appear after your assessment."}
              </div>
            )}
          </div>
          <div className="sy-v2-console-chart-footer">
            <span>{eligible.length >= 2 ? eligible[0].date + " → " + eligible[eligible.length - 1].date : "YOUR ENERGY HISTORY"}</span>
            <span>{maxLabel ?? "NO ESTIMATED VALUE"}</span>
          </div>
        </div>

        <div className="sy-v2-console-switch" role="group" aria-label="Select an energy estimate to view">
          <button type="button" aria-pressed={mode === "electricity"} className={mode === "electricity" ? "sy-v2-console-active" : ""} onClick={() => setMode("electricity")}>
            <Zap size={16} aria-hidden="true" /> Electricity
          </button>
          <button type="button" aria-pressed={mode === "appliances"} className={mode === "appliances" ? "sy-v2-console-active" : ""} onClick={() => setMode("appliances")}>
            <Activity size={16} aria-hidden="true" /> Appliances
          </button>
        </div>

        <footer className="sy-v2-console-footer">
          <span>WE LOOK AT</span>
          <strong>Electricity. Gas. Oil.</strong>
        </footer>
      </div>
    </div>
  );
}
