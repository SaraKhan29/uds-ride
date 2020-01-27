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
        "description": "registering user s8osharo|register Page Tests",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 15268,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": [
            "Expected 'The email address is already in use by another account.' to contain 'An email has been sent to your account for account verification. Kindly check your email.'."
        ],
        "trace": [
            "Error: Failed expectation\n    at C:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\e2e\\src\\register.e2e-spec.ts:32:55\n    at C:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\protractor\\built\\element.js:804:32\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Osama\\Desktop\\SE_project\\dev\\project16\\uds-ride-yaml\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284318019,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284318469,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284318470,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284318470,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284318549,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284318560,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyCFD2VqepyNei_vnMmcHkFZxjxh0unwmE4 - Failed to load resource: the server responded with a status of 400 ()",
                "timestamp": 1579284333974,
                "type": ""
            }
        ],
        "screenShotFile": "00c00060-009f-00b3-00ec-009900d500ae.png",
        "timestamp": 1579284314055,
        "duration": 19997
    },
    {
        "description": "registering already registered user|register Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15268,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284337683,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284337942,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284337943,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284337943,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284338004,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284338012,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyCFD2VqepyNei_vnMmcHkFZxjxh0unwmE4 - Failed to load resource: the server responded with a status of 400 ()",
                "timestamp": 1579284356373,
                "type": ""
            }
        ],
        "screenShotFile": "007800bf-0019-00c2-00a5-009700ed0089.png",
        "timestamp": 1579284334529,
        "duration": 21905
    },
    {
        "description": "verified user logged in|Login Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15268,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284357141,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284357394,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284357394,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284357394,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284357428,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284357434,
                "type": ""
            }
        ],
        "screenShotFile": "00650091-005b-00fc-00eb-0086005d007d.png",
        "timestamp": 1579284356836,
        "duration": 15931
    },
    {
        "description": "non-verified user not logged in|Login Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15268,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284373454,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284373697,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284373697,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284373698,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284373726,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284373731,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyCFD2VqepyNei_vnMmcHkFZxjxh0unwmE4 - Failed to load resource: the server responded with a status of 400 ()",
                "timestamp": 1579284389048,
                "type": ""
            }
        ],
        "screenShotFile": "007e00de-002e-004c-0094-000500590090.png",
        "timestamp": 1579284373148,
        "duration": 15962
    },
    {
        "description": "verified user wrong password not logged in|Login Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15268,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284389805,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284390044,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284390044,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284390045,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284390072,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284390078,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyCFD2VqepyNei_vnMmcHkFZxjxh0unwmE4 - Failed to load resource: the server responded with a status of 400 ()",
                "timestamp": 1579284405434,
                "type": ""
            }
        ],
        "screenShotFile": "001b00d6-00fa-0082-0083-006600a200e2.png",
        "timestamp": 1579284389501,
        "duration": 15995
    },
    {
        "description": "forgot password for invalid user.|ForgotPassword Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15268,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284409235,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284409471,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284409472,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284409472,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284409502,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284409508,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?key=AIzaSyCFD2VqepyNei_vnMmcHkFZxjxh0unwmE4 - Failed to load resource: the server responded with a status of 400 ()",
                "timestamp": 1579284418413,
                "type": ""
            }
        ],
        "screenShotFile": "00ce0070-0004-007b-0073-00d100f800a7.png",
        "timestamp": 1579284405884,
        "duration": 12594
    },
    {
        "description": "receiving forgot password email for valid user.|ForgotPassword Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15268,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284422547,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284422784,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284422785,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284422785,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284422809,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284422814,
                "type": ""
            }
        ],
        "screenShotFile": "00a40017-00c5-000a-0033-00c70007002a.png",
        "timestamp": 1579284418871,
        "duration": 12975
    },
    {
        "description": "registering user s8osharo|register Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 12940,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284674254,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284674577,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284674578,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284674578,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284674661,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284674672,
                "type": ""
            }
        ],
        "screenShotFile": "001b00fd-00eb-008c-0015-00ad004a005e.png",
        "timestamp": 1579284670335,
        "duration": 20031
    },
    {
        "description": "registering already registered user|register Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 12940,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284694167,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284694411,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284694412,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284694412,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284694464,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284694472,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyCFD2VqepyNei_vnMmcHkFZxjxh0unwmE4 - Failed to load resource: the server responded with a status of 400 ()",
                "timestamp": 1579284712786,
                "type": ""
            }
        ],
        "screenShotFile": "0002001c-008d-00a4-0013-00d200ec00ed.png",
        "timestamp": 1579284690793,
        "duration": 22049
    },
    {
        "description": "verified user logged in|Login Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 12940,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284713525,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284713775,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284713775,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284713776,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284713810,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284713819,
                "type": ""
            }
        ],
        "screenShotFile": "00f40074-00c6-00ce-00eb-00b200fd007b.png",
        "timestamp": 1579284713210,
        "duration": 15956
    },
    {
        "description": "non-verified user not logged in|Login Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 12940,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284729855,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284730087,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284730087,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284730087,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284730116,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284730120,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyCFD2VqepyNei_vnMmcHkFZxjxh0unwmE4 - Failed to load resource: the server responded with a status of 400 ()",
                "timestamp": 1579284745433,
                "type": ""
            }
        ],
        "screenShotFile": "00570060-00bd-00cc-005a-000200f90037.png",
        "timestamp": 1579284729550,
        "duration": 15947
    },
    {
        "description": "verified user wrong password not logged in|Login Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 12940,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284746202,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284746450,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284746451,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284746451,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284746480,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284746484,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyCFD2VqepyNei_vnMmcHkFZxjxh0unwmE4 - Failed to load resource: the server responded with a status of 400 ()",
                "timestamp": 1579284761866,
                "type": ""
            }
        ],
        "screenShotFile": "009c00e4-0097-00cf-00e0-00f9009b0096.png",
        "timestamp": 1579284745862,
        "duration": 16069
    },
    {
        "description": "forgot password for invalid user.|ForgotPassword Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 12940,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284765724,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284765964,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284765964,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284765964,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284765992,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284765997,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?key=AIzaSyCFD2VqepyNei_vnMmcHkFZxjxh0unwmE4 - Failed to load resource: the server responded with a status of 400 ()",
                "timestamp": 1579284774866,
                "type": ""
            }
        ],
        "screenShotFile": "003100ef-00c7-0017-00da-005a002200a3.png",
        "timestamp": 1579284762335,
        "duration": 12592
    },
    {
        "description": "receiving forgot password email for valid user.|ForgotPassword Page Tests",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 12940,
        "browser": {
            "name": "chrome",
            "version": "79.0.3945.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 162575:8 \"\\nIt looks like you're using the development build of the Firebase JS SDK.\\nWhen deploying Firebase apps to production, it is advisable to only import\\nthe individual SDK components you intend to use.\\n\\nFor the module builds, these are available in the following manner\\n(replace \\u003CPACKAGE> with the name of a component - i.e. auth, database, etc):\\n\\nCommonJS Modules:\\nconst firebase = require('firebase/app');\\nrequire('firebase/\\u003CPACKAGE>');\\n\\nES Modules:\\nimport firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\\nTypescript:\\nimport * as firebase from 'firebase/app';\\nimport 'firebase/\\u003CPACKAGE>';\\n\"",
                "timestamp": 1579284778817,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.styleLightContent, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284779078,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling StatusBar.backgroundColorByHexString, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284779078,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 150212:20 \"Native: tried calling SplashScreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator\"",
                "timestamp": 1579284779078,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-content padding>'\\n\\nWith:\\n'\\u003Cion-content class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284779108,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://localhost:4200/vendor.js 155936:20 \"[DEPRECATED][CSS] Ionic CSS attributes are deprecated.\\nReplace:\\n'\\u003Cion-footer padding>'\\n\\nWith:\\n'\\u003Cion-footer class=\\\"ion-padding\\\">'\\n      \"",
                "timestamp": 1579284779114,
                "type": ""
            }
        ],
        "screenShotFile": "00600019-002a-003c-0036-003700620070.png",
        "timestamp": 1579284775292,
        "duration": 12959
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
