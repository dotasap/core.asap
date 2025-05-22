import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { accountNumber, bankCode } = await request.json();
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const BASE_URL = process.env.PAYSTACK_BASE_URL;
    const headers = {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };
    const params = { account_number: accountNumber, bank_code: bankCode };
    const response = await axios.get(`${BASE_URL}/bank/resolve`, { headers, params });
    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to resolve account' }), { status: 500 });
  }
} 