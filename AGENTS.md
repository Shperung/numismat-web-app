<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Numismat — веб-версія (Next.js)

## Мета
Навчальний проєкт: веб-версія додатку обліку колекції монет, що повторює логіку відображення
Expo-додатку (`/Users/viktor_kravchuk/traning/numismat-expo-app/AGENTS.md` — головний контекст і дизайн).
Фокус — найновіші можливості React 19 (React Compiler, Server Components, Server Actions,
`useActionState`, `useOptimistic`, `use`, `<Activity>`, `useEffectEvent`) і Next.js 16.
Пов'язані проєкти:
- Expo / RN: `/Users/viktor_kravchuk/traning/numismat-expo-app`
- Kotlin / Android: `/Users/viktor_kravchuk/traning/numismat-kotlin-app`
- Swift / iOS: `/Users/viktor_kravchuk/traning/numismat-swift-app`
- AI-проксі: `/Users/viktor_kravchuk/traning/numismat-server` (`https://inua.tetiana-redko.com`)

## Як працюємо (правила для AI)
- Малі кроки, після кожного — деплой на `https://next.tetiana-redko.com`.
- Спершу коротко «навіщо», потім «як»; порівнювати з реалізацією того самого в Expo.
- Код мінімальний, без зайвих бібліотек. React Compiler увімкнено → `useMemo` / `useCallback` / `memo` не писати.
- Перед кодом звірятися з `node_modules/next/dist/docs/` (Next 16 відрізняється від training data).
- Мова спілкування — українська.
- Після кроку оновлювати «План», «Поточний стан», «Журнал».

## Стек
- Next.js 16.3 (App Router, Turbopack), React 19, TypeScript, `src/` + alias `@/*`.
- React Compiler: `reactCompiler: true` у `next.config.ts` + `babel-plugin-react-compiler`.
- Стилі: CSS Modules (аналог `StyleSheet` з Expo), без Tailwind.
- Дані: Firestore (той самий проєкт `tetiana-redko`), читання — у Server Components.
- AI: Server Actions → `numismat-server` (ключі й токен лишаються на сервері Next).

## Деплой
- Hetzner `116.203.220.233`, DNS `next` → цей IP (вже є).
- Код: `/var/www/numismat-web-app` (`git clone` з GitHub `Shperung/numismat-web-app`).
- pm2: процес `numismat-web`, `next start -H 127.0.0.1 -p 3002` (зайняті: 3000 — numismat-server, 3001, 777, 8082).
- nginx: `sites-available/next.tetiana-redko.com`, сертифікат через `certbot certonly --nginx -d next.tetiana-redko.com`
  + 443-блок вручну (див. «Пастки nginx / certbot» у `numismat-server/AGENTS.md`).
- pm2 `tetiana-redko.com` (id 0) — НЕ ЧІПАТИ, команди лише за іменем.
- Оновлення: `cd /var/www/numismat-web-app && git pull && npm ci && npm run build && pm2 restart numismat-web`.

## План
1. [x] Hello World на Next.js 16 + React Compiler, деплой на `next.tetiana-redko.com`
2. [x] Layout + навігація: Головна / Список / Інфо (`layout.tsx`, `<Link>`), тема з Expo
3. [x] Firestore у Server Components: `countries`, `coins` (async-компоненти, кешування)
4. [x] Головна: випадкова країна → випадкова монета `CoinDetails` (`<Suspense>` + streaming)
5. [x] Список: фільтр країни через `searchParams`, `CoinCard`, сторінка `coin/[id]`
6. [ ] Перегляд фото: модалка через parallel + intercepting routes
7. [ ] AI-кнопки: Server Actions + `useActionState`, список `/providers`, markdown
8. [ ] Чат з контекстом: `useOptimistic`, `useFormStatus`
9. [ ] React 19.2: `<Activity>`, `useEffectEvent`, `<ViewTransition>`

## Поточний стан
Кроки 3–5 — дані з Firestore і відображення як в Expo (без AI-секції):
- `src/lib/data.ts`: `getCountries`, `getCountry`, `getCoinsByCountry`, `getCoin` (`'use cache'` + `cacheLife('minutes')`)
  замість `CountriesProvider` / `CoinsProvider` + `useEffect`.
