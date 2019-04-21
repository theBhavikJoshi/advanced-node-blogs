const Page = require('../helpers/page');

let page;

beforeEach(async () => {
  page = await Page.Build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When Logged In', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('New Blogpost form on New Button Click', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('Using Invalid Inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('Form Shows an Error Message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');
      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
  
  describe('Using Valid Inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My Title');
      await page.type('.content input', 'My Content');
      await page.click('form button');
    });

    test('Submitting takes to Review Screen', async () => {
      const confirmText = await page.getContentsOf('h5');
      expect(confirmText).toEqual('Please confirm your entries');
    });
    
    test('Submitting Then Saving Adds Blog to Index Page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');
      expect(title).toEqual('My Title');
      expect(content).toEqual('My Content');
    });
  });
});