"use client";

import { useState, type PointerEvent } from "react";

type Focus = "solar" | "heating" | "appliances";

const focusContent: Record<Focus, { code: string; title: string; description: string; detail: string }> = {
  solar: {
    code: "01 / SOLAR",
    title: "See your home's potential.",
    description: "Explore the roof, daylight and opportunities to use energy more efficiently.",
    detail: "ROOF + SOLAR",
  },
  heating: {
    code: "02 / HEATING",
    title: "Understand where heat goes.",
    description: "Focus on insulation, draughts and the way your home is heated.",
    detail: "HEAT + COMFORT",
  },
  appliances: {
    code: "03 / ELECTRICITY",
    title: "Find the everyday energy drains.",
    description: "Discover the habits and appliances worth checking first.",
    detail: "USAGE + APPLIANCES",
  },
};

export default function AnimatedHomeScene() {
  const [focus, setFocus] = useState<Focus>("solar");
  const current = focusContent[focus];

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--move-x", (horizontal * 16).toFixed(2) + "px");
    event.currentTarget.style.setProperty("--move-y", (vertical * 12).toFixed(2) + "px");
  }

  function resetPointer(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--move-x", "0px");
    event.currentTarget.style.setProperty("--move-y", "0px");
  }

  return (
    <div className={"sy-tech-panel sy-tech-panel--" + focus} onPointerMove={onPointerMove} onPointerLeave={resetPointer}>
      <div className="sy-tech-grain" aria-hidden="true" />
      <div className="sy-tech-grid" aria-hidden="true" />
      <div className="sy-tech-beam sy-tech-beam-one" aria-hidden="true" />
      <div className="sy-tech-beam sy-tech-beam-two" aria-hidden="true" />

      <div className="sy-tech-topbar">
        <span className="sy-tech-kicker"><span className="sy-tech-status-dot" /> SAVE YOUR EGO <span className="sy-tech-kicker-muted">/ HOME INTELLIGENCE</span></span>
        <span className="sy-tech-view-indicator">INTERACTIVE MODEL <span className="sy-tech-crosshair">✳</span></span>
      </div>

      <div className="sy-tech-scene" role="img" aria-label="Animated three-dimensional architectural house model with solar panels, illuminated windows and moving energy connections">
        <div className="sy-tech-halo" />
        <div className="sy-tech-radar sy-tech-radar-one" />
        <div className="sy-tech-radar sy-tech-radar-two" />
        <svg viewBox="0 0 840 625" xmlns="http://www.w3.org/2000/svg" className="sy-tech-house-svg" aria-hidden="true">
          <defs>
            <linearGradient id="sy-scene-left" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#316BB0" /><stop offset="1" stopColor="#0B3274" />
            </linearGradient>
            <linearGradient id="sy-scene-right" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#214F8F" /><stop offset="1" stopColor="#091F4C" />
            </linearGradient>
            <linearGradient id="sy-scene-roof" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5885B5" /><stop offset=".5" stopColor="#1A4C89" /><stop offset="1" stopColor="#0B2A60" />
            </linearGradient>
            <linearGradient id="sy-scene-glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#BAEEFF" /><stop offset=".4" stopColor="#5CBBED" /><stop offset="1" stopColor="#0A5692" />
            </linearGradient>
            <linearGradient id="sy-scene-panel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#54D4FF" /><stop offset=".4" stopColor="#0E7CC4" /><stop offset="1" stopColor="#092552" />
            </linearGradient>
            <linearGradient id="sy-scene-platform" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1E4F89" /><stop offset="1" stopColor="#061832" />
            </linearGradient>
            <radialGradient id="sy-scene-glow">
              <stop offset="0" stopColor="#51BBFA" stopOpacity=".3" />
              <stop offset="1" stopColor="#51BBFA" stopOpacity="0" />
            </radialGradient>
            <filter id="sy-scene-house-shadow" x="-40%" y="-40%" width="180%" height="190%">
              <feDropShadow dx="0" dy="25" stdDeviation="23" floodColor="#000718" floodOpacity=".52" />
            </filter>
            <filter id="sy-scene-neon" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <pattern id="sy-panel-lines" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(26)">
              <path d="M0 0H22M0 0V22" stroke="#99E6FF" strokeWidth=".65" opacity=".35" />
            </pattern>
          </defs>

          <circle cx="420" cy="343" r="315" fill="url(#sy-scene-glow)" />
          <g className="sy-tech-ground" opacity=".72" stroke="#2675AF" fill="none">
            <path d="M-70 420L420 625L920 413M-90 465L420 680L934 461M-80 373L420 580L915 369" strokeWidth="1" strokeDasharray="5 9" />
            <path d="M-30 388L460 592M35 345L526 551M110 313L600 515M187 283L682 488M272 254L758 457M350 225L839 429" opacity=".5" />
            <path d="M60 566L691 290M145 614L766 334M234 654L842 378M-16 515L620 248" opacity=".5" />
          </g>

          <g className="sy-tech-orbit-lines" stroke="#50B9F5" strokeWidth="1" fill="none" opacity=".28">
            <ellipse cx="412" cy="425" rx="330" ry="116" />
            <ellipse cx="412" cy="425" rx="280" ry="99" />
            <ellipse cx="412" cy="425" rx="240" ry="80" />
          </g>

          <g className="sy-tech-house-assembly" filter="url(#sy-scene-house-shadow)">
            <path d="M126 420L410 284L706 415L422 552Z" fill="#041733" stroke="#4A9CD2" strokeWidth="2" />
            <path d="M126 420L422 552L422 578L126 446Z" fill="url(#sy-scene-platform)" stroke="#3273AB" strokeWidth="2" />
            <path d="M422 552L706 415L706 442L422 578Z" fill="#0A2348" stroke="#3273AB" strokeWidth="2" />
            <path d="M146 421L422 550L681 422L410 299Z" fill="#0A2A59" />

            <path d="M170 293L416 406L416 529L170 414Z" fill="url(#sy-scene-left)" stroke="#5C9CD0" strokeWidth="3" />
            <path d="M416 406L665 292L665 414L416 529Z" fill="url(#sy-scene-right)" stroke="#64A7DB" strokeWidth="3" />
            <path d="M170 293L416 176L665 292L416 412Z" fill="url(#sy-scene-roof)" stroke="#89BFE6" strokeWidth="4" strokeLinejoin="round" />
            <path d="M170 293L416 412L665 292" fill="none" stroke="#80CEF2" strokeWidth="3" opacity=".7" />

            <path d="M200 314L402 406M206 335L402 427M206 356L402 448M438 423L642 328M438 445L642 351M438 467L642 373" fill="none" stroke="#74B4EB" strokeWidth="1.3" opacity=".17" />

            <g className="sy-tech-solar-model">
              <path d="M374 209L570 302L443 360L249 268Z" fill="#031B43" stroke="#73CFFF" strokeWidth="5" />
              <path d="M373 217L554 302L444 351L264 267Z" fill="url(#sy-scene-panel)" opacity=".94" />
              <path d="M373 217L554 302L444 351L264 267Z" fill="url(#sy-panel-lines)" />
              <path d="M328 238L510 323M284 259L464 343M416 238L309 287M465 260L361 312M514 282L409 335" fill="none" stroke="#A5E8FF" strokeWidth="2.5" opacity=".8" />
              <path d="M373 217L554 302" fill="none" stroke="#D6F6FF" strokeWidth="3" opacity=".8" />
            </g>

            <g className="sy-tech-windows-model">
              <path d="M201 338L288 378V447L201 408Z" fill="url(#sy-scene-glass)" stroke="#B6E8FA" strokeWidth="5" />
              <path d="M297 383L389 426V493L297 451Z" fill="url(#sy-scene-glass)" stroke="#B6E8FA" strokeWidth="5" />
              <path d="M244 357V425M343 407V470" stroke="#A3E3FA" strokeWidth="3" opacity=".8" />
              <path d="M201 374L288 413M297 419L389 461" stroke="#A3E3FA" strokeWidth="3" opacity=".75" />
              <path d="M442 429L539 385V461L442 505Z" fill="url(#sy-scene-glass)" stroke="#6BBCED" strokeWidth="5" />
              <path d="M548 381L641 339V409L548 452Z" fill="url(#sy-scene-glass)" stroke="#6BBCED" strokeWidth="5" />
              <path d="M490 408V483M593 360V431" stroke="#ABDBF7" strokeWidth="3" opacity=".73" />
              <path d="M442 466L539 423M548 416L641 377" stroke="#ABDBF7" strokeWidth="3" opacity=".73" />
            </g>

            <path d="M170 293L416 406L665 292" fill="none" stroke="#D5F4FF" strokeWidth="3" opacity=".56" />
            <path d="M417 406V529" stroke="#8BD4FF" strokeWidth="4" opacity=".75" />
            <path d="M176 417L416 529L660 414" stroke="#3D9CD5" strokeWidth="2" fill="none" opacity=".7" />
            <path d="M173 297L415 182L662 295" fill="none" stroke="#A3D5FA" strokeWidth="2" opacity=".42" />
          </g>

          <g className="sy-tech-heating-overlay" pointerEvents="none">
            <path d="M172 304L411 414L411 526L172 412Z" fill="#FFD400" opacity=".14" />
            <path d="M420 413L662 302L662 411L420 524Z" fill="#FFB64F" opacity=".16" />
            <path d="M174 302L416 186L658 296" fill="none" stroke="#FFD400" strokeWidth="8" opacity=".55" />
            <path d="M212 327Q296 279 395 348M446 362Q548 309 634 330" stroke="#FFD400" strokeWidth="4" fill="none" strokeDasharray="6 12" opacity=".88" />
          </g>

          <g className="sy-tech-powerflow" fill="none" strokeLinecap="round">
            <path className="sy-tech-path-glow" d="M503 316L575 351L611 399L713 367" stroke="#65DDFB" strokeWidth="15" opacity=".55" filter="url(#sy-scene-neon)" />
            <path className="sy-tech-path-primary" d="M503 316L575 351L611 399L713 367" stroke="#FFD400" strokeWidth="4" strokeDasharray="3 13" />
            <path className="sy-tech-path-primary sy-tech-path-secondary" d="M332 281L220 238L133 273" stroke="#7ADFFF" strokeWidth="3.5" strokeDasharray="3 12" />
          </g>

          <g className="sy-tech-appliance-pulses" fill="none">
            <rect x="194" y="331" width="100" height="125" stroke="#FFD400" strokeWidth="3" rx="5" opacity=".9" />
            <rect x="434" y="379" width="112" height="137" stroke="#FFD400" strokeWidth="3" rx="5" opacity=".9" />
          </g>

          <g fill="#55C7FC">
            <circle className="sy-tech-node sy-tech-node-1" cx="119" cy="430" r="5" />
            <circle className="sy-tech-node sy-tech-node-2" cx="720" cy="410" r="5" />
            <circle className="sy-tech-node sy-tech-node-3" cx="418" cy="170" r="5" />
          </g>
          <g stroke="#69D3FF" opacity=".75" strokeWidth="1.5" fill="none">
            <path d="M112 420L65 398H32M674 228L726 205H809M584 502L694 552H815" strokeDasharray="3 6" />
          </g>
          <g fill="#D5F4FF" fontSize="12" fontFamily="system-ui, sans-serif" fontWeight="700" letterSpacing="2">
            <text x="30" y="388">ENERGY</text><text x="30" y="403">PROFILE</text>
            <text x="682" y="189">SYSTEM</text><text x="682" y="203">OVERVIEW</text>
            <text x="698" y="569">HOME</text><text x="698" y="584">MODEL</text>
          </g>

          <g className="sy-tech-corner-points" stroke="#8CD5F9" strokeWidth="2" fill="none" opacity=".75">
            <path d="M47 69V48H67M773 48H795V69M47 552V574H67M773 574H795V552" />
          </g>
        </svg>

        <div className="sy-tech-spec sy-tech-spec-top">
          <span className="sy-tech-spec-eyebrow">ACTIVE FOCUS</span>
          <strong>{current.detail}</strong>
          <span className="sy-tech-mini-track"><span /></span>
        </div>
        <div className="sy-tech-spec sy-tech-spec-bottom">
          <span className="sy-tech-spec-eyebrow">HOME EFFICIENCY</span>
          <strong>Explore the possibilities</strong>
          <small>Electricity · Gas · Oil</small>
        </div>
        <div className="sy-tech-scene-axis">SYE / INTERACTIVE CONCEPT 01</div>
      </div>

      <div className="sy-tech-bottom">
        <div className="sy-tech-description" aria-live="polite">
          <span>{current.code}</span>
          <strong>{current.title}</strong>
          <p>{current.description}</p>
        </div>
        <div className="sy-tech-focus-buttons" role="group" aria-label="Change home visualization focus">
          <button type="button" aria-pressed={focus === "solar"} className={focus === "solar" ? "sy-tech-button-active" : ""} onClick={() => setFocus("solar")}>
            <span>01</span> Solar
          </button>
          <button type="button" aria-pressed={focus === "heating"} className={focus === "heating" ? "sy-tech-button-active" : ""} onClick={() => setFocus("heating")}>
            <span>02</span> Heating
          </button>
          <button type="button" aria-pressed={focus === "appliances"} className={focus === "appliances" ? "sy-tech-button-active" : ""} onClick={() => setFocus("appliances")}>
            <span>03</span> Electricity
          </button>
        </div>
      </div>
      <div className="sy-tech-disclaimer">ILLUSTRATIVE MODEL — NO LIVE HOME DATA</div>
    </div>
  );
}
