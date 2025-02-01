# coverletter.ai
https://coverletter-ai-ruddy.vercel.app/

## Table of Contents
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)

## Getting Started
This project provides an LLM-based AI model that generates cover letters for job applications and resumes

The project uses PostegreSQL as the database from AWS RDS and Next.js as both the frontend and backend. It also uses AWS S3 to store LLM prompts, other functionality is planned so that the user can upload/save their own prompts

The project is then deployed on Vercel

## Prerequisites

## Installation
1. Clone the repo
   ```sh
   git clone https://github.com/ssheera/coverletter.ai.git
    ```
2. Run the terraform script
   ```sh
   cd coverletter.ai/terraform
   terraform init
   terraform apply
   ```
3. Create .env file in the root directory and add the following
   ```sh
   NODE_ENV=development
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=your_aws_region
   AWS_BUCKET_NAME=your_aws_bucket_name
   RDS_ENDPOINT=your_rds_endpoint
   RDS_USER=your_rds_user
   RDS_PASSWORD=your_rds_password
   RDS_DATABASE=your_rds_database
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Install NPM packages
   ```sh
    npm install
    ```
5. Run the project
    ```sh
     npm run dev
     ```
6. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.