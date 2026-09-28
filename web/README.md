# Pragati Digital: Next.js site

The main Pragati Digital website: landing page, enquiry form, enquiry backend and admin list. See the [project README](../README.md) for the full picture, configuration and deployment.

## Commands

```bash
npm install
npm run dev        # development server on http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run lint
npm run test:e2e   # build, then run the Playwright suite
npm test           # run the Playwright suite against the existing build
```

Requires Node.js 20.9 or newer. Configuration goes in `.env.local`; copy [`.env.example`](.env.example) to start.

## Where things are

- **Page copy and business details**: `src/lib/site.ts`
- **Landing page**: `src/app/page.tsx`
- **Styles, including all animation**: `src/app/globals.css`
- **Enquiries**: `src/app/actions.ts` (main form), `src/app/api/enquiry/route.ts` (public API), `src/lib/enquiries.ts` (save, email and list)
- **Admin list**: `src/app/admin/page.tsx`, protected by `src/proxy.ts`
- **Tests**: `tests/pragati.spec.ts`, mapped to the IDs in [`TEST-CASES.md`](../TEST-CASES.md)

This project uses Next.js 16, whose APIs differ from older versions; for example, `middleware.ts` is now `proxy.ts`. The Next.js docs for this exact version ship in `node_modules/next/dist/docs/`.
