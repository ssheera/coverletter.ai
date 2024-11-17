# coverletter.ai
This web app takes your resume and a job description and generates a cover letter for you. It uses openai's gpt-4o-mini model to generate the cover letter. The app is built with Next.js and using Chakra UI for styling. The app is deployed on Vercel.

The app also uses AWS DynamoDB to store user data for authentication and cover letters. The app also uses AWS Amplify for running GraphQL queries to DynamoDB


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

You can start editing the page by modifying `src/pages/index.tsx`. The page auto-updates as you edit the file.