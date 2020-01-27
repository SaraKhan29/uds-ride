import { LoginPage, ProfilePage, EditCar} from './app.po';
import { browser, element, by } from 'protractor';

describe('Car Tests', () => {
    const login_page: LoginPage = new LoginPage();
    const profilePage: ProfilePage = new ProfilePage();
    const editCarPage: EditCar = new EditCar();
    let email, password, login_btn, saveProfileButton, add_car, name, brand, model, seats, color, deleteButton, saveButton;

    beforeEach(async () => {
      browser.waitForAngularEnabled(false);
      email = login_page.getEmailField();
      password = login_page.getPasswordField();
      login_btn = login_page.getLoginButton();
      saveProfileButton = profilePage.getSaveProfileButton();
      add_car = profilePage.getAddCar();
      name = editCarPage.getName();
      brand = editCarPage.getBrand();
      model = editCarPage.getModel();
      seats = editCarPage.getSeats();
      color = editCarPage.getColor();
      saveButton = editCarPage.getSaveButton();
      deleteButton = editCarPage.getDeleteButton();
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
      await browser.get('/tabs/profile');
      browser.sleep(5000);
    });

    it('Creating a car', async () => {
        browser.executeScript('arguments[0].scrollIntoView();', add_car.getWebElement());
        browser.sleep(2000);
        add_car.click();
        browser.sleep(5000);
        name.click();
        browser.sleep(3000);
        await name.sendKeys('testcar');
        browser.sleep(1500);
        brand.click();
        browser.sleep(2000);
        await brand.sendKeys('testcar');
        browser.sleep(1500);
        model.click();
        browser.sleep(1500);
        await model.sendKeys('testcar');
        browser.sleep(1500);
        saveButton.click().then(function() {
            browser.sleep(5000);
            expect(login_page.getAlertPopup().getText()).toContain(
              'This car has been successfully created.'
            );
          });
    });

    it('Edit a car', async () => {
        browser.executeScript('arguments[0].scrollIntoView();', element.all(by.className('input-list-wrapper-cstm')).get(1));
        browser.sleep(3000);
        element.all(by.className('item-label')).get(3).click();
        browser.sleep(2000);
        name.click();
        browser.sleep(3000);
        await name.sendKeys('/updated');
        browser.sleep(1500);
        brand.click();
        browser.sleep(2000);
        await brand.sendKeys('/updated');
        browser.sleep(1500);
        model.click();
        browser.sleep(1500);
        await model.sendKeys('/updated');
        browser.sleep(1500);
        saveButton.click().then(function() {
            browser.sleep(5000);
            expect(login_page.getAlertPopup().getText()).toContain(
              'This car has been successfully saved.'
            );
          });
    });

    it('Delete a car', async () => {
        browser.executeScript('arguments[0].scrollIntoView();', element.all(by.className('input-list-wrapper-cstm')).get(1));
        browser.sleep(3000);
        element.all(by.className('item-label')).get(3).click();
        browser.sleep(2000);
        deleteButton.click();
        // browser.executeScript('arguments[0].scrollIntoView();', deleteButton.getWebElement());
        element.all(by.className('alert-button')).get(1).click().then(function() {
                    browser.sleep(5000);
                    expect(editCarPage.getAlertPopup().getText()).toContain(
                      'This car has been successfully deleted.'
                    );
                  });
        browser.sleep(5000);
    });
});
