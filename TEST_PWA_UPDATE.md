# Testing PWA Update Prompt

This guide explains how to test the Service Worker update notification feature.

## Method 1: Development Mode (Recommended for Testing)

The Service Worker is enabled in dev mode, so you can test updates easily:

### Steps:

1. **Start the dev server:**
   ```bash
   bun run dev
   ```

2. **Open browser and DevTools:**
   - Navigate to http://localhost:3000
   - Open DevTools (F12) → **Application** tab → **Service Workers**
   - You should see the Service Worker registered

3. **Make a code change to trigger update:**
   - Edit any source file (e.g., change text in `src/components/header.tsx`)
   - Save the file
   - Vite will hot-reload, creating a "new build"

4. **Trigger Service Worker update check:**
   In DevTools → Application → Service Workers:
   - Click **"Update"** button next to your Service Worker
   - OR click **"skipWaiting"** if a new worker is waiting
   - OR reload the page (Ctrl/Cmd + R)

5. **See the update prompt:**
   - The UpdatePrompt toast should appear at the bottom of the page
   - It will show: "New version available! Click to update."
   - Click "Update Now" to reload with the new version
   - OR click "Later" to dismiss

## Method 2: Production Build + Preview

Test with a production build for more realistic behavior:

### Steps:

1. **Build and preview:**
   ```bash
   bun run build
   bunx vite preview --port 4173
   ```

2. **Open first browser tab:**
   - Navigate to http://localhost:4173
   - Open DevTools → Application → Service Workers
   - The Service Worker should register

3. **Make a change and rebuild:**
   - Edit a source file (e.g., change title in `index.html`)
   - Run `bun run build` again
   - Keep the preview server running

4. **Trigger update in the browser:**
   - In the open tab, go to DevTools → Application → Service Workers
   - Click **"Update"** button
   - OR reload the page
   - The update prompt should appear

5. **Test the update flow:**
   - Click "Update Now" → Page reloads with new version
   - OR click "Later" → Prompt dismisses, update available later

## Method 3: Using Chrome DevTools Service Worker Tools

For more control during testing:

1. **Navigate to** http://localhost:3000
2. **Open DevTools → Application → Service Workers**
3. **Enable these options:**
   - ☑ **Update on reload** - Forces SW update on every page reload
   - ☑ **Bypass for network** - Helps with debugging
4. **Check the "Offline" checkbox** to test offline functionality
5. **Use the "Update" button** to manually trigger updates

## What to Look For:

### Success Indicators:
- ✅ UpdatePrompt toast appears with "New version available!"
- ✅ Clicking "Update Now" reloads the page
- ✅ Clicking "Later" dismisses the prompt
- ✅ Console shows: "SW Registered: [ServiceWorkerRegistration]"

### In DevTools Console:
```
SW Registered: ServiceWorkerRegistration {...}
```

### In DevTools → Application → Service Workers:
- **Status:** activated and is running
- **Source:** sw.js

## Method 4: Test Offline Functionality

1. **Navigate to** http://localhost:3000
2. **Wait for Service Worker to activate**
3. **Open DevTools → Network tab**
4. **Enable "Offline" mode**
5. **Try to navigate:**
   - Solo practice: ✅ Should work offline
   - Competition/Spectator: ❌ Should show offline.html fallback
6. **Disable "Offline" mode**
7. **Watch for the green "Back online" banner** from OfflineIndicator

## Troubleshooting:

### Update prompt not appearing?
- Check Console for errors
- Verify Service Worker is registered: DevTools → Application → Service Workers
- Make sure `registerType: 'prompt'` in vite.config.ts
- Try a hard reload: Ctrl/Cmd + Shift + R

### Service Worker not registering?
- Check if browser supports Service Workers (most modern browsers do)
- Service Workers require HTTPS in production (localhost is exempt)
- Check Console for registration errors

### Old Service Worker won't update?
- In DevTools → Application → Service Workers:
  - Click "Unregister" to remove old SW
  - Click "skipWaiting" if a worker is waiting
  - Hard reload the page

### Clear everything and start fresh:
```bash
# In DevTools → Application:
1. Storage → Clear site data
2. Service Workers → Unregister
3. Hard reload page (Ctrl/Cmd + Shift + R)
```

## Tips:

1. **Use Incognito/Private mode** for clean testing without cached state
2. **Keep DevTools open** to see Service Worker status and console logs
3. **Don't use "Update on reload"** for testing the update prompt (it skips the prompt)
4. **Test in multiple browsers** (Chrome, Firefox, Safari, Edge)
5. **Check mobile browsers** for PWA install and update behavior

## Production Deployment Testing:

After deploying to production (Netlify/Vercel):

1. Visit your production URL
2. Make a change and redeploy
3. Visit production URL again in the same browser
4. The update prompt should appear automatically
5. Some users may need to refresh the page to trigger the update check

## Configuration Reference:

The update behavior is controlled in `vite.config.ts`:

```typescript
VitePWA({
  registerType: 'prompt', // Shows update prompt instead of auto-updating
  workbox: {
    skipWaiting: true,     // New SW activates immediately
    clientsClaim: true,    // New SW takes control of pages immediately
  },
})
```

For more info: https://vite-pwa-org.netlify.app/guide/
