const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

jest.setTimeout(120000);

describe('Negative Flows E2E', () => {
  let driver;
  const baseUrl = 'http://host.docker.internal:3006';

  beforeAll(async () => {
    const options = new chrome.Options();
    // options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .usingServer('http://localhost:4444/wd/hub')
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('Should reject invalid login', async () => {
    await driver.get(`${baseUrl}/login`);

    // Attempt login with garbage credentials
    const emailInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Email"]')), 10000);
    await emailInput.sendKeys('nobody@example.com');

    const passInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Password"]')), 10000);
    await passInput.sendKeys('wrongpassword');

    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await driver.executeScript("arguments[0].scrollIntoView(true);", submitBtn);
    await submitBtn.click();

    // Check for native alert
    await driver.wait(until.alertIsPresent(), 10000);
    const alert = await driver.switchTo().alert();
    const text = await alert.getText();
    expect(text.toLowerCase()).toContain('invalid');
    await alert.accept();
  });
});
