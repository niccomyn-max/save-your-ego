"use client";

import { useState } from "react";

type View = "building" | "thermal" | "electricity";

type Props = {
  propertyType: string;
  heatingSystem: string;
  hasSolar: boolean;
  usesGas: boolean;
  usesOil: boolean;
};

const views: Record<View, { number: string; name: string; eyebrow: string; headline: string; description: string; focus: string }> = {
  building: {
    number: "01",
    name: "Building",
    eyebrow: "BUILDING PROFILE",
    headline: "A clearer picture of your home.",
    description: "Your property details help shape the questions and the guidance in your report.",
    focus: "PROPERTY DETAILS",
  },
  thermal: {
    number: "02",
    name: "Heating",
    eyebrow: "THERMAL SYSTEMS",
    headline: "Understand your heating.",
    description: "Look at your heating system, insulation and the places heat may escape.",
    focus: "HEAT & COMFORT",
  },
  electricity: {
    number: "03",
    name: "Electricity",
    eyebrow: "ENERGY CONSUMPTION",
    headline: "Explore energy use.",
    description: "Review electricity, appliances and optional solar considerations.",
    focus: "USAGE & APPLIANCES",
  },
};

export default function AssessmentEnergyVisualizer({
  propertyType,
  heatingSystem,
  hasSolar,
  usesGas,
  usesOil,
}: Props) {
  const [view, setView] = useState<View>("building");
  const selected = views[view];
  const fuels = ["Electricity", ...(usesGas ? ["Gas"] : []), ...(usesOil ? ["Oil"] : [])];
  const safePropertyType = propertyType || "Your home";
  const safeHeating = heatingSystem || "Not selected";

  return (
    <div className={"sy-av sy-av-" + view}>
      <div className="sy-av-top">
        <span className="sy-av-brand"><span className="sy-av-live-dot" /> HOME ENERGY INTELLIGENCE</span>
        <span className="sy-av-edition">VISUAL OVERVIEW <span aria-hidden="true">↗</span></span>
      </div>

      <div className="sy-av-viewport">
        <div className="sy-av-aura sy-av-aura-1" aria-hidden="true" />
        <div className="sy-av-aura sy-av-aura-2" aria-hidden="true" />
        <svg
          viewBox="0 0 960 660"
          className="sy-av-model"
          aria-hidden="true"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sy-av-face-left" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#2A6FAF" />
              <stop offset=".55" stopColor="#174A80" />
              <stop offset="1" stopColor="#0B315F" />
            </linearGradient>
            <linearGradient id="sy-av-face-right" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#0C376B" />
              <stop offset=".55" stopColor="#0C305A" />
              <stop offset="1" stopColor="#071C3A" />
            </linearGradient>
            <linearGradient id="sy-av-roof" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#6EBCE5" />
              <stop offset=".35" stopColor="#235C98" />
              <stop offset="1" stopColor="#0C3168" />
            </linearGradient>
            <linearGradient id="sy-av-glass" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#B3EFFF" />
              <stop offset=".45" stopColor="#4FA9D9" />
              <stop offset="1" stopColor="#125393" />
            </linearGradient>
            <linearGradient id="sy-av-solar" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#77CFEF" />
              <stop offset=".5" stopColor="#166BA8" />
              <stop offset="1" stopColor="#071F49" />
            </linearGradient>
            <linearGradient id="sy-av-floor" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#27588E" />
              <stop offset="1" stopColor="#081F42" />
            </linearGradient>
            <radialGradient id="sy-av-haze">
              <stop stopColor="#3A9CE5" stopOpacity=".23" />
              <stop offset=".7" stopColor="#205CA7" stopOpacity=".05" />
              <stop offset="1" stopColor="#1A4789" stopOpacity="0" />
            </radialGradient>
            <filter id="sy-av-shadow" x="-40%" y="-60%" width="190%" height="240%">
              <feDropShadow dx="0" dy="26" stdDeviation="23" floodColor="#020C21" floodOpacity=".55" />
            </filter>
            <filter id="sy-av-line-blur" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          <circle cx="490" cy="324" r="340" fill="url(#sy-av-haze)" />
          <g className="sy-av-gridlines" stroke="#85C8EE" fill="none" strokeWidth="1.2" opacity=".17">
            <path d="M-120 434L456 645L1060 426M-100 481L456 693L1060 467M-120 389L456 601L1060 387" strokeDasharray="4 10" />
            <path d="M-95 343L603 595M-2 312L691 555M96 281L788 524M190 245L889 491M302 205L1002 455" strokeDasharray="4 10" />
            <path d="M-10 558L671 285M85 603L764 325M181 647L854 365M269 681L959 406" strokeDasharray="4 10" />
          </g>

          <g className="sy-av-orbit" fill="none" stroke="#76BFF0">
            <ellipse cx="484" cy="423" rx="392" ry="157" strokeWidth="2" strokeOpacity=".25" strokeDasharray="5 17" />
            <ellipse cx="484" cy="423" rx="318" ry="127" strokeWidth="1" strokeOpacity=".28" />
            <ellipse cx="484" cy="423" rx="240" ry="90" strokeWidth="1.5" strokeOpacity=".34" strokeDasharray="28 13" />
          </g>

          <g className="sy-av-house" filter="url(#sy-av-shadow)">
            <path d="M157 441L479 297L814 443L490 594Z" fill="#0A2D5A" stroke="#4FA3D3" strokeWidth="2.3" />
            <path d="M157 441L490 594V625L157 472Z" fill="url(#sy-av-floor)" stroke="#428DCD" strokeWidth="2" />
            <path d="M490 594L814 443V474L490 625Z" fill="#09254D" stroke="#2D75B5" strokeWidth="2" />
            <path d="M176 439L489 582L792 445L479 308Z" fill="#123F73" />

            <path d="M205 320L490 453V564L205 433Z" fill="url(#sy-av-face-left)" stroke="#6BAEE2" strokeWidth="3" />
            <path d="M490 453L763 326V436L490 564Z" fill="url(#sy-av-face-right)" stroke="#549ACF" strokeWidth="3" />
            <path d="M205 320L489 189L763 326L490 462Z" fill="url(#sy-av-roof)" stroke="#A2DFFB" strokeWidth="5" strokeLinejoin="round" />
            <path d="M205 320L490 453L763 326" fill="none" stroke="#8BD2F7" strokeWidth="2.5" />
            <path d="M489 189L489 453" fill="none" stroke="#77C0E6" strokeWidth="2" opacity=".3" />
            <path d="M205 320L489 189L763 326" fill="none" stroke="#E5F9FF" strokeOpacity=".33" strokeWidth="2" />

            <g className="sy-av-roof-panels">
              <path d="M436 225L633 321L503 382L305 286Z" fill="#09244F" stroke="#70CBF2" strokeWidth="4" strokeLinejoin="round" />
              <path d="M432 235L616 321L503 372L322 287Z" fill="url(#sy-av-solar)" />
              <path d="M432 235L616 321L503 372L322 287Z" fill="none" stroke="#B8EEFF" strokeOpacity=".6" strokeWidth="1.5" />
              <path d="M367 264L553 348M414 244L594 329M478 258L368 308M526 281L418 331M576 306L468 352" stroke="#94DCF7" strokeWidth="2" opacity=".68" />
              <path d="M434 235L613 322" stroke="#E1FAFF" strokeOpacity=".7" strokeWidth="2.5" />
            </g>

            <g className="sy-av-glass">
              <path d="M246 356L350 405V482L246 434Z" fill="url(#sy-av-glass)" stroke="#9CCFF2" strokeWidth="4" />
              <path d="M366 411L467 457V533L366 487Z" fill="url(#sy-av-glass)" stroke="#9CCFF2" strokeWidth="4" />
              <path d="M298 380V458M415 433V511M246 393L350 443M366 448L467 495" stroke="#BDFAFF" strokeOpacity=".64" strokeWidth="2.5" />
              <path d="M514 456L619 406V487L514 537Z" fill="url(#sy-av-glass)" stroke="#77BBE5" strokeWidth="4" />
              <path d="M635 399L727 359V432L635 475Z" fill="url(#sy-av-glass)" stroke="#77BBE5" strokeWidth="4" />
              <path d="M567 431V512M681 379V453M514 493L619 445M635 436L727 397" stroke="#A5EAFF" strokeOpacity=".57" strokeWidth="2.5" />
            </g>

            <path d="M205 433L490 564L763 436" stroke="#5CB6E6" strokeOpacity=".7" strokeWidth="2.5" fill="none" />
            <path d="M490 453V564" stroke="#99D2F9" strokeOpacity=".65" strokeWidth="3" />
            <path d="M237 335L458 437M523 444L723 351" stroke="#76BAEE" strokeOpacity=".24" strokeWidth="1.5" />
          </g>

          <g className="sy-av-thermal-overlay" pointerEvents="none">
            <path d="M207 323L489 455V560L207 431Z" fill="#FFD400" opacity=".15" />
            <path d="M491 454L761 329V433L491 559Z" fill="#FFAD52" opacity=".13" />
            <path d="M212 323L489 196L757 327" fill="none" stroke="#FFD400" strokeWidth="8" opacity=".72" />
            <path className="sy-av-dash-moving" d="M227 334L489 457L747 336" stroke="#FFD400" strokeDasharray="3 17" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M277 444Q345 395 426 460M538 484Q594 425 677 453" stroke="#FFC162" strokeWidth="4" strokeDasharray="5 11" fill="none" />
          </g>

          <g className="sy-av-electricity-overlay" pointerEvents="none">
            <path className="sy-av-dash-moving" d="M411 271L527 345L612 396L783 369" stroke="#FFD400" strokeDasharray="5 18" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M411 271L527 345L612 396L783 369" stroke="#FFE880" opacity=".3" strokeWidth="16" fill="none" filter="url(#sy-av-line-blur)" />
            <path d="M350 386L415 417L415 518" fill="none" stroke="#81E1FF" strokeDasharray="4 10" strokeWidth="4" />
            <circle className="sy-av-pulse-node" cx="415" cy="518" r="11" stroke="#FFD400" fill="#FFD400" fillOpacity=".12" strokeWidth="2" />
            <circle className="sy-av-pulse-node" cx="612" cy="396" r="11" stroke="#8DE9FF" fill="#8DE9FF" fillOpacity=".12" strokeWidth="2" />
          </g>

          <g className="sy-av-building-overlay" fill="none" stroke="#91E0FF" pointerEvents="none">
            <path className="sy-av-dash-moving" d="M191 306L487 170L784 309" strokeWidth="2.5" strokeDasharray="4 14" />
            <path className="sy-av-dash-moving" d="M182 440L492 585L792 444" strokeWidth="2.5" strokeDasharray="4 14" />
            <path d="M170 314V446M800 304V449" strokeWidth="1" strokeDasharray="3 8" opacity=".7" />
            <path d="M165 312L177 312M165 446L177 446M795 304L807 304M795 449L807 449" strokeWidth="2" />
          </g>

          <g className="sy-av-callouts" pointerEvents="none">
            <path d="M333 260L249 180H120M590 326L716 240H837M605 497L706 548H858" fill="none" stroke="#93D4F5" strokeOpacity=".6" strokeDasharray="4 8" strokeWidth="1.8" />
            <g fill="#061B38" stroke="#72B7E1" strokeWidth="2">
              <circle cx="333" cy="260" r="8" /><circle cx="590" cy="326" r="8" /><circle cx="605" cy="497" r="8" />
            </g>
            <g fill="#FFD400"><circle cx="333" cy="260" r="3" /><circle cx="590" cy="326" r="3" /><circle cx="605" cy="497" r="3" /></g>
            <g fill="#BADDF4" fontFamily="Arial,Helvetica,sans-serif" fontSize="13" fontWeight="700" letterSpacing="2">
              <text x="120" y="165">HOME</text><text x="120" y="180">PROFILE</text>
              <text x="716" y="225">ROOF +</text><text x="716" y="240">SOLAR</text>
              <text x="710" y="566">ENERGY</text><text x="710" y="581">SYSTEMS</text>
            </g>
          </g>

          <g className="sy-av-crosshairs" stroke="#A1D5FC" strokeOpacity=".6" strokeWidth="2" fill="none">
            <path d="M45 80V58H68M895 58H918V81M45 580V603H68M895 603H918V580" />
          </g>
        </svg>

        <div className="sy-av-indicator sy-av-indicator-left"><span>MODEL / 01</span><strong>{selected.focus}</strong></div>
        <div className="sy-av-indicator sy-av-indicator-right"><span>INPUT TYPE</span><strong>{safePropertyType}</strong></div>
        <div className="sy-av-scanmark" aria-hidden="true">SYE  /  ASSESSMENT VISUAL  /  001</div>
      </div>

      <div className="sy-av-details">
        <div className="sy-av-details-copy" aria-live="polite">
          <span className="sy-av-eyebrow">{selected.number} / {selected.eyebrow}</span>
          <strong>{selected.headline}</strong>
          <p>{selected.description}</p>
        </div>
        <div className="sy-av-input-bits">
          <div><span>PROPERTY</span><strong>{safePropertyType}</strong></div>
          <div><span>HEATING</span><strong>{safeHeating}</strong></div>
          <div><span>ENERGY</span><strong>{fuels.join(" + ")}</strong></div>
        </div>
      </div>

      <div className="sy-av-controls" aria-label="Illustrated energy topics">
        {(Object.keys(views) as View[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setView(item)}
            aria-pressed={view === item}
            className={view === item ? "sy-av-control sy-av-control-active" : "sy-av-control"}
          >
            <span>{views[item].number}</span>
            {views[item].name}
          </button>
        ))}
      </div>

      <div className="sy-av-bottomline">
        <span>VISUAL GUIDE — NOT A LIVE ENERGY MEASUREMENT</span>
        <span>{hasSolar ? "SOLAR SELECTED" : "SOLAR NOT SELECTED"}</span>
      </div>
    </div>
  );
}
