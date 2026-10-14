/**
 * Decorative-only graphics for Save Your EGO assessment/dashboard.
 * These components have no client-side state, handlers or assessment logic.
 */
export function AssessmentMotionGraphic() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="sy-assessment-motion-art"
      viewBox="0 0 660 660"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sy-assessment-glow">
          <stop stopColor="#53AFE8" stopOpacity=".43" />
          <stop offset=".57" stopColor="#53AFE8" stopOpacity=".12" />
          <stop offset="1" stopColor="#53AFE8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sy-assessment-ring" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#53AFE8" stopOpacity=".8" />
          <stop offset=".6" stopColor="#FFD400" stopOpacity=".8" />
          <stop offset="1" stopColor="#53AFE8" stopOpacity=".13" />
        </linearGradient>
      </defs>
      <circle cx="330" cy="330" r="300" fill="url(#sy-assessment-glow)" />
      <g className="sy-assessment-ring-spin" fill="none" stroke="url(#sy-assessment-ring)">
        <circle cx="330" cy="330" r="267" strokeWidth="1.3" strokeDasharray="3 11" />
        <circle cx="330" cy="330" r="229" strokeWidth="1" strokeDasharray="30 16 2 24" />
        <circle cx="330" cy="330" r="194" strokeWidth="2.5" strokeDasharray="105 280" />
      </g>
      <g className="sy-assessment-ring-reverse" fill="none" stroke="#90D7FF">
        <circle cx="330" cy="330" r="247" strokeWidth="1.2" strokeOpacity=".3" strokeDasharray="75 150 10 115" />
        <circle cx="330" cy="330" r="150" strokeWidth="1" strokeOpacity=".24" strokeDasharray="5 12" />
      </g>
      <g fill="none" stroke="#66B9E8" strokeOpacity=".52" strokeWidth="1.5">
        <path d="M30 330H163M496 330H630M330 30V158M330 504V630" strokeDasharray="4 8" />
        <path d="M105 104L218 215M552 108L451 210M108 555L211 455M547 554L449 452" strokeDasharray="3 10" />
      </g>
      <g fill="none" stroke="#FFD400" strokeWidth="3" strokeLinecap="round">
        <path className="sy-assessment-trace" d="M80 335C132 288 154 378 210 326S308 235 347 275S433 410 484 331S563 282 604 311" strokeDasharray="12 20" />
        <path className="sy-assessment-trace sy-assessment-trace-alt" d="M330 80C295 150 372 161 327 219S272 292 338 333S395 402 332 456S300 528 330 589" strokeDasharray="4 23" />
      </g>
      <g className="sy-assessment-nodes" fill="#FFD400">
        <circle cx="330" cy="63" r="6" />
        <circle cx="562" cy="330" r="5" />
        <circle cx="135" cy="504" r="5" />
      </g>
      <g className="sy-assessment-signal-center" stroke="#A6E2FF" strokeOpacity=".35" fill="none">
        <path d="M272 329L313 297L357 329L357 378L313 410L272 378Z" strokeWidth="3" />
        <path d="M313 297V410M272 329L313 356L357 329M313 356V410" strokeWidth="2" />
        <circle cx="313" cy="356" r="77" strokeDasharray="2 11" />
      </g>
    </svg>
  );
}

export function DashboardMotionGraphic() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="sy-dashboard-motion-art"
      viewBox="0 0 750 680"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sy-dash-halo">
          <stop stopColor="#4BC5FF" stopOpacity=".29" />
          <stop offset=".55" stopColor="#4BC5FF" stopOpacity=".07" />
          <stop offset="1" stopColor="#4BC5FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="380" cy="320" r="320" fill="url(#sy-dash-halo)" />
      <g className="sy-dashboard-network-grid" fill="none" stroke="#7BD5FA" strokeWidth=".85" strokeOpacity=".28">
        <path d="M-50 144H800M-50 235H800M-50 326H800M-50 417H800M-50 508H800" strokeDasharray="3 8" />
        <path d="M80 -25V710M180 -25V710M280 -25V710M380 -25V710M480 -25V710M580 -25V710M680 -25V710" strokeDasharray="3 8" />
      </g>
      <g className="sy-dashboard-radar" fill="none" stroke="#85CFF3">
        <ellipse cx="365" cy="340" rx="290" ry="195" strokeOpacity=".29" strokeWidth="1.7" />
        <ellipse cx="365" cy="340" rx="238" ry="151" strokeOpacity=".37" strokeWidth="1" strokeDasharray="5 13" />
        <ellipse cx="365" cy="340" rx="175" ry="107" strokeOpacity=".3" strokeWidth="1.4" />
        <ellipse cx="365" cy="340" rx="120" ry="67" strokeOpacity=".4" strokeDasharray="15 12" />
      </g>
      <g className="sy-dashboard-data-paths" fill="none" strokeLinecap="round">
        <path d="M-20 460L170 460L276 330L385 330L512 220L765 220" stroke="#65D9FF" strokeOpacity=".3" strokeWidth="7" />
        <path className="sy-dashboard-flow" d="M-20 460L170 460L276 330L385 330L512 220L765 220" stroke="#FFD400" strokeWidth="3.5" strokeDasharray="5 21" />
        <path d="M50 143L197 143L336 276L441 276L567 401L730 401" stroke="#A5E8FF" strokeOpacity=".35" strokeWidth="5" />
        <path className="sy-dashboard-flow sy-dashboard-flow-alt" d="M50 143L197 143L336 276L441 276L567 401L730 401" stroke="#7AD9F5" strokeWidth="2.8" strokeDasharray="4 18" />
        <path className="sy-dashboard-flow sy-dashboard-flow-third" d="M70 575L267 575L402 456L690 456" stroke="#FFD400" strokeOpacity=".7" strokeWidth="2.6" strokeDasharray="5 17" />
      </g>
      <g className="sy-dashboard-energy-nodes" fill="#FFD400" stroke="#153D6A" strokeWidth="3">
        <circle cx="170" cy="460" r="7" />
        <circle cx="276" cy="330" r="6" />
        <circle cx="512" cy="220" r="7" />
        <circle cx="197" cy="143" r="7" />
        <circle cx="567" cy="401" r="6" />
        <circle cx="402" cy="456" r="7" />
      </g>
      <g className="sy-dashboard-radar-center" fill="none" stroke="#91DCFF" strokeOpacity=".44">
        <path d="M320 320L366 293L410 320L410 368L366 395L320 368Z" strokeWidth="2.5" />
        <path d="M320 320L366 347L410 320M366 347V395" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
