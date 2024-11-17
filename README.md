# coverletter.ai
https://coverletter-ai-ruddy.vercel.app/

This web app takes your resume and a job description and generates a cover letter for you. It uses openai's gpt-4o-mini model to generate the cover letter. The app is built with Next.js and using Chakra UI for styling. The app is deployed on Vercel.

The app also uses AWS DynamoDB to store user data for authentication and cover letters. The app also uses AWS Amplify for running GraphQL queries to DynamoDB



https://github.com/user-attachments/assets/f7ccd1cd-365c-4150-8abd-4dbbac09a733



## Technologies Used
- Next.js
- Chakra UI
- OpenAI
- AWS DynamoDB
- AWS Amplify
- TypeScript

## Configuration

- Create DynamoDB table with 'uid' as the primary key
- Use the following GraphQL schema
```graphql
type CoverLetter {
	company: String!
	content: String!
	date: Float!
	job: String!
}

type User {
	email: String
	uid: String!
	coverLetters: [CoverLetter]
}

type Query {
	getUser(uid: String!): User
}
```
- The resolver code is just the 'GetItem' sample with a changed primary key
```javascript
import { util } from '@aws-appsync/utils';

/**
 * Sends a request to get an item with id `ctx.args.id`
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBGetItemRequest} the request
 */
export function request(ctx) {
    return {
        operation: 'GetItem',
        key: util.dynamodb.toMapValues({ uid: ctx.args.uid }),
    };
}

/**
 * Returns the fetched DynamoDB item
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the DynamoDB item
 */
export function response(ctx) {
    return ctx.result;
}
```

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
