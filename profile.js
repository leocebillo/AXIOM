/* ============================================================
   AXIOM // SIGNAL — shared profile logic
   Used by index.html, archive.html, and lore.html.
   ============================================================ */

const TIERS = {
  1: { name: "Listener", desc: "You can hear AXIOM. You can't yet ask it anything." },
  2: { name: "Seeker",   desc: "You've asked. AXIOM is starting to answer." },
  3: { name: "Adept",    desc: "You understand more of the signal than most who've tried." },
  4: { name: "Keeper",   desc: "The Archive is open to you." }
};

// Listener names (lowercase) recognized as the site's creator — shown with
// a special "AXIOM" title instead of a normal tier name, and granted full
// clearance automatically at signup. Add more handles here if needed.
const CREATOR_USERNAMES = ["leoaxiom", "theaxiom"];

function isCreatorUsername(username) {
  return CREATOR_USERNAMES.includes((username || "").toLowerCase());
}

function displayTitle(userData) {
  if (userData && userData.isCreator) return "AXIOM";
  const tier = userData && userData.tier;
  return (TIERS[tier] && TIERS[tier].name) || "Listener";
}

function displayDesc(userData) {
  if (userData && userData.isCreator) return "The one who tuned the language. Full clearance, always.";
  const tier = userData && userData.tier;
  return (TIERS[tier] && TIERS[tier].desc) || "";
}

function formatMemberSince(timestampMs) {
  if (!timestampMs) return "";
  try {
    const d = new Date(timestampMs);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch (e) {
    return "";
  }
}

/* ---------- Badges ---------- */
const BADGE_DEFS = [
  { id: "first-contact",   label: "First Contact",    test: u => (u.tier || 0) >= 1 },
  { id: "seeker",          label: "Seeker Clearance",  test: u => (u.tier || 0) >= 2 },
  { id: "adept",           label: "Adept Clearance",   test: u => (u.tier || 0) >= 3 },
  { id: "keeper",          label: "Keeper Clearance",  test: u => (u.tier || 0) >= 4 },
  { id: "fragment-hunter", label: "Fragment Hunter",   test: u => (u.loreUnlocked || []).length >= 3 },
  { id: "archivist",       label: "Archivist",         test: u => (u.loreUnlocked || []).length >= 6 },
  { id: "architect",       label: "The Architect",     test: u => !!u.isCreator }
];

function computeBadges(userData) {
  return BADGE_DEFS.filter(b => b.test(userData || {}));
}

function badgeListHTML(userData) {
  const badges = computeBadges(userData);
  if (!badges.length) return "";
  return badges.map(b => `<span class="badge${userData.isCreator && b.id === 'architect' ? ' badge-creator' : ''}">${b.label}</span>`).join("");
}
