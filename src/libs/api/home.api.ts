export type PublicSubmissionType = 'waitlist' | 'contact' | 'subscription' | 'feedback' | 'concern';

export interface PublicSubmissionPayload {
  type: PublicSubmissionType;
  name?: string;
  email: string;
  phone?: string;
  subject?: string;
  category?: string;
  message?: string;
  rating?: number | null;
  metadata?: Record<string, unknown>;
  consent?: boolean;
  source: string;
}

export const homeApi = {
  async submit(payload: PublicSubmissionPayload) {
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/public-submissions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.message || 'Submission failed. Please try again.');
    return result as { message: string; reference?: string };
  },
};
