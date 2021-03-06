/*
 * SonarQube, open source software quality management tool.
 * Copyright (C) 2008-2014 SonarSource
 * mailto:contact AT sonarsource DOT com
 *
 * SonarQube is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * SonarQube is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
/* globals casper: false */

var lib = require('../lib'),
    testName = lib.testName('Process');


lib.initMessages();
lib.configureCasper();


casper.test.begin(testName('One Timeout'), function (test) {
  casper
      .start(lib.buildUrl('nav'), function () {
        lib.setDefaultViewport();
      })

      .then(function () {
        casper.evaluate(function () {
          jQuery.get(baseUrl + '/api/generic/long');
        });
      })

      .then(function () {
        casper.waitForSelector('.process-spinner.shown');
      })

      .then(function () {
        casper.waitWhileSelector('.process-spinner.shown');
      })

      .then(function () {
        test.assert(true, 'All process spinners disappeared');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Several Timeouts'), 1, function (test) {
  casper
      .start(lib.buildUrl('nav'), function () {
        lib.setDefaultViewport();
      })

      .then(function () {
        casper.evaluate(function () {
          setTimeout(function() { jQuery.get(baseUrl + '/api/generic/long'); }, 0);
          setTimeout(function() { jQuery.get(baseUrl + '/api/generic/long'); }, 500);
          setTimeout(function() { jQuery.get(baseUrl + '/api/generic/long'); }, 1000);
        });
      })

      .then(function () {
        casper.waitForSelector('.process-spinner.shown');
      })

      .then(function () {
        lib.waitWhileElementCount('.process-spinner.shown', 1);
      })

      .then(function () {
        test.assertDoesntExist('.process-spinner.shown', 'All process spinners disappeared');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Failed'), 1, function (test) {
  casper
      .start(lib.buildUrl('nav'), function () {
        lib.setDefaultViewport();
      })

      .then(function () {
        casper.evaluate(function () {
          setTimeout(function() { jQuery.get(baseUrl + '/api/generic/long'); }, 0);
          setTimeout(function() { jQuery.get(baseUrl + '/api/generic/failed'); }, 0);
        });
      })

      .then(function () {
        casper.waitForSelector('.process-spinner.process-spinner-failed');
      })

      .then(function () {
        lib.waitWhileElementCount('.process-spinner.shown', 1);
      })

      .then(function () {
        test.assertDoesntExist('.process-spinner.shown', 'All process spinners disappeared');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Close Failed'), 2, function (test) {
  casper
      .start(lib.buildUrl('nav'), function () {
        lib.setDefaultViewport();
      })

      .then(function () {
        casper.evaluate(function () {
          jQuery.get(baseUrl + '/api/generic/failed');
        });
      })

      .then(function () {
        casper.waitForSelector('.process-spinner.process-spinner-failed');
      })

      .then(function () {
        test.assertExists('.process-spinner-close');
        casper.click('.process-spinner-close');
      })

      .then(function () {
        test.assertDoesntExist('.process-spinner.shown', 'All process spinners disappeared');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});
