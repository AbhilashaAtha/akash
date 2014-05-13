/**
 * Mock the api responses.
 *
 * Uses to intercept request to the api and set predefined responses
 *
 */

(function() {
  'use strict';

  angular.module('oepMocked', ['oep', 'ngMockE2E', 'oep.fixtures', 'eop.card.services']).

  run(['$httpBackend', 'OEP_FIXTURES', '$window', 'eopReportCardApi',
    function(httpBackend, fixtures, window, reportCardApi) {
      var users = fixtures.users, // List of user info,
        suggestions = [],
        chrisId = null, // Id of Chris, our logged in user.
        _ = window._;

      // Login
      httpBackend.whenGET(fixtures.url.user).respond(function() {
        if (!chrisId) {
          return [200, fixtures.newChris];
        } else {
          return [200, fixtures.chris(users[chrisId])];
        }
      });

      // Updating logged user's info
      httpBackend.whenPUT(fixtures.url.user).respond(function(_, __, rawData) {
        var data = JSON.parse(rawData);

        chrisId = data.id;
        fixtures.newChris.name = data.name;

        data.email = fixtures.newChris.email;
        data.gravatar = fixtures.gravatar;
        if (!data.services) {
          data.services = {};
        }

        users[data.id] = data;
        return [200, null];
      });

      // Users info
      httpBackend.whenGET(fixtures.url.users).respond(function(m, url) {
        var match = fixtures.url.users.exec(url),
          id = match ? match[1] : null;

        if (!id || !users[id]) {
          return [404, fixtures.notFound];
        } else {
          return [200, users[id]];
        }
      });

      // Code school id validation
      httpBackend.whenGET(fixtures.url.codeSchoolCheck).respond(function(m, url) {
        var match = fixtures.url.codeSchoolCheck.exec(url),
          id = match ? match[1] : null;

        if (!id) {
          return [404, fixtures.notFound];
        }

        console.log('Mocking calls to code school...');
        if (fixtures.profiles.codeSchool[id]) {
          return [200, {
            exist: true
          }];
        } else {
          console.log(
            'The only valid code school ids are: ' +
            _.keys(fixtures.profiles.codeSchool).join(', ')
          );
          return [404, fixtures.notFound];
        }
      });

      // Code School profile
      httpBackend.whenJSONP(fixtures.url.codeSchool).respond(function(m, url) {
        var match = fixtures.url.codeSchool.exec(url),
          id = match ? match[1] : null;

        if (!id) {
          return [404, fixtures.notFound];
        }

        console.log('Mocking calls to code school...');
        if (fixtures.profiles.codeSchool[id]) {
          return [200, fixtures.profiles.codeSchool[id]];
        } else {
          console.log(
            'The only valid code school ids are: ' +
            _.keys(fixtures.profiles.codeSchool).join(', ')
          );
          return [404, fixtures.notFound];
        }

      });

      // Request to update badges
      httpBackend.whenPOST(fixtures.url.updateBadges).respond(function(m, url) {
        var match = fixtures.url.updateBadges.exec(url),
          id = match ? match[1] : null;

        if (!id || !users[id]) {
          return [404, fixtures.notFound];
        }

        if (
          users[id].services &&
          users[id].services.codeSchool &&
          users[id].services.codeSchool.id &&
          fixtures.profiles.codeSchool[users[id].services.codeSchool.id]
        ) {
          users[id].services.codeSchool = reportCardApi.consolidate.codeSchool(
            fixtures.profiles.codeSchool[users[id].services.codeSchool.id]
          );
        }

        if (
          users[id].services &&
          users[id].services.treeHouse &&
          users[id].services.treeHouse.id &&
          fixtures.profiles.treeHouse[users[id].services.treeHouse.id]
        ) {
          users[id].services.treeHouse = reportCardApi.consolidate.treeHouse(
            fixtures.profiles.treeHouse[users[id].services.treeHouse.id]
          );
        }

        return [200, users[id].services];

      });

      // Ranks
      httpBackend.whenGET(fixtures.url.ranks).respond(function(m, url) {
        var match = fixtures.url.ranks.exec(url),
          sortBy = match ? match[1] : null,
          services = _.map(users, function(user) {
            var s = _.cloneDeep(user.services),
              score = 0,
              totalBadges = 0;

            if (s.codeSchool && s.codeSchool.badges) {
              totalBadges += s.codeSchool.badges.length;
            }

            if (s.treeHouse) {
              if (s.treeHouse.badges) {
                totalBadges += s.treeHouse.badges.length;
              }
              if (s.treeHouse.points) {
                score += s.treeHouse.points;
              }
            }

            s.id = user.id;
            s.name = user.name;
            s.score = score;
            s.totalBadges = totalBadges;
            return s;
          }),
          sort;

        switch (sortBy) {
        case 'treeHouse':
          sort = function(s) {
            if (s.treeHouse && s.treeHouse.badges) {
              return -s.treeHouse.badges.length;
            } else {
              return 0;
            }
          };
          break;
        case 'codeSchool':
          sort = function(s) {
            if (s.codeSchool && s.codeSchool.badges) {
              return -s.codeSchool.badges.length;
            } else {
              return 0;
            }
          };
          break;
        default:
          sort = function(s) {
            return -s.score;
          };
          break;
        }

        return [200, _.sortBy(services, sort)];
      });

      // Suggestions list
      httpBackend.whenGET(fixtures.url.suggestions).respond({
        suggestions: suggestions,
        cursor: ''
      });

      // New suggestion
      httpBackend.whenPOST(fixtures.url.suggestions).respond(function(m, u, body) {
        var suggestion = JSON.parse(body);

        suggestions.push(suggestion);
        suggestion.id = suggestions.length;
        suggestion.createdAt = new Date().toUTCString();

        return [200, suggestion];
      });

      // Everything else (like html templates) should go pass through
      httpBackend.whenGET(/.*/).passThrough();
    }
  ])

  ;

})();