var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var convertTimestamp = function (timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh === 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    } else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    } else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};

//</editor-fold>

app.controller('ScreenshotReportController', ['$scope', '$http', 'TitleService', function ($scope, $http, titleService) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;
    this.totalDurationFormat = clientDefaults.totalDurationFormat;
    this.showTotalDurationIn = clientDefaults.showTotalDurationIn;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime) {
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }


    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };
    this.hasNextScreenshot = function (index) {
        var old = index;
        return old !== this.getNextScreenshotIdx(index);
    };

    this.hasPreviousScreenshot = function (index) {
        var old = index;
        return old !== this.getPreviousScreenshotIdx(index);
    };
    this.getNextScreenshotIdx = function (index) {
        var next = index;
        var hit = false;
        while (next + 2 < this.results.length) {
            next++;
            if (this.results[next].screenShotFile && !this.results[next].pending) {
                hit = true;
                break;
            }
        }
        return hit ? next : index;
    };

    this.getPreviousScreenshotIdx = function (index) {
        var prev = index;
        var hit = false;
        while (prev > 0) {
            prev--;
            if (this.results[prev].screenShotFile && !this.results[prev].pending) {
                hit = true;
                break;
            }
        }
        return hit ? prev : index;
    };

    this.convertTimestamp = convertTimestamp;


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };

    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.totalDuration = function () {
        var sum = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.duration) {
                sum += result.duration;
            }
        }
        return sum;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };


    var results = [
    {
        "description": "creating a new ride fail|СreateRide Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 2832,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.130"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 164784:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1580140705594,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140705926,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140705926,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140705927,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 158097:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1580140705975,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/vendor.js 46776:40 \"ERROR\" TypeError: Cannot read property 'id' of undefined\n    at http://localhost:4200/main.js:4477:132\n    at Array.some (<anonymous>)\n    at http://localhost:4200/main.js:4477:98\n    at Array.filter (<anonymous>)\n    at MapSubscriber.project (http://localhost:4200/main.js:4477:69)\n    at MapSubscriber._next (http://localhost:4200/vendor.js:176546:35)\n    at MapSubscriber.next (http://localhost:4200/vendor.js:172051:18)\n    at MapSubscriber._next (http://localhost:4200/vendor.js:176552:26)\n    at MapSubscriber.next (http://localhost:4200/vendor.js:172051:18)\n    at http://localhost:4200/vendor.js:77916:79",
                "timestamp": 1580140720258,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 164784:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1580140720672,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140720919,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140720919,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140720919,
                "type": ""
            }
        ],
        "screenShotFile": "00980017-009c-001b-0059-000c008c005f.png",
        "timestamp": 1580140702954,
        "duration": 27647
    },
    {
        "description": "creating a new ride success|СreateRide Page Tests",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 2832,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.130"
        },
        "message": [
            "Failed: No element found using locator: By(css selector, *[id=\"select_car\"])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"select_car\"])\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)Error: \n    at ElementArrayFinder.applyAction_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\element.js:831:22)\n    at Object.<anonymous> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\e2e\\src\\create-ride.e2e-spec.ts:50:16)\n    at step (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\tslib\\tslib.js:136:27)\n    at Object.next (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\tslib\\tslib.js:117:57)\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\tslib\\tslib.js:110:75\n    at new Promise (<anonymous>)\n    at Object.__awaiter (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\tslib\\tslib.js:106:16)\n    at UserContext.<anonymous> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\e2e\\src\\create-ride.e2e-spec.ts:48:37)\nFrom: Task: Run it(\"creating a new ride success\") in control flow\n    at UserContext.<anonymous> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\e2e\\src\\create-ride.e2e-spec.ts:48:3)\n    at addSpecsToSuite (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\e2e\\src\\create-ride.e2e-spec.ts:4:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Module.m._compile (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\ts-node\\src\\index.ts:439:23)\n    at Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Object.require.extensions.<computed> [as .ts] (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\ts-node\\src\\index.ts:442:12)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 164784:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1580140734408,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140734637,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140734637,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140734637,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 158097:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1580140734669,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 164784:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1580140748925,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140749160,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140749160,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140749160,
                "type": ""
            }
        ],
        "screenShotFile": "00b3005c-00a3-0071-00e3-0009001900eb.png",
        "timestamp": 1580140733998,
        "duration": 21761
    },
    {
        "description": "editing a ride|Edit and Delete ride Tests",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 2832,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.130"
        },
        "message": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"id_btn\"])",
            "Failed: No element found using locator: By(css selector, *[id=\"edit\"])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"id_btn\"])\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom: Task: WebDriver.executeScript()\n    at Driver.schedule (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\webdriver.js:807:17)\n    at Driver.executeScript (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\webdriver.js:878:16)\n    at run (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\browser.js:59:33)\n    at ProtractorBrowser.to.<computed> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\browser.js:67:16)\n    at Object.<anonymous> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\e2e\\src\\edit-ride.e2e-spec.ts:42:13)\n    at step (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\tslib\\tslib.js:136:27)\n    at Object.next (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\tslib\\tslib.js:117:57)\n    at fulfilled (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\tslib\\tslib.js:107:62)\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)",
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"edit\"])\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)Error: \n    at ElementArrayFinder.applyAction_ (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\element.js:831:22)\n    at Object.<anonymous> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\e2e\\src\\edit-ride.e2e-spec.ts:52:34)\n    at step (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\tslib\\tslib.js:136:27)\n    at Object.next (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\tslib\\tslib.js:117:57)\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\tslib\\tslib.js:110:75\n    at new Promise (<anonymous>)\n    at Object.__awaiter (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\tslib\\tslib.js:106:16)\n    at UserContext.<anonymous> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\e2e\\src\\edit-ride.e2e-spec.ts:51:24)\nFrom: Task: Run it(\"editing a ride\") in control flow\n    at UserContext.<anonymous> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at handleError (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4244:11)\n    at process.onerror (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:2371:17)\n    at process.emit (events.js:210:5)\n    at process.emit (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\node_modules\\source-map-support\\source-map-support.js:439:21)\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\e2e\\src\\edit-ride.e2e-spec.ts:51:3)\n    at addSpecsToSuite (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\e2e\\src\\edit-ride.e2e-spec.ts:4:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Module.m._compile (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\ts-node\\src\\index.ts:439:23)\n    at Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Object.require.extensions.<computed> [as .ts] (c:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\ts-node\\src\\index.ts:442:12)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 164784:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1580140763396,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140763640,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140763640,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140763640,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 158097:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1580140763670,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/vendor.js 46776:40 \"ERROR\" TypeError: Cannot read property 'id' of undefined\n    at http://localhost:4200/main.js:4477:132\n    at Array.some (<anonymous>)\n    at http://localhost:4200/main.js:4477:98\n    at Array.filter (<anonymous>)\n    at MapSubscriber.project (http://localhost:4200/main.js:4477:69)\n    at MapSubscriber._next (http://localhost:4200/vendor.js:176546:35)\n    at MapSubscriber.next (http://localhost:4200/vendor.js:172051:18)\n    at MapSubscriber._next (http://localhost:4200/vendor.js:176552:26)\n    at MapSubscriber.next (http://localhost:4200/vendor.js:172051:18)\n    at http://localhost:4200/vendor.js:77916:79",
                "timestamp": 1580140776723,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 164784:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1580140777039,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140777275,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140777275,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 152291:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1580140777275,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/vendor.js 46776:40 \"ERROR\" TypeError: Cannot read property 'id' of undefined\n    at http://localhost:4200/main.js:4477:132\n    at Array.some (<anonymous>)\n    at http://localhost:4200/main.js:4477:98\n    at Array.filter (<anonymous>)\n    at MapSubscriber.project (http://localhost:4200/main.js:4477:69)\n    at MapSubscriber._next (http://localhost:4200/vendor.js:176546:35)\n    at MapSubscriber.next (http://localhost:4200/vendor.js:172051:18)\n    at MapSubscriber._next (http://localhost:4200/vendor.js:176552:26)\n    at MapSubscriber.next (http://localhost:4200/vendor.js:172051:18)\n    at http://localhost:4200/vendor.js:77916:79",
                "timestamp": 1580140783172,
                "type": ""
            }
        ],
        "screenShotFile": "00b6004f-003e-00c8-005c-009e00b60060.png",
        "timestamp": 1580140762567,
        "duration": 23752
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});

    };

    this.setTitle = function () {
        var title = $('.report-title').text();
        titleService.setTitle(title);
    };

    // is run after all test data has been prepared/loaded
    this.afterLoadingJobs = function () {
        this.sortSpecs();
        this.setTitle();
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    } else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.afterLoadingJobs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.afterLoadingJobs();
    }

}]);

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

