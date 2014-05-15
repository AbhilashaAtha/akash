/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject, expect */

(function() {
  'use strict';

  describe('eop.card.directives', function() {
    var compile, scope, httpBackend, elem, timeout;

    beforeEach(module('eop.card.directives'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_, $timeout) {
      compile = _$compile_;
      scope = _$rootScope_;
      httpBackend = _$httpBackend_;
      timeout = $timeout;
    }));

    describe('eopValidTreehouseUsername', function() {

      beforeEach(function() {
        elem = compile(
          '<form name="form"><input ng-model="user.treehousId" name="userTHId" eop-valid-treehouse-username="true"/>'
        )(scope);
      });

      it('should check report card exist', function() {
        httpBackend.expectGET('http://teamtreehouse.com/bob.json').respond(200, {});

        scope.form.userTHId.$setViewValue('bob');
        timeout.flush();
        httpBackend.flush();
      });

      it('should set model as valid if the report card exist', function() {
        httpBackend.expectGET('http://teamtreehouse.com/bob.json').respond(200, {});

        scope.form.userTHId.$setViewValue('bob');
        timeout.flush();
        httpBackend.flush();

        expect(scope.form.userTHId.$valid).toBe(true);
        expect(scope.form.userTHId.$error.eopValidTreehouseUsername).toBe(false);
      });

      it('should set model as invalid if the report card doesn\'t exist', function() {
        httpBackend.expectGET('http://teamtreehouse.com/bob.json').respond(404, {});

        scope.form.userTHId.$setViewValue('bob');
        timeout.flush();
        httpBackend.flush();

        expect(scope.form.userTHId.$invalid).toBe(true);
        expect(scope.form.userTHId.$error.eopValidTreehouseUsername).toBe(true);
      });

    });

    describe('eopValidCodeSchoolUsername', function() {

      beforeEach(function() {
        elem = compile(
          '<form name="form"><input ng-model="user.codeschoolId" name="userCSId" eop-valid-code-school-username="true"/>'
        )(scope);
      });

      it('should check report card exist', function() {
        httpBackend.expectGET('/api/v1/codeschool/bob').respond('{"exist": true}');

        scope.form.userCSId.$setViewValue('bob');
        timeout.flush();
        httpBackend.flush();
      });

      it('should set model as valid if the report card exist', function() {
        httpBackend.expectGET('/api/v1/codeschool/bob').respond('{"exist": true}');

        scope.form.userCSId.$setViewValue('bob');
        timeout.flush();
        httpBackend.flush();

        expect(scope.form.userCSId.$valid).toBe(true);
        expect(scope.form.userCSId.$error.eopValidCodeSchoolUsername).toBe(false);
      });

      it('should set model as invalid if the report card doesn\'t exist', function() {
        httpBackend.expectGET('/api/v1/codeschool/bob').respond(404, '{"exist": false}');

        scope.form.userCSId.$setViewValue('bob');
        timeout.flush();
        httpBackend.flush();

        expect(scope.form.userCSId.$invalid).toBe(true);
        expect(scope.form.userCSId.$error.eopValidCodeSchoolUsername).toBe(true);
      });

    });

  });

})();