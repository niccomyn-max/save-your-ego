/**
 * Lightweight, route-scoped technical thumbnails for each assessment section.
 * Decorative only: independent of questions, scoring and saved answers.
 */
type SectionTopic =
  | "home-details"
  | "energy-costs"
  | "fabric-details"
  | "appliances-usage"
  | "solar-suitability"
  | "assessment-preview"
  | "ai-assessment";

export default function AssessmentSectionVisual({ topic }: { topic: string }) {
  const current = topic as SectionTopic;
  return (
    <svg className="sy-section-graphic" viewBox="0 0 180 124" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={"sy-tile-bg-" + topic} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#163F7A" />
          <stop offset="1" stopColor="#061B3B" />
        </linearGradient>
        <linearGradient id={"sy-tile-shine-" + topic} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#AAE9FF" /><stop offset=".55" stopColor="#4BACEA" /><stop offset="1" stopColor="#1760A2" />
        </linearGradient>
      </defs>
      <rect width="180" height="124" rx="14" fill={"url(#sy-tile-bg-" + topic + ")"} />
      <g stroke="#6BBAF0" strokeOpacity=".18" strokeWidth=".65">
        <path d="M0 21H180M0 42H180M0 63H180M0 84H180M0 105H180M22 0V124M44 0V124M66 0V124M88 0V124M110 0V124M132 0V124M154 0V124M176 0V124" />
      </g>
      <circle cx="91" cy="63" r="55" fill="none" stroke="#52BDEE" strokeOpacity=".22" strokeDasharray="4 7" />
      <circle cx="91" cy="63" r="38" fill="none" stroke="#73CAFA" strokeOpacity=".16" />
      <path d="M9 15V8H16M164 8H171V15M9 109V116H16M164 116H171V109" stroke="#9DDFFB" strokeOpacity=".5" strokeWidth="1.2" fill="none" />

      {current === "home-details" && (
        <g className="sy-section-art-orbit">
          <path d="M39 66L90 39L143 66L91 94Z" fill="#235B94" stroke="#9DDEFC" strokeWidth="2.4"/>
          <path d="M39 66L91 94V110L39 82Z" fill="#1A4D83" stroke="#7ACFF6" strokeWidth="1.4"/>
          <path d="M91 94L143 66V82L91 110Z" fill="#10335C" stroke="#68B7E8" strokeWidth="1.4"/>
          <path d="M31 57L91 23L151 57L91 91Z" fill="#285E98" stroke="#D4F1FF" strokeWidth="2.2"/>
          <path d="M55 69L78 81V98L55 86Z" fill="#5BBAED" stroke="#B7EBFF" strokeWidth="1.4"/>
          <path d="M106 81L126 70V88L106 99Z" fill="#5BBAED" stroke="#A9E4FF" strokeWidth="1.4"/>
          <path d="M55 46L91 26L125 45" fill="none" stroke="#FFD400" strokeWidth="2.4" />
        </g>
      )}

      {current === "energy-costs" && (
        <g>
          <g className="sy-section-bar-one"><rect x="38" y="69" width="19" height="30" rx="3" fill="#3085C5" /></g>
          <g className="sy-section-bar-two"><rect x="69" y="47" width="19" height="52" rx="3" fill="#54AFE5" /></g>
          <g className="sy-section-bar-three"><rect x="100" y="57" width="19" height="42" rx="3" fill="#FFD400" /></g>
          <g className="sy-section-bar-four"><rect x="131" y="33" width="15" height="66" rx="3" fill="#62D4ED" /></g>
          <path className="sy-section-dash" d="M29 64L48 54L80 63L111 37L142 28" fill="none" stroke="#E8F9FF" strokeWidth="2.5" strokeDasharray="5 5" />
          <path d="M29 100H151" stroke="#87C6EC" strokeOpacity=".55"/>
        </g>
      )}

      {current === "fabric-details" && (
        <g className="sy-section-art-orbit">
          <path d="M91 18L137 39V78Q120 102 91 112Q62 102 45 78V39Z" fill="#1D578B" stroke="#84D6FB" strokeWidth="2.5" />
          <path d="M91 31L125 46V74Q115 90 91 100Q67 90 57 74V46Z" fill="#255C8D" stroke="#FFD400" strokeWidth="2.3" strokeDasharray="6 4" />
          <path d="M91 43L113 53V71Q105 82 91 88Q77 82 69 71V53Z" fill="#0C315F" stroke="#9CE3FF" strokeWidth="1.7" />
          <path className="sy-section-glow-line" d="M75 65L86 76L108 54" stroke="#FFD400" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      )}

      {current === "appliances-usage" && (
        <g>
          <path d="M38 72L61 72L70 49L82 89L94 37L106 74L113 58L122 72L148 72" stroke="#6DD7F8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".2"/>
          <path className="sy-section-dash" d="M38 72L61 72L70 49L82 89L94 37L106 74L113 58L122 72L148 72" stroke="#FFD400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="150 20"/>
          <circle cx="38" cy="72" r="5" fill="#87DBFF"/><circle cx="148" cy="72" r="5" fill="#87DBFF"/>
          <rect x="55" y="30" width="72" height="72" rx="12" stroke="#63C2EF" strokeOpacity=".23" fill="none" />
        </g>
      )}

      {current === "solar-suitability" && (
        <g className="sy-section-art-orbit">
          <path d="M45 43L124 37L148 88L64 94Z" fill="#103764" stroke="#8DDCFF" strokeWidth="2.5"/>
          <path d="M52 48L120 42L141 83L68 89Z" fill="#2078B0" />
          <path d="M72 46L88 90M95 45L113 86M120 43L141 83M56 68L133 65" stroke="#A1E6FF" strokeWidth="2" fill="none" />
          <path className="sy-section-glow-line" d="M37 27L57 30L64 17M128 102L147 98" stroke="#FFD400" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <circle cx="43" cy="26" r="6" fill="#FFD400" />
        </g>
      )}

      {current === "assessment-preview" && (
        <g>
          <rect x="37" y="26" width="107" height="75" rx="8" fill="#0D345F" stroke="#75CFFF" strokeWidth="2"/>
          <path d="M51 79L69 63L86 70L106 44L129 51" stroke="#FFD400" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path className="sy-section-dash" d="M51 86L72 79L95 87L130 69" stroke="#65D8F6" strokeWidth="2" fill="none" strokeDasharray="4 6"/>
          <path d="M51 39H84M51 44H72" stroke="#8FD7FA" opacity=".72" strokeWidth="2" />
          <circle cx="106" cy="44" r="4.5" fill="#FFD400" />
        </g>
      )}

      {current === "ai-assessment" && (
        <g className="sy-section-art-orbit">
          <rect x="58" y="18" width="76" height="89" rx="7" fill="#2A669A" stroke="#91E4FA" strokeWidth="2.5"/>
          <path d="M69 40H116M69 52H117M69 64H107M69 77H98" stroke="#B1EBFF" strokeWidth="2.4" strokeLinecap="round" strokeOpacity=".9" />
          <rect x="69" y="88" width="36" height="7" rx="2" fill="#FFD400"/>
          <path className="sy-section-dash" d="M47 32V91M146 32V91" stroke="#FFD400" strokeOpacity=".8" strokeWidth="2" strokeDasharray="3 7"/>
          <circle cx="122" cy="90" r="10" fill="#0B3274" stroke="#FFD400" strokeWidth="2"/>
          <path d="M117 90L121 94L128 86" fill="none" stroke="#FFD400" strokeWidth="2.4" strokeLinecap="round"/>
        </g>
      )}
      <g className="sy-section-spectrum" fill="none" stroke="#FFD400" strokeOpacity=".85">
        <path d="M12 109H27M153 15H169" strokeWidth="2" />
      </g>
    </svg>
  );
}
