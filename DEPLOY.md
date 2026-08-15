# Get it onto GitHub Pages, then turn it into an APK

## 1. Push to GitHub (from Termux)

```bash
pkg install git -y        # if not already installed
cd morgan-ctrader          # the folder with index.html, manifest.json, sw.js, icons
git init
git add .
git commit -m "Morgan AI trading engine - cTrader build"
```

Create an empty repo on github.com (no README/license, so it stays empty), then:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/morgan-ai-trading.git
git push -u origin main
```

## 2. Turn on GitHub Pages

1. On the repo page: **Settings → Pages**.
2. Under "Build and deployment", set **Source = Deploy from a branch**.
3. Branch = `main`, folder = `/ (root)`. Save.
4. Wait ~1 minute. Your link will be:
   `https://<your-username>.github.io/morgan-ai-trading/`

That link is the one you open on your phone, and the one you feed to the APK builder
below.

## 3. Turn it into an APK (no Android Studio needed)

Go to **[pwabuilder.com](https://www.pwabuilder.com/)** on any device:

1. Paste your GitHub Pages link into the box and hit **Start**.
2. PWABuilder reads `manifest.json` automatically (already included in this build) and
   shows a score. It should be green/mostly-green already since the manifest, icons and
   service worker are all in place.
3. Click **Package for stores → Android**.
4. Leave the defaults (package ID auto-fills from your URL, e.g.
   `io.github.<your-username>.morganai`) or edit it if you want a different name.
5. Click **Generate**, then download the `.zip`. Inside is a signed `.apk` (and an
   `.aab` if you ever want Play Store). The `.apk` is the one to install directly on
   your phone — enable "Install unknown apps" for your browser/file manager if Android
   asks.

That's the whole path: no Java, no Android Studio, no keystore to manage yourself
(PWABuilder generates and stores one for you — download it from the same page if you
ever need to sign an update the same way).

## Re-deploying after changes

Any time you edit `index.html` (new strategy tweaks, etc.):

```bash
git add .
git commit -m "update"
git push
```

GitHub Pages updates automatically within a minute. The APK itself doesn't need to be
rebuilt for logic changes — since the app is a PWA/WebView pointed at your Pages URL,
opening it will pull the latest version. Only rebuild the APK if you change the app
name, icon, or manifest.
