const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

describe('End-to-End Storefront (Selenium)', () => {
  let driver;

  beforeAll(async () => {
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Commented out to show browser during demo
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    // Run against the Selenium container at port 4444
    // Note: The Selenium container sees the Next app at http://app:3000
    // Run against local chromedriver to show the window on the desktop
    driver = await new Builder()
      // .usingServer('http://localhost:4444/wd/hub') // Commented out for local visibility
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('should load the homepage and show categories', async () => {
    await driver.get('http://localhost:3000');
    
    // Wait for the main title or a known element
    await driver.wait(until.elementLocated(By.css('h1')), 10000);
    const title = await driver.findElement(By.css('h1')).getText();
    
    expect(title).toBeDefined();
    console.log('Found title:', title);
  });

  it('should navigate to the Sweet Treats store', async () => {
    await driver.get('http://localhost:3000/sweet-treats');
    
    // Check if store name is displayed correctly
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Sweet Treats')]")), 10000);
    const storeHeader = await driver.findElement(By.xpath("//*[contains(text(), 'Sweet Treats')]"));
    
    expect(await storeHeader.isDisplayed()).toBe(true);
  }, 30000);
});
