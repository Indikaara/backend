# PayU Frontend Integration (quick guide)

This document describes how the frontend should integrate with the backend for PayU payments using the pending-order + txnid flow implemented in this repository.

Overview
- Create a pending order on the backend: POST /api/orders/create-pending (authenticated). The backend returns an `txnid` that uniquely links the pending order.
- Use the `txnid` in the PayU payment request (form-based post) so PayU forwards it back on success/failure and in the webhook.
- PayU will POST the result to your configured webhook `/api/payu/webhook`. The backend verifies the hash and updates the order by `txnid`.
- Admins can view webhook events at GET /api/admin/webhooks (requires an admin JWT).

1) Create a pending order (frontend -> backend)

Endpoint
POST /api/orders/create-pending
Authorization: Bearer <jwt>

Request body (JSON)
{
  "products": [
    { "product": "<productId>", "quantity": 2, "price": 1999 }
  ],
  "shippingAddress": { "address": "...", "city": "..." },
  "totalPrice": 3998
}

Successful response (201)
{
  "order": { /* created order object */ },
  "txnid": "tx_163..."
}

Use the returned `txnid` when building the PayU payment request.

2) Initiate PayU checkout (frontend -> PayU)

PayU typically accepts an HTML form POST to their payment page. Example fields PayU expects include:
- key (your merchant key)
- txnid (the txnid returned by backend)
- amount
- productinfo
- firstname
- email
- phone
- sUrl (success redirect URL back to your frontend)
- fUrl (failure redirect URL back to your frontend)
- hash (calculated on the frontend/server according to PayU docs)

Example (conceptual):
<form action="https://test.payu.in/_payment" method="post">
  <input name="key" value="<PAYU_MERCHANT_KEY>">
  <input name="txnid" value="<txnid>">
  <input name="amount" value="3998">
  <input name="productinfo" value="Order#1234">
  <input name="firstname" value="John">
  <input name="email" value="john@example.com">
  <input name="surl" value="https://your-frontend/success">
  <input name="furl" value="https://your-frontend/failure">
  <input name="hash" value="<calculated-hash>">
  <button type="submit">Pay</button>
</form>

Notes:
- Hash calculation requires your merchant `salt` and `key` per PayU docs. For security you may calculate the hash server-side and return it to the frontend.
- The important piece is the `txnid` field: it connects PayU callbacks to the pending order you created in step 1.

3) PayU callbacks

- Redirects: PayU will redirect the user to `surl` or `furl` after payment. These are frontend pages you control; they should show a friendly message and optionally poll the backend for order status by order id or txnid.
- Webhook: PayU will POST the payment result to `/api/payu/webhook`. The server verifies the hash and updates the pending order identified by `txnid` (marks it paid and sets `paymentResult`).

Local testing (recommended)
- Use ngrok (or similar) to expose your local backend to PayU in sandbox. Example:
  ngrok http 5000
- Configure the public webhook URL in PayU dashboard to point to `https://<your-ngrok>.ngrok.io/api/payu/webhook`.
- Create a pending order, then submit a PayU sandbox payment (or simulate webhook POSTs).

Admin webhook viewer
- URL: GET /api/admin/webhooks (requires admin JWT). Useful for debugging incoming webhook payloads, seeing raw body, headers, IP, and hash validation result.

Troubleshooting
- If webhook hash verification fails: ensure the PayU payload fields are passed exactly and that your PAYU_MERCHANT_SALT and PAYU_MERCHANT_KEY are correct in backend `.env`.
- If webhook IP is blocked: set `PAYU_ALLOWED_IPS` in `.env` to a comma-separated list of PayU webhook IPs (or leave empty to accept all).

If you want, I can also:
- Add a small example React component to illustrate the create-pending -> redirect flow.
- Provide a server-side helper endpoint to return a server-calculated PayU hash for the frontend.
