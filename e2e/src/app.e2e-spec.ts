import { HomePage } from './app.po';

describe('Home Page Tests', () => {
  let home_page: HomePage;

  beforeEach(() => {
    home_page = new HomePage();
  });

  it('should have headline', () => {
    home_page.navigateTo();
    expect(home_page.getParagraphText()).toContain(
      'Life ain\'t always beautiful, but it\'s a beautiful ride.'
    );
  });
});
