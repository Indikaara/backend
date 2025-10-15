import React, { useState, useEffect } from 'react'

// Small demo that hits the backend to create a pending order, asks for server hash, and auto-submits a PayU form
export default function App() {
  const [status, setStatus] = useState('idle')
  const [userEmail, setUserEmail] = useState('test@example.com')
  const [lastTxnId, setLastTxnId] = useState('')
  const [manualTxnId, setManualTxnId] = useState('')
  const [amount, setAmount] = useState('100.00')
  const [firstname, setFirstname] = useState('Test User')
  const [phone, setPhone] = useState('9999999999')
  // Product id to use for testing (user input)
  const [productId, setProductId] = useState('68c35a05dd6f33d78209b046')
  // Provided demo JWT to avoid requiring login in the demo UI
  const PROVIDED_DEMO_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGVmOTRhMzgxOWUzZTM1ZTU3Njk2Y2IiLCJpYXQiOjE3NjA1MzI5MzgsImV4cCI6MTc2MTEzNzczOH0.YNt1L5sR_-sG363lYoH0BGSBAUoR8uzYOwxa2FvlsdI'

  const handlePay = async () => {
    setStatus('creating pending order...')
    // 1) Create pending order on backend (replace with actual auth JWT)
    const jwt = localStorage.getItem('token') || ''
    // All API calls should go to backend at port 5000
    const API_BASE = 'https://backend-wei5.onrender.com'
    // Use protected endpoint (demo user is created on load and token stored in localStorage)
    const endpoint = `${API_BASE}/api/orders/create-pending`
    const createResp = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) 
      },
      body: JSON.stringify({
        products: [{ product: productId, quantity: 1 }],
        shippingAddress: { 
          address: 'Test Address',
          firstname: firstname.trim(),
          email: userEmail.trim().toLowerCase(),
          phone: phone.replace(/[^0-9]/g, '')
        },
        totalPrice: parseFloat(amount).toFixed(2), // Ensure consistent amount format
        customerName: firstname.trim(),
        customerEmail: userEmail.trim().toLowerCase(),
        customerPhone: phone.replace(/[^0-9]/g, '')
      }),
    })
  if (!createResp.ok) return setStatus('failed to create pending order')
  const { order, txnid } = await createResp.json()
  if (txnid) setLastTxnId(txnid)

    setStatus('initiating payment on server...')
    // 2) Ask backend to initiate hosted PayU checkout for this order
    const initResp = await fetch(`${API_BASE}/api/payu/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
      body: JSON.stringify({ orderId: order._id }),
    })
    if (!initResp.ok) return setStatus('failed to initiate payment')
    const { formData, paymentUrl } = await initResp.json()

    setStatus('submitting to PayU sandbox...')
    // 3) Build a form and submit to the returned paymentUrl with returned formData
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = paymentUrl

    const addField = (name, value) => {
      const i = document.createElement('input')
      i.type = 'hidden'
      i.name = name
      i.value = value
      form.appendChild(i)
    }

    Object.entries(formData || {}).forEach(([k, v]) => addField(k, v))

    document.body.appendChild(form)
    form.submit()
  }

  const handleInitiateByTxn = async (txn) => {
    setStatus('initiating payment by txnid...')
    const jwt = localStorage.getItem('token') || ''
    const API_BASE = 'http://localhost:5000'
    const initResp = await fetch(`${API_BASE}/api/payu/initiate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) 
      },
      body: JSON.stringify({ txnid: txn }),
    })
    if (!initResp.ok) return setStatus('failed to initiate payment by txnid')
    const { formData, paymentUrl } = await initResp.json()
    // submit to PayU
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = paymentUrl
    const addField = (name, value) => {
      const i = document.createElement('input')
      i.type = 'hidden'
      i.name = name
      i.value = value
      form.appendChild(i)
    }
    Object.entries(formData || {}).forEach(([k, v]) => addField(k, v))
    document.body.appendChild(form)
    form.submit()
  }

  // On mount, request a demo token and store in localStorage for the demo
  useEffect(() => {
    const seedDemoToken = async () => {
        // Instead of hitting demo-login, use the provided token so demo doesn't ask for login
        try {
          localStorage.setItem('token', PROVIDED_DEMO_TOKEN);
          return { token: PROVIDED_DEMO_TOKEN, email: 'alice@example.com' };
        } catch (err) {
          return null;
        }
    };
    (async () => {
      const data = await seedDemoToken();
      if (data && data.email) {
        setUserEmail(data.email);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {/* Dev-only demo banner */}
      <div style={{ background: '#fffae6', border: '1px solid #ffe58f', padding: 8, marginBottom: 12 }}>
        <strong>Demo mode</strong> — this frontend is running in demo mode and will request a demo JWT from the backend on load.
      </div>
      {userEmail && (
        <div style={{ marginBottom: 8 }}><em>Logged in as:</em> {userEmail}</div>
      )}
      {/* Login hidden in demo mode */}
      <h1>PayU frontend demo</h1>
      <p>Status: {status}</p>
      
      <div style={{ marginBottom: 20 }}>
        <h3>Payment Details</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Product ID:</label>
          <input 
            type="text" 
            value={productId} 
            onChange={e => setProductId(e.target.value)}
            placeholder="Enter product ID"
            style={{ padding: 5, width: 300 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Amount (₹):</label>
          <input 
            type="text" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter amount (e.g., 100.00)"
            style={{ padding: 5, width: 200 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Name:</label>
          <input 
            type="text" 
            value={firstname} 
            onChange={e => setFirstname(e.target.value)}
            placeholder="Enter your name"
            style={{ padding: 5, width: 200 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Email:</label>
          <input 
            type="email" 
            value={userEmail} 
            onChange={e => setUserEmail(e.target.value)}
            placeholder="Enter your email"
            style={{ padding: 5, width: 200 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Phone:</label>
          <input 
            type="text" 
            value={phone} 
            onChange={e => setPhone(e.target.value)}
            placeholder="Enter your phone"
            style={{ padding: 5, width: 200 }}
          />
        </div>
      </div>

      <button 
        onClick={handlePay}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
      >
        Pay Now (₹{amount})
      </button>

      <div style={{ marginTop: 20, padding: 15, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Transaction History</h3>
        <div>Last txnid: <strong>{lastTxnId || '—'}</strong></div>
        <div style={{ marginTop: 8 }}>
          <input 
            placeholder="Enter txnid to initiate" 
            value={manualTxnId} 
            onChange={e => setManualTxnId(e.target.value)}
            style={{ padding: 5, marginRight: 8 }}
          />
          <button onClick={() => handleInitiateByTxn(manualTxnId)} style={{ marginRight: 8 }}>Initiate by txnid</button>
          <button onClick={() => { if (lastTxnId) handleInitiateByTxn(lastTxnId) }}>Use last txnid</button>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: 15, backgroundColor: '#fff3e0', borderRadius: '4px' }}>
        <h3>Test Card Details</h3>
        <p>Use these details for testing:</p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Card Number: 4012 0010 3714 1112</li>
          <li>CVV: 123</li>
          <li>Expiry: Any future date</li>
          <li>3D Secure Password/OTP: 123456</li>
        </ul>
      </div>
  <button onClick={() => { localStorage.removeItem('token'); setUserEmail(null); setStatus('demo token cleared') }} style={{ marginLeft: 12 }}>Clear demo token</button>
      <p>
        Note: this demo expects you to be logged in and have a JWT stored in <code>localStorage.token</code>.
      </p>
    </div>
  )
}
