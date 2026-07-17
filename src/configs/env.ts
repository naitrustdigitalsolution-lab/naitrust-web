import type { AppMode, PagePhase } from '../types/global';

const allowedModes: AppMode[] = ["mock", "dev", "prod"];
const allowedPagePhases: PagePhase[] = ["app", "coming-soon", "be-back"];

function getAppMode(value: string | undefined): AppMode {
  if (allowedModes.includes(value as AppMode)) {
    return value as AppMode;
  }

  return "mock";
}

function getPagePhase(value: string | undefined): PagePhase {
  if (allowedPagePhases.includes(value as PagePhase)) {
    return value as PagePhase;
  }

  return "app";
}

export const appConfig = {
  mode: getAppMode(import.meta.env.VITE_APP_MODE),
  pagePhase: getPagePhase(import.meta.env.VITE_PAGE_PHASE),
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
  splineSceneUrl: import.meta.env.VITE_SPLINE_SCENE_URL || "",
  mockOtp: import.meta.env.VITE_MOCK_OTP || "",
  mock2faCode: import.meta.env.VITE_MOCK_2FA_CODE || "",
  mockPassword: import.meta.env.VITE_MOCK_PASSWORD || "",
  mockTotpSecret: import.meta.env.VITE_MOCK_TOTP_SECRET || "",
  isMock: getAppMode(import.meta.env.VITE_APP_MODE) === "mock",
};
