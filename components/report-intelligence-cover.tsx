import Image from "next/image";
import { ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

type ReportCoverProps = {
  assessmentDate: string;
  propertyType: string;
  fuels: string[];
  electricityKwh: number | null;
  applianceKwh: number | null;
  biggestLossArea: string;
  fabricBand: string;
  priorities: string[];
};

export function formatEnergyEstimate(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value).toLocaleString("en-US") + " kWh/yr"
    : "Not estimated";
}

function EnergyHomeDiagram() {
  return (
    <svg className="ri-home-diagram" viewBox="0 0 680 470" role="img" aria-label="Conceptual architectural home model with energy routes and solar roof" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ri-wall-l" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#4B91C5" /><stop offset=".6" stopColor="#24649E" /><stop offset="1" stopColor="#113E70" />
        </linearGradient>
        <linearGradient id="ri-wall-r" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#194E89" /><stop offset="1" stopColor="#09264D" />
        </linearGradient>
        <linearGradient id="ri-roof" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#8EC6E8" /><stop offset=".35" stopColor="#346A9E" /><stop offset="1" stopColor="#102D60" />
        </linearGradient>
        <linearGradient id="ri-solar" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#72DEFA" /><stop offset=".65" stopColor="#1979B7" /><stop offset="1" stopColor="#0B3262" />
        </linearGradient>
        <radialGradient id="ri-haze">
          <stop stopColor="#51C7FF" stopOpacity=".23" /><stop offset=".6" stopColor="#51C7FF" stopOpacity=".08" /><stop offset="1" stopColor="#51C7FF" stopOpacity="0" />
        </radialGradient>
        <filter id="ri-shadow" x="-50%" y="-50%" width="200%" height="230%">
          <feDropShadow dx="0" dy="19" stdDeviation="17" floodColor="#000914" floodOpacity=".5" />
        </filter>
      </defs>
      <circle cx="346" cy="228" r="220" fill="url(#ri-haze)" />
      <g fill="none" stroke="#9DD9F8" strokeOpacity=".2">
        <path d="M-20 320L328 467L700 316M0 367L328 503L702 365M-5 276L328 428L702 272" strokeDasharray="4 9" />
        <path d="M38 404L490 209M112 444L562 249M205 472L649 284M-40 357L403 164" strokeDasharray="4 9" />
        <ellipse cx="339" cy="326" rx="280" ry="103" strokeDasharray="4 13" />
        <ellipse cx="339" cy="326" rx="231" ry="78" />
      </g>
      <g className="ri-home-building" filter="url(#ri-shadow)">
        <path d="M123 330L334 229L572 327L355 433Z" fill="#06244A" stroke="#69B2E6" strokeWidth="2" />
        <path d="M123 330L355 433V457L123 352Z" fill="#1A4777" stroke="#438BC0" strokeWidth="2" />
        <path d="M355 433L572 327V350L355 457Z" fill="#0B2B53" stroke="#438BC0" strokeWidth="2" />
        <path d="M148 235L346 329V417L148 324Z" fill="url(#ri-wall-l)" stroke="#8DC6E9" strokeWidth="2.5" />
        <path d="M346 329L552 234V326L346 417Z" fill="url(#ri-wall-r)" stroke="#68ADE0" strokeWidth="2.5" />
        <path d="M148 235L346 138L552 234L346 338Z" fill="url(#ri-roof)" stroke="#B2E1FA" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M148 235L346 329L552 234" fill="none" stroke="#D4F3FD" strokeWidth="2" />
        <g>
          <path d="M307 169L458 236L368 278L219 210Z" fill="#062552" stroke="#8CDBFB" strokeWidth="3" />
          <path d="M303 175L446 237L367 269L229 208Z" fill="url(#ri-solar)" />
          <path d="M264 189L407 255M307 174L443 237M352 193L260 224M390 209L301 243M425 223L341 259" stroke="#B1EDFC" strokeWidth="1.7" opacity=".75"/>
        </g>
        <g fill="#5AAEE1" stroke="#C1EEFD" strokeWidth="3">
          <path d="M175 267L248 300V355L175 321Z"/><path d="M260 307L325 337V392L260 362Z"/>
          <path d="M372 344L448 309V367L372 401Z"/><path d="M461 302L528 272V327L461 359Z"/>
        </g>
        <g fill="none" stroke="#CEFAFF" strokeOpacity=".63" strokeWidth="2">
          <path d="M212 284V337M292 321V375M409 326V383M495 287V343"/>
          <path d="M175 294L248 328M260 335L325 364M372 372L448 339M461 327L528 300"/>
        </g>
      </g>
      <g className="ri-home-flow" fill="none" strokeLinecap="round">
        <path d="M249 178Q162 111 86 150" stroke="#55CFF8" strokeOpacity=".36" strokeWidth="12" />
        <path d="M249 178Q162 111 86 150" stroke="#FFD400" strokeWidth="3.5" strokeDasharray="4 13" className="ri-home-dash"/>
        <path d="M418 256L516 287L615 245" stroke="#69DFF6" strokeOpacity=".3" strokeWidth="11"/>
        <path d="M418 256L516 287L615 245" stroke="#80EEFF" strokeWidth="3.5" strokeDasharray="4 13" className="ri-home-dash"/>
      </g>
      <g className="ri-home-annotations" fill="none" stroke="#80C8EF" strokeWidth="1.5" strokeDasharray="3 7">
        <path d="M241 175L189 95H60M485 266L587 167H657M438 375L578 412H657" />
      </g>
      <g fill="#FFD400"><circle cx="241" cy="175" r="4"/><circle cx="485" cy="266" r="4"/><circle cx="438" cy="375" r="4"/></g>
      <g fill="#A3D5F0" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700" letterSpacing="2">
        <text x="57" y="83">SOLAR</text><text x="564" y="154">THERMAL</text><text x="576" y="430">ELECTRICITY</text>
      </g>
      <g fill="none" stroke="#A3D5F0" strokeWidth="2" opacity=".48">
        <path d="M30 38V22H46M632 22H648V38M30 428V446H46M632 446H648V428"/>
      </g>
    </svg>
  );
}

