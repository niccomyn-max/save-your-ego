"use client";

import { useState } from "react";

type ViewMode = "structure" | "thermal" | "power";

type Props = {
  propertyType: string;
  heatingSystem: string;
  glazing: string;
  bedrooms: number;
  occupants: number;
  hasSolar: boolean;
  usesGas: boolean;
  usesOil: boolean;
};

const contentByMode: Record<ViewMode, {
  eyebrow: string;
  title: string;
  description: string;
  signal: string;
}> = {
  structure: {
    eyebrow: "01 / THE PROPERTY",
    title: "See the full picture.",
    description: "Your home details form the foundation of the assessment.",
    signal: "BUILDING PROFILE",
  },
  thermal: {
    eyebrow: "02 / HEAT & COMFORT",
    title: "Look beneath the surface.",
    description: "Insulation, glazing and heating all contribute to the bigger picture.",
    signal: "THERMAL PROFILE",
  },
  power: {
    eyebrow: "03 / ENERGY USE",
    title: "Connect the energy dots.",
    description: "Electricity, appliances and fuel choices help shape your report.",
    signal: "ENERGY PROFILE",
  },
};

function display(value: string | number | null | undefined, fallback = "Not specified") {
  if (value === "" || value === null || value === undefined) return fallback;
  return String(value);
}

