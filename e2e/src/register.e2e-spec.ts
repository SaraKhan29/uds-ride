import { RegisterPage } from './app.po';
import { browser, element, by } from 'protractor';

describe('register Page Tests', () => {
  const register_page: RegisterPage = new RegisterPage();
  let email, terms, policy, register_btn;

  beforeEach(async () => {
    browser.waitForAngularEnabled(false);
    // await browser.get("/register");
    email = register_page.getEmailField();
    terms = register_page.getTermsField();
    policy = register_page.getPolicyField();
    register_btn = register_page.getRegisterButton();
  });

  it('registering user s8osharo', async () => {
    browser.sleep(3000);
    await browser.get('/register');
    await email.click();
    await email.sendKeys('s8osharo@stud.uni-saarland.de');
    browser.sleep(3000);
    await terms.click();
    browser.sleep(3000);
    await policy.click();
    browser.sleep(3000);

    register_btn.click().then(function() {
      //  console.log("button pressed");
      browser.sleep(5000);
      // expect popup with error.
      expect(register_page.getAlertPopup().getText()).toContain(
        'An email has been sent to your account for account verification. Kindly check your email.'
      );
    });
  });

  it('registering already registered user', async () => {
    browser.sleep(3000);
    await browser.get('/register');
    browser.sleep(3000);
    await email.click();
    await email.sendKeys('s8osharo@stud.uni-saarland.de');
    browser.sleep(3000);
    await terms.click();
    browser.sleep(3000);
    await policy.click();
    browser.sleep(3000);

    register_btn.click().then(function() {
      browser.sleep(5000);
      // expect popup with error.
      expect(register_page.getAlertPopup().getText()).toContain(
        'The email address is already in use by another account.'
      );
    });
  });
});
