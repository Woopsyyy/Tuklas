# Tuklas Project Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a fresh React Native app named `tuklas` in `/home/woopsy/project/TUKLAS` on the full requested stack, with a working app shell, persisted settings store, and audio demo proving every library is wired end-to-end.

**Architecture:** Expo managed workflow (SDK 57, New Architecture) with file-based routing via Expo Router living in `src/app/`. Styling through NativeWind 4 (Tailwind 3 class names compiled by Metro). Client state in a single Zustand store persisted to AsyncStorage. Reanimated 4 + Gesture Handler power an interactive home screen; expo-audio backs a sound demo screen.

**Tech Stack:** React Native 0.86.2 · Expo SDK 57 (~57.0.16) · TypeScript ~6.0 (strict) · Expo Router ~57.0.16 · NativeWind ^4.2.6 + Tailwind CSS ~3.4.19 · react-native-reanimated 4.5.1 (+ react-native-worklets 0.10.1) · react-native-gesture-handler ~2.32.0 · Zustand ^5 · @react-native-async-storage/async-storage · expo-audio ~57.0.4

## Global Constraints

- Package name must be exactly `"tuklas"` (lowercase — npm forbids uppercase). Display name / slug / URI scheme: `Tuklas` / `tuklas` / `tuklas`.
- **Do NOT run `npx create-expo-app`.** It is broken with npm ≥ 12 ("Could not parse JSON returned from npm pack"). Task 1 uses the verified `npm pack` extraction path instead.
- **NativeWind stays on v4 stable (`^4.2.6`) with Tailwind CSS `~3.4.19`.** Do not install `nativewind@preview`, `tailwindcss@4`, or `react-native-css`. NativeWind v5 is still tagged `preview` on npm and requires Tailwind v4; v4 declares peer dependency `tailwindcss >3.3.0`.
- Expo SDK 57 is New Architecture only. Reanimated 4.5.1 + react-native-worklets are already in the template — never downgrade Reanimated to v3.
- Install every Expo/native module with `npx expo install` (never bare `npm install`) so versions stay SDK-matched: applies to `expo-audio`, `@react-native-async-storage/async-storage`, `jest-expo`, `jest`. Pure-JS libs (`nativewind`, `tailwindcss`, `zustand`, dev tooling) go through `npm` / `npm install --dev`.
- Source code lives under `src/`; the template tsconfig maps `@/*` → `./src/*` and `@/assets/*` → `./assets/*`.
- No comments inside source files.
- Every task touching bundler/babel/metro config must be verified with `npm run typecheck` AND `npx expo export` before committing.
- Working directory for all commands: `/home/woopsy/project/TUKLAS`.

## File Structure (end state)

```
/home/woopsy/project/TUKLAS/
├── app.json                          # renamed to tuklas
├── package.json                      # name "tuklas"; scripts: start/android/ios/web/lint/test/typecheck
├── tsconfig.json                     # from template, untouched
├── eslint.config.js                  # added in Task 7 if missing
├── jest.setup.js                     # AsyncStorage mock (Task 3)
├── babel.config.js                   # NativeWind jsxImportSource (Task 2)
├── metro.config.js                   # withNativeWind wrapper (Task 2)
├── tailwind.config.js                # NW preset + content globs (Task 2)
├── nativewind-env.d.ts               # className types (Task 2)
├── assets/images/                    # template images, untouched
├── assets/audio/tone.wav             # generated in Task 6
├── scripts/generate-tone.mjs         # deterministic WAV generator (Task 6)
├── docs/superpowers/plans/           # this plan
└── src/
    ├── global.css                    # Tailwind directives (replaces template CSS)
    ├── app/
    │   ├── _layout.tsx               # Stack + GestureHandlerRootView + ThemeProvider
    │   ├── index.tsx                 # Home: theme switcher, sound toggle, swipeable card
    │   └── audio.tsx                 # expo-audio play/pause demo
    ├── components/
    │   ├── swipeable-card.tsx
    │   └── __tests__/swipeable-card.test.tsx
    ├── lib/
    │   ├── format-duration.ts        # pure util, TDD'd (Task 6)
    │   └── __tests__/format-duration.test.ts
    ├── store/
    │   ├── use-settings-store.ts     # Zustand + persist (Task 4)
    │   └── __tests__/use-settings-store.test.ts
    └── __tests__/harness.test.ts     # jest sanity test (Task 3)
```

