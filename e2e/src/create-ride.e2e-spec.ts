import { CreateRidePage, LoginPage } from './app.po';
import { browser, element, by } from 'protractor';

describe('СreateRide Page Tests', () => {
  const login_page: LoginPage = new LoginPage();
  const createRidePage: CreateRidePage = new CreateRidePage();
  let seats, ride_date, select_car, start_time, end_time, ride_from, ride_to;
  let offerRideButton, email, password, login_btn;

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
    await browser.get('/create-ride/42');
    browser.sleep(6000);
  });

  it('creating a new ride fail', async () => {
    offerRideButton.click().then(function() {
      //  console.log("button pressed");
      browser.sleep(3000);
      // expect popup with error.
      expect(createRidePage.getAlertPopup().getText()).toContain(
        'Input is missing.'
      );
    });
  });

  it('creating a new ride success', async () => {

    select_car.click();
    browser.sleep(2000);
    element.all(by.className('alert-radio-button')).first().click();
    browser.sleep(1000);
    element.all(by.className('alert-button')).get(1).click();
    browser.sleep(500);

    browser.executeScript('arguments[0].scrollIntoView();', ride_date.getWebElement());
    browser.sleep(2000);
    ride_date.click();
    browser.sleep(2000);
    element.all(by.className('picker-button')).get(1).click();
    browser.sleep(2000);

    start_time.click();
    browser.sleep(1000);
    element.all(by.className('picker-button')).get(1).click();
    browser.sleep(3000);

    browser.executeScript('arguments[0].scrollIntoView();', end_time.getWebElement());
    browser.sleep(2000);
    end_time.click();
    browser.sleep(1000);
    element.all(by.className('picker-button')).get(1).click();
    browser.sleep(2000);

    ride_from.click();
    browser.sleep(1000);
    element.all(by.className('ionic-selectable-item')).first().click();
    browser.sleep(1000);

    browser.executeScript('arguments[0].scrollIntoView();', ride_to.getWebElement());
    browser.sleep(2000);
    ride_to.click();
    browser.sleep(1000);
    element.all(by.className('ionic-selectable-item')).get(1).click();
    browser.sleep(1000);

    offerRideButton.click().then(function() {
      browser.sleep(3000);
      expect(createRidePage.getAlertPopup().getText()).toContain(
        'This ride has been successfully created.'
      );
    });
  });
});
