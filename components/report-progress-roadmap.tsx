"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, Circle, RotateCcw } from "lucide-react";

export type RoadmapAction = {
  action?: string;
  why_it_matters?: string;
  estimated_annual_saving_range?: string;
  estimated_cost_range?: string;
  effort_level?: string;
  priority?: string;
  suggested_next_step?: string;
};

const norm = (value?: string) => (value ?? "").trim().toLowerCase();

function makeActionKey(action: RoadmapAction, index: number) {
  return (action.action || "action-" + index).trim().toLowerCase();
}

export default function ReportProgressRoadmap({
  actions,
  reportId,
  lowCostActions = [],
  mediumCostActions = [],
  higherCostActions = [],
}: {
  actions: RoadmapAction[];
  reportId: string;
  lowCostActions?: RoadmapAction[];
  mediumCostActions?: RoadmapAction[];
  higherCostActions?: RoadmapAction[];
}) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  const storageKey = "save-your-ego-report-progress-v1:" + reportId;
  const low = new Set(lowCostActions.map((action) => norm(action.action)));
  const medium = new Set(mediumCostActions.map((action) => norm(action.action)));
  const higher = new Set(higherCostActions.map((action) => norm(action.action)));

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const safe: Record<string, boolean> = {};
          for (const [key, value] of Object.entries(parsed)) {
            if (typeof value === "boolean" && key.length < 500) safe[key] = value;
          }
          setCompleted(safe);
        }
      }
    } catch {
      // Local storage can be unavailable in privacy modes. Checklist still works for this visit.
    }
    setReady(true);
  }, [storageKey]);

  if (!actions.length) return null;

  const doneCount = actions.filter((item, index) => completed[makeActionKey(item, index)]).length;
  const percent = Math.round((doneCount / actions.length) * 100);

  function toggle(item: RoadmapAction, index: number) {
    if (!ready) return;
    const key = makeActionKey(item, index);
    const next = { ...completed, [key]: !completed[key] };
    setCompleted(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Saving is best-effort; visual progress remains available this visit.
    }
  }

  function reset() {
    setCompleted({});
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Browser may restrict storage.
    }
  }

  function getCost(item: RoadmapAction) {
    const key = norm(item.action);
    if (higher.has(key)) return { label: "Higher cost", className: "ri-cost-higher" };
    if (medium.has(key)) return { label: "Medium cost", className: "ri-cost-medium" };
    if (low.has(key)) return { label: "Low cost", className: "ri-cost-low" };
    return null;
  }

  return (
    <section id="report-roadmap" className="ri-roadmap report-section">
      <div className="ri-section-intro">
        <div>
          <p className="ri-section-kicker">04 / YOUR ROADMAP</p>
          <h2>{actions.length} actions, in your recommended order</h2>
          <p>Take one action at a time. Use the checklist to see what you have tackled.</p>
        </div>
        <span className="ri-roadmap-mini">YOUR ACTION PLAN <CheckCircle2 size={16} aria-hidden="true" /></span>
      </div>

      <div className="ri-roadmap-progress print:hidden">
        <div className="ri-roadmap-progress-top">
          <div><span>YOUR PROGRESS</span><strong>{doneCount} of {actions.length} completed</strong></div>
          <span className="ri-roadmap-percent">{percent}%</span>
        </div>
        <div className="ri-roadmap-progress-track" role="progressbar" aria-label="Completed report actions" aria-valuemin={0} aria-valuemax={actions.length} aria-valuenow={doneCount}>
          <span style={{width:percent + "%"}} />
        </div>
        <div className="ri-roadmap-progress-footer">
          <span>Checked actions are saved in this browser only, not synced to your account.</span>
          <button type="button" onClick={reset} disabled={!ready || doneCount === 0}><RotateCcw size={13} aria-hidden="true" /> Reset</button>
        </div>
      </div>

      <ol className="ri-roadmap-list print:hidden">
        {actions.map((item, index) => {
          const key = makeActionKey(item, index);
          const isDone = Boolean(completed[key]);
          const cost = getCost(item);
          return (
            <li key={index + "-" + key} className={"ri-roadmap-item " + (isDone ? "ri-roadmap-item-done" : "")}>
              <div className="ri-roadmap-item-index">
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="ri-roadmap-item-body">
                <div className="ri-roadmap-item-top">
                  <span className="ri-roadmap-item-kicker">PRIORITY {String(index + 1).padStart(2, "0")}</span>
                  <div className="ri-roadmap-tags">
                    {cost && <span className={"ri-cost-tag " + cost.className}>{cost.label}</span>}
                    {item.priority && <span className="ri-roadmap-ranking">{item.priority}</span>}
                  </div>
                </div>
                <h3>{item.action || "Recommended action"}</h3>
                {item.why_it_matters && <p className="ri-roadmap-why"><strong>Why:</strong> {item.why_it_matters}</p>}
                <div className="ri-roadmap-action-details">
                  {item.estimated_annual_saving_range && <div><span>COULD SAVE EACH YEAR</span><strong>{item.estimated_annual_saving_range}</strong></div>}
                  {item.estimated_cost_range && <div><span>ESTIMATED COST</span><strong>{item.estimated_cost_range}</strong></div>}
                  {item.effort_level && <div><span>EFFORT</span><strong>{item.effort_level}</strong></div>}
                </div>
                {item.suggested_next_step && <p className="ri-roadmap-next"><span>WHAT TO DO NEXT</span>{item.suggested_next_step}</p>}
              </div>
              <button
                className={"ri-roadmap-check print:hidden " + (isDone ? "ri-roadmap-check-done" : "")}
                type="button"
                aria-label={(isDone ? "Mark incomplete: " : "Mark complete: ") + (item.action || "Action " + (index + 1))}
                aria-pressed={isDone}
                disabled={!ready}
                onClick={() => toggle(item,index)}
              >
                {isDone ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : <Circle size={22} strokeWidth={1.8} aria-hidden="true" />}
              </button>
              {isDone && <span className="ri-roadmap-printed-done hidden print:block"><Check size={14} aria-hidden="true" /> Completed</span>}
            </li>
          );
        })}
      </ol>
      <table className="ri-roadmap-print-table hidden print:table">
        <thead>
          <tr>
            <th scope="col">Priority</th>
            <th scope="col">Recommended action</th>
            <th scope="col">Your next step</th>
            <th scope="col">Done</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((item, index) => (
            <tr key={"print-priority-" + index}>
              <td>{String(index + 1).padStart(2, "0")}</td>
              <td><strong>{item.action || "Recommended action"}</strong></td>
              <td>{item.suggested_next_step || "See the detailed recommendation above."}</td>
              <td>{completed[makeActionKey(item, index)] ? "Yes" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ri-roadmap-footnote">Savings and costs are estimates. Actions may overlap, so individual potential savings should not be added together.</div>
    </section>
  );
}