Template demo files deleted in Task 5: `src/app/explore.tsx`, `src/app/smoke.tsx` (created in Task 2), everything under `src/components/` except the new files above, `src/constants/`, `src/hooks/`, and `scripts/reset-project.js`. The `reset-project` npm script entry is removed in Task 1 Step 2.

---

### Task 1: Scaffold tuklas from the Expo SDK 57 template

**Files:**
- Create: everything extracted from `expo-template-default@57.0.18` into the repo root
- Modify: `package.json` (name/version/scripts), `app.json` (name/slug/scheme)
- Rename: `gitignore` → `.gitignore`, `_vscode/` → `.vscode/`

**Interfaces:**
- Produces: a committed, installable Expo SDK 57 project named `tuklas` with deps `expo@~57.0.16`, `react-native@0.86.2`, `react@19.2.3`, `react-native-reanimated@4.5.1`, `react-native-worklets@0.10.1`, `react-native-gesture-handler@~2.32.0`, `react-native-safe-area-context@~5.7.0`, `expo-router@~57.0.16`, `typescript@~6.0.3`, plus `src/app/{_layout,index,explore}.tsx` and `src/global.css` exactly as shipped by the template. Later tasks modify these files in place.

- [ ] **Step 1: Download and extract the pinned template**

The directory must be empty before starting (verify with `ls -A`). Run:

```bash
cd /home/woopsy/project/TUKLAS
npm pack expo-template-default@57.0.18
tar -xzf expo-template-default-57.0.18.tgz --strip-components=1
rm expo-template-default-57.0.18.tgz
mv gitignore .gitignore
mv _vscode .vscode
```

Expected: `ls -A` shows `.gitignore`, `.vscode`, `README.md`, `LICENSE`, `app.json`, `package.json`, `tsconfig.json`, `assets/`, `scripts/`, `src/`. There is no `node_modules/` yet.

Why this works: `create-expo-app` performs exactly this extraction plus renames, but its `npm pack --dry-run --json` parser is incompatible with npm ≥ 12. We replicate its steps manually against the same published template tarball.

- [ ] **Step 2: Rename the project to tuklas**

Edit `package.json`: change `"name"` to `"tuklas"`, change `"version"` to `"1.0.0"`, and delete the `"reset-project": "node ./scripts/reset-project.js"` line from `scripts` (keep `start`, `android`, `ios`, `web`, `lint`). Leave everything else byte-identical.

Edit `app.json`: set `"name": "Tuklas"`, `"slug": "tuklas"`, and `"scheme": "tuklas"`. Touch nothing else.

- [ ] **Step 3: Install dependencies**

```bash
npm install
npx expo-doctor
```

Expected: install completes without errors; expo-doctor reports no version mismatches (a prompt suggesting `expo install --check` with zero findings is fine).

- [ ] **Step 4: Verify the scaffold typechecks**

Run: `npx tsc --noEmit`
Expected: exits 0, no output. (`expo-env.d.ts` does not exist yet; it is generated on first `expo start` / `expo export`.)

- [ ] **Step 5: Initialize git and commit the baseline**

```bash
git init
git add -A
git commit -m "chore: scaffold tuklas from expo-template-default@57.0.18"
```

Expected: a single commit containing the pristine renamed template.

---

### Task 2: Wire up NativeWind 4 + Tailwind CSS 3

**Files:**
- Create: `tailwind.config.js`, `metro.config.js`, `babel.config.js`, `nativewind-env.d.ts`, `src/app/smoke.tsx`
- Modify: `package.json` (new deps via commands below), `src/global.css` (replace contents), `src/app/_layout.tsx` (add one import)

**Interfaces:**
- Consumes: template files from Task 1 (`src/app/_layout.tsx`, `src/global.css`).
- Produces: a working `className` prop on all RN core components across the app; a temporary `smoke` route at `/smoke` (deleted in Task 5); config contract later tasks rely on: the global stylesheet lives at `src/global.css` and is imported exactly once, in `src/app/_layout.tsx`.

