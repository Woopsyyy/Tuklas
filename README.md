# Tuklas

A React Native discovery app built with Expo.

## Stack

- Expo SDK 57 · React Native 0.86 · TypeScript (strict)
- Expo Router (file-based routing under `src/app/`)
- NativeWind v4 + Tailwind CSS 3 for styling (`className` everywhere)
- Reanimated 4 + Gesture Handler for motion and gestures
- Zustand persisted to AsyncStorage for client state
- expo-audio for playback

## Getting started

```bash
npm install
npm start
```

Press `a` (Android), `i` (iOS), or `w` (web), or scan the QR code with Expo Go.

## Commands

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Boot the Android emulator, then start Expo and open the app |
| `npm start`         | Start the dev server            |
| `npm test`          | Run jest-expo tests             |
| `npm run typecheck` | TypeScript strict check         |
| `npm run lint`      | ESLint via `expo lint`          |
| `npx expo export`   | Production bundle smoke test    |

## Layout

App code lives in `src/`: routes in `src/app/`, components in `src/components/`,
state in `src/store/`, pure helpers in `src/lib/`. The `@/*` import alias maps to
`src/*`.
