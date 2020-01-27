import { LoginPage } from './app.po';
import { browser, element, by } from 'protractor';

describe('Login Page Tests', () => {
  const login_page: LoginPage = new LoginPage();
  let email, password, login_btn;

  beforeEach(async () => {
    browser.waitForAngularEnabled(false);
    // await browser.get("/login");
    email = login_page.getEmailField();
    password = login_page.getPasswordField();
    login_btn = login_page.getLoginButton();
  });

  it('verified user logged in', async () => {
    await browser.get('/login');
    browser.sleep(3000);
    await email.click();
    await email.sendKeys('s8osharo@stud.uni-saarland.de');
    browser.sleep(3000);
    await password.click();
    await password.sendKeys('123456');
    browser.sleep(3000);
    login_btn.click().then(function() {
      browser.sleep(5000);
      expect(browser.getCurrentUrl()).toContain('/tabs/tab1');
    });
  });

  it('non-verified user not logged in', async () => {
    await browser.get('/login');
    browser.sleep(3000);
    await email.click();
    await email.sendKeys('s8kala@stud.uni-saarland.de');
    browser.sleep(3000);
    await password.click();
    await password.sendKeys('abc123');
    browser.sleep(3000);
    login_btn.click().then(function() {
      browser.sleep(5000);
      expect(login_page.getAlertPopup().getText()).toContain(
        'There is no user record corresponding to this identifier. The user may have been deleted.'
      );
    });
  });

  it('verified user wrong password not logged in', async () => {
    await browser.get('/login');
    browser.sleep(3000);
    await email.click();
    await email.sendKeys('s8osharo@stud.uni-saarland.de');
    browser.sleep(3000);
    await password.click();
    await password.sendKeys('abc123');
    browser.sleep(3000);
    login_btn.click().then(function() {
      browser.sleep(5000);
      expect(login_page.getAlertPopup().getText()).toContain(
        'The password is invalid or the user does not have a password.'
      );
    });
  });
});
