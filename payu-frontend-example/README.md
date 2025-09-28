# PayU Frontend Example

A tiny Vite + React demo showing how to:
- Create a pending order on the backend
- Get a server-calculated PayU hash
- Auto-submit a form to PayU sandbox

Setup
1. From the repo root, install dependencies for the example:

```powershell
cd payu-frontend-example
npm install
npm run dev
```

2. Make sure your backend is running (default port 5000) and accessible at `/api` paths.
3. This demo expects an auth JWT in localStorage under `token`. Adjust the demo to use your auth flow or temporarily stub the token.

Notes
- For real deployments, ensure the backend endpoint `/api/payu/hash` is only callable by authenticated users and that you protect merchant secrets.
- The demo posts to PayU sandbox URL. Replace `process.env.PAYU_BASE_URL` or the form action if you use a different endpoint.
