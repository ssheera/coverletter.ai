# coverletter.ai
https://coverletter-ai-ruddy.vercel.app/

## Table of Contents
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)

## Getting Started
This project provides an LLM-based AI model that generates cover letters for job applications and resumes.

It uses PostgreSQL (now hosted on Prisma's database service) as the database, and Next.js as both the frontend and backend.  
AWS S3 is used to store LLM prompts. Additional functionality is planned to allow users to upload and save their own prompts.

The project is deployed on Vercel.

### Note
Due to the AWS Free Tier expiring, the database has been migrated to **Prisma's Database Platform**.

## Prerequisites
- Node.js (v18+ recommended)
- Terraform (for AWS resources)
- AWS account (for S3 bucket)
- Prisma CLI (`npm install -g prisma`)

## Installation
1. Clone the repository
   ```sh
   git clone https://github.com/ssheera/coverletter.ai.git
   cd coverletter.ai
   ```

2. Run the Terraform script to set up AWS S3
   ```sh
   cd terraform
   terraform init
   terraform apply
   cd ..
   ```

3. Configure environment variables
   Create a `.env` file in the root directory:
   ```dotenv
   NODE_ENV=development
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=your_aws_region
   AWS_BUCKET_NAME=your_aws_bucket_name
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=your_gemini_model
   OPENAI_MODEL=your_openai_model
   DATABASE_URL=your_prisma_database_url
   OPTIMIZE_API_KEY=your_optimize_api_key (optional)
   ```

4. Install dependencies
   ```sh
   npm install
   ```

5. Set up Prisma Client
   - Install Prisma Client if it's not already installed:
     ```sh
     npm install @prisma/client
     ```
   - Generate the Prisma Client:
     ```sh
     npx prisma generate
     ```
   - If needed, you can introspect the database or push schema changes:
     ```sh
     npx prisma db pull   # pulls the database schema
     npx prisma migrate deploy  # applies migrations if needed
     ```

6. Run the project
   ```sh
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Future Updates
- Migration to AWS Lambda + SQS - Vercel doesn't handle background jobs like I had hoped, and I need to get around the 60s runtime restriction
- Switching to TailwindCSS for the frontend
- Improved design
