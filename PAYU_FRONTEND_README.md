Local PayU redirect configuration

To have PayU redirect to your frontend (instead of the backend) after payment success/failure, set the environment variable FRONTEND_BASE_URL to your frontend base URL (for example http://localhost:3000).

Example (PowerShell):

$env:FRONTEND_BASE_URL = "http://localhost:3000"
npm run dev

The backend will prefer FRONTEND_BASE_URL for the PayU `surl` and `furl` form fields when initiating a hosted checkout. If FRONTEND_BASE_URL is not set, it will fall back to the backend host that received the initiate request.