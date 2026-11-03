/** Original Leo — fluffy beige Persian explorer (SVG + CSS motion). */

export function leoMarkup(extraClass = '') {
  return `
  <div class="leo ${extraClass}" role="img" aria-label="Leo the explorer cat">
    <svg class="leo-svg" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fur" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#E8D0B0"/>
          <stop offset="55%" stop-color="#C9A07A"/>
          <stop offset="100%" stop-color="#A67B52"/>
        </radialGradient>
        <radialGradient id="belly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#F5E6D3"/>
          <stop offset="100%" stop-color="#E0C4A0"/>
        </radialGradient>
      </defs>
      <!-- tail -->
      <g class="leo-tail">
        <path d="M48 150 Q10 170 28 210 Q48 195 55 175" fill="url(#fur)"/>
      </g>
      <!-- backpack -->
      <g class="leo-pack">
        <rect x="148" y="128" width="42" height="48" rx="10" fill="#F5D76E" stroke="#C9A227" stroke-width="3"/>
        <rect x="156" y="138" width="26" height="18" rx="4" fill="#FFF3B0"/>
        <path d="M155 128 Q169 118 183 128" fill="none" stroke="#C9A227" stroke-width="3"/>
      </g>
      <!-- body -->
      <ellipse class="leo-body" cx="110" cy="155" rx="62" ry="48" fill="url(#fur)"/>
      <ellipse cx="110" cy="165" rx="36" ry="28" fill="url(#belly)"/>
      <!-- paws -->
      <ellipse cx="78" cy="195" rx="18" ry="12" fill="#B88962"/>
      <ellipse cx="138" cy="195" rx="18" ry="12" fill="#B88962"/>
      <!-- head mane -->
      <g class="leo-head">
        <ellipse cx="115" cy="95" rx="58" ry="52" fill="url(#fur)"/>
        <ellipse cx="70" cy="88" rx="18" ry="22" fill="#B88962"/>
        <ellipse cx="160" cy="88" rx="18" ry="22" fill="#B88962"/>
        <!-- ears -->
        <path d="M68 55 L58 22 L90 48 Z" fill="#A67B52"/>
        <path d="M68 55 L64 32 L82 48 Z" fill="#E8B4A0"/>
        <path d="M162 55 L172 22 L140 48 Z" fill="#A67B52"/>
        <path d="M162 55 L168 32 L148 48 Z" fill="#E8B4A0"/>
        <!-- face -->
        <ellipse cx="115" cy="102" rx="32" ry="28" fill="#F0DCC4"/>
        <g class="leo-eyes">
          <ellipse cx="98" cy="92" rx="7" ry="9" fill="#2C1810"/>
          <ellipse cx="132" cy="92" rx="7" ry="9" fill="#2C1810"/>
          <circle cx="100" cy="89" r="2.2" fill="#fff"/>
          <circle cx="134" cy="89" r="2.2" fill="#fff"/>
        </g>
        <ellipse cx="115" cy="108" rx="8" ry="6" fill="#E8A090"/>
        <path d="M115 114 Q105 122 96 118" fill="none" stroke="#5C3A22" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M115 114 Q125 122 134 118" fill="none" stroke="#5C3A22" stroke-width="2.5" stroke-linecap="round"/>
        <!-- whiskers -->
        <path d="M70 108 H40 M72 116 H38 M168 108 H200 M166 116 H202" stroke="#8B6914" stroke-width="1.5" opacity="0.7"/>
      </g>
    </svg>
    <span class="leo-label">Leo</span>
  </div>`
}