export default function AssessmentEnergyTwinV2({
  propertyType,
  heatingSystem,
  glazing,
  bedrooms,
  occupants,
  hasSolar,
  usesGas,
  usesOil,
}: Props) {
  const [mode, setMode] = useState<ViewMode>("structure");
  const copy = contentByMode[mode];
  const fuelCount = 1 + Number(Boolean(usesGas)) + Number(Boolean(usesOil));

  return (
    <div className={"sy-v2-twin sy-v2-twin-" + mode}>
      <header className="sy-v2-twin-header">
        <div className="sy-v2-twin-header-title">
          <span className="sy-v2-status-light" />
          <span>HOME ENERGY INTELLIGENCE</span>
        </div>
        <span className="sy-v2-twin-model-id">MODEL <strong>01</strong> / 03</span>
      </header>

      <div className="sy-v2-twin-stage">
        <div className="sy-v2-twin-stage-halo" aria-hidden="true" />
        <div className="sy-v2-twin-stage-grid" aria-hidden="true" />

        <svg className="sy-v2-twin-svg" viewBox="0 0 800 590" role="img" aria-label="Animated three-dimensional architectural home with different building, heating and energy views" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sy-v2-wall-front" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#639DD0" />
              <stop offset=".36" stopColor="#2C6399" />
              <stop offset="1" stopColor="#143762" />
            </linearGradient>
            <linearGradient id="sy-v2-wall-right" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#234F80" />
              <stop offset=".55" stopColor="#173D71" />
              <stop offset="1" stopColor="#0A254F" />
            </linearGradient>
            <linearGradient id="sy-v2-roof-shading" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#98BEDA" />
              <stop offset=".43" stopColor="#396A9E" />
              <stop offset="1" stopColor="#112F65" />
            </linearGradient>
            <linearGradient id="sy-v2-solar-panel" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#B4EEFC" />
              <stop offset=".25" stopColor="#36A9DC" />
              <stop offset=".78" stopColor="#0D5599" />
              <stop offset="1" stopColor="#082954" />
            </linearGradient>
            <linearGradient id="sy-v2-window-light" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#C9F9FF" />
              <stop offset=".55" stopColor="#6BC6EA" />
              <stop offset="1" stopColor="#1466A8" />
            </linearGradient>
            <linearGradient id="sy-v2-ground-panel" x1="0" y1="0" x2=".5" y2="1">
              <stop stopColor="#1A518B" />
              <stop offset="1" stopColor="#081B36" />
            </linearGradient>
            <radialGradient id="sy-v2-glow-aura">
              <stop stopColor="#48C5FF" stopOpacity=".35" />
              <stop offset=".52" stopColor="#4389E2" stopOpacity=".07" />
              <stop offset="1" stopColor="#4389E2" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sy-v2-thermal-map" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#FFB84D" stopOpacity=".27" />
              <stop offset=".47" stopColor="#FFD400" stopOpacity=".07" />
              <stop offset="1" stopColor="#F97357" stopOpacity=".36" />
            </linearGradient>
            <filter id="sy-v2-drop-shadow" x="-50%" y="-50%" width="220%" height="220%">
              <feDropShadow dx="0" dy="28" stdDeviation="26" floodColor="#000719" floodOpacity=".52" />
            </filter>
            <filter id="sy-v2-soft-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          <circle cx="400" cy="277" r="286" fill="url(#sy-v2-glow-aura)" />

          <g className="sy-v2-twin-floorgrid" fill="none" stroke="#77C2F2" strokeWidth="1.1">
            <path d="M-90 393L393 570L891 378M-100 434L393 613L886 425M-100 483L393 660L886 473" strokeDasharray="4 10"/>
            <path d="M-40 515L544 286M55 548L639 319M143 581L731 359M235 618L816 394" strokeDasharray="4 10"/>
            <path d="M-20 337L533 547M70 309L628 509M161 273L713 472M261 240L805 437" strokeDasharray="4 10"/>
          </g>
          <g className="sy-v2-orbit-lines" fill="none" stroke="#73CFF9" strokeWidth="1.2">
            <ellipse cx="396" cy="380" rx="358" ry="137" strokeDasharray="4 14"/>
            <ellipse cx="396" cy="380" rx="288" ry="106" strokeDasharray="36 22 8 14"/>
            <ellipse cx="396" cy="380" rx="232" ry="83"/>
          </g>

          <g className="sy-v2-twin-building" filter="url(#sy-v2-drop-shadow)">
            <path d="M126 386L390 270L677 393L410 522Z" fill="#082345" stroke="#6DB8E7" strokeWidth="2.3"/>
            <path d="M126 386L410 522V548L126 412Z" fill="url(#sy-v2-ground-panel)" stroke="#3C8ABF" strokeWidth="2"/>
            <path d="M410 522L677 393V419L410 548Z" fill="#0B2D58" stroke="#3C8ABF" strokeWidth="2"/>
            <path d="M150 387L409 511L653 393L391 281Z" fill="#0C3765"/>

            <path d="M174 267L407 374V494L174 386Z" fill="url(#sy-v2-wall-front)" stroke="#9DD5F4" strokeWidth="3"/>
            <path d="M407 374L641 267V386L407 494Z" fill="url(#sy-v2-wall-right)" stroke="#82BCE5" strokeWidth="3"/>
            <path d="M174 267L407 153L641 267L407 383Z" fill="url(#sy-v2-roof-shading)" stroke="#C7E9FD" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M174 267L407 374L641 267" fill="none" stroke="#D2F4FF" strokeOpacity=".82" strokeWidth="2.4"/>

            <g className="sy-v2-roof-module">
              <path d="M364 186L543 269L434 322L256 237Z" fill="#0B2C56" stroke="#A4E3FF" strokeWidth="4" strokeLinejoin="round"/>
              <path d="M364 192L532 270L435 316L270 237Z" fill="url(#sy-v2-solar-panel)"/>
              <path d="M313 214L479 292M359 195L526 273M414 211L311 258M456 233L360 282M502 255L408 304" stroke="#A4E9FF" strokeWidth="1.9" strokeOpacity=".68"/>
              <path d="M366 192L530 268" stroke="#E0FAFF" strokeWidth="2.5" strokeOpacity=".9"/>
            </g>

            <g className="sy-v2-glazing">
              <path d="M201 303L288 342V404L201 364Z" fill="url(#sy-v2-window-light)" stroke="#C0E8FC" strokeWidth="3.5"/>
              <path d="M301 349L379 385V448L301 413Z" fill="url(#sy-v2-window-light)" stroke="#C0E8FC" strokeWidth="3.5"/>
              <path d="M244 322V385M340 368V431M201 332L288 370M301 376L379 413" stroke="#CDF7FF" strokeWidth="2.1" strokeOpacity=".72"/>
              <path d="M434 388L522 347V413L434 452Z" fill="url(#sy-v2-window-light)" stroke="#8ED3F5" strokeWidth="3.5"/>
              <path d="M536 341L612 307V371L536 405Z" fill="url(#sy-v2-window-light)" stroke="#8ED3F5" strokeWidth="3.5"/>
              <path d="M479 366V434M574 322V388M434 421L522 380M536 373L612 338" stroke="#CEF9FF" strokeWidth="2.1" strokeOpacity=".72"/>
            </g>

            <path d="M407 374V493" stroke="#C6E8FA" strokeWidth="2.3" strokeOpacity=".65"/>
            <path d="M177 386L407 493L640 386" stroke="#90C9ED" strokeWidth="2" fill="none" strokeOpacity=".72"/>
            <path d="M187 273L402 374M417 372L627 276" stroke="#F2FCFF" strokeOpacity=".12" strokeWidth="6"/>
          </g>

          <g className="sy-v2-mode-structure" fill="none" stroke="#8DDFFF" strokeWidth="1.8">
            <path d="M155 252L399 134L660 256" strokeDasharray="8 8" />
            <path d="M150 399L402 517L662 399" strokeDasharray="8 8" />
            <path d="M142 267V398M668 263V398" strokeDasharray="3 8"/>
            <path d="M138 267H151M138 398H151M662 263H676M662 398H676" strokeWidth="2"/>
            <path className="sy-v2-data-stream" d="M126 386L410 522L677 393" strokeDasharray="7 23" stroke="#FFD400" strokeWidth="3.5"/>
          </g>
          <g className="sy-v2-mode-thermal">
            <path d="M177 269L407 376V490L177 383Z" fill="url(#sy-v2-thermal-map)" />
            <path d="M409 375L638 270V383L409 488Z" fill="url(#sy-v2-thermal-map)" />
            <path d="M174 266L407 156L639 266" fill="none" stroke="#FFD400" strokeWidth="6.5" strokeLinecap="round"/>
            <path className="sy-v2-data-stream" d="M192 296L407 394L626 294" fill="none" stroke="#FFD400" strokeWidth="4.5" strokeDasharray="5 15" strokeLinecap="round"/>
            <path className="sy-v2-data-stream" d="M218 390L396 477L597 395" fill="none" stroke="#FF996B" strokeWidth="4" strokeDasharray="4 19" strokeLinecap="round"/>
            <circle cx="408" cy="377" r="28" fill="#FFD400" fillOpacity=".14" stroke="#FFD400" strokeWidth="2" strokeDasharray="4 7"/>
          </g>
          <g className="sy-v2-mode-power">
            <path d="M365 199L491 259L536 337L678 290" stroke="#76D6F5" strokeWidth="16" strokeOpacity=".5" filter="url(#sy-v2-soft-glow)" fill="none"/>
            <path className="sy-v2-data-stream" d="M365 199L491 259L536 337L678 290" stroke="#FFD400" strokeWidth="5" strokeDasharray="4 13" strokeLinecap="round" fill="none"/>
            <path className="sy-v2-data-stream" d="M264 322L180 326L102 277" stroke="#72E0FF" strokeWidth="4" strokeDasharray="4 14" strokeLinecap="round" fill="none"/>
            <path className="sy-v2-data-stream" d="M475 368L466 438L583 496" stroke="#72E0FF" strokeWidth="3.8" strokeDasharray="4 14" strokeLinecap="round" fill="none"/>
            <circle className="sy-v2-energy-node" cx="536" cy="337" r="10" fill="#FFD400" fillOpacity=".35" stroke="#FFD400" strokeWidth="2.5"/>
            <circle className="sy-v2-energy-node" cx="180" cy="326" r="9" fill="#72DFFE" fillOpacity=".35" stroke="#8ADFFA" strokeWidth="2.5"/>
            <circle className="sy-v2-energy-node" cx="466" cy="438" r="9" fill="#72DFFE" fillOpacity=".35" stroke="#8ADFFA" strokeWidth="2.5"/>
          </g>

          <g fill="none" stroke="#76CDF8" strokeOpacity=".62" strokeWidth="1.5">
            <path d="M288 179L218 115H70M573 250L668 178H753M559 449L650 500H758" strokeDasharray="4 8"/>
            <path d="M31 52V33H50M747 33H769V53M31 521V541H50M747 541H769V522" strokeWidth="2"/>
          </g>
          <g fill="#DFEFFC" fontFamily="Arial,Helvetica,sans-serif" fontSize="12" letterSpacing="2.1" fontWeight="700">
            <text x="70" y="98">ROOF / SOLAR</text>
            <text x="663" y="164">ENVELOPE</text>
            <text x="657" y="520">ENERGY USE</text>
          </g>
          <g fill="#FFD400">
            <circle cx="288" cy="179" r="4.5"/>
            <circle cx="573" cy="250" r="4.5"/>
            <circle cx="559" cy="449" r="4.5"/>
          </g>
        </svg>

        <div className="sy-v2-floating-tag sy-v2-floating-tag-left">
          <span>BUILDING</span>
          <strong>{display(propertyType)}</strong>
        </div>
        <div className="sy-v2-floating-tag sy-v2-floating-tag-right">
          <span>{mode === "power" ? "SOLAR" : mode === "thermal" ? "HEATING" : "OCCUPANTS"}</span>
          <strong>{mode === "power" ? (hasSolar ? "Installed" : "Not installed") : mode === "thermal" ? display(heatingSystem) : display(occupants)}</strong>
        </div>
        <div className="sy-v2-scan-label">ILLUSTRATIVE 3D MODEL / ENERGY SYSTEMS</div>
      </div>

      <div className="sy-v2-twin-info">
        <div className="sy-v2-twin-description" aria-live="polite">
          <span>{copy.eyebrow}</span>
          <strong>{copy.title}</strong>
          <p>{copy.description}</p>
        </div>
        <div className="sy-v2-twin-profile">
          <div><span>BEDROOMS</span><b>{display(bedrooms)}</b></div>
          <div><span>GLAZING</span><b>{display(glazing)}</b></div>
          <div><span>FUELS</span><b>{fuelCount} considered</b></div>
        </div>
      </div>

      <div className="sy-v2-twin-tabs" role="group" aria-label="Explore home energy systems">
        <button type="button" className={mode === "structure" ? "sy-v2-active" : ""} aria-pressed={mode === "structure"} onClick={() => setMode("structure")}>
          <span>01</span> Building
        </button>
        <button type="button" className={mode === "thermal" ? "sy-v2-active" : ""} aria-pressed={mode === "thermal"} onClick={() => setMode("thermal")}>
          <span>02</span> Heating
        </button>
        <button type="button" className={mode === "power" ? "sy-v2-active" : ""} aria-pressed={mode === "power"} onClick={() => setMode("power")}>
          <span>03</span> Electricity
        </button>
      </div>

      <footer className="sy-v2-twin-foot">
        <span><span className="sy-v2-status-pin"/> HOME PROFILE</span>
        <span>Visual guide, not measured energy data</span>
      </footer>
    </div>
  );
}
