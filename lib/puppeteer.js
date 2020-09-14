const puppeteer = require("puppeteer");

const loginWithPuppeteer = async (email, password) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 150,
      devtools: true,
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15063"
    );

    const navigationPromise = page.waitForNavigation();

    await page.goto(
      "https://unite.nike.com/s3/unite/mobile.html?androidSDKVersion=3.1.0&corsoverride=https://unite.nike.com&uxid=com.nike.sport.running.droid.3.8&locale=en_US&backendEnvironment=identity&view=login&clientId=WLr1eIG5JSNNcBJM3npVa6L76MK8OBTt&facebookAppId=84697719333&wechatAppId=wxde7d0246cfaf32f7#%7B"
    );

    await page.setViewport({ width: 1679, height: 364 });

    await navigationPromise;

    await page.waitForSelector(
      '.nike-unite .nike-unite-component.nike-unite-text-input input[type="email"]'
    );
    await page.click(
      '.nike-unite .nike-unite-component.nike-unite-text-input input[type="email"]'
    );

    await page.type(
      '.nike-unite .nike-unite-component.nike-unite-text-input input[type="email"]',
      email
    );

    await page.waitForSelector(
      '.nike-unite .nike-unite-component.nike-unite-text-input input[type="password"]'
    );
    await page.click(
      '.nike-unite .nike-unite-component.nike-unite-text-input input[type="password"]'
    );

    await page.type(
      '.nike-unite .nike-unite-component.nike-unite-text-input input[type="password"]',
      password
    );

    const clickSignin = await page.click(
      '.nike-unite .nike-unite-component.nike-unite-action-button input, .nike-unite .nike-unite-component.nike-unite-submit-button input[value="SIGN IN"]'
    );

    const [response] = await Promise.all([
      page.waitForResponse((response) => response.url().includes("login")),
      clickSignin,
    ]);
    const creds = await response.json();
    await browser.close();

    return creds;
  } catch (err) {
    console.log("error with loginWithPuppeteer", err);
  }
};

module.exports = { loginWithPuppeteer };
