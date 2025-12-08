# Web Application of Closar AI

## Mock/demo mode

- Set `REACT_APP_USE_MOCKS=true` in your env (or prefix the start command).
- Run with mock data: `REACT_APP_USE_MOCKS=true npm start`.
- Mock fixtures live in `src/mocks/` and cover auth, patients, reports, samples, messages, and preventive plans.
- When the flag is on, all Firebase/API calls are bypassed and replaced with local promises plus small artificial delay.

### Notes/limitations

- Downloads/QR features still render static data from the mocks.
- Firestore writes (e.g., saving preventive plans) are no-ops in mock mode.
- Turn the flag off to restore real backend behavior.