export function ReportIntelligenceCover({
  assessmentDate,
  propertyType,
  fuels,
  electricityKwh,
  applianceKwh,
  biggestLossArea,
  fabricBand,
  priorities,
}: ReportCoverProps) {
  return (
    <section id="report-overview" className="ri-cover report-cover">
      <div className="ri-cover-body">
        <div className="ri-cover-wordmark">
          <Image src="/save-your-ego-logo.png" alt="Save Your EGO" width={252} height={90} className="h-auto w-48 sm:w-52" priority />
          <span className="ri-document-marker"><span /> YOUR ENERGY INTELLIGENCE REPORT</span>
        </div>

        <div className="ri-cover-title-block">
          <div className="ri-cover-overline"><Sparkles size={14} aria-hidden="true"/> PERSONALISED HOME ANALYSIS</div>
          <h1>Understand your energy.<br/><span>Know what to do next.</span></h1>
          <p>Your home's practical energy-saving opportunities, explained and prioritised in one clear report.</p>
        </div>

        <div className="ri-cover-highlights">
          <div className="ri-cover-highlight">
            <span>ESTIMATED ELECTRICITY USE</span>
            <strong>{formatEnergyEstimate(electricityKwh)}</strong>
            <small>Based on the information you provided</small>
          </div>
          <div className="ri-cover-highlight">
            <span>APPLIANCE ESTIMATE</span>
            <strong>{formatEnergyEstimate(applianceKwh)}</strong>
            <small>Included within home electricity use; not additional</small>
          </div>
        </div>

        {priorities.length > 0 && (
          <div className="ri-cover-opportunities">
            <div className="ri-cover-opportunities-title">
              <span><CheckCircle2 size={17} aria-hidden="true"/> YOUR FIRST MOVES</span>
              <a href="#report-actions" className="ri-cover-more print:hidden">Explore actions <ArrowUpRight size={15} aria-hidden="true" /></a>
            </div>
            <ol>
              {priorities.slice(0, 3).map((item, i) => (
                <li key={"cover-priority-" + i}><span>{String(i + 1).padStart(2, "0")}</span><p>{item}</p></li>
              ))}
            </ol>
          </div>
        )}

        <div className="ri-cover-meta">
          <span><ShieldCheck size={15} aria-hidden="true"/> Based on your assessment</span>
          <span>{propertyType || "Your home"} · {assessmentDate}</span>
        </div>
      </div>

      <div className="ri-cover-visual">
        <div className="ri-cover-visual-top">
          <span><span className="ri-status-led"/> HOME SYSTEMS / OVERVIEW</span>
          <span>SYE / INTELLIGENCE 01</span>
        </div>
        <div className="ri-cover-diagram-frame"><EnergyHomeDiagram/></div>
        <div className="ri-cover-visual-info">
          <div className="ri-cover-data">
            <span>LIKELY HEAT-LOSS AREA</span>
            <strong>{biggestLossArea || "Not enough information"}</strong>
          </div>
          <div className="ri-cover-data">
            <span>INSULATION OVERVIEW</span>
            <strong>{fabricBand || "Not enough information"}</strong>
          </div>
          <div className="ri-cover-systems"><span>ENERGY SOURCES</span><strong>{fuels.join(" · ")}</strong></div>
        </div>
        <div className="ri-cover-visual-bottom"><span>01 / ENERGY PROFILE</span><span>Illustrative model · not a live reading</span></div>
      </div>
    </section>
  );
}

