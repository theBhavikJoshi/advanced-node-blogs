const Page = require('./helpers/page');
let page;

beforeEach(async () => {
  page = await Page.Build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
});

test('Test Header', async () => {
  const text = await page.getContentsOf('a.brand-logo');
  expect(text).toEqual('Blogster');
});

test('Test if clicking Auth Button takes us to Google OAuth', async () => {
  await page.click('.right a');
  const url = page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test('Logout Button Appear when Signed In', async () => {
  await page.login();
  const logOutText = await page.getContentsOf('a[href="/auth/logout"]');
  expect(logOutText).toEqual('Logout');
});