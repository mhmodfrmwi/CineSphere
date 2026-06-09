export enum PaymentMethod {
  CreditCard = 0,
  DebitCard = 1,
  Cash = 2,
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CreditCard]: 'Credit Card',
  [PaymentMethod.DebitCard]: 'Debit Card',
  [PaymentMethod.Cash]: 'Cash',
};
