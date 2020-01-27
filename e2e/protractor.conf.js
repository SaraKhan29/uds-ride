// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

//const { SpecReporter } = require('jasmine-spec-reporter');
var HtmlReporter = require('protractor-beautiful-reporter');

// change config for unit tests to add here.
exports.config = {
  allScriptsTimeout: 19000,
  specs: [
    // uncomment the script test you want to execute.
    //'./src/register.e2e-spec.ts',
    //'./src/forgot-password.e2e-spec.ts',
    //'./src/login.e2e-spec.ts',
    //'./src/edit-profile.e2e-spec.ts',
    //'./src/create-ride.e2e-spec.ts',
    //'./src/edit-ride.e2e-spec.ts',
    //'./src/edit-car.e2e-spec.ts',
    //'./src/search-rides.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 50000,
    print: function () { }
  },
  onPrepare() {
    browser.manage().window().setSize(800, 800);
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new HtmlReporter({
      baseDirectory: 'tmp/screenshots'
    }).getJasmine2Reporter());
  }
};
