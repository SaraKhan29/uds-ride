import { ForgotPasswordPage } from './app.po';
import { browser, element, by } from 'protractor';

describe('ForgotPassword Page Tests', () => {
  const ForgotPassword_page: ForgotPasswordPage = new ForgotPasswordPage();
  let email, terms, policy, ForgotPassword_btn;

  beforeEach(async () => {
    browser.waitForAngularEnabled(false);
    // await browser.get("/ForgotPassword");
    email = ForgotPassword_page.getEmailField();
    ForgotPassword_btn = ForgotPassword_page.getButton();
  });

  it('forgot password for invalid user.', async () => {
    browser.sleep(3000);
    await browser.get('/forgot-password');
    await email.click();
    await email.sendKeys('s8kala@stud.uni-saarland.de');
    browser.sleep(3000);

    ForgotPassword_btn.click().then(function() {
      browser.sleep(5000);
      expect(ForgotPassword_page.getAlertPopup().getText()).toContain(
        'There is no user record corresponding to this identifier. The user may have been deleted.'
      );
    });
  });

  it('receiving forgot password email for valid user.', async () => {
    browser.sleep(3000);
    await browser.get('/forgot-password');
    await email.click();
    await email.sendKeys('s8osharo@stud.uni-saarland.de');
    browser.sleep(3000);

    ForgotPassword_btn.click().then(function() {
      browser.sleep(5000);
      expect(ForgotPassword_page.getAlertPopup().getText()).toContain(
        'An email has been sent to your account to reset your password. Kindly check your email.'
      );
    });
  });
});
