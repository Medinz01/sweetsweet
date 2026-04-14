const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Increase Jest timeout for long-running E2E tests
jest.setTimeout(240000);

describe('Full Seller Lifecycle E2E', () => {
  let driver;
  const baseUrl = 'http://localhost:3000';
  const timestamp = Date.now();
  const sellerEmail = `seller_${timestamp}@example.com`;
  const sellerPass = 'password123';
  const storeName = `Test Store ${timestamp}`;
  const categoryName = `E2E Category ${timestamp}`;
  const productName = `Gourmet Truffle ${timestamp}`;

  beforeAll(async () => {
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Removed for demonstration
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    await driver.manage().setTimeouts({ implicit: 5000 });
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  async function jsClick(element) {
    await driver.executeScript("arguments[0].scrollIntoView(true);", element);
    await driver.sleep(500);
    await driver.executeScript("arguments[0].click();", element);
  }

  async function waitForAndType(selector, text) {
    const el = await driver.wait(until.elementLocated(selector), 30000);
    await driver.wait(until.elementIsVisible(el), 30000);
    await el.clear();
    await el.sendKeys(text);
    return el;
  }

  test('Should Register a new Seller', async () => {
    console.log('Registering seller:', sellerEmail);
    await driver.get(`${baseUrl}/register`);
    await waitForAndType(By.css('input[placeholder*="Full Name"]'), 'Test Seller');
    await waitForAndType(By.css('input[placeholder*="Email Address"]'), sellerEmail);
    await waitForAndType(By.css('input[placeholder*="Password"]'), sellerPass);
    await waitForAndType(By.css('input[placeholder*="Store Name"]'), storeName);
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await jsClick(submitBtn);
    await driver.wait(until.alertIsPresent(), 30000);
    const alert = await driver.switchTo().alert();
    await alert.accept();
    await driver.wait(until.urlContains('/login'), 20000);
  });

  test('Should Login as the new Seller', async () => {
    console.log('Logging in seller...');
    await driver.get(`${baseUrl}/login`);
    await waitForAndType(By.css('input[placeholder="Email"]'), sellerEmail);
    await waitForAndType(By.css('input[placeholder="Password"]'), sellerPass);
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await jsClick(submitBtn);
    await driver.wait(until.urlContains('/admin'), 30000);
  });

  test('Should Add a New Category', async () => {
    console.log('Adding category:', categoryName);
    await driver.get(`${baseUrl}/admin/add-category`);
    await waitForAndType(By.xpath("//label[contains(text(), 'Category Name')]/../div/input"), categoryName);
    const submitBtn = await driver.wait(until.elementLocated(By.css('button.submit-btn')), 20000);
    await jsClick(submitBtn);
    const snackbar = await driver.wait(until.elementLocated(By.css('.MuiAlert-message')), 30000);
    expect(await snackbar.getText()).toContain('successfully');
  });

  test('Should Add a New Product via Admin', async () => {
    console.log('Adding product:', productName);
    await driver.get(`${baseUrl}/admin/add-product`);
    await driver.sleep(3000);
    const addBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Add Product')]")), 30000);
    await jsClick(addBtn);
    await driver.sleep(2000);
    await waitForAndType(By.name('name'), productName);
    await waitForAndType(By.name('slug'), `e2e-truffle-${timestamp}`);
    
    // Select Category - Extreme robust mode
    console.log('Selecting category...');
    const selectTrigger = await driver.wait(until.elementLocated(By.css('.MuiSelect-select')), 20000);
    await driver.wait(until.elementIsVisible(selectTrigger), 10000);
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", selectTrigger);
    await driver.sleep(1000);
    await selectTrigger.click(); // MUST use standard click for MUI to trigger mousedown
    await driver.sleep(2000);
    
    // Try to find the category by text directly in the body
    console.log('Locating option element...');
    const option = await driver.wait(until.elementLocated(By.xpath(`//li[contains(text(), '${categoryName}')]`)), 10000);
    console.log('Option element located. Waiting for visibility...');
    await driver.wait(until.elementIsVisible(option), 10000);
    console.log('Option is visible. Scrolling to it...');
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", option);
    await driver.sleep(500);
    console.log('Clicking option...');
    await option.click();
    await driver.sleep(1000);

    console.log('Typing pricePerUnit...');
    await waitForAndType(By.name('pricePerUnit'), '250');
    console.log('Typing description...');
    await waitForAndType(By.css('textarea[name="description"]'), 'Automated lifecycle test product.');
    console.log('Clicking save...');
    const saveBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Save')]"));
    await jsClick(saveBtn);
    const snackbar = await driver.wait(until.elementLocated(By.css('.MuiAlert-message')), 40000);
    expect(await snackbar.getText()).toContain('Added');
  });

  test('Should Verify the Product on the Public Storefront', async () => {
    console.log('Verifying storefront...');
    await driver.get(baseUrl);
    const storeLink = await driver.wait(until.elementLocated(By.xpath(`//h5[contains(text(), '${storeName}')]/..`)), 30000);
    await jsClick(storeLink);
    const productElement = await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${productName}')]`)), 60000);
    expect(await productElement.isDisplayed()).toBe(true);
  });
});
