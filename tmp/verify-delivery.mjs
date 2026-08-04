import { chromium } from 'playwright';

const baseUrl = 'http://127.0.0.1:5182';
const password = process.env.VITE_MOCK_PASSWORD;
if (!password) throw new Error('VITE_MOCK_PASSWORD is required for local verification.');

async function login(page, email) {
  await page.goto(`${baseUrl}/login`);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign in securely' }).click();
  await page.waitForURL(/\/app(?:\/)?$/);
}

async function createBuyerPage(browser, runtimeState) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page, 'aisha.customer@naitrust.test');
  await page.evaluate((runtime) => {
    window.localStorage.setItem('naitrust:protected-deal-runtime:v1', runtime);
  }, runtimeState);
  return { context, page };
}

const browser = await chromium.launch({ headless: true });
try {
  const sellerContext = await browser.newContext();
  const sellerPage = await sellerContext.newPage();
  await login(sellerPage, 'fatima.verified@naitrust.test');
  await sellerPage.goto(`${baseUrl}/app/deals/txn_mock_029`);
  await sellerPage.getByRole('button', { name: 'Generate delivery card' }).click();
  await sellerPage.getByRole('dialog').waitFor();

  const runtimeState = await sellerPage.evaluate(() =>
    window.localStorage.getItem('naitrust:protected-deal-runtime:v1'),
  );
  if (!runtimeState) throw new Error('Delivery lifecycle was not persisted.');
  const runtime = JSON.parse(runtimeState);
  const card = runtime.deals.txn_mock_029.delivery.card;
  if (!/^[a-f0-9]{48}$/.test(card.token)) throw new Error('Delivery token is not opaque.');
  if (!/^\d{6}$/.test(card.otpCode)) throw new Error('Delivery OTP is invalid.');
  const cardText = await sellerPage.getByRole('dialog').innerText();
  if (cardText.includes('₦') || cardText.includes('185000000')) {
    throw new Error('Delivery card exposed protected financial data.');
  }

  const firstToken = card.token;
  await sellerPage.keyboard.press('Escape');
  await sellerPage.getByRole('button', { name: /regenerate card/i }).waitFor();
  await sellerPage.getByRole('button', { name: /regenerate card/i }).click();
  await sellerPage.getByRole('dialog').waitFor();
  const regeneratedState = await sellerPage.evaluate(() =>
    window.localStorage.getItem('naitrust:protected-deal-runtime:v1'),
  );
  const regenerated = JSON.parse(regeneratedState).deals.txn_mock_029.delivery.card;
  if (regenerated.token === firstToken) throw new Error('Regeneration did not invalidate the prior token.');

  await sellerPage.goto(`${baseUrl}/delivery/${regenerated.token}`);
  await sellerPage.waitForLoadState('networkidle');
  await sellerPage.waitForTimeout(2_000);
  const sellerHandoverText = await sellerPage.locator('body').innerText();
  if (!sellerHandoverText.includes('Buyer confirmation required')) {
    throw new Error(`Seller authorization guard missing at ${sellerPage.url()}. Page showed: ${sellerHandoverText.slice(0, 500)}`);
  }
  await sellerContext.close();

  const { context: qrContext, page: qrPage } = await createBuyerPage(browser, regeneratedState);
  await qrPage.goto(`${baseUrl}/delivery/${regenerated.token}`);
  await qrPage.getByRole('button', { name: 'Confirm product received' }).click();
  await qrPage.getByText('Inspect the product now').waitFor();
  await qrPage.reload();
  await qrPage.getByText('Inspect the product now').waitFor();
  await qrPage.getByRole('button', { name: 'Correct product received' }).click();
  await qrPage.getByText('Handover recorded').waitFor();
  await qrContext.close();

  const { context: otpContext, page: otpPage } = await createBuyerPage(browser, regeneratedState);
  await otpPage.goto(`${baseUrl}/app/deals/txn_mock_029`);
  await otpPage.locator('#handover-otp').fill(regenerated.otpCode);
  await otpPage.getByRole('button', { name: 'Confirm', exact: true }).click();
  await otpPage.getByText('Inspect before the rider leaves').waitFor();
  const confirmedState = JSON.parse(
    await otpPage.evaluate(() => window.localStorage.getItem('naitrust:protected-deal-runtime:v1')),
  );
  if (confirmedState.deals.txn_mock_029.delivery.card.status !== 'used') {
    throw new Error('Delivery card was not invalidated after OTP confirmation.');
  }
  await otpContext.close();

  process.stdout.write('Delivery verification passed: seller card, regeneration, role guard, QR receipt, OTP receipt, refresh recovery, and one-time use.\n');
} finally {
  await browser.close();
}