//formats millseconds to h m s
app.filter('timeFormat', function () {
    return function (tr, fmt) {
        if(tr == null){
            return "NaN";
        }

        switch (fmt) {
            case 'h':
                var h = tr / 1000 / 60 / 60;
                return "".concat(h.toFixed(2)).concat("h");
            case 'm':
                var m = tr / 1000 / 60;
                return "".concat(m.toFixed(2)).concat("min");
            case 's' :
                var s = tr / 1000;
                return "".concat(s.toFixed(2)).concat("s");
            case 'hm':
            case 'h:m':
                var hmMt = tr / 1000 / 60;
                var hmHr = Math.trunc(hmMt / 60);
                var hmMr = hmMt - (hmHr * 60);
                if (fmt === 'h:m') {
                    return "".concat(hmHr).concat(":").concat(hmMr < 10 ? "0" : "").concat(Math.round(hmMr));
                }
                return "".concat(hmHr).concat("h ").concat(hmMr.toFixed(2)).concat("min");
            case 'hms':
            case 'h:m:s':
                var hmsS = tr / 1000;
                var hmsHr = Math.trunc(hmsS / 60 / 60);
                var hmsM = hmsS / 60;
                var hmsMr = Math.trunc(hmsM - hmsHr * 60);
                var hmsSo = hmsS - (hmsHr * 60 * 60) - (hmsMr*60);
                if (fmt === 'h:m:s') {
                    return "".concat(hmsHr).concat(":").concat(hmsMr < 10 ? "0" : "").concat(hmsMr).concat(":").concat(hmsSo < 10 ? "0" : "").concat(Math.round(hmsSo));
                }
                return "".concat(hmsHr).concat("h ").concat(hmsMr).concat("min ").concat(hmsSo.toFixed(2)).concat("s");
            case 'ms':
                var msS = tr / 1000;
                var msMr = Math.trunc(msS / 60);
                var msMs = msS - (msMr * 60);
                return "".concat(msMr).concat("min ").concat(msMs.toFixed(2)).concat("s");
        }

        return tr;
    };
});


function PbrStackModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;
    ctrl.convertTimestamp = convertTimestamp;
    ctrl.isValueAnArray = isValueAnArray;
    ctrl.toggleSmartStackTraceHighlight = function () {
        var inv = !ctrl.rootScope.showSmartStackTraceHighlight;
        ctrl.rootScope.showSmartStackTraceHighlight = inv;
    };
    ctrl.applySmartHighlight = function (line) {
        if ($rootScope.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return '';
    };
}


app.component('pbrStackModal', {
    templateUrl: "pbr-stack-modal.html",
    bindings: {
        index: '=',
        data: '='
    },
    controller: PbrStackModalController
});

function PbrScreenshotModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;

    /**
     * Updates which modal is selected.
     */
    this.updateSelectedModal = function (event, index) {
        var key = event.key; //try to use non-deprecated key first https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/keyCode
        if (key == null) {
            var keyMap = {
                37: 'ArrowLeft',
                39: 'ArrowRight'
            };
            key = keyMap[event.keyCode]; //fallback to keycode
        }
        if (key === "ArrowLeft" && this.hasPrevious) {
            this.showHideModal(index, this.previous);
        } else if (key === "ArrowRight" && this.hasNext) {
            this.showHideModal(index, this.next);
        }
    };

    /**
     * Hides the modal with the #oldIndex and shows the modal with the #newIndex.
     */
    this.showHideModal = function (oldIndex, newIndex) {
        const modalName = '#imageModal';
        $(modalName + oldIndex).modal("hide");
        $(modalName + newIndex).modal("show");
    };

}