- [ ] **Step 1: Install nativewind and pinned tailwindcss**

```bash
npm install nativewind@^4.2.6
npm install --dev tailwindcss@~3.4.19
npm ls tailwindcss
```

Expected: clean install; `npm ls tailwindcss` shows `3.4.x` (never 4.x). `react-native-css-interop@0.2.6` arrives transitively with nativewind.

- [ ] **Step 2: Replace src/global.css**

Replace the entire content of `src/global.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Create tailwind.config.js**

Create `tailwind.config.js` at the repo root:

```js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 4: Create babel.config.js**

Create `babel.config.js` at the repo root:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
  };
};
```

This `jsxImportSource` option is what makes `className` actually compile to styles. Without it the app bundles fine but renders unstyled.

- [ ] **Step 5: Create metro.config.js**

Create `metro.config.js` at the repo root:

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

- [ ] **Step 6: Create nativewind-env.d.ts**

Create `nativewind-env.d.ts` at the repo root:

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 7: Import global.css in the root layout**

In `src/app/_layout.tsx`, add this as the very first import line (above all others):

```tsx
import "../global.css";
```

Leave the rest of `_layout.tsx` unchanged in this task.

- [ ] **Step 8: Create a smoke route with Tailwind classes**

Create `src/app/smoke.tsx`:

```tsx
import { Text, View } from "react-native";

export default function SmokeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-600">
      <Text className="text-3xl font-bold text-white">NativeWind OK</Text>
      <View className="mt-4 h-10 w-40 rounded-full bg-amber-400" />
    </View>
  );
}
```

- [ ] **Step 9: Typecheck and bundle**

```bash
npx tsc --noEmit
npx expo export
```

Expected: both exit 0. The export proves Metro resolves `withNativeWind`, processes `src/global.css`, and applies the babel transform. Any error mentioning `nativewind/metro`, `postcss`, or `global.css` means Steps 2–5 were skipped or mistyped.

- [ ] **Step 10: Visual check (requires device, simulator, or web)**

Start `npx expo start` and open the `smoke` route (press `w` for web, `a`/`i` for simulators, or scan the QR from Expo Go).

Expected visual: full-screen blue background, bold white centered text reading "NativeWind OK", amber pill below it. If text renders without colors/layout, the babel `jsxImportSource` from Step 4 is wrong. Stop the dev server when done.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: wire up nativewind v4 with tailwind css 3"
```

---
### Task 3: Add Jest test harness

**Files:**
- Create: `jest.setup.js`, `src/__tests__/harness.test.ts`
- Modify: `package.json` (dev deps, `test`/`typecheck` scripts, `jest` config block)

**Interfaces:**
- Produces: `npm test` runs jest-expo tests matching `src/**/__tests__/*.test.{ts,tsx}`; `npm run typecheck` runs `tsc --noEmit`; `jest.setup.js` pre-registers the `@react-native-async-storage/async-storage` mock that Task 4's persistence tests rely on. This task installs `@react-native-async-storage/async-storage` one task early so the mock references a real module.

- [ ] **Step 1: Install test dependencies**

```bash
npx expo install --dev jest-expo jest @react-native-async-storage/async-storage
npm install --dev @types/jest @testing-library/react-native
```

Expected: `jest-expo` lands at the SDK 57-matched version (`~57.x`), `jest` at `~29.7.0`, async-storage at the SDK-pinned version. Confirm with `npm ls jest-expo jest @react-native-async-storage/async-storage`.

- [ ] **Step 2: Write jest.setup.js**

Create `jest.setup.js` at the repo root:

```js
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
```

If Step 5 fails because the mock path above cannot resolve (possible on async-storage v3), replace the file content with an inline in-memory implementation:

```js
let memoryStore = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async (key) => memoryStore[key] ?? null),
  setItem: jest.fn(async (key, value) => {
    memoryStore[key] = value;
  }),
  removeItem: jest.fn(async (key) => {
    delete memoryStore[key];
  }),
  clear: jest.fn(async () => {
    memoryStore = {};
  }),
}));
```

