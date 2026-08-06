import { appConfig } from '../../configs/env';
import type { BillPayment, BillProvider, CreateBillPaymentInput } from '../store/types';
import { httpClient } from './client';
import { endpoints } from './endpoints';
import type { ApiSuccess } from './types';
import { walletApi } from './wallet.api';

const PROVIDERS: BillProvider[] = [
  { id: 'ikeja-electric', name: 'Ikeja Electric', category: 'electricity', identifierLabel: 'Meter number', identifierPlaceholder: 'Enter meter number', minimumAmountMinor: 100000, maximumAmountMinor: 50000000 },
  { id: 'eko-electric', name: 'Eko Electricity', category: 'electricity', identifierLabel: 'Meter number', identifierPlaceholder: 'Enter meter number', minimumAmountMinor: 100000, maximumAmountMinor: 50000000 },
  { id: 'abuja-electric', name: 'Abuja Electricity', category: 'electricity', identifierLabel: 'Meter number', identifierPlaceholder: 'Enter meter number', minimumAmountMinor: 100000, maximumAmountMinor: 50000000 },
  { id: 'mtn-data', name: 'MTN Data', category: 'internet', identifierLabel: 'Phone number', identifierPlaceholder: '0803 000 0000', minimumAmountMinor: 10000, maximumAmountMinor: 10000000 },
  { id: 'airtel-data', name: 'Airtel Data', category: 'internet', identifierLabel: 'Phone number', identifierPlaceholder: '0802 000 0000', minimumAmountMinor: 10000, maximumAmountMinor: 10000000 },
  { id: 'dstv', name: 'DStv', category: 'tv', identifierLabel: 'Smartcard number', identifierPlaceholder: 'Enter smartcard number', minimumAmountMinor: 100000, maximumAmountMinor: 10000000 },
  { id: 'gotv', name: 'GOtv', category: 'tv', identifierLabel: 'IUC number', identifierPlaceholder: 'Enter IUC number', minimumAmountMinor: 100000, maximumAmountMinor: 10000000 },
  { id: 'mtn-airtime', name: 'MTN Airtime', category: 'airtime', identifierLabel: 'Phone number', identifierPlaceholder: '0803 000 0000', minimumAmountMinor: 5000, maximumAmountMinor: 5000000, presetAmountsMinor: [10000, 20000, 50000, 100000] },
  { id: 'airtel-airtime', name: 'Airtel Airtime', category: 'airtime', identifierLabel: 'Phone number', identifierPlaceholder: '0802 000 0000', minimumAmountMinor: 5000, maximumAmountMinor: 5000000, presetAmountsMinor: [10000, 20000, 50000, 100000] },
  { id: 'glo-airtime', name: 'Glo Airtime', category: 'airtime', identifierLabel: 'Phone number', identifierPlaceholder: '0805 000 0000', minimumAmountMinor: 5000, maximumAmountMinor: 5000000, presetAmountsMinor: [10000, 20000, 50000, 100000] },
  { id: '9mobile-airtime', name: '9mobile Airtime', category: 'airtime', identifierLabel: 'Phone number', identifierPlaceholder: '0809 000 0000', minimumAmountMinor: 5000, maximumAmountMinor: 5000000, presetAmountsMinor: [10000, 20000, 50000, 100000] },
];

let payments: BillPayment[] = [];
const wait = () => new Promise((resolve) => setTimeout(resolve, 500));

export const billsApi = {
  listProviders: async (): Promise<ApiSuccess<BillProvider[]>> => {
    if (!appConfig.isMock) return httpClient.get<BillProvider[]>(endpoints.bills.providers) as Promise<ApiSuccess<BillProvider[]>>;
    await wait();
    return { success: true, data: PROVIDERS };
  },
  listPayments: async (): Promise<ApiSuccess<BillPayment[]>> => {
    if (!appConfig.isMock) return httpClient.get<BillPayment[]>(endpoints.bills.history) as Promise<ApiSuccess<BillPayment[]>>;
    await wait();
    return { success: true, data: payments };
  },
  purchase: async (input: CreateBillPaymentInput): Promise<ApiSuccess<BillPayment>> => {
    if (!appConfig.isMock) return httpClient.post<BillPayment>(endpoints.bills.purchase, input) as Promise<ApiSuccess<BillPayment>>;
    const provider = PROVIDERS.find((item) => item.id === input.providerId);
    if (!provider) throw new Error('Choose a valid service provider.');
    const identifier = input.customerIdentifier.replace(/\s/g, '');
    if (identifier.length < 7) throw new Error(`Enter a valid ${provider.identifierLabel.toLowerCase()}.`);
    if (input.amountMinor < provider.minimumAmountMinor || input.amountMinor > provider.maximumAmountMinor) throw new Error('The amount is outside this provider’s allowed range.');
    await walletApi.payBill(input.amountMinor, `${provider.name} · ${identifier}`);
    const payment: BillPayment = { id: `billpay_${crypto.randomUUID()}`, providerId: provider.id, providerName: provider.name, category: provider.category, customerIdentifier: identifier, amountMinor: input.amountMinor, currency: input.currency, status: 'successful', reference: `NTB-${Date.now().toString().slice(-10)}`, createdAt: new Date().toISOString() };
    payments = [payment, ...payments];
    return { success: true, message: 'Payment successful', data: payment };
  },
};
