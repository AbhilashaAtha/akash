/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject, expect */

(function() {
  'use strict';

  describe('oep.events.services', function() {
    var api, httpBackend, fix;

    beforeEach(module('oep.events.services', 'oep.fixtures'));

    beforeEach(inject(function(_$httpBackend_, OEP_FIXTURES) {
      httpBackend = _$httpBackend_;
      fix = OEP_FIXTURES;
    }));

    describe('oepEventsApi', function() {

      beforeEach(inject(function(oepEventsApi) {
        api = oepEventsApi;
      }));

      it('should query the list of event', function() {
        var results;

        httpBackend.expectGET('/api/v1/events').respond(
          '{"events":[], "cursor": ""}'
        );

        api.get().then(function(resp) {
          results = resp;
        });

        httpBackend.flush();

        expect(results.length).toBe(0);
        expect(results.cursor).toBe(null);
      });

      it('should return the list of event and the cursor', function() {
        var results;

        httpBackend.expectGET('/api/v1/events').respond(
          '{"events":[{"eventName": "My Event", "visibility": "public", "password": "", "criteria": 1, "service":{"Code School": true, "Treehouse": false, "Code Combat": false}, "start": "2014-10-08", "end": "2014-10-15", "reward": "Learn coding!", "comments": "Have fun.", "users": [], "from": "me"}], ' +
          '"cursor": "abcd"}'
        );

        api.get().then(function(resp) {
          results = resp;
        });

        httpBackend.flush();

        expect(results.length).toBe(1);
        expect(results.cursor).toBe('abcd');
      });

      it('should query event from a cursor', function() {
        httpBackend.expectGET('/api/v1/events?cursor=abcd').respond({});
        api.get({cursor: 'abcd'});
        httpBackend.flush();
      });

      it('should post new events', function() {
        var data, event = {
          'eventName': 'My Event',
          'visibility': 'public',
          'password': '',
          'criteria': 1,
          'services': {
            'Code School': true,
            'Treehouse': false,
            'Code Combat': false
          },
          'start': '2014-10-08',
          'end': '2014-10-15',
          'reward': 'Learn coding!',
          'comments': 'Have fun.',
          'users': [],
          'from': 'me'
        };

        httpBackend.expectPOST('/api/v1/events').respond(function(m, u, body) {
          data = JSON.parse(body);
          return [200, data];
        });

        api.create(event);
        httpBackend.flush();

        expect(data).toEqual(event);
      });

      it('should add new participants', function() {
        httpBackend.expectPUT('/api/v1/events/foo/participants/bar').respond({});
        api.addParticipant({
          id: 'foo'
        }, 'bar');
        httpBackend.flush();
      });

      it('should remove participants', function() {
        var req;

        httpBackend.expectDELETE('/api/v1/events/foo/participants/bar').respond(function(m, u, body) {
          req = body;
          return [200, {}];
        });
        api.removeParticipant({
          id: 'foo'
        }, 'bar');
        httpBackend.flush();
        expect(req).toBe(null);
      });

      it('should get an event details', function() {
        var eventId;

        httpBackend.expectGET(fix.url.oneEvent).respond(function(m, url) {
          eventId = fix.url.oneEvent.exec(url)[1];
          return [200, {}];
        });
        api.getDetails('1234');
        httpBackend.flush();

        expect(eventId).toBe('1234');
      });

    });

  });

})();
