import { SearchPage, LoginPage, BookPage, BookedRidesPage} from './app.po';
import { browser, element, by } from 'protractor';

describe('Search Tests', () => {
  const search_page: SearchPage = new SearchPage();
  const login_page: LoginPage = new LoginPage();
  const book_page: BookPage = new BookPage();
  const ride_page: BookedRidesPage =  new BookedRidesPage();
  let list1, list2, option1, option2, option3, option4, option5, button, email, password, login_btn,  bookbutton, viewdetails, viewdetailsR, booktab, CancelButton;

  beforeEach(async () => {
    browser.waitForAngularEnabled(false);
    // await browser.get("/login");
    list1 = search_page.getStartList();
    list2 = search_page.getEndList();
    option1 = search_page.getOption(0);
    option2 = search_page.getOption(1);
    option3 = search_page.getOption(2);
	   option4 = search_page.getOption(3);
	   option5 = search_page.getOption(5);
    button = search_page.getSearchButton();
    email = login_page.getEmailField();
    password = login_page.getPasswordField();
    login_btn = login_page.getLoginButton();
	   bookbutton = book_page.getBookButton();
	   viewdetails = book_page.getViewDetails();
	   booktab = ride_page.getBookTab();
	   viewdetailsR = ride_page.getViewDetails();
	   CancelButton = ride_page.getCancelButton();

  });

 /* it("Redirect user to login.", async () => {
    await browser.get("/tabs/tab2");
    browser.sleep(3000);
    await list1.click();
    browser.sleep(2000);
    await option1.click();
    browser.sleep(2000);
    await list2.click();
    browser.sleep(2000);
    await option2.click();
    browser.sleep(2000);
    button.click().then(function() {
        browser.sleep(5000);
        expect(browser.getCurrentUrl()).toContain("/home");
        });
    })

  it("Search a random ride.", async () => {

    await browser.get("/login");
    browser.sleep(3000);
    await email.click();
    await email.sendKeys("s8babend@stud.uni-saarland.de");
    browser.sleep(2000);
    await password.click();
    await password.sendKeys("password");
    browser.sleep(2000);
    login_btn.click();
    browser.sleep(5000);
    await browser.get("/tabs/tab2");
    browser.sleep(3000);
    await list1.click();
    browser.sleep(2000);
    await option1.click();
    browser.sleep(2000);
    await list2.click();
    browser.sleep(2000);
    await option2.click();
    browser.sleep(2000);
    button.click().then(function() {
        browser.sleep(2000);
        expect(browser.getCurrentUrl()).toContain("/tabs/tab2/search-results/1");
        });
    //expect(true).toBe(true);
    });

    it("Search a non existen ride.", async () => {
        await browser.get("/tabs/tab2");
        browser.sleep(3000);
        await list1.click();
        browser.sleep(2000);
        await option3.click();
        browser.sleep(2000);
        await list2.click();
        browser.sleep(2000);
        await option3.click();
        browser.sleep(2000);
        button.click().then(function() {
            browser.sleep(5000);
            expect(browser.getCurrentUrl()).toContain("/tabs/tab2/search-results/1");
            });
        })

        it("Search an existing ride.", async () => {
            await browser.get("/tabs/tab2");
            browser.sleep(3000);
            await list1.click();
            browser.sleep(2000);
            await option1.click();
            browser.sleep(2000);
            await list2.click();
            browser.sleep(2000);
            await option1.click();
            browser.sleep(2000);
            button.click().then(function() {
                browser.sleep(5000);
                expect(browser.getCurrentUrl()).toContain("/tabs/tab2/search-results/1");
                });
            })


	 it("Viewing details of a booked ride", async () =>{
	await browser.get("/login");
	browser.sleep(3000);
    await email.click();
    await email.sendKeys('s8sakhan@stud.uni-saarland.de');
    browser.sleep(3000);
    await password.click();
    await password.sendKeys('1234sara');
    browser.sleep(3000);
    login_btn.click();
	browser.sleep(3000);
	await browser.get("/tabs/tab1");
	browser.sleep(3000);
	await booktab.click();
	browser.sleep(3000);
	})

	it("Cancellation of a booked ride", async () =>{
	await browser.get("/login");
	browser.sleep(3000);
    await email.click();
    await email.sendKeys('s8sakhan@stud.uni-saarland.de');
    browser.sleep(3000);
    await password.click();
    await password.sendKeys('1234sara');
    browser.sleep(3000);
    login_btn.click();
	browser.sleep(3000);
	await browser.get("/tabs/tab1");
	browser.sleep(3000);
	await booktab.click();
	browser.sleep(3000);
	await viewdetailsR.click();
	browser.sleep(3000);
	CancelButton.click().then(function() {
        browser.sleep(5000);
         expect(login_page.getAlertPopup().getText()).toContain(
              'Are you sure to cancel your booking?'
            );
          });

	})*/


	 it('Viewing details of an existing ride', async () => {
	await browser.get('/login');
	browser.sleep(3000);
 await email.click();
 await email.sendKeys('s8sakhan@stud.uni-saarland.de');
 browser.sleep(3000);
 await password.click();
 await password.sendKeys('1234sara');
 browser.sleep(3000);
 login_btn.click();
	browser.sleep(3000);
	await browser.get('/tabs/tab2');
 browser.sleep(3000);
 await list1.click();
 browser.sleep(2000);
	// await list1.sendKeys("Hauptbahnof")
	// browser.sleep(2000);
 await option5.click();
 browser.sleep(2000);
 await list2.click();
 browser.sleep(2000);
	// await list2.sendKeys("Universit�t S�d");
 browser.sleep(2000);
 await option3.click();
 browser.sleep(6000);
	button.click();
	// await browser.get('/search-results-details/1');
	browser.sleep(2000);
 await viewdetails.click();
	});


	 it('Booking an  existing ride', async () => {
	await browser.get('/login');
	browser.sleep(3000);
 await email.click();
 await email.sendKeys('s8sakhan@stud.uni-saarland.de');
 browser.sleep(3000);
 await password.click();
 await password.sendKeys('1234sara');
 browser.sleep(3000);
 login_btn.click();
	browser.sleep(3000);
	await browser.get('/tabs/tab2');
 browser.sleep(3000);
 await list1.click();
 browser.sleep(2000);
	// await list1.sendKeys("Hauptbahnof")
	// browser.sleep(2000);
 await option5.click();
 browser.sleep(2000);
 await list2.click();
 browser.sleep(2000);
	// await list2.sendKeys("Universit�t S�d");
 browser.sleep(2000);
 await option3.click();
 browser.sleep(6000);
	button.click();
	// await browser.get('/search-results-details/42');
	browser.sleep(2000);
 await viewdetails.click();
	browser.sleep(2000);
	// await browser.get('/search-results-details/42');
	// await bookbutton.click();
	// browser.sleep(3000);
	bookbutton.click().then(function() {
        browser.sleep(5000);
        expect(login_page.getAlertPopup().getText()).toContain(
              'Your ride request has been sent to the driver. We’ll notify you once your ride is confirmed'
            );
          });

	});















});
