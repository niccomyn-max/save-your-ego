type GraphicKind = "bills" | "solar" | "upgrades" | "appliances";

export default function ReportTechnicalGraphic({ kind }: { kind: GraphicKind }) {
  const isSolar = kind === "solar";
  const isBills = kind === "bills";
  const isUpgrades = kind === "upgrades";

  return (
    <svg className={"ri-technical-graphic ri-technical-" + kind} viewBox="0 0 420 240" role="img" aria-label={"Conceptual " + kind + " technical illustration, not measured data"} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={"ri-tg-bg-" + kind} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#133F73"/><stop offset="1" stopColor="#061A38"/></linearGradient>
        <linearGradient id={"ri-tg-panel-" + kind} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#85DFFF"/><stop offset=".5" stopColor="#2789BF"/><stop offset="1" stopColor="#0B3274"/></linearGradient>
      </defs>
      <rect width="420" height="240" rx="23" fill={"url(#ri-tg-bg-" + kind + ")"}/>
      <g stroke="#9FD5F4" strokeOpacity=".18" strokeWidth=".8" fill="none">
        <path d="M0 40H420M0 80H420M0 120H420M0 160H420M0 200H420M40 0V240M80 0V240M120 0V240M160 0V240M200 0V240M240 0V240M280 0V240M320 0V240M360 0V240M400 0V240"/>
      </g>
      <circle cx="210" cy="117" r="94" fill="none" stroke="#77B7DF" strokeDasharray="4 13" opacity=".35"/>
      <circle cx="210" cy="117" r="67" fill="none" stroke="#77B7DF" opacity=".25"/>
      {isBills ? (
        <g>
          <rect x="78" y="130" width="35" height="56" rx="5" fill="#2787BC"/>
          <rect x="127" y="100" width="35" height="86" rx="5" fill="#57B6E7"/>
          <rect x="176" y="116" width="35" height="70" rx="5" fill="#FFD400"/>
          <rect x="225" y="69" width="35" height="117" rx="5" fill="#4AAFE7"/>
          <rect x="274" y="89" width="35" height="97" rx="5" fill="#79D5F6"/>
          <path className="ri-technical-motion-path" d="M77 113L143 75L194 87L240 46L300 59L348 30" stroke="#FFF" strokeWidth="3" strokeDasharray="5 10" fill="none" strokeLinecap="round"/>
          <path d="M66 186H341" stroke="#BFEAFF" strokeOpacity=".4"/>
        </g>
      ) : isSolar ? (
        <g>
          <path d="M69 135L207 52L352 133L212 218Z" fill="#0B3260" stroke="#9ADCFB" strokeWidth="3"/>
          <path d="M111 139L209 80L310 139L211 198Z" fill={"url(#ri-tg-panel-" + kind + ")"} stroke="#B2EFFF" strokeWidth="3"/>
          <path d="M146 118L246 178M182 97L281 157M245 101L148 158M278 120L180 179" stroke="#D5FAFF" strokeWidth="2" opacity=".75"/>
          <g stroke="#FFD400" fill="none" strokeWidth="3.5" strokeLinecap="round">
            <circle cx="326" cy="53" r="24" strokeDasharray="6 10"/>
            <path d="M325 14V4M325 101v-10M285 53h-10M374 53h-12"/>
          </g>
          <path className="ri-technical-motion-path" d="M229 175L285 192L354 164" stroke="#FFD400" strokeWidth="4" strokeDasharray="5 10" fill="none"/>
        </g>
      ) : isUpgrades ? (
        <g>
          <g strokeWidth="2" stroke="#A2DFF8">
            <rect x="67" y="122" width="84" height="75" rx="9" fill="#164A7D"/>
            <rect x="168" y="83" width="84" height="114" rx="9" fill="#164A7D"/>
            <rect x="269" y="50" width="84" height="147" rx="9" fill="#164A7D"/>
          </g>
          <path d="M85 174L98 161L112 174L136 147M187 168L204 146L218 155L236 120M287 147L308 110L322 119L340 83" stroke="#FFD400" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path className="ri-technical-motion-path" d="M72 205Q210 213 348 204" stroke="#9BE5FF" strokeWidth="3" strokeDasharray="6 11" fill="none"/>
        </g>
      ) : (
        <g>
          <rect x="96" y="54" width="228" height="137" rx="18" fill="#0C3768" stroke="#84D9FA" strokeWidth="3"/>
          <path className="ri-technical-motion-path" d="M116 132H158L181 89L212 160L237 106L258 133H303" stroke="#FFD400" strokeWidth="5" strokeDasharray="160 14" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M116 86H153M116 96H143M267 86H303M267 96H295" stroke="#A7DFFC" strokeOpacity=".6" strokeWidth="3"/>
          <circle cx="96" cy="122" r="6" fill="#9CEAFF"/>
          <circle cx="324" cy="122" r="6" fill="#9CEAFF"/>
          <path d="M209 42V15M209 201V225M83 122H58M337 122H362" stroke="#8FD5FC" strokeWidth="2" strokeDasharray="3 7"/>
        </g>
      )}
      <g fill="none" stroke="#B2E5FB" strokeOpacity=".56" strokeWidth="2">
        <path d="M19 31V18H32M388 18H401V31M19 209V222H32M388 222H401V209"/>
      </g>
    </svg>
  );
}
