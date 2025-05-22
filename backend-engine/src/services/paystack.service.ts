import axios from 'axios';

export class PaystackService {
  private readonly PAYSTACK_SECRET_KEY: string;
  private readonly BASE_URL: string;
  private readonly WEB_SERVICE_URL: string;
  private readonly SERVICE_TOKEN: string;

  constructor() {
    this.PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
    this.BASE_URL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';
    this.WEB_SERVICE_URL = process.env.WEB_SERVICE_URL || 'http://localhost:3000';
    this.SERVICE_TOKEN = process.env.SERVICE_TOKEN || '';
  }

  private get paystackHeaders() {
    return {
      Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  private get webServiceHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-service-token': this.SERVICE_TOKEN
    };
  }
  

  async getRecipientCode(walletAddress: string): Promise<string> {
    const response = await axios.get(`${this.WEB_SERVICE_URL}/api/profile/recipient`, {
      params: { wallet: walletAddress },
      headers: this.webServiceHeaders
    });

    if (!response.data.bankDetails?.recipientCode) {
      throw new Error('No recipient code found for this wallet');
    }

    return response.data.bankDetails.recipientCode;
  }

  async initiateTransfer(amountInKobo: number, recipientCode: string, reason: string) {
    const response = await axios.post(
      `${this.BASE_URL}/transfer`,
      {
        source: 'balance',
        amount: amountInKobo,
        recipient: recipientCode,
        reason,
      },
      { headers: this.paystackHeaders }
    );

    return response.data.data;
  }

  async verifyTransfer(transferReference: string) {
    const response = await axios.get(
      `${this.BASE_URL}/transfer/verify/${transferReference}`,
      { headers: this.paystackHeaders }
    );

    return response.data;
  }

  async processOfframpTransfer(walletAddress: string, amountInKobo: number) {
    // 1. Get recipient code
    const recipientCode = await this.getRecipientCode(walletAddress);

    // 2. Initiate transfer
    const transfer = await this.initiateTransfer(
      amountInKobo,
      recipientCode,
      'Offramp transfer'
    );

    // 3. Verify transfer
    const verification = await this.verifyTransfer(transfer.reference);

    return {
      transfer,
      verification,
      status: verification.data.status,
      reference: transfer.reference
    };
  }
} 