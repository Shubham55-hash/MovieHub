# 🎬 Movie Explorer

A production-grade **Movie Explorer** mobile application built with **React Native CLI + TypeScript**, consuming the [TMDB API](https://developer.themoviedb.org).

---

## App Overview

| Screen | Description |
|---|---|
| **Home** | Browses popular movies with infinite scroll and pull-to-refresh. Shows cached data instantly on cold start while re-fetching silently in the background. |
| **Search** | Searches movies by title with 400ms debounced input, paginated results, and a recent searches chip list. |
| **Detail** | Shows full movie details — poster, backdrop, tagline, genres, runtime, rating, and overview. Uses Redux cache for instant data before the extended API response arrives. |

---

## Setup & Run

### Prerequisites
- Node.js ≥ 18
- JDK 17
- Android Studio with a configured emulator (or a physical device)
- Xcode (macOS only, for iOS)

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd MovieExplorer

# 2. Install dependencies
npm install

# 3. Add your TMDB API key (see Environment Variables section)

# 4a. Run on Android
npx react-native run-android

# 4b. Run on iOS (macOS only)
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## Environment Variables

The TMDB API key is currently stored in `src/constants/api.ts`. For production use, set it via a `.env` file with `react-native-config`:

1. Install: `npm install react-native-config`
2. Create `.env` in the project root:
   ```
   TMDB_API_KEY=your_api_key_here
   ```
3. Update `src/constants/api.ts`:
   ```ts
   import Config from 'react-native-config';
   export const TMDB_API_KEY = Config.TMDB_API_KEY ?? '';
   ```
4. For Android, follow the `react-native-config` android setup to expose variables to `BuildConfig`.

> **Get your API key at:** https://www.themoviedb.org/settings/api

---

## Architecture Decisions

### Why Redux Toolkit over Context API?
Redux Toolkit (RTK) provides a centralized, predictable state container with first-class support for async operations (`createAsyncThunk`), memoized selectors (`createSelector`), and middleware. Context API re-renders all consumers on any state change — unsuitable for a large movie list with frequent pagination updates.

### Why custom persistence middleware over redux-persist?
`redux-persist` is a large, opinionated library that serializes the entire store and requires rehydration actions that conflict with RTK's `createSlice` patterns. The custom `persistenceMiddleware` is ~20 lines of targeted code that only persists what matters: the movie list and recent searches. This gives complete control, zero magic, and no bundle-size overhead.

### Why `getItemLayout`?
`FlatList` normally measures each item's height at render time, causing layout recalculations as the user scrolls. By implementing `getItemLayout` with fixed card heights, RN can compute scroll positions instantly — enabling accurate `scrollToIndex`, better jump-scrolling, and reduced jank during rapid scrolling through hundreds of items.

### How stale-while-revalidate works
On app start, `App.tsx` reads `AsyncStorage` synchronously (in effect) and immediately hydrates the Redux store with cached movies. The UI renders cached content within milliseconds. Simultaneously, if the cached data is older than 10 minutes, a background fetch is dispatched. When it completes, the list updates seamlessly — users see data instantly and get fresh data without a loading screen.

---

## Known Limitations

- No token-based auth or user accounts
- Movie images are not cached to disk (uses in-memory React Native `Image` cache only)
- No offline indicator banner (NetInfo integration omitted for brevity)
- Detail screen does not pre-check network before fetching extended data
- Pagination deduplication uses `Array.filter` — O(n²) for very large lists; a `Set`-based approach would be optimal
- `react-native-vector-icons` is installed but tab bar uses emoji icons to avoid the native linking setup requirement

---

## What I'd Improve with More Time

1. **Unit & Integration Tests** — Jest + React Native Testing Library for slices, hooks, and screen render tests; 80%+ coverage target
2. **E2E Tests** — Detox test suite covering the full browse → search → detail navigation flow
3. **Image Caching** — Replace RN's `Image` with `react-native-fast-image` for persistent disk-level caching with priority queuing
4. **CI/CD Pipeline** — GitHub Actions workflow: lint → type-check → test → build APK/IPA on PRs
5. **Offline Network Banner** — `@react-native-community/netinfo` integration to show a banner when the device is offline and gracefully block API dispatches
6. **Skeleton Loaders** — Animated placeholder cards using `Animated.loop` instead of `ActivityIndicator` for a more polished loading experience
7. **Prefetching** — Trigger page N+1 fetch when user scrolls past 60% of current results (before `onEndReached` fires)
8. **Axios Cancel Tokens** — Abort in-flight search requests when query changes or screen unmounts to prevent race conditions and stale data renders
