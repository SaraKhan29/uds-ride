import { browser, by, element } from 'protractor';

export class HomePage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.deepCss('app-root ion-content')).getText();
  }
}

export class LoginPage {
  navigateTo() {
    return browser.get('/login');
  }

  getEmailField() {
    return element(by.id('id_email')).element(by.css('input'));
  }

  getPasswordField() {
    return element(by.id('id_password')).element(by.css('input'));
  }

  getLoginButton() {
    return element(by.id('id_login'));
  }

  getAlertPopup() {
    return element(by.className('alert-message'));
  }
}

export class RegisterPage {
  navigateTo() {
    return browser.get('/register');
  }

  getEmailField() {
    return element(by.id('id_email')).element(by.css('input'));
  }

  getTermsField() {
    return element(by.id('id_terms'));
  }

  getPolicyField() {
    return element(by.id('id_policy'));
  }

  getAlertPopup() {
    return element(by.className('alert-message'));
  }

  getRegisterButton() {
    return element(by.id('id_register_btn'));
  }
}

export class ForgotPasswordPage {
  navigateTo() {
    return browser.get('/forgot-password');
  }

  getEmailField() {
    return element(by.id('id_email')).element(by.css('input'));
  }

  getAlertPopup() {
    return element(by.className('alert-message'));
  }

  getButton() {
    return element(by.id('id_btn'));
  }
}

export class CreateRidePage {
  navigateTo() {
    return browser.get('/create-ride/42');
  }

  getSeatsField() {
    return element(by.id('seats'));
  }

  getRideDateField() {
    return element(by.id('ride_date'));
  }

  getSelectCarField() {
    return element(by.id('select_car'));
  }

  getRideStartTimeField() {
    return element(by.id('start_time'));
  }

  getRideEndTimeField() {
    return element(by.id('end_time'));
  }

  getRideFromField() {
    return element(by.id('ride_from'));
  }

  getRideToField() {
    return element(by.id('ride_to'));
  }

  getAlertPopup() {
    return element(by.className('alert-message'));
  }

  getButton() {
    return element(by.id('id_btn'));
  }
}

export class Tabs1Page {
  navigateTo() {
    return browser.get('/tabs/tab1');
  }

  getButton() {
    return element(by.id('id_btn'));
  }
}

export class ProfilePage {
  getFirstName() {
    return element(by.id('firstName')).element(by.css('input'));
  }
  getLastName() {
    return element(by.id('lastName')).element(by.css('input'));
  }
  getPhoneNumber() {
    return element(by.id('phoneNumber')).element(by.css('input'));
  }
  getAddCar() {
    return element(by.id('add_car'));
  }
  getSaveProfileButton() {
    return element(by.id('save_profile'));
  }
  getDeleteProfileButton() {
    return element(by.id('id_delete'));
  }
  getLogoutButton() {
    return element(by.id('id_logout'));
  }
  getAlertPopup() {
    return element(by.className('alert-wrapper'));
  }
}

export class EditCar {
  getName() {
    return element(by.id('car_name')).element(by.css('input'));
  }
  getBrand() {
    return element(by.id('car_brand')).element(by.css('input'));
  }
  getModel() {
    return element(by.id('car_model')).element(by.css('input'));
  }
  getSeats() {
    return element(by.id('car_seats'));
  }
  getColor() {
    return element(by.id('car_color'));
  }
  getSaveButton() {
    return element(by.id('save'));
  }
  getDeleteButton() {
    return element(by.id('delete'));
  }
  getAlertPopup() {
    return element(by.className('alert-message'));
  }
}

export class SearchPage {
  navigateTo() {
    return browser.get('/tabs/tab2');
  }

  getStartList() {
    return element(by.id('startLocation'));
  }

  getEndList() {
    return element(by.id('endLocation'));
  }

  getOption(pos: number) {
    return element.all(by.className('ionic-selectable-item')).get(pos);
  }

  getSearchButton() {
    return element(by.id('searchbtn'));
  }

}




export class BookPage {
	navigateTo() {
		return browser.get('/tabs/tab2');
	}


	getBookButton() {
    return element(by.id('bookride'));
   }

    getViewDetails() {
    return element(by.id('details'));
   }

}

export class BookedRidesPage {
	navigateTo() {
		return browser.get('/tabs/tab1');
	}


	getBookTab() {
    return element(by.id('bookedrides'));
   }

    getViewDetails() {
    return element(by.id('viewdetails'));
   }

	getCancelButton() {
		 return element(by.id('cancel'));

	}

}




