- [ ] **Step 3: Configure package.json**

Add to `scripts`:

```json
"test": "jest",
"typecheck": "tsc --noEmit"
```

Add this top-level `jest` block to `package.json`:

```json
"jest": {
  "preset": "jest-expo",
  "setupFiles": ["<rootDir>/jest.setup.js"],
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-css))"
  ]
}
```

- [ ] **Step 4: Write a sanity test**

Create `src/__tests__/harness.test.ts`:

```ts
describe("test harness", () => {
  it("executes tests through the jest-expo preset", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the verification gates**

Run: `npm test`
Expected: PASS — 1 suite, 1 test.

Run: `npm run typecheck && npx expo export`
Expected: both exit 0 — the new dev deps and config did not break bundling.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: add jest-expo harness with async-storage mock"
```

---

### Task 4: Zustand settings store persisted to AsyncStorage (TDD)

**Files:**
- Create: `src/store/use-settings-store.ts`, `src/store/__tests__/use-settings-store.test.ts`

**Interfaces:**
- Consumes: jest harness and AsyncStorage mock from Task 3.
- Produces (Tasks 5 and 6 consume these exact names):

```ts
export type ThemePreference = "light" | "dark" | "system";

export const SETTINGS_STORAGE_KEY: string;

export const useSettingsStore: {
  (): {
    theme: ThemePreference;
    soundEnabled: boolean;
    setTheme: (theme: ThemePreference) => void;
    toggleSound: () => void;
  };
  persist: {
    rehydrate: () => Promise<void>;
  };
};
```

Defaults: `theme = "system"`, `soundEnabled = true`. Persisted under key `tuklas-settings` in zustand's `{ state, version }` envelope.

- [ ] **Step 1: Install zustand**

```bash
npm install zustand
npm ls zustand
```

Expected: `zustand@5.x` installs (`^5.0.15` is current).

- [ ] **Step 2: Write the failing tests**

Create `src/store/__tests__/use-settings-store.test.ts`:

```ts
import { act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SETTINGS_STORAGE_KEY, useSettingsStore } from "../use-settings-store";

describe("useSettingsStore", () => {
  beforeEach(() => {
    AsyncStorage.clear();
    useSettingsStore.setState({ theme: "system", soundEnabled: true });
  });

  it("starts with system theme and sound enabled", () => {
    const state = useSettingsStore.getState();
    expect(state.theme).toBe("system");
    expect(state.soundEnabled).toBe(true);
  });

  it("setTheme updates the theme", () => {
    act(() => {
      useSettingsStore.getState().setTheme("dark");
    });
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("toggleSound flips soundEnabled", () => {
    act(() => {
      useSettingsStore.getState().toggleSound();
    });
    expect(useSettingsStore.getState().soundEnabled).toBe(false);

    act(() => {
      useSettingsStore.getState().toggleSound();
    });
    expect(useSettingsStore.getState().soundEnabled).toBe(true);
  });

  it("persists changes to AsyncStorage", async () => {
    act(() => {
      useSettingsStore.getState().toggleSound();
    });
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    expect(JSON.parse(raw ?? "")).toMatchObject({
      state: { soundEnabled: false },
      version: 0,
    });
  });

  it("rehydrates persisted state", async () => {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        state: { theme: "light", soundEnabled: false },
        version: 0,
      })
    );
    await useSettingsStore.persist.rehydrate();
    const state = useSettingsStore.getState();
    expect(state.theme).toBe("light");
    expect(state.soundEnabled).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — "Cannot find module '../use-settings-store'". If tests pass before the store exists, the test file is in the wrong location.

- [ ] **Step 4: Implement the store**

Create `src/store/use-settings-store.ts`:

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

interface SettingsState {
  theme: ThemePreference;
  soundEnabled: boolean;
  setTheme: (theme: ThemePreference) => void;
  toggleSound: () => void;
}

export const SETTINGS_STORAGE_KEY = "tuklas-settings";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      soundEnabled: true,
      setTheme: (theme) => set({ theme }),
      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

Note: `createJSONStorage` lives in `zustand/middleware` (v5). If TypeScript rejects the import, run `npm ls zustand` — anything below v5 means a stale resolution; fix with `npm install zustand@latest`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — 2 suites (harness + store), 6 tests total.

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/store package.json package-lock.json
git commit -m "feat: add zustand settings store persisted to asyncstorage"
```

