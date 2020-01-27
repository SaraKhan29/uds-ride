import { CreateRidePage, LoginPage, Tabs1Page } from './app.po';
import { browser, element, by } from 'protractor';

describe('Edit and Delete ride Tests', () => {
  const login_page: LoginPage = new LoginPage();
  const createRidePage: CreateRidePage = new CreateRidePage();
  const tabs1Page: Tabs1Page = new Tabs1Page();
  let seats, ride_date, select_car, start_time, end_time, ride_from, ride_to;
  let offerRideButton, email, password, login_btn, view_details;

  beforeEach(async () => {
    browser.waitForAngularEnabled(false);
    email = login_page.getEmailField();
    password = login_page.getPasswordField();
    login_btn = login_page.getLoginButton();
    seats = createRidePage.getSeatsField();
    ride_date = createRidePage.getRideDateField();
    select_car = createRidePage.getSelectCarField();
    start_time = createRidePage.getRideStartTimeField();
    end_time = createRidePage.getRideEndTimeField();
    ride_from = createRidePage.getRideFromField();
    ride_to = createRidePage.getRideToField();
    offerRideButton = createRidePage.getButton();
    view_details = tabs1Page.getButton();
    await browser.get('/login');
    browser.sleep(3000);
    await email.click();
    await email.sendKeys('s8geivan@stud.uni-saarland.de');
    browser.sleep(3000);
    await password.click();
    await password.sendKeys('1234567');
    browser.sleep(3000);
    login_btn.click();
    browser.sleep(3000);
    await browser.get('/tabs/tab1');
    browser.sleep(5000);
    await element
      .all(by.className('seg-button-custm'))
      .first()
      .click();
    browser.sleep(3000);
    browser.executeScript(
      'arguments[0].scrollIntoView();',
      view_details.getWebElement()
    );
    browser.sleep(2000);
    await view_details.click();
    browser.sleep(2000);
  });

  it('editing a ride', async () => {
    await element(by.id('edit')).click();
    browser.sleep(2000);
    await select_car.click();
    browser.sleep(2000);
    await element
      .all(by.className('alert-radio-button'))
      .first()
      .click();
    browser.sleep(1000);
    await element
      .all(by.className('alert-button'))
      .get(1)
      .click();
    browser.sleep(500);

    browser.executeScript(
      'arguments[0].scrollIntoView();',
      ride_date.getWebElement()
    );
    browser.sleep(2000);
    await ride_date.click();
    browser.sleep(2000);
    await element
      .all(by.className('picker-button'))
      .get(1)
      .click();
    browser.sleep(2000);

    browser.executeScript(
      'arguments[0].scrollIntoView();',
      end_time.getWebElement()
    );
    browser.sleep(2000);
    await end_time.click();
    browser.sleep(1000);
    await element
      .all(by.className('picker-button'))
      .get(1)
      .click();
    browser.sleep(2000);

    browser.executeScript(
      'arguments[0].scrollIntoView();',
      ride_to.getWebElement()
    );
    browser.sleep(2000);
    await ride_to.click();
    browser.sleep(1000);
    await element
      .all(by.className('ionic-selectable-item'))
      .get(2)
      .click();
    browser.sleep(3000);

    // await element(by.buttonText("Save")).click();
    browser.sleep(3000);
    // not pressing a button... yet
  });

  it('Cancel ride', async () => {
    element(by.id('cancel')).click();
    browser.sleep(2000);
    element
      .all(by.className('alert-button'))
      .get(1)
      .click();
  });
});
