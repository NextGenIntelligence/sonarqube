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
/* global casper:false */

var lib = require('../lib'),
    testName = lib.testName('Quality Profiles');

lib.initMessages();
lib.changeWorkingDirectory('quality-profiles');
lib.configureCasper();


casper.test.begin(testName('Should Show List'), 9, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        test.assertElementCount('.js-list .list-group-item', 5);
        test.assertSelectorContains('.js-list .list-group-item', 'Sonar way');
        test.assertSelectorContains('.js-list .list-group-item', 'PSR-2');

        test.assertElementCount('.js-list-language', 4);
        test.assertSelectorContains('.js-list-language', 'Java');
        test.assertSelectorContains('.js-list-language', 'JavaScript');
        test.assertSelectorContains('.js-list-language', 'PHP');
        test.assertSelectorContains('.js-list-language', 'Python');

        test.assertElementCount('.js-list .badge', 4);
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Should Filter List By Language'), 15, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        test.assertElementCount('.js-list .list-group-item', 5);
        test.assertVisible('.js-list .list-group-item[data-key="java-sonar-way-67887"]');
        test.assertVisible('.js-list .list-group-item[data-key="js-sonar-way-71566"]');

        test.assertElementCount('.js-list-language', 4);
        test.assertVisible('.js-list-language[data-language="java"]');
        test.assertVisible('.js-list-language[data-language="js"]');
      })

      .then(function () {
        test.assertExists('#quality-profiles-filter-by-language');
        casper.click('.js-filter-by-language[data-language="js"]');
      })

      .then(function () {
        test.assertNotVisible('.js-list .list-group-item[data-key="java-sonar-way-67887"]');
        test.assertVisible('.js-list .list-group-item[data-key="js-sonar-way-71566"]');
        test.assertNotVisible('.js-list-language[data-language="java"]');
        test.assertVisible('.js-list-language[data-language="js"]');
      })

      .then(function () {
        casper.click('.js-filter-by-language:nth-child(1)');
      })

      .then(function () {
        test.assertVisible('.js-list .list-group-item[data-key="java-sonar-way-67887"]');
        test.assertVisible('.js-list .list-group-item[data-key="js-sonar-way-71566"]');
        test.assertVisible('.js-list-language[data-language="java"]');
        test.assertVisible('.js-list-language[data-language="js"]');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Should Show Details'), 10, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json',
            { data: { qprofile: 'java-sonar-way-67887', activation: 'true' }});
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json', {
          data: { profileKey: 'java-sonar-way-67887' }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        casper.click('.js-list .list-group-item[data-key="java-sonar-way-67887"]');
        casper.waitForSelector('.search-navigator-header-component');
      })

      .then(function () {
        test.assertElementCount('.js-list .list-group-item.active', 1);
        test.assertSelectorContains('.js-list .list-group-item.active', 'Sonar way');

        test.assertSelectorContains('.search-navigator-workspace-header', 'Sonar way');
        test.assertSelectorContains('.search-navigator-workspace-header', 'Java');
        test.assertExists('#quality-profile-backup');
        test.assertDoesntExist('#quality-profile-rename');
        test.assertDoesntExist('#quality-profile-copy');
        test.assertDoesntExist('#quality-profile-delete');
        test.assertDoesntExist('#quality-profile-set-as-default');
        test.assertDoesntExist('#quality-profile-change-parent');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Should Show Details', 'Admin'), 10, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json',
            { data: { qprofile: 'java-sonar-way-67887', activation: 'true' }});
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json', {
          data: { profileKey: 'java-sonar-way-67887' }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        casper.click('.js-list .list-group-item[data-key="java-sonar-way-67887"]');
        casper.waitForSelector('.search-navigator-header-component');
      })

      .then(function () {
        test.assertElementCount('.js-list .list-group-item.active', 1);
        test.assertSelectorContains('.js-list .list-group-item.active', 'Sonar way');

        test.assertSelectorContains('.search-navigator-workspace-header', 'Sonar way');
        test.assertSelectorContains('.search-navigator-workspace-header', 'Java');
        test.assertExists('#quality-profile-backup');
        test.assertExists('#quality-profile-rename');
        test.assertExists('#quality-profile-copy');
        test.assertDoesntExist('#quality-profile-delete');
        test.assertDoesntExist('#quality-profile-set-as-default');
        test.assertExists('#quality-profile-change-parent');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Should Show Inheritance Details'), 10, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search-inheritance.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance-plus.json', {
          data: { profileKey: 'java-inherited-profile-85155' }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        casper.click('.js-list .list-group-item[data-key="java-inherited-profile-85155"]');
        casper.waitForSelector('.search-navigator-header-component');
      })

      .then(function () {
        test.assertElementCount('#quality-profile-ancestors li', 1);
        test.assertSelectorContains('#quality-profile-ancestors', 'Sonar way');
        test.assertSelectorContains('#quality-profile-ancestors', '161');

        test.assertElementCount('#quality-profile-inheritance-current', 1);
        test.assertSelectorContains('#quality-profile-inheritance-current', 'Inherited Profile');
        test.assertSelectorContains('#quality-profile-inheritance-current', '163');
        test.assertSelectorContains('#quality-profile-inheritance-current', '7');

        test.assertElementCount('#quality-profile-children li', 1);
        test.assertSelectorContains('#quality-profile-children', 'Second Level Inherited Profile');
        test.assertSelectorContains('#quality-profile-children', '165');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Should Show Selected Projects'), 2, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/projects?key=php-psr-2-46772', 'projects.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        casper.click('.js-list .list-group-item[data-key="php-psr-2-46772"]');
        casper.waitForSelector('#quality-profile-projects');
      })

      .then(function () {
        lib.waitForElementCount('#quality-profile-projects .select-list-list li', 2);
      })

      .then(function () {
        test.assertSelectorContains('#quality-profile-projects .select-list-list li', 'CSS');
        test.assertSelectorContains('#quality-profile-projects .select-list-list li', 'http-request-parent');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Should Move Between Profiles'), 1, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search-inheritance.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        this.rulesMock = lib.mockRequestFromFile('/api/rules/search', 'rules.json',
            { data: { qprofile: 'java-inherited-profile-85155', activation: 'true' }});
        this.inheritanceMock = lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance-plus.json');
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        casper.click('.js-list .list-group-item[data-key="java-inherited-profile-85155"]');
        casper.waitForSelector('#quality-profile-ancestors');
      })

      .then(function () {
        lib.clearRequestMock(this.rulesMock);
        lib.clearRequestMock(this.inheritanceMock);
        lib.mockRequestFromFile('/api/rules/search', 'rules.json',
            { data: { qprofile: 'java-sonar-way-67887', activation: 'true' }});
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');

        casper.click('#quality-profile-ancestors .js-profile[data-key="java-sonar-way-67887"]');
        casper.waitForSelectorTextChange('.search-navigator-header-component');
      })

      .then(function () {
        test.assertSelectorContains('.search-navigator-header-component', 'Sonar way');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Copy Profile'), 5, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
        lib.mockRequestFromFile('/api/qualityprofiles/copy', 'copy.json', {
          data: { fromKey: 'java-sonar-way-67887', toName: 'Copied Profile' }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
          jQuery.ajaxSetup({ dataType: 'json' });
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        test.assertElementCount('.js-list .list-group-item', 5);
        casper.click('.js-list .list-group-item[data-key="java-sonar-way-67887"]');
        casper.waitForSelector('#quality-profile-copy');
      })

      .then(function () {
        casper.click('#quality-profile-copy');
        casper.waitForSelector('.modal');
      })

      .then(function () {
        casper.evaluate(function () {
          jQuery('#copy-profile-name').val('Copied Profile');
        });
        casper.click('#copy-profile-submit');
        casper.waitForSelectorTextChange('.search-navigator-header-component');
      })

      .then(function () {
        test.assertElementCount('.js-list .list-group-item', 6);
        test.assertSelectorContains('.js-list .list-group-item.active', 'Copied Profile');
        test.assertSelectorContains('.search-navigator-header-component', 'Copied Profile');
        test.assertSelectorContains('.search-navigator-header-component', 'Java');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Rename Profile'), 2, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        this.searchMock = lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
        lib.mockRequest('/api/qualityprofiles/rename', '{}', {
          data: { key: 'java-sonar-way-67887', name: 'Renamed Profile' }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
          jQuery.ajaxSetup({ dataType: 'json' });
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        casper.click('.js-list .list-group-item[data-key="java-sonar-way-67887"]');
        casper.waitForSelector('#quality-profile-rename');
      })

      .then(function () {
        casper.click('#quality-profile-rename');
        casper.waitForSelector('.modal');
      })

      .then(function () {
        lib.clearRequestMock(this.searchMock);
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search-renamed.json');

        casper.evaluate(function () {
          jQuery('#rename-profile-name').val('Renamed Profile');
        });
        casper.click('#rename-profile-submit');
        casper.waitForSelectorTextChange('.search-navigator-header-component');
      })

      .then(function () {
        test.assertSelectorContains('.js-list .list-group-item.active', 'Renamed Profile');
        test.assertSelectorContains('.search-navigator-header-component', 'Renamed Profile');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Make Profile Default'), 4, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        this.searchMock = lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
        lib.mockRequest('/api/qualityprofiles/set_default', '{}', {
          data: { profileKey: 'php-psr-2-46772' }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
          jQuery.ajaxSetup({ dataType: 'json' });
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        test.assertDoesntExist('.js-list .list-group-item[data-key="php-psr-2-46772"] .badge');
        test.assertExists('.js-list .list-group-item[data-key="php-sonar-way-10778"] .badge');
        casper.click('.js-list .list-group-item[data-key="php-psr-2-46772"]');
        casper.waitForSelector('#quality-profile-set-as-default');
      })

      .then(function () {
        lib.clearRequestMock(this.searchMock);
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search-another-default.json');

        casper.click('#quality-profile-set-as-default');
        casper.waitWhileSelector('.js-list .list-group-item[data-key="php-sonar-way-10778"] .badge');
      })

      .then(function () {
        test.assertDoesntExist('#quality-profile-set-as-default');
        test.assertExists('.js-list .list-group-item[data-key="php-psr-2-46772"] .badge');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Delete Profile'), 2, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        this.searchMock = lib.mockRequestFromFile('/api/qualityprofiles/search', 'search-with-copy.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
        lib.mockRequest('/api/qualityprofiles/delete', '{}', {
          data: { profileKey: 'java-copied-profile-11711' }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
          jQuery.ajaxSetup({ dataType: 'json' });
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        test.assertElementCount('.js-list .list-group-item', 6);
        casper.click('.js-list .list-group-item[data-key="java-copied-profile-11711"]');
        casper.waitForSelector('#quality-profile-delete');
      })

      .then(function () {
        casper.click('#quality-profile-delete');
        casper.waitForSelector('.modal');
      })

      .then(function () {
        lib.clearRequestMock(this.searchMock);
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');

        casper.click('#delete-profile-submit');
        lib.waitForElementCount('.js-list .list-group-item', 5);
      })

      .then(function () {
        test.assertSelectorDoesntContain('.js-list .list-group-item', 'Copied Profile');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Create Profile'), 2, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        this.searchMock = lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/qualityprofiles/importers', 'importers-empty.json');
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
          jQuery.ajaxSetup({ dataType: 'json' });
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        test.assertElementCount('.js-list .list-group-item', 5);
        casper.click('#quality-profiles-create');
        casper.waitForSelector('.modal');
      })

      .then(function () {
        lib.clearRequestMock(this.searchMock);
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search-with-copy.json');

        casper.evaluate(function () {
          jQuery('#create-profile-name').val('Copied Profile');
          jQuery('#create-profile-language').val('java');
        });
        casper.click('#create-profile-submit');
        lib.waitForElementCount('.js-list .list-group-item', 6);
      })

      .then(function () {
        test.assert(true);
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Restore Profile'), 2, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        this.searchMock = lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
          jQuery.ajaxSetup({ dataType: 'json' });
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        test.assertElementCount('.js-list .list-group-item', 5);
        casper.click('#quality-profiles-restore');
        casper.waitForSelector('.modal');
      })

      .then(function () {
        casper.click('#restore-profile-submit');
        lib.waitForElementCount('.js-list .list-group-item', 6);
      })

      .then(function () {
        test.assert(true);
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Importers'), 6, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/qualityprofiles/importers', 'importers.json');
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
          jQuery.ajaxSetup({ dataType: 'json' });
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        casper.click('#quality-profiles-create');
        casper.waitForSelector('.modal');
      })

      .then(function () {
        test.assertVisible('.js-importer[data-key="pmd"]');
        test.assertVisible('.js-importer[data-key="random"]');

        casper.evaluate(function () {
          jQuery('#create-profile-language').val('js').change();
        });
      })

      .then(function () {
        test.assertNotVisible('.js-importer[data-key="pmd"]');
        test.assertVisible('.js-importer[data-key="random"]');

        casper.evaluate(function () {
          jQuery('#create-profile-language').val('py').change();
        });
      })

      .then(function () {
        test.assertNotVisible('.js-importer[data-key="pmd"]');
        test.assertNotVisible('.js-importer[data-key="random"]');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Restore Built-in Profiles'), 2, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        this.searchMock = lib.mockRequestFromFile('/api/qualityprofiles/search', 'search-modified.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
        lib.mockRequest('/api/qualityprofiles/restore_built_in', '{}', {
          data: { language: 'java' }
        });
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
          jQuery.ajaxSetup({ dataType: 'json' });
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        test.assertElementCount('.js-list .list-group-item', 1);
        casper.click('#quality-profiles-restore-built-in');
        casper.waitForSelector('.modal');
      })

      .then(function () {
        lib.clearRequestMock(this.searchMock);
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');

        casper.evaluate(function () {
          jQuery('#restore-built-in-profiles-language').val('java');
        });
        casper.click('#restore-built-in-profiles-submit');
        lib.waitForElementCount('.js-list .list-group-item', 5);
      })

      .then(function () {
        test.assertSelectorContains('.js-list .list-group-item', 'Sonar way');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Change Parent'), 1, function (test) {
  casper
      .start(lib.buildUrl('profiles'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        this.searchMock = lib.mockRequestFromFile('/api/qualityprofiles/search', 'search-change-parent.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        this.inheritanceMock = lib.mockRequestFromFile('/api/qualityprofiles/inheritance',
            'inheritance-change-parent.json');
        lib.mockRequest('/api/qualityprofiles/change_parent', '{}', {
          data: { profileKey: 'java-inherited-profile-85155', parentKey: 'java-another-profile-00609' }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
          jQuery.ajaxSetup({ dataType: 'json' });
        });
      })

      .then(function () {
        casper.waitForSelector('.js-list .list-group-item');
      })

      .then(function () {
        casper.click('.js-list .list-group-item[data-key="java-inherited-profile-85155"]');
        casper.waitForSelector('#quality-profile-change-parent');
      })

      .then(function () {
        casper.click('#quality-profile-change-parent');
        casper.waitForSelector('.modal');
      })

      .then(function () {
        lib.clearRequestMock(this.searchMock);
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search-changed-parent.json');
        lib.clearRequestMock(this.inheritanceMock);
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance-changed-parent.json');

        casper.evaluate(function () {
          jQuery('#change-profile-parent').val('java-another-profile-00609');
        });
        casper.click('#change-profile-parent-submit');
        casper.waitForSelectorTextChange('#quality-profile-ancestors');
      })

      .then(function () {
        test.assertSelectorContains('#quality-profile-ancestors', 'Another Profile');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Permalink'), 9, function (test) {
  casper
      .start(lib.buildUrl('profiles#show?key=java-sonar-way-67887'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user-admin.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('#quality-profile-rename');
      })

      .then(function () {
        test.assertElementCount('.js-list .list-group-item.active', 1);
        test.assertSelectorContains('.js-list .list-group-item.active', 'Sonar way');

        test.assertSelectorContains('.search-navigator-workspace-header', 'Sonar way');
        test.assertSelectorContains('.search-navigator-workspace-header', 'Java');
        test.assertExists('#quality-profile-backup');
        test.assertExists('#quality-profile-rename');
        test.assertExists('#quality-profile-copy');
        test.assertDoesntExist('#quality-profile-delete');
        test.assertDoesntExist('#quality-profile-set-as-default');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Changelog'), 22, function (test) {
  casper
      .start(lib.buildUrl('profiles#show?key=java-sonar-way-67887'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
        lib.mockRequestFromFile('/api/qualityprofiles/changelog', 'changelog2.json', {
          data: { p: '2', profileKey: 'java-sonar-way-67887' }
        });
        lib.mockRequestFromFile('/api/qualityprofiles/changelog', 'changelog.json', {
          data: { profileKey: 'java-sonar-way-67887' }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('#quality-profile-changelog-form-submit');
      })

      .then(function () {
        test.assertDoesntExist('.js-show-more-changelog');

        casper.click('#quality-profile-changelog-form-submit');
        casper.waitForSelector('#quality-profile-changelog table');
      })

      .then(function () {
        test.assertExists('.js-show-more-changelog');
        test.assertElementCount('#quality-profile-changelog tbody tr', 2);

        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(1)', 'April 13 2015');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(1)', 'System');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(1)', 'ACTIVATED');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(1)', 'Synchronisation should not');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(1)', 'BLOCKER');

        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(2)', 'April 13 2015');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(2)', 'Anakin Skywalker');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(2)', 'ACTIVATED');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(2)', 'Double.longBitsToDouble');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(2)', 'threshold');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(2)', '3');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(2)', 'emptyParameter');

        casper.click('.js-show-more-changelog');
        lib.waitForElementCount('#quality-profile-changelog tbody tr', 3);
      })

      .then(function () {
        test.assertDoesntExist('.js-show-changelog');
        test.assertDoesntExist('.js-show-more-changelog');

        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(3)', 'April 13 2015');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(3)', 'System');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(3)', 'DEACTIVATED');
        test.assertSelectorContains('#quality-profile-changelog tbody tr:nth-child(3)', 'runFinalizersOnExit');
      })

      .then(function () {
        casper.click('.js-hide-changelog');
        test.assertDoesntExist('#quality-profile-changelog tbody tr');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Changelog Permalink'), 2, function (test) {
  casper
      .start(lib.buildUrl('profiles#changelog?since=2015-03-25&key=java-sonar-way-67887&to=2015-03-26'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
        lib.mockRequestFromFile('/api/qualityprofiles/changelog', 'changelog2.json', {
          data: {
            p: '2',
            since: '2015-03-25',
            to: '2015-03-26',
            profileKey: 'java-sonar-way-67887'
          }
        });
        lib.mockRequestFromFile('/api/qualityprofiles/changelog', 'changelog.json', {
          data: {
            since: '2015-03-25',
            to: '2015-03-26',
            profileKey: 'java-sonar-way-67887'
          }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('.js-show-more-changelog');
      })

      .then(function () {
        test.assertElementCount('#quality-profile-changelog tbody tr', 2);

        casper.click('.js-show-more-changelog');
        lib.waitForElementCount('#quality-profile-changelog tbody tr', 3);
      })

      .then(function () {
        test.assertDoesntExist('.js-show-more-changelog');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Comparison'), 12, function (test) {
  casper
      .start(lib.buildUrl('profiles#show?key=java-sonar-way-67887'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search-with-copy.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
        lib.mockRequestFromFile('/api/qualityprofiles/compare', 'compare.json', {
          data: { leftKey: 'java-sonar-way-67887', rightKey: 'java-copied-profile-11711' }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('#quality-profile-comparison-form-submit');
      })

      .then(function () {
        test.assertElementCount('#quality-profile-comparison-with-key option', 1);
        casper.click('#quality-profile-comparison-form-submit');
        casper.waitForSelector('#quality-profile-comparison table');
      })

      .then(function () {
        test.assertElementCount('.js-comparison-in-left', 2);
        test.assertElementCount('.js-comparison-in-right', 2);
        test.assertElementCount('.js-comparison-modified', 2);

        test.assertSelectorContains('.js-comparison-in-left', '".equals()" should not be used to test');
        test.assertSelectorContains('.js-comparison-in-left', '"@Override" annotation should be used on');

        test.assertSelectorContains('.js-comparison-in-right', '"ConcurrentLinkedQueue.size()" should not be used');
        test.assertSelectorContains('.js-comparison-in-right', '"compareTo" results should not be checked');

        test.assertSelectorContains('.js-comparison-modified', 'Control flow statements');
        test.assertSelectorContains('.js-comparison-modified', '"Cloneables" should implement "clone"');
        test.assertSelectorContains('.js-comparison-modified', 'max: 5');
        test.assertSelectorContains('.js-comparison-modified', 'max: 3');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});


casper.test.begin(testName('Comparison Permalink'), 4, function (test) {
  casper
      .start(lib.buildUrl('profiles#compare?key=java-sonar-way-67887&withKey=java-copied-profile-11711'), function () {
        lib.setDefaultViewport();

        lib.mockRequestFromFile('/api/users/current', 'user.json');
        lib.mockRequestFromFile('/api/qualityprofiles/search', 'search-with-copy.json');
        lib.mockRequestFromFile('/api/qualityprofiles/exporters', 'exporters.json');
        lib.mockRequestFromFile('/api/languages/list', 'languages.json');
        lib.mockRequestFromFile('/api/rules/search', 'rules.json');
        lib.mockRequestFromFile('/api/qualityprofiles/inheritance', 'inheritance.json');
        lib.mockRequestFromFile('/api/qualityprofiles/compare', 'compare.json', {
          data: { leftKey: 'java-sonar-way-67887', rightKey: 'java-copied-profile-11711' }
        });
      })

      .then(function () {
        casper.evaluate(function () {
          require(['/js/quality-profiles/app.js']);
        });
      })

      .then(function () {
        casper.waitForSelector('#quality-profile-comparison table');
      })

      .then(function () {
        test.assertElementCount('#quality-profile-comparison-with-key option', 1);
        test.assertElementCount('.js-comparison-in-left', 2);
        test.assertElementCount('.js-comparison-in-right', 2);
        test.assertElementCount('.js-comparison-modified', 2);
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});
