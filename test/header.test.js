const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');
let browser, page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false
  });
  page = await browser.newPage();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await browser.close();
});

test('Test Header', async () => {
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);
  expect(text).toEqual('Blogster');
});

test('Test if clicking Auth Button takes us to Google OAuth', async () => {
  await page.click('.right a');
  const url = page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test('Logout Button Appear when Signed In', async () => {
  const user = await userFactory();
  const { session, sig } = sessionFactory(user);
  await page.setCookie({ name: 'session', value: session });
  await page.setCookie({ name: 'session.sig', value: sig });
  await page.goto('localhost:3000');
  await page.waitFor('a[href="/auth/logout"]');
  const logOutText = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
  expect(logOutText).toEqual('Logout');
});

// test('Testing a Test Case', () => {
//   let sum = 1 + 2;
//   expect(sum).toEqual(3);
// })