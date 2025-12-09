# Web Application of Closar AI

## Running the Project

### Development

```bash
npm start
```

This starts the development server with mock data enabled. The app will run on `http://localhost:3000` (or the next available port).

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory with mock data enabled.

## Mock/demo mode

- Mock mode is **enabled by default** in both `npm start` and `npm run build`
- Mock fixtures live in `src/mocks/` and cover auth, patients, reports, samples, messages, and preventive plans.
- All Firebase/API calls are bypassed and replaced with local promises plus small artificial delay.
- The login page shows a simple "Login" button (no credentials needed).

### Notes/limitations

- Downloads/QR features still render static data from the mocks.
- Firestore writes (e.g., saving preventive plans) are no-ops in mock mode.
- Turn the flag off to restore real backend behavior.

## Deployment

### For Portfolio/Demo Deployment (Mock Mode)

1. **Set environment variable for mock mode:**
   - Create a `.env.prod` file (or set in your hosting platform) with:
     ```
     REACT_APP_USE_MOCKS=true
     ```

2. **Build the production bundle:**
   ```bash
   npm run build:prod
   ```
   This creates an optimized, obfuscated build in the `build/` directory.

3. **Deploy options:**

   **Option A: Firebase Hosting (recommended for this project)**
   ```bash
   firebase deploy --only hosting
   ```
   - Make sure `firebase.json` is configured (already set up)
   - The build folder will be deployed to Firebase Hosting

   **Option B: Netlify (Recommended for easy deployment)**
   - Connect your GitHub repository to Netlify
   - Netlify will automatically detect `netlify.toml` configuration
   - The build command is already set to `npm run build` (uses mock mode by default)
   - No additional environment variables needed - mock mode is enabled by default in the build script
   - Netlify will automatically handle SPA routing via `_redirects` file
   
   **Option C: Other Static hosting (Vercel, GitHub Pages, etc.)**
   - Upload the contents of the `build/` folder to your hosting provider
   - Configure your hosting to serve `index.html` for all routes (SPA routing)
   - Set `REACT_APP_USE_MOCKS=true` as an environment variable

4. **Environment variables:**
   - For mock mode: Only `REACT_APP_USE_MOCKS=true` is needed
   - For production with real backend: Set all Firebase config vars in your hosting platform

### Important Notes

- The build process includes code obfuscation (see `scripts/obfuscate.js`)
- Source maps are disabled in production builds (`GENERATE_SOURCEMAP=false`)
- Make sure to set `REACT_APP_USE_MOCKS=true` in your production environment for portfolio demos