---
### Task 5: App shell — root layout, gesture/reanimated home screen, cleanup

**Files:**
- Create: `src/components/swipeable-card.tsx`, `src/components/__tests__/swipeable-card.test.tsx`
- Modify: `src/app/_layout.tsx` (full rewrite), `src/app/index.tsx` (full rewrite)
- Delete: `src/app/explore.tsx`, `src/app/smoke.tsx`, `src/components/animated-icon.module.css`, `src/components/animated-icon.tsx`, `src/components/animated-icon.web.tsx`, `src/components/app-tabs.tsx`, `src/components/app-tabs.web.tsx`, `src/components/external-link.tsx`, `src/components/hint-row.tsx`, `src/components/themed-text.tsx`, `src/components/themed-view.tsx`, `src/components/ui/collapsible.tsx`, `src/components/web-badge.tsx`, `src/constants/theme.ts`, `src/hooks/use-color-scheme.ts`, `src/hooks/use-color-scheme.web.ts`, `src/hooks/use-theme.ts`, `scripts/reset-project.js`

**Interfaces:**
- Consumes: `useSettingsStore` and `ThemePreference` from Task 4; the NativeWind pipeline from Task 2. Routes registered here: `index` (header hidden) and `audio` (title "Audio") — Task 6 creates `src/app/audio.tsx` to fill that route.
- Produces: `SwipeableCard` component:

```ts
interface SwipeableCardProps {
  label: string;
  onDismiss: () => void;
}
```

Renders `label` centered in a rounded card; a horizontal pan past ±120 logical pixels animates the card off-screen then calls `onDismiss` once.

- [ ] **Step 1: Rewrite the root layout**

Replace the entire content of `src/app/_layout.tsx` with:

```tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="audio" options={{ title: "Audio" }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
```

`GestureHandlerRootView` must wrap everything or no gesture callback ever fires — it is the single most common RNGH misconfiguration.

- [ ] **Step 2: Create SwipeableCard with a Pan gesture + Reanimated timing**

Create `src/components/swipeable-card.tsx`:

```tsx
import { Text } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const DISMISS_THRESHOLD = 120;

interface SwipeableCardProps {
  label: string;
  onDismiss: () => void;
}

export function SwipeableCard({ label, onDismiss }: SwipeableCardProps) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange((event) => {
      translateX.value = event.translationX;
    })
    .onFinalize((event) => {
      if (Math.abs(event.translationX) > DISMISS_THRESHOLD) {
        translateX.value = withTiming(
          event.translationX > 0 ? 500 : -500,
          { duration: 200 },
          (finished) => {
            if (finished) {
              runOnJS(onDismiss)();
            }
          }
        );
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          cardStyle,
          {
            alignSelf: "stretch",
            borderRadius: 24,
            paddingVertical: 32,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text className="text-lg font-semibold">{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

- [ ] **Step 3: Write the SwipeableCard render test**

Create `src/components/__tests__/swipeable-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react-native";

import { SwipeableCard } from "../swipeable-card";

