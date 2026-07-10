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
