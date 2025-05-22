import axios from 'axios';

export async function GET() {
  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const BASE_URL = process.env.PAYSTACK_BASE_URL;
    const headers = {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(`${BASE_URL}/bank`, { headers });
    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch banks' }), { status: 500 });
  }
} 