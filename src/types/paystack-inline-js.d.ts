declare module "@paystack/inline-js" {
  interface PaystackTransaction {
    reference: string
    status?: string
    message?: string
    trxref?: string
  }

  interface PaystackTransactionOptions {
    key: string
    email: string
    amount: number
    currency?: string
    ref?: string
    metadata?: Record<string, unknown>
    onSuccess?: (transaction: PaystackTransaction) => void
    onCancel?: () => void
    onError?: (error: unknown) => void
  }

  export default class PaystackPop {
    newTransaction(options: PaystackTransactionOptions): void
  }
}