app.component('pbrScreenshotModal', {
    templateUrl: "pbr-screenshot-modal.html",
    bindings: {
        index: '=',
        data: '=',
        next: '=',
        previous: '=',
        hasNext: '=',
        hasPrevious: '='
    },
    controller: PbrScreenshotModalController
});

app.factory('TitleService', ['$document', function ($document) {
    return {
        setTitle: function (title) {
            $document[0].title = title;
        }
    };
}]);


app.run(
    function ($rootScope, $templateCache) {
        //make sure this option is on by default
        $rootScope.showSmartStackTraceHighlight = true;
        
  $templateCache.put('pbr-screenshot-modal.html',
    '<div class="modal" id="imageModal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="imageModalLabel{{$ctrl.index}}" ng-keydown="$ctrl.updateSelectedModal($event,$ctrl.index)">\n' +
    '    <div class="modal-dialog modal-lg m-screenhot-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="imageModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="imageModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <img class="screenshotImage" ng-src="{{$ctrl.data.screenShotFile}}">\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <div class="pull-left">\n' +
    '                    <button ng-disabled="!$ctrl.hasPrevious" class="btn btn-default btn-previous" data-dismiss="modal"\n' +
    '                            data-toggle="modal" data-target="#imageModal{{$ctrl.previous}}">\n' +
    '                        Prev\n' +
    '                    </button>\n' +
    '                    <button ng-disabled="!$ctrl.hasNext" class="btn btn-default btn-next"\n' +
    '                            data-dismiss="modal" data-toggle="modal"\n' +
    '                            data-target="#imageModal{{$ctrl.next}}">\n' +
    '                        Next\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '                <a class="btn btn-primary" href="{{$ctrl.data.screenShotFile}}" target="_blank">\n' +
    '                    Open Image in New Tab\n' +
    '                    <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>\n' +
    '                </a>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

  $templateCache.put('pbr-stack-modal.html',
    '<div class="modal" id="modal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="stackModalLabel{{$ctrl.index}}">\n' +
    '    <div class="modal-dialog modal-lg m-stack-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="stackModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="stackModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <div ng-if="$ctrl.data.trace.length > 0">\n' +
    '                    <div ng-if="$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer" ng-repeat="trace in $ctrl.data.trace track by $index"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                    <div ng-if="!$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in $ctrl.data.trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div ng-if="$ctrl.data.browserLogs.length > 0">\n' +
    '                    <h5 class="modal-title">\n' +
    '                        Browser logs:\n' +
    '                    </h5>\n' +
    '                    <pre class="logContainer"><div class="browserLogItem"\n' +
    '                                                   ng-repeat="logError in $ctrl.data.browserLogs track by $index"><div><span class="label browserLogLabel label-default"\n' +
    '                                                                                                                             ng-class="{\'label-danger\': logError.level===\'SEVERE\', \'label-warning\': logError.level===\'WARNING\'}">{{logError.level}}</span><span class="label label-default">{{$ctrl.convertTimestamp(logError.timestamp)}}</span><div ng-repeat="messageLine in logError.message.split(\'\\\\n\') track by $index">{{ messageLine }}</div></div></div></pre>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <button class="btn btn-default"\n' +
    '                        ng-class="{active: $ctrl.rootScope.showSmartStackTraceHighlight}"\n' +
    '                        ng-click="$ctrl.toggleSmartStackTraceHighlight()">\n' +
    '                    <span class="glyphicon glyphicon-education black"></span> Smart Stack Trace\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

    });
