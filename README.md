# Peru Trip

Personal trip app for the Cusco and Inca Trail trip, Nov 15–21, 2026.
Installable web app that works offline once it's been opened.

- `src/trip.html` is the trip page. Edit this.
- `src/lock.html` is the password screen.
- `build.js` runs on Netlify. It encrypts the trip page with the `TRIP_PASSWORD`
  environment variable (set in Netlify → Project configuration → Environment variables)
  and writes the site to `dist/`. The password is never stored in this repository.
  If it isn't set, only a "not set up yet" screen is published.
- When the trip page changes, bump `VERSION` in `sw.js` so phones pick up the update.
