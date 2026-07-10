# AXIOM // SIGNAL — Backend Setup (Firebase)

This connects real accounts and tier-tracking to the site, using Firebase's
free Spark plan — no cost until you're at a scale you'd probably want a
domain for anyway.

## 1. Create the Firebase project
1. Go to https://console.firebase.google.com and click **Add project**.
2. Name it whatever you want (e.g. "axiom-signal"). Google Analytics is optional — skip it.
3. Once created, click the **</> (web)** icon to register a web app. Name it anything.
4. Firebase will show you a `firebaseConfig` object. Copy it.

## 2. Drop your config into the site
Open `firebase-config.js` and replace the placeholder values with the real
ones from step 1:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Both `index.html` and `archive.html` read from this one file, so you only edit it once.

## 3. Turn on Email/Password sign-in
1. In the Firebase console, go to **Build → Authentication → Get started**.
2. Click **Email/Password**, toggle it on, save.

(Listener names are converted to a fake address like `leo@axiom.local` behind
the scenes so Firebase Auth — which expects emails — works with your
"listener name" system. Nobody sees this; it's just plumbing.)

## 4. Turn on Firestore (this stores tiers)
1. In the left sidebar, go to **Databases & Storage → Firestore** (this section may be labeled differently depending on when you're reading this — look for "Firestore" or "Cloud Firestore" if "Databases & Storage" isn't there).
2. Click **Create database** (or **Add database**).
3. Choose **Standard edition** if asked.
4. Pick any location.
5. Start in **test mode** for now (easiest while you're building). Pick any region.
6. Once you're closer to launch, replace the rules with something like this.
   Reads are public (needed for the Listeners page, which shows everyone's
   username/tier/badges) but only you can write to your own account:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Nothing sensitive is ever stored in these documents — no emails or
passwords, those live in Firebase Authentication separately and are never
public. Only username, tier, badges-related data, and join date are in
Firestore, which is exactly what the Listeners page is meant to show.

## 5. Test it
Open `index.html` in a real browser (not this chat preview — more on that
below) and create an account. Check the Firebase console under
**Authentication** and **Firestore → users** — you should see the new
listener show up in both.

## How tiers work right now
- New accounts start at **tier 1 (Listener)**.
- To bump someone's tier (e.g. after they solve a future mystery), go to
  Firestore → `users` → their document → edit the `tier` field to 2, 3, or 4.
- There's no in-site way to auto-promote tiers yet — that's the next piece
  to build once you've decided what "solving a mystery" looks like
  mechanically (a new puzzle page? a code phrase? up to you).

## Troubleshooting: "Failed to get document because the client is offline"
This means the Firestore SDK can't reach the backend. Two common causes:
- **The Firestore database was never created** — Authentication and Firestore
  are separate setup steps. Double-check step 4 above was actually completed.
- **An ad blocker or privacy extension** (uBlock, Brave Shields, etc.) is
  blocking the connection. Firestore's real-time channel sometimes gets
  flagged by tracker-blocking lists. Try pausing the extension for your site,
  or test in a browser with no extensions.

## One important caveat about testing inside Claude
The preview you see in this chat runs inside a sandboxed iframe, and
Firebase's session persistence relies on browser storage that sandbox
blocks. Account creation *will* still work in that preview, but staying
logged in across a refresh might not, and errors may show in the console
that don't mean anything's wrong. Once you upload these files to GitHub
Pages and open the real deployed URL, none of that applies — it's a normal
browser context and everything (including staying logged in) works as
expected.

## Files in this project
- `index.html` — Main page: riddle → alphabet → decode → account
- `archive.html` — the Big Mystery page, tier-gated lore log
- `cipher.js` — the Axiom Script alphabet + encode/decode functions (shared)
- `firebase-config.js` — your backend credentials (edit this one file)
- `contact.html` — not built yet
