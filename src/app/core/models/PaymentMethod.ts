export enum PaymentMethod {
  Visa = 0,
  Cash = 1,
  Fawry = 2,
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.Visa]: 'Visa',
  [PaymentMethod.Cash]: 'Cash',
  [PaymentMethod.Fawry]: 'Fawry',
};
