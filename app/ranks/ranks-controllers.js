/**
 * oep.ranks.controllers - Controller for the ranks subsection
 *
 * Defines `OepRanksShowRanks`.
 */
(function() {
  'use strict';

  /**
   * OepRanksShowRanks - Controller for the ranks subsction
   *
   * Fetch the users ranks to populate the scope (added the ranks
   * property.
   *
   * Scope will also include `sortBy` order and the current user stats
   * (as `userStats`) If the current user is not part of top ranks.
   *
   */
  function OepRanksShowRanks(userApi, currentUserApi, settings) {

    this.currentUser = currentUserApi;
    this.userApi = userApi;

    this.filterOptions = settings.userOptions;

    this.filterBy = {};
    this.ranks = null;
    this.userStats = null;
    this.sortBy = 'totalBadges';

    currentUserApi.auth().then(this.setUserStats.bind(this));
    this.getRanks();
  }

  OepRanksShowRanks.prototype = {
    /**
     * Populate the scope `userStats` property with the current user stats
     * if he's not part of the top rank.
     */
    setUserStats: function() {
      if (this.ranks === null) {
        return;
      }

      if (!this.currentUser.data || !this.currentUser.data.stats) {
        return;
      }

      for (var i = 0; i < this.ranks.length; i++) {
        if (this.ranks[i].id === this.currentUser.data.stats.id) {
          return;
        }
      }

      this.userStats = this.currentUser.data.stats;
    },

    /**
     * Fetch rank and populate the scope `ranks` property with it.
     *
     */
    getRanks: function() {
      var self = this,
        opts = {};

      if (
        this.filterBy &&
        this.filterBy.type &&
        this.filterBy.type.id &&
        this.filterBy.value &&
        this.filterBy.value.id
      ) {
        opts.filterByType = this.filterBy.type.id;
        opts.filterByValue = this.filterBy.value.id;
      }

      if (this.sortBy) {
        opts.sortBy = this.sortBy;
      }

      this.ranks = null;
      return this.userApi.getRanks(opts).then(function(ranks) {
        self.ranks = ranks;
        self.setUserStats();
        return ranks;
      });
    },

    getRanksSortedBy: function(sortBy) {
      this.sortBy = sortBy;
      return this.getRanks();
    }
  };


  angular.module('oep.ranks.controllers', ['oep.config', 'oep.user.services', 'eop.card.directives']).

  controller('OepRanksShowRanks', ['oepUsersApi', 'oepCurrentUserApi', 'oepSettings', '$window', OepRanksShowRanks])

  ;

})();