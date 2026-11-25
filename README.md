# Nexus Advanced Scientific Calculator

Nexus is a unified React + TypeScript calculator for web, Android, and Windows. It includes standard, scientific, programmer, statistics, converter, graphing, and equation-solver modes with persistent history and memory.

## Development

Requirements: Node.js 20+ and npm.

```powershell
npm install
npm run dev
```

## Web production

```powershell
npm run build
npm run preview
```

Deploy the repository to Vercel. `vercel.json` uses Vite build settings with `dist` as the output directory. No environment variables are required.

## Android APK

Requirements: Android Studio, JDK 17+, and an Android SDK.

```powershell
npm run android:sync
npm run android:open
```

In Android Studio select **Build > Build Bundle(s)/APK(s) > Build APK(s)**. The debug APK is generated under `android\app\build\outputs\apk\debug\`.

## Windows installer

Requirements: Windows and NSIS.

```powershell
npm run electron:build
```

The NSIS installer is generated in `release\`. A standalone portable executable can also be generated with:

```powershell
npx electron-builder --win portable
```

The Android APK is built at `android\app\build\outputs\apk\debug\app-debug.apk`.

For Electron development, run `npm run dev` in one terminal and `npm run electron:dev` in another.
