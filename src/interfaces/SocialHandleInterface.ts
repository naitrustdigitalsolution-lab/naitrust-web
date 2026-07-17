/**
 * SocialHandleInterface
 * A single social handle entry captured on the business registration form
 * (platform + the handle/value the user typed).
 */
export interface SocialHandleInterface {
  platform: string;
  value: string;
}
