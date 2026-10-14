"use client";

import { useState } from "react";

type SceneMode = "solar" | "lights" | "warmth";

const sceneCopy: Record<SceneMode, { eyebrow: string; title: string; note: string }> = {
  solar: {
    eyebrow: "SUNSHINE AT WORK",
    title: "Hello, solar power!",
    note: "See how daylight can help power a home.",
  },
  lights: {
    eyebrow: "A BRIGHT IDEA",
    title: "Every light matters.",
    note: "Try turning off lights in empty rooms.",
  },
  warmth: {
    eyebrow: "KEEP THE COSY IN",
    title: "Hold on to the heat.",
    note: "Little draughts can make a big difference.",
  },
};

export default function AnimatedHomeScene() {
  const [mode, setMode] = useState<SceneMode>("solar");
  const copy = sceneCopy[mode];

  return (
    <div className={"ego-cinematic-home ego-cinematic-home--" + mode}>
      <div className="ego-stage" aria-label="Animated illustrated house with moving sun, clouds, glowing windows and solar power">
        <div className="ego-stage-topline" aria-hidden="true">
          <span className="ego-stage-live"><span className="ego-live-dot" /> THE EGO HOME</span>
          <span className="ego-stage-stars">✦ &nbsp; ✧ &nbsp; ✦</span>
        </div>

        <svg
          className="ego-illustration"
          viewBox="0 0 760 600"
          role="img"
          aria-label="Colourful home with animated sunshine, solar panels, moving clouds, bright windows and a family in the garden"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ego-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4CB8F2" />
              <stop offset=".62" stopColor="#B9E8FF" />
              <stop offset="1" stopColor="#F5FDFF" />
            </linearGradient>
            <linearGradient id="ego-grass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#89DE96" />
              <stop offset="1" stopColor="#43A978" />
            </linearGradient>
            <linearGradient id="ego-house-front" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset=".72" stopColor="#F6FAFF" />
              <stop offset="1" stopColor="#D8E5F7" />
            </linearGradient>
            <linearGradient id="ego-roof" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#173E86" />
              <stop offset="1" stopColor="#0B2358" />
            </linearGradient>
            <linearGradient id="ego-glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFE776" />
              <stop offset="1" stopColor="#FFB937" />
            </linearGradient>
            <linearGradient id="ego-panel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4AD4FA" />
              <stop offset=".6" stopColor="#1161A6" />
              <stop offset="1" stopColor="#0B3274" />
            </linearGradient>
            <radialGradient id="ego-sun-glow">
              <stop offset=".1" stopColor="#FFF5A5" stopOpacity=".95" />
              <stop offset=".45" stopColor="#FFD400" stopOpacity=".62" />
              <stop offset="1" stopColor="#FFD400" stopOpacity="0" />
            </radialGradient>
            <filter id="ego-shadow" x="-40%" y="-60%" width="180%" height="240%">
              <feDropShadow dx="0" dy="14" stdDeviation="13" floodColor="#0B3274" floodOpacity=".22" />
            </filter>
            <filter id="ego-soft-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>

          <rect width="760" height="600" fill="url(#ego-sky)" />
          <g className="ego-sun-group">
            <circle cx="143" cy="134" r="125" fill="url(#ego-sun-glow)" />
            <g className="ego-sun-rays" stroke="#FFE66D" strokeWidth="8" strokeLinecap="round">
              <path d="M143 47V27 M143 241v-20 M56 134H35 M251 134h-20 M81 72L65 56 M221 212l-15-15 M206 72l15-16 M65 212l16-16" />
            </g>
            <circle cx="143" cy="134" r="56" fill="#FFD400" />
            <ellipse cx="125" cy="115" rx="15" ry="9" fill="#FFF2A0" opacity=".65" transform="rotate(-28 125 115)" />
            <path d="M119 148q24 24 48 0" fill="none" stroke="#C78E00" strokeWidth="5" strokeLinecap="round" />
            <circle cx="123" cy="130" r="4.5" fill="#C78E00" />
            <circle cx="163" cy="130" r="4.5" fill="#C78E00" />
          </g>

          <g className="ego-cloud ego-cloud-one" fill="#FFFFFF" opacity=".88">
            <ellipse cx="479" cy="119" rx="79" ry="23" />
            <ellipse cx="442" cy="106" rx="42" ry="33" />
            <ellipse cx="491" cy="90" rx="51" ry="39" />
            <ellipse cx="536" cy="108" rx="36" ry="28" />
          </g>
          <g className="ego-cloud ego-cloud-two" fill="#FFFFFF" opacity=".77">
            <ellipse cx="639" cy="206" rx="63" ry="19" />
            <ellipse cx="610" cy="193" rx="34" ry="27" />
            <ellipse cx="650" cy="183" rx="43" ry="32" />
          </g>
          <g className="ego-bird" stroke="#2779A9" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M313 119q10-12 22 1q10-13 20-4 M361 142q7-8 14 1q7-9 14-3" />
          </g>

          <path d="M0 451 Q107 379 200 432 Q343 369 467 416 Q639 351 760 429 L760 600H0Z" fill="#ACE5B3" opacity=".8" />
          <path d="M0 496 Q134 453 234 489 Q388 444 530 470 Q664 432 760 466V600H0Z" fill="url(#ego-grass)" />
          <path d="M0 537q225-48 402-16q192-49 358-4v83H0Z" fill="#69C985" />
          <path d="M340 522l-35 78h156l-54-78Z" fill="#EED5AA" />
          <path d="M355 522l-15 78h86l-22-78Z" fill="#FFE7C2" />

          <g className="ego-house-build" filter="url(#ego-shadow)">
            <rect x="181" y="274" width="414" height="253" rx="19" fill="url(#ego-house-front)" />
            <rect x="184" y="280" width="22" height="243" rx="9" fill="#D1E4F6" />
            <rect x="561" y="277" width="33" height="246" rx="10" fill="#E5EFFA" />
            <rect x="273" y="219" width="46" height="75" rx="7" fill="#F7FAFF" />
            <rect x="273" y="217" width="46" height="18" rx="5" fill="#CEDAE9" />
            <path d="M143 294L372 142L633 295L611 314L372 181L165 313Z" fill="url(#ego-roof)" />
            <path d="M143 294L372 142L633 295" fill="none" stroke="#3663A1" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M372 142L633 295" stroke="#071E4E" strokeWidth="10" opacity=".3" />
            <path d="M143 294L372 142" stroke="#79AFE9" strokeWidth="5" opacity=".65" />

            <g className="ego-solar-array">
              <path d="M374 191L514 277H397L291 233Z" fill="#0C306D" stroke="#80DDFF" strokeWidth="5" strokeLinejoin="round" />
              <path d="M374 193L409 275M326 219l93 56M413 216l-5 60M449 238l-3 39M349 251h122" stroke="#88DFFD" strokeWidth="3" opacity=".77" fill="none" />
              <path d="M377 202L488 267" stroke="#C9F7FF" strokeWidth="4" opacity=".85" />
            </g>

            <rect x="214" y="342" width="123" height="115" rx="14" fill="#E8F4FF" stroke="#C3DFF5" strokeWidth="7" />
            <rect className="ego-window-glow" x="222" y="351" width="107" height="97" rx="9" fill="url(#ego-glass)" />
            <path d="M275 351v97M222 399h107" stroke="#FFFFFF" strokeWidth="8" />
            <path d="M227 358q19 17 17 37v47" fill="none" stroke="#FFF5CA" strokeWidth="10" opacity=".65" />

            <rect x="445" y="342" width="117" height="115" rx="14" fill="#E8F4FF" stroke="#C3DFF5" strokeWidth="7" />
            <rect className="ego-window-glow ego-window-right" x="453" y="351" width="101" height="97" rx="9" fill="url(#ego-glass)" />
            <path d="M504 351v97M453 399h101" stroke="#FFFFFF" strokeWidth="8" />
            <path d="M547 358q-17 15-16 38v46" fill="none" stroke="#FFF5CA" strokeWidth="10" opacity=".6" />

            <path d="M350 527V422q0-27 27-27h34q27 0 27 27v105Z" fill="#0B3274" />
            <path d="M360 527V424q0-20 20-20h28q20 0 20 20v103Z" fill="#1C5B9A" />
            <path d="M364 525v-99q0-17 16-17h24v116" fill="#2776B9" />
            <circle cx="412" cy="472" r="5" fill="#FFD400" />
            <path d="M173 523h432" stroke="#B8CCE4" strokeWidth="8" strokeLinecap="round" />
            <rect x="345" y="524" width="102" height="17" rx="7" fill="#C3D4E9" />
          </g>

          <g className="ego-chimney-smoke" stroke="#FFFFFF" opacity=".65" strokeWidth="13" fill="none" strokeLinecap="round">
            <path d="M293 206q-20-19 1-43q17-17 1-35" />
            <path d="M301 189q26-20 4-41" opacity=".55" />
          </g>

          <g className="ego-energy-route" fill="none" strokeLinecap="round">
            <path d="M175 158Q246 110 363 222" stroke="#FFFFFF" strokeWidth="15" opacity=".22" />
            <path className="ego-energy-flow" d="M175 158Q246 110 363 222" stroke="#FFD400" strokeWidth="6" strokeDasharray="10 18" />
            <path d="M444 280q53 20 63 59" stroke="#FFFFFF" strokeWidth="15" opacity=".24" />
            <path className="ego-energy-flow ego-energy-delay" d="M444 280q53 20 63 59" stroke="#FFD400" strokeWidth="6" strokeDasharray="9 16" />
          </g>

          <g className="ego-heat-lines" fill="none" stroke="#FF9A58" strokeWidth="7" strokeLinecap="round" opacity=".93">
            <path d="M228 328q-13-16 0-34q13-18 0-31" />
            <path d="M269 327q-13-16 0-34q13-18 0-31" />
            <path d="M310 328q-13-16 0-34q13-18 0-31" />
            <path d="M470 328q-13-16 0-34q13-18 0-31" />
            <path d="M512 327q-13-16 0-34q13-18 0-31" />
          </g>

          <g className="ego-family-people">
            <ellipse cx="584" cy="557" rx="95" ry="12" fill="#2E9568" opacity=".3" />
            <g className="ego-person-one">
              <path d="M562 492q-17 5-21 29v32h56v-32q-3-24-21-29Z" fill="#FFD400" />
              <rect x="553" y="546" width="14" height="28" rx="6" fill="#17356F" />
              <rect x="580" y="546" width="14" height="28" rx="6" fill="#17356F" />
              <path d="M541 516l-20 15" stroke="#F0B58D" strokeWidth="11" strokeLinecap="round" />
              <path d="M594 517l15 16" stroke="#F0B58D" strokeWidth="11" strokeLinecap="round" />
              <circle cx="570" cy="474" r="25" fill="#F0B58D" />
              <path d="M548 464q-1-26 22-27q25 0 25 26q-23-12-47 1Z" fill="#513528" />
              <circle cx="561" cy="475" r="2.5" fill="#513528" /><circle cx="579" cy="475" r="2.5" fill="#513528" />
              <path d="M560 485q10 8 20 0" stroke="#A35E47" strokeWidth="2.7" fill="none" strokeLinecap="round" />
            </g>
            <g className="ego-person-two">
              <path d="M619 526q-14 7-15 19v24h40v-24q-3-14-16-19Z" fill="#54B6EE" />
              <rect x="608" y="564" width="11" height="16" rx="5" fill="#17356F" />
              <rect x="628" y="564" width="11" height="16" rx="5" fill="#17356F" />
              <path d="M605 540l-10-10M641 542l9-15" stroke="#F8C5A2" strokeWidth="8" strokeLinecap="round" />
              <circle cx="625" cy="510" r="19" fill="#F8C5A2" />
              <path d="M607 502q3-24 23-15q15 4 13 22q-10-13-36-7Z" fill="#7C4329" />
              <circle cx="618" cy="512" r="2.2" fill="#573B30" /><circle cx="632" cy="512" r="2.2" fill="#573B30" />
              <path d="M619 519q7 6 13 0" stroke="#B66B51" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          </g>

          <g className="ego-tree-sway">
            <rect x="81" y="448" width="20" height="112" rx="9" fill="#996D4E" />
            <circle cx="90" cy="436" r="48" fill="#399F7B" />
            <circle cx="64" cy="415" r="37" fill="#51B788" />
            <circle cx="118" cy="411" r="39" fill="#77CC90" />
            <circle cx="95" cy="382" r="39" fill="#6ECF91" />
            <circle cx="113" cy="429" r="5" fill="#FFE269" />
            <circle cx="59" cy="435" r="4" fill="#FFE269" />
          </g>
          <g className="ego-flowers">
            <path d="M134 568v-21M166 583v-21M689 554v-20M710 575v-25" stroke="#277B59" strokeWidth="4" />
            <circle cx="134" cy="543" r="9" fill="#FF8CAF" /><circle cx="134" cy="543" r="3" fill="#FFD400" />
            <circle cx="166" cy="558" r="8" fill="#FFD400" /><circle cx="166" cy="558" r="3" fill="#FFFFFF" />
            <circle cx="689" cy="530" r="9" fill="#FF8CAF" /><circle cx="689" cy="530" r="3" fill="#FFD400" />
            <circle cx="710" cy="548" r="9" fill="#FFD400" /><circle cx="710" cy="548" r="3" fill="#FFFFFF" />
          </g>

          <g className="ego-sparkle ego-sparkle-one" fill="#FFFFFF">
            <path d="M657 317l6 15 15 6-15 6-6 15-6-15-15-6 15-6Z" />
          </g>
          <g className="ego-sparkle ego-sparkle-two" fill="#FFD400">
            <path d="M135 315l4 11 11 4-11 4-4 11-4-11-11-4 11-4Z" />
          </g>
          <g className="ego-sparkle ego-sparkle-three" fill="#FFFFFF">
            <path d="M703 131l4 11 11 4-11 4-4 11-4-11-11-4 11-4Z" />
          </g>
        </svg>

        <div className="ego-floating-badge ego-floating-badge-solar" aria-hidden="true"><span>☀</span> Solar in action</div>
        <div className="ego-floating-badge ego-floating-badge-idea" aria-hidden="true"><span>✦</span> Little changes. Big ideas.</div>
        <div className="ego-scene-story" aria-live="polite">
          <span className="ego-scene-story-eyebrow">{copy.eyebrow}</span>
          <strong>{copy.title}</strong>
          <span>{copy.note}</span>
        </div>
      </div>
      <div className="ego-scene-controls" aria-label="Explore home energy ideas">
        <span className="ego-controls-label">Tap to explore</span>
        <div className="ego-control-buttons">
          <button type="button" className={mode === "solar" ? "ego-mode-active" : ""} aria-pressed={mode === "solar"} onClick={() => setMode("solar")}>☀ Solar</button>
          <button type="button" className={mode === "lights" ? "ego-mode-active" : ""} aria-pressed={mode === "lights"} onClick={() => setMode("lights")}>✦ Lighting</button>
          <button type="button" className={mode === "warmth" ? "ego-mode-active" : ""} aria-pressed={mode === "warmth"} onClick={() => setMode("warmth")}>♨ Warmth</button>
        </div>
      </div>
      <p className="ego-scene-footnote">An illustration of energy-saving ideas, not a live reading of your home.</p>
    </div>
  );
}