describe("SwipeableCard", () => {
  it("renders its label", () => {
    render(<SwipeableCard label="Swipe me away" onDismiss={() => {}} />);
    expect(screen.getByText("Swipe me away")).toBeOnTheScreen();
  });
});
```

- [ ] **Step 4: Run tests to verify the component renders**

Run: `npm test`
Expected: PASS — 3 suites including swipeable-card (7 tests total). A failure mentioning `react-native-worklets` or `reanimated` usually means `node_modules` is stale relative to Task 1's lockfile; fix with `rm -rf node_modules && npm install` before debugging further.

- [ ] **Step 5: Rewrite the home screen**

Replace the entire content of `src/app/index.tsx` with:

```tsx
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View, useColorScheme } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { SwipeableCard } from "@/components/swipeable-card";
import { ThemePreference, useSettingsStore } from "@/store/use-settings-store";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function useIsDark() {
  const scheme = useColorScheme();
  const preference = useSettingsStore((state) => state.theme);
  if (preference === "system") {
    return scheme === "dark";
  }
  return preference === "dark";
}

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useIsDark();
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);

  const surface = isDark ? "bg-zinc-950" : "bg-white";
  const surfaceAlt = isDark ? "bg-zinc-900" : "bg-zinc-100";
  const primaryText = isDark ? "text-zinc-50" : "text-zinc-900";
  const secondaryText = isDark ? "text-zinc-400" : "text-zinc-500";

  return (
    <View className={`flex-1 ${surface}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1 gap-8 px-6 pt-8">
        <Animated.View entering={FadeInDown.duration(500)} className="gap-1">
          <Text className={`text-4xl font-bold ${primaryText}`}>Tuklas</Text>
          <Text className={`text-base ${secondaryText}`}>
            discover something new
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          className="gap-3"
        >
          <Text className={`text-sm font-semibold uppercase ${secondaryText}`}>
            Theme
          </Text>
          <View className={`flex-row rounded-2xl p-1 ${surfaceAlt}`}>
            {THEME_OPTIONS.map((option) => {
              const active = theme === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setTheme(option.value)}
                  className={`flex-1 items-center rounded-xl py-2 ${
                    active ? "bg-sky-500" : ""
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      active ? "text-white" : secondaryText
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          className="gap-3"
        >
          <Text className={`text-sm font-semibold uppercase ${secondaryText}`}>
            Sound
          </Text>
          <Pressable
            onPress={toggleSound}
            className={`flex-row items-center justify-between rounded-2xl px-4 py-4 ${surfaceAlt}`}
          >
            <Text className={`text-base font-medium ${primaryText}`}>
              Sound effects
            </Text>
            <View
              className={`h-7 w-12 items-center rounded-full px-1 ${
                soundEnabled
                  ? "justify-end bg-emerald-500"
                  : "justify-start bg-zinc-400"
              }`}
            >
              <View className="h-5 w-5 rounded-full bg-white" />
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <SwipeableCard
            label="Swipe me to dismiss"
            onDismiss={() => router.navigate("/audio")}
          />
          <Text className={`mt-2 text-center text-xs ${secondaryText}`}>
            swiping the card opens the audio demo
          </Text>
        </Animated.View>

        <Pressable
          onPress={() => router.navigate("/audio")}
          className="items-center rounded-2xl bg-sky-500 py-4"
        >
          <Text className="text-base font-semibold text-white">
            Open Audio Demo
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
```

- [ ] **Step 6: Delete template demo files**

```bash
rm src/app/explore.tsx \
   src/app/smoke.tsx \
   src/components/animated-icon.module.css \
   src/components/animated-icon.tsx \
   src/components/animated-icon.web.tsx \
   src/components/app-tabs.tsx \
   src/components/app-tabs.web.tsx \
   src/components/external-link.tsx \
   src/components/hint-row.tsx \
   src/components/themed-text.tsx \
   src/components/themed-view.tsx \
   src/components/ui/collapsible.tsx \
   src/components/web-badge.tsx \
   src/constants/theme.ts \
   src/hooks/use-color-scheme.ts \
   src/hooks/use-color-scheme.web.ts \
   src/hooks/use-theme.ts \
   scripts/reset-project.js
rmdir src/components/ui src/constants src/hooks scripts 2>/dev/null || true
```

(Task 6 recreates `scripts/` with its own file.)

- [ ] **Step 7: Full verification gate**

```bash
npm test
npm run typecheck
npx expo export
```

Expected: all pass/bundle cleanly. A type error referencing deleted modules (`@/constants/theme`, `themed-text`, `app-tabs`) means a deletion was missed or `index.tsx` still imports them.

- [ ] **Step 8: Manual smoke on device/simulator/web**

Run `npx expo start` and open the app.

Expected: dark/light/system segmented control switches the whole palette immediately; the Sound toggle flips green/grey; swiping the tip card fully off-screen attempts navigation to `/audio` (missing-route state is expected — that screen arrives in Task 6); "Open Audio Demo" button navigates too. Kill the server when done.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add app shell with gestures, reanimated entrance, and settings"
```

---
### Task 6: expo-audio sound demo (TDD where pure)

**Files:**
- Create: `src/lib/format-duration.ts`, `src/lib/__tests__/format-duration.test.ts`, `src/app/audio.tsx`, `scripts/generate-tone.mjs`
- Generate: `assets/audio/tone.wav`

**Interfaces:**
- Consumes: `useSettingsStore` (gates playback on `soundEnabled`); the `audio` route registered in Task 5's Stack.
- Produces: `formatDuration` util:

```ts
export function formatDuration(milliseconds: number): string;
```

Returns `"m:ss"` — e.g. `formatDuration(0)` → `"0:00"`, `formatDuration(65000)` → `"1:05"`, `formatDuration(59999)` → `"0:59"` (truncates, never rounds up).

- [ ] **Step 1: Install expo-audio**

```bash
npx expo install expo-audio
npm ls expo-audio
```

Expected: installs the SDK 57-matched version (`~57.0.4`).

- [ ] **Step 2: Write failing tests for formatDuration**

Create `src/lib/__tests__/format-duration.test.ts`:

```ts
import { formatDuration } from "../format-duration";

describe("formatDuration", () => {
  it("formats zero milliseconds", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats sub-second durations without rounding up", () => {
    expect(formatDuration(59999)).toBe("0:59");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(65000)).toBe("1:05");
  });

  it("pads seconds to two digits", () => {
    expect(formatDuration(61000)).toBe("1:01");
  });

  it("handles negative input as zero", () => {
    expect(formatDuration(-250)).toBe("0:00");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx jest src/lib`
Expected: FAIL — "Cannot find module '../format-duration'".

- [ ] **Step 4: Implement formatDuration**

Create `src/lib/format-duration.ts`:

```ts
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest src/lib`
Expected: PASS — 5 tests.

- [ ] **Step 6: Generate a deterministic tone asset**

Create `scripts/generate-tone.mjs`:

```js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 22050;
const DURATION_SECONDS = 0.6;
const FREQUENCY_HZ = 440;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDir, "../assets/audio/tone.wav");

const sampleCount = Math.round(SAMPLE_RATE * DURATION_SECONDS);
const dataBytes = sampleCount * 2;
const buffer = Buffer.alloc(44 + dataBytes);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataBytes, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataBytes, 40);

for (let i = 0; i < sampleCount; i++) {
  const fade = Math.min(1, i / 480, (sampleCount - i) / 480);
  const amplitude =
    Math.sin((2 * Math.PI * FREQUENCY_HZ * i) / SAMPLE_RATE) * fade;
  buffer.writeInt16LE(Math.round(amplitude * 32000), 44 + i * 2);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buffer);
console.log(`wrote ${outputPath}`);
```

Run it:

```bash
node scripts/generate-tone.mjs
ls -la assets/audio/tone.wav
```

Expected: file exists at ~26 KB (`44 + 22050 × 0.6 × 2` bytes).

- [ ] **Step 7: Create the audio screen**

Create `src/app/audio.tsx`:

```tsx
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatDuration } from "@/lib/format-duration";
import { useSettingsStore } from "@/store/use-settings-store";

export default function AudioScreen() {
  const player = useAudioPlayer(require("../../assets/audio/tone.wav"));
  const status = useAudioPlayerStatus(player);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  useEffect(() => {
    return () => {
      player.release();
    };
  }, [player]);

  const playing = status.playing;

  const handleTogglePlayback = () => {
    if (!soundEnabled) {
      return;
    }
    if (playing) {
      player.pause();
    } else {
      player.seekTo(0);
      player.play();
    }
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <SafeAreaView className="flex-1 items-center justify-center gap-6 px-6">
        <Text className="text-3xl font-bold text-zinc-50">Sound Check</Text>
        <Text className="text-base text-zinc-400">
          {status.duration
            ? `${formatDuration(status.currentTime)} / ${formatDuration(
                status.duration
              )}`
            : "loading…"}
        </Text>
        <Pressable
          onPress={handleTogglePlayback}
          disabled={!soundEnabled}
          className={`rounded-full px-10 py-4 ${
            soundEnabled ? "bg-sky-500" : "bg-zinc-700"
          }`}
        >
          <Text className="text-lg font-semibold text-white">
            {!soundEnabled ? "Sound disabled" : playing ? "Pause" : "Play tone"}
          </Text>
        </Pressable>
        <Pressable onPress={toggleSound} className="py-2">
          <Text className="text-sm text-zinc-400 underline">
            {soundEnabled ? "Turn sound off" : "Turn sound on"}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
```

- [ ] **Step 8: Verification gate**

```bash
npm test
npm run typecheck
npx expo export
```

Expected: all pass/bundle cleanly (4 suites, 12 tests). A type error on `useAudioPlayerStatus` fields means expo-audio resolved below `~57.0`; fix with `npx expo install --fix`.

- [ ] **Step 9: Manual audio check**

Run `npx expo start`, navigate Home → "Open Audio Demo".

Expected: pressing "Play tone" plays a short beep on device/simulator speakers, the progress line reads around `0:00 / 0:01`, and the button flips Play/Pause. Toggling "Turn sound off" disables the play button until re-enabled. On iOS simulator, raise the Mac volume; `playsInSilentMode` handles the silent switch.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add expo-audio demo with generated tone and duration formatting"
```

---

### Task 7: Lint, doctor, README, final verification

**Files:**
- Create: `eslint.config.js` (only if absent)
- Modify: `README.md` (replace template readme)

**Interfaces:**
- Consumes: all prior tasks.
- Produces: green `lint` / `typecheck` / `test` gates plus an accurate README — the project is ready for feature work.

- [ ] **Step 1: Ensure ESLint is configured**

Run: `npm run lint` (the template already defines `"lint": "expo lint"`).

- If it runs and reports results: fix trivial findings (e.g. unused imports left over from rewrites), continue.
- If it fails because ESLint isn't installed/configured, run:

```bash
npm install --dev eslint eslint-config-expo
```

then create `eslint.config.js` at the repo root:

```js
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
]);
```

and rerun `npm run lint`. Expected: zero errors (warnings acceptable).

- [ ] **Step 2: Run expo-doctor**

Run: `npx expo-doctor`
Expected: no errors. Any version mismatch listed here must be fixed with `npx expo install --fix` before proceeding (commit that separately as `chore: align dependency versions with sdk 57`).

- [ ] **Step 3: Replace the README**

Overwrite `README.md` with:

```markdown
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
| `npm start`         | Start the dev server            |
| `npm test`          | Run jest-expo tests             |
| `npm run typecheck` | TypeScript strict check         |
| `npm run lint`      | ESLint via `expo lint`          |
| `npx expo export`   | Production bundle smoke test    |

## Layout

App code lives in `src/`: routes in `src/app/`, components in `src/components/`,
state in `src/store/`, pure helpers in `src/lib/`. The `@/*` import alias maps to
`src/*`.
```

- [ ] **Step 4: Final verification gate**

Run each of these; all must exit 0:

```bash
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo export
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: add project readme and finalize tooling"
git log --oneline
```

Expected: a clean linear history of one commit per task.

---

## Verification Summary

The finished project proves every requested library works end-to-end:

| Requirement     | Proven by                                                        |
| --------------- | ---------------------------------------------------------------- |
| React Native    | App runs via Expo SDK 57 (RN 0.86.2)                             |
| Expo            | Managed workflow, `expo-doctor` clean                            |
| TypeScript      | Strict mode green through `npm run typecheck`                    |
| Expo Router     | `/` and `/audio` routes via Stack in `src/app/_layout.tsx`       |
| NativeWind      | Task 2 smoke route + all screens styled with `className`         |
| Reanimated      | `FadeInDown` entrances + swipe-dismiss timing animation          |
| Gesture Handler | Pan gesture dismisses card inside `GestureHandlerRootView`       |
| Zustand         | Settings store drives theme/sound UI live                        |
| AsyncStorage    | Persist middleware round-trip covered by tests                   |
| expo-audio      | Generated WAV plays with progress display, gated by settings     |
