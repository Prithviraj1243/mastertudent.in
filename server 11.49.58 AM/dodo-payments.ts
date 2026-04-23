import axios from 'axios';

interface DodoPaymentRequest {
  projectId: string;
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  returnUrl: string;
  notifyUrl: string;
}

interface DodoPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
  message?: string;
}

interface DodoWebhookPayload {
  transactionId: string;
  orderId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  timestamp: string;
}

class DodoPaymentsService {
  private projectId: string;
  private apiKey: string;
  private apiUrl: string;
  private checkoutUrl: string;

  constructor() {
    this.projectId = process.env.DODO_PROJECT_ID || '';
    this.apiKey = process.env.DODO_API_KEY || '';
    this.apiUrl = process.env.DODO_API_URL || 'https://api.dodopayments.com';
    this.checkoutUrl = process.env.DODO_CHECKOUT_URL || '';

    if (!this.projectId) {
      console.warn('Dodo Payments Project ID not configured');
    }
    if (!this.checkoutUrl) {
      console.warn('Dodo Payments Checkout URL not configured');
    }
  }

  /**
   * Create a payment request with Dodo Payments
   */
  async createPayment(request: DodoPaymentRequest): Promise<DodoPaymentResponse> {
    try {
      if (!this.projectId || !this.checkoutUrl) {
        return {
          success: false,
          error: 'Dodo Payments not configured'
        };
      }

      // Build checkout URL with parameters
      const checkoutParams = new URLSearchParams({
        quantity: '1',
        email: request.customerEmail,
        phone: request.customerPhone,
        // Custom metadata for tracking
        custom_order_id: request.orderId,
        custom_description: request.description,
        custom_return_url: request.returnUrl,
        custom_notify_url: request.notifyUrl
      });

      const paymentUrl = `${this.checkoutUrl}?${checkoutParams.toString()}`;

      // Generate transaction ID for tracking
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('Dodo payment initiated:', {
        orderId: request.orderId,
        amount: request.amount,
        transactionId,
        checkoutUrl: this.checkoutUrl
      });

      return {
        success: true,
        paymentUrl,
        transactionId
      };
    } catch (error: any) {
      console.error('Dodo Payments error:', error.message);
      return {
        success: false,
        error: error.message || 'Payment service error'
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      if (!this.projectId || !this.apiKey) {
        return {
          success: false,
          error: 'Dodo Payments not configured'
        };
      }

      const response = await axios.get(
        `${this.apiUrl}/v1/payments/${transactionId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: response.data.success,
        status: response.data.status
      };
    } catch (error: any) {
      console.error('Dodo Payment verification error:', error.message);
      return {
        success: false,
        error: error.message || 'Verification failed'
      };
    }
  }

  /**
   * Generate signature for request validation
   */
  private generateSignature(payload: any): string {
    const crypto = require('crypto');
    const dataString = JSON.stringify(payload) + this.apiKey;
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: DodoWebhookPayload, signature: string): boolean {
    const crypto = require('crypto');
    const dataString = JSON.stringify({
      transactionId: payload.transactionId,
      orderId: payload.orderId,
      status: payload.status,
      amount: payload.amount,
      currency: payload.currency,
      timestamp: payload.timestamp
    }) + this.apiKey;
    
    const expectedSignature = crypto.createHash('sha256').update(dataString).digest('hex');
    return expectedSignature === signature;
  }
}

export default new DodoPaymentsService();