- `/` — `RandomCoin` (`await connection()` → `Math.random` на кожен запит) у `<Suspense>` → `CoinDetails`.
- `/list?country=ua` — `CountryPicker` (Client: `useOptimistic` + `useTransition` + `router.replace`) + `CoinCard`;
  без параметра — випадкова країна.
- `/coin/[id]` — `getCoin` (`getDoc` за id, а не пошук у всіх монетах) + `notFound()`, `generateMetadata` → назва монети.
- `CoinDetails` / `CoinCard` — Server Components, іконки Ionicons з `react-icons/io5`, фото — `next/image`.
- `error.tsx` — межа помилок (аналог `error`-тексту в Expo), `retry()` з Next 16.2.
Фото поки не клікабельні (крок 6). Наступне — крок 6 (модалка фото).

## Журнал
- `create-next-app` у пісочниці Cursor падає з EPERM (пише конфіг у `~/Library/Preferences`) → запускати поза пісочницею.
- Next 16 вендорить власну збірку React для App Router; `react` у `package.json` — 19.2.8.
- Видалено шаблонні `README.md`, `page.module.css`, `public/*.svg`, шрифти Geist.
- Деплой: на сервері немає SSH-ключа GitHub → `git clone https://...` (репо публічне).
  Бекап nginx перед змінами: `tar -czf /root/nginx-$(date +%F-%H%M).tar.gz -C /etc nginx`.
  Конфіг nginx записано через `cat > ... <<'EOF'` (без `nano` → без `*.save`).
- Пастка pm2: `pm2 start ... --name X` при наявному процесі X не створює новий, а перезапускає старий
  у його старому `exec cwd` (тут був старий `inua-client` з `/root/tetiana-redko/`) → `pm2 delete X` + `start`.
  Перевірка: `pm2 describe X | grep "exec cwd"`.
- Навігація: `src/components/nav-tabs.tsx` — єдиний Client Component (`"use client"`, бо `usePathname`);
  layout і сторінки — Server Components. Активний таб — CSS Modules `composes: tab`.
  Expo `(tabs)/_layout.tsx` (`<Tabs>`) ↔ Next `app/layout.tsx` (довільний JSX, навігація — звичайні `<Link>`).
- React Compiler у збірці: `NavTabs` → `const $ = c(4)` (кеш на 4 слоти з `react/compiler-runtime`),
  `tabs.map(...)` перераховується лише при `$[0] !== pathname`, `<nav>` — лише при зміні масиву лінків.
- Firebase: `firebase/firestore/lite` (REST, без realtime — для одноразових читань на сервері). Ключі — `.env.local`
  без `NEXT_PUBLIC_` (`FIREBASE_*`) → лише сервер, у браузер не потрапляють. На сервері `.env.local` створити вручну.
- `cacheComponents: true` (Next 16): кеш лише явний (`'use cache'`), збірка вимагає `<Suspense>` навколо
  runtime-даних (`searchParams`, `params`, `connection()`). Маршрути `/`, `/list`, `/coin/[id]` — `◐ Partial Prerender`:
  статична оболонка (nav + fallback) одразу, дані — streaming.
  `usePathname()` у layout на динамічному маршруті теж runtime → `NavTabs` = `<Suspense fallback={<Tabs />}>` + `ActiveTabs`.
- `useOptimistic` у фільтрі: контрольований `<select>` одразу показує нову країну, поки transition з навігацією
  ще триває (без нього значення відкотилося б до старого до приходу нової сторінки); `isPending` → `opacity`.
- `notFound()` всередині `<Suspense>` після стріму оболонки → HTTP 200 + сторінка 404 з `noindex` (статус уже відправлено).
- `next/image`: `remotePatterns: [new URL(...)]` вимагає порожній query → URL Storage (`?alt=media&token=`) → 400.
  Рішення — об'єкт `{ protocol, hostname, pathname: '/v0/b/tetiana-redko.appspot.com/**' }` без `search`.
