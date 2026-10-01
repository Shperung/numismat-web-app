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
1. [ ] Hello World на Next.js 16 + React Compiler, деплой на `next.tetiana-redko.com`
2. [ ] Layout + навігація: Головна / Список / Інфо (`layout.tsx`, `<Link>`), тема з Expo
3. [ ] Firestore у Server Components: `countries`, `coins` (async-компоненти, кешування)
4. [ ] Головна: випадкова країна → випадкова монета `CoinDetails` (`<Suspense>` + streaming)
5. [ ] Список: фільтр країни через `searchParams`, `CoinCard`, сторінка `coin/[id]`
6. [ ] Перегляд фото: модалка через parallel + intercepting routes
7. [ ] AI-кнопки: Server Actions + `useActionState`, список `/providers`, markdown
8. [ ] Чат з контекстом: `useOptimistic`, `useFormStatus`
9. [ ] React 19.2: `<Activity>`, `useEffectEvent`, `<ViewTransition>`

## Поточний стан
Крок 1 — каркас з `create-next-app@16.3.8` (`--react-compiler --src-dir --no-tailwind`), Hello World.
Локально `lint`, `tsc`, `build` проходять. Наступне — деплой на сервер.

## Журнал
- `create-next-app` у пісочниці Cursor падає з EPERM (пише конфіг у `~/Library/Preferences`) → запускати поза пісочницею.
- Next 16 вендорить власну збірку React для App Router; `react` у `package.json` — 19.2.8.
- Видалено шаблонні `README.md`, `page.module.css`, `public/*.svg`, шрифти Geist.
