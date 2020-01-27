import { LoginPage, ProfilePage } from './app.po';
import { browser, element, by } from 'protractor';

describe('Profile Tests', () => {
  const login_page: LoginPage = new LoginPage();
  const profilePage: ProfilePage = new ProfilePage();
  let email,
    password,
    login_btn,
    firstName,
    lastName,
    phoneNumber,
    saveProfileButton,
    logoutButton,
    deleteButton;

  beforeEach(async () => {
    browser.waitForAngularEnabled(false);
    email = login_page.getEmailField();
    password = login_page.getPasswordField();
    login_btn = login_page.getLoginButton();
    firstName = profilePage.getFirstName();
    lastName = profilePage.getLastName();
    phoneNumber = profilePage.getPhoneNumber();
    saveProfileButton = profilePage.getSaveProfileButton();
    logoutButton = profilePage.getLogoutButton();
    deleteButton = profilePage.getDeleteProfileButton();
    await browser.get('/login');
    browser.sleep(3000);
    await email.click();
    await email.sendKeys('s8osharo@stud.uni-saarland.de');
    browser.sleep(3000);
    await password.click();
    await password.sendKeys('abc123');
    browser.sleep(3000);
    login_btn.click();
    browser.sleep(3000);
    await browser.get('/tabs/profile');
    browser.sleep(5000);
  });

  it('Edit a profile', async () => {
    await firstName.click();
    browser.sleep(3000);
    await firstName.clear();
    browser.sleep(3000);
    await firstName.sendKeys('osama_updated');
    browser.sleep(3000);

    await browser.executeScript(
      'arguments[0].scrollIntoView();',
      lastName.getWebElement()
    );
    browser.sleep(3000);
    await lastName.click();
    browser.sleep(3000);
    await lastName.clear();
    browser.sleep(3000);
    await lastName.sendKeys('haroon_updated');
    browser.sleep(3000);

    await phoneNumber.click();
    browser.sleep(3000);
    await phoneNumber.clear();
    browser.sleep(3000);
    await phoneNumber.sendKeys('+123123123');
    browser.sleep(3000);

    await saveProfileButton.click();
    browser.sleep(3000);
    expect(profilePage.getAlertPopup().getText()).toContain(
      'Your profile has been successfully saved.'
    );
  });

  it('Logout', async () => {
    browser.executeScript(
      'arguments[0].scrollIntoView();',
      logoutButton.getWebElement()
    );
    browser.sleep(3000);
    logoutButton.click().then(function() {
      browser.sleep(3000);
      expect(profilePage.getAlertPopup().getText()).toContain(
        'You have been signed out successfully.'
      );
    });
  });

  it('Delete profile', async () => {
    browser.executeScript(
      'arguments[0].scrollIntoView();',
      deleteButton.getWebElement()
    );
    browser.sleep(4000);
    deleteButton.click();
    browser.sleep(3000);
    element
      .all(by.className('alert-button'))
      .get(1)
      .click();
    browser.sleep(7000);
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
        'There is no user record corresponding to this identifier. The user may have been deleted.'
      );
    });
  });
});
