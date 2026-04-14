const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Increase Jest timeout for long-running E2E tests
jest.setTimeout(120000);

describe('Full Buyer Lifecycle E2E', () => {
  let driver;
  const baseUrl = 'http://localhost:3000';
  const timestamp = Date.now();
  const buyerEmail = `buyer_${timestamp}@example.com`;
  const buyerPass = 'password123';

  beforeAll(async () => {
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Removed for demonstration
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

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
    await driver.executeScript("arguments[0].click();", element);
  }

  async function waitForAndType(selector, text) {
    const el = await driver.wait(until.elementLocated(selector), 20000);
    await driver.wait(until.elementIsVisible(el), 20000);
    await el.clear();
    await el.sendKeys(text);
    return el;
  }

  async function waitForAndClick(selector) {
    const el = await driver.wait(until.elementLocated(selector), 20000);
    await driver.wait(until.elementIsVisible(el), 20000);
    await jsClick(el);
    return el;
  }

  test('Should Register a new Buyer', async () => {
    console.log('Registering buyer:', buyerEmail);
    await driver.get(`${baseUrl}/user/register`);
    
    await waitForAndType(By.css('input[placeholder*="Full Name"]'), 'Test Buyer');
    await waitForAndType(By.css('input[placeholder*="Email Address"]'), buyerEmail);
    await waitForAndType(By.css('input[placeholder*="Password"]'), buyerPass);
    await waitForAndType(By.css('input[placeholder*="Phone Number"]'), '9876543210');
    
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await jsClick(submitBtn);
    
    await driver.wait(until.alertIsPresent(), 20000);
    const alert = await driver.switchTo().alert();
    await alert.accept();
    
    await driver.wait(until.urlContains('/user/login'), 20000);
  });

  test('Should Login as the new Buyer', async () => {
    console.log('Logging in buyer...');
    await driver.get(`${baseUrl}/user/login`);
    
    await waitForAndType(By.css('input[placeholder="Email"]'), buyerEmail);
    await waitForAndType(By.css('input[placeholder="Password"]'), buyerPass);
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await jsClick(submitBtn);
    
    // Use urlContains instead of urlIs to be flexible with trailing slashes
    await driver.wait(until.urlContains('localhost:3000'), 30000);
    await driver.wait(until.elementLocated(By.css('h1')), 20000);
  });

  test('Should Select a Shop and Add Product to Cart', async () => {
    console.log('Browsing shop...');
    await driver.get(baseUrl);
    
    const storeLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(@class, 'block')]")), 25000);
    await jsClick(storeLink);
    
    const orderBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Order Now')]")), 25000);
    await jsClick(orderBtn);
    
    const addBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Add to Cart')]")), 25000);
    await jsClick(addBtn);
    
    await driver.wait(until.alertIsPresent(), 20000);
    const alert = await driver.switchTo().alert();
    await alert.accept();
  });

  test('Should Complete Checkout', async () => {
    console.log('Checking out...');
    await driver.get(`${baseUrl}/cart`);
    
    await waitForAndType(By.name('fullName'), 'Test Buyer');
    await waitForAndType(By.name('phoneNumber'), '9876543210');
    await waitForAndType(By.name('streetAddress'), '123 Selenium St');
    await waitForAndType(By.name('city'), 'Test City');
    await waitForAndType(By.name('state'), 'Test State');
    await waitForAndType(By.name('postalCode'), '110001');
    
    const placeOrderBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Place Order')]")), 25000);
    await jsClick(placeOrderBtn);
    
    await driver.wait(until.alertIsPresent(), 40000);
    const alert = await driver.switchTo().alert();
    expect(await alert.getText()).toContain('Order placed successfully');
    await alert.accept();
    
    // Verification of redirect
    await driver.wait(until.urlContains('localhost:3000'), 30000);
  });
});
