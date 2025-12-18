# Quicksuite Q&A Demo

This is a demo project for AWS Quicksight/Quicksuite generative Q&A feature.

## Setup

1. Install dependencies:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd .. && npm install
   ```

2. Run the project:

   ```bash
   npm run dev
   ```

This will start the backend on port 4000 and frontend on port 5173.

## AWS Integration

Placeholders for AWS credentials in `backend/.env.example`. Add your keys and integrate with real Quicksight API.

### AWS Cognito Setup

To enable login and signup:

1. Create a Cognito User Pool in AWS Console.
2. Create an App Client.
3. Update `frontend/src/aws-exports.js` with your User Pool ID and Client ID.
4. The app will require authentication before accessing the Q&A interface.