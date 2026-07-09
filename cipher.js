/* ============================================================
   AXIOM SCRIPT v2 — a genuinely custom alien writing system.

   How it works (in-lore: AXIOM encodes phonetic class as a base
   shape, and the specific sound as an antenna mark around it):

   - VOWELS  -> circle
   - STOPS   -> triangle   (B D G K P Q T)
   - HISSERS -> square     (F H S V W X Z)
   - OPENERS -> diamond    (C J L M N R Y)

   Each letter within a family gets a unique antenna angle, evenly
   spaced around its shape. Shape + angle together are unique per
   letter, so the system is fully decodable with the sheet.

   Everything is drawn at runtime with SVG math — no external font,
   no reused unicode block. Shared by index.html and archive.html.
   ============================================================ */

const GLYPH_FAMILIES = {
  circle:   { letters: "AEIOU".split(""),        radius: 12 },
  triangle: { letters: "BDGKPQT".split(""),       radius: 14 },
  square:   { letters: "FHSVWXZ".split(""),       radius: 12 },
  diamond:  { letters: "CJLMNRY".split(""),       radius: 14 }
};

const LETTER_META = {};
Object.entries(GLYPH_FAMILIES).forEach(([shape, { letters }]) => {
  letters.forEach((letter, i) => {
    LETTER_META[letter] = { shape, angle: (360 / letters.length) * i };
  });
});

function polarPoint(angleDeg, radius, cx = 20, cy = 20) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function polygonPoints(sides, radius, offsetDeg) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const p = polarPoint(offsetDeg + (360 / sides) * i, radius);
    pts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function baseShapeMarkup(shape, radius) {
  switch (shape) {
    case "circle":
      return `<circle cx="20" cy="20" r="${radius}" fill="none" stroke="currentColor" stroke-width="2.4"/>`;
    case "triangle":
      return `<polygon points="${polygonPoints(3, radius, 0)}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`;
    case "square":
      return `<polygon points="${polygonPoints(4, radius, 45)}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`;
    case "diamond":
      return `<polygon points="${polygonPoints(4, radius, 0)}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`;
  }
}

function antennaMarkup(angle, shapeRadius) {
  const inner = polarPoint(angle, shapeRadius + 2);
  const outer = polarPoint(angle, shapeRadius + 9);
  return `<line x1="${inner.x.toFixed(2)}" y1="${inner.y.toFixed(2)}" x2="${outer.x.toFixed(2)}" y2="${outer.y.toFixed(2)}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="${outer.x.toFixed(2)}" cy="${outer.y.toFixed(2)}" r="2.1" fill="currentColor"/>`;
}

function buildGlyphSprite() {
  if (document.getElementById("axiom-glyph-sprite")) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "axiom-glyph-sprite";
  svg.style.display = "none";
  svg.setAttribute("aria-hidden", "true");

  let symbols = "";
  Object.entries(LETTER_META).forEach(([letter, { shape, angle }]) => {
    const radius = GLYPH_FAMILIES[shape].radius;
    symbols += `<symbol id="glyph-${letter}" viewBox="0 0 40 40">
        ${baseShapeMarkup(shape, radius)}
        ${antennaMarkup(angle, radius)}
      </symbol>`;
  });
  svg.innerHTML = symbols;
  document.body.appendChild(svg);
}
buildGlyphSprite();

// ---- public helpers ----

function glyphMarkup(letter) {
  return `<svg class="glyph" viewBox="0 0 40 40" aria-hidden="true"><use href="#glyph-${letter}"></use></svg>`;
}

// Encodes plain text into a run of HTML (SVG glyphs + spacers).
// Letters become glyphs; spaces become a wider gap; anything else
// (punctuation) passes through as small muted text.
function encodeToHTML(text) {
  let out = "";
  text.toUpperCase().split("").forEach(ch => {
    if (ch === " ") {
      out += `<span class="glyph-space"></span>`;
    } else if (LETTER_META[ch]) {
      out += glyphMarkup(ch);
    } else if (/[A-Z]/.test(ch) === false && ch.trim() !== "") {
      out += `<span class="glyph-punct">${ch}</span>`;
    }
  });
  return out;
}