export function ReportEnergyAnalysis({
  electricityKwh,
  applianceKwh,
  biggestLossArea,
  fabricBand,
}: {
  electricityKwh: number | null;
  applianceKwh: number | null;
  biggestLossArea: string;
  fabricBand: string;
}) {
  const validElectricity = electricityKwh !== null && electricityKwh > 0;
  const validAppliance = applianceKwh !== null && applianceKwh > 0;
  const hasComparableShare = validElectricity && validAppliance && applianceKwh <= electricityKwh;
  const applianceShare = hasComparableShare && electricityKwh && applianceKwh ? Math.min(100, Math.round(applianceKwh / electricityKwh * 100)) : null;

  return (
    <section id="report-energy" className="ri-energy-section report-section">
      <div className="ri-section-intro">
        <div>
          <p className="ri-section-kicker">01 / ENERGY ANALYSIS</p>
          <h2>Your home at a glance</h2>
          <p>Here is what the assessment suggests about your home's energy use. These are estimates, not meter readings.</p>
        </div>
        <span className="ri-analysis-chip"><span/> ASSESSMENT-BASED</span>
      </div>
      <div className="ri-energy-grid">
        <div className="ri-usage-graph">
          <div className="ri-usage-heading">
            <div><span>ELECTRICITY</span><strong>Understanding your usage</strong></div>
            <span className="ri-usage-graph-icon" aria-hidden="true">↗</span>
          </div>
          <div className="ri-usage-stats">
            <div><span>Estimated yearly electricity</span><strong>{formatEnergyEstimate(electricityKwh)}</strong></div>
            <div><span>Estimated appliance use</span><strong>{formatEnergyEstimate(applianceKwh)}</strong></div>
          </div>
          {hasComparableShare ? (
            <div className="ri-usage-bars">
              <div className="ri-usage-bar-label"><span>Whole home estimate</span><b>100%</b></div>
              <div className="ri-usage-track"><span className="ri-bar-whole" style={{width:"100%"}} /></div>
              <div className="ri-usage-bar-label"><span>Appliances within that estimate</span><b>{applianceShare}%</b></div>
              <div className="ri-usage-track"><span className="ri-bar-appliance" style={{width:applianceShare + "%"}} /></div>
              <p>The appliance figure is a part of the total estimate, not an extra amount to add on.</p>
            </div>
          ) : (
            <div className="ri-usage-unavailable">A reliable appliance share cannot be shown from the figures available. Your individual estimates are listed above where available.</div>
          )}
        </div>
        <div className="ri-home-findings">
          <span className="ri-findings-title">BUILDING FINDINGS</span>
          <div className="ri-finding-item">
            <div className="ri-finding-symbol" aria-hidden="true">01</div>
            <div><span>Where heat may escape</span><strong>{biggestLossArea || "Not enough information"}</strong></div>
          </div>
          <div className="ri-finding-item">
            <div className="ri-finding-symbol" aria-hidden="true">02</div>
            <div><span>How your home holds heat</span><strong>{fabricBand || "Not enough information"}</strong></div>
          </div>
          <p>These findings help you choose where to investigate first. Confirm technical details with an expert before major upgrades.</p>
        </div>
      </div>
    </section>
  );
}
