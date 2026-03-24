This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Google Sheet Credentials (Peace Quiz)

Use environment variables for service account credentials. Do not put private keys in code files.

1. Copy `.env.example` to `.env.local`.
2. Set these values in `.env.local`:
	- `AUTH_SESSION_SECRET` (required for auth cookie signing)
	- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
	- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
	- `GOOGLE_QUIZ_SPREADSHEET_ID`
	- `GOOGLE_QUIZ_SHEET_RANGE` (optional, default: `Sheet1!A:Z`)
3. For Vercel deployment, add the same variables in Project Settings -> Environment Variables.

Helper file for sheet access:

- `src/app/lib/googleSheets.ts`

It exports:

- `getGoogleSheetsClient()`
- `getQuizRowsFromSheet()`

## Peace Quiz API Endpoint

After setting env variables, use this endpoint:

- `GET /api/peace-quiz/questions`

Response format:

- `success`: boolean
- `totalRows`: number
- `headers`: string[]
- `items`: object[]

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
