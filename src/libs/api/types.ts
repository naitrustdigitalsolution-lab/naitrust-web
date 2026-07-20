export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface JoinWaitlistInput {
  name?: string;
  email: string;
  phone?: string;
  source?: string;
}

export interface ContactUsInput {
  name?: string;
  email: string;
  subject?: string;
  message?: string;
}

export interface SubscribeInput {
  email: string;
}

export interface SubmitFeedbackInput {
  name?: string;
  email?: string;
  rating: number;
  message?: string;
}

export interface ReportConcernInput {
  name?: string;
  email: string;
  category?: string;
  description?: string;
}