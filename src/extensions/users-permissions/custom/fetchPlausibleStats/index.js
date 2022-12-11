/**
 * Update a/an user record.
 * https://strapi.io/video-library/update-own-user-data
 *
 * @return {Object}
 */
const fs = require("fs");

const _ = require("lodash");
const utils = require("@strapi/utils");

const { fetchTimeSeriesData, fetchPlausibleData } = require("./utils");

const { sanitize } = utils;

const axios = require("axios");
const plausibleKey = process.env.PLAUSIBLE_KEY;
const baseURL = "https://analytics.prototypr.io/api/v1";

module.exports = {
  /**
   * delete avatar
   * @param {*} ctx
   */

  async fetchPlausibleStatsForUser(ctx) {
    const { id, slug } = ctx.request.body;

    /**
     * required: userId and post slug. [x]
     * Fetch user
     * Fetch plausible stats for slug
     * check if user has slug in their posts
     * if slug exists then show plausible data
     * if not, then access denied.
     *
     */

    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      id,
      { populate: ["posts"] }
    );

    if (user) {
      const { posts: userPosts } = user;
      const slugExistsInPost = userPosts.find((post) => post.slug === slug);
      if (slugExistsInPost) {
        const s = slug; // "take-me-to-the-useless-webs";
        // fetch plausible data
        const monthlyAggregate = await fetchPlausibleData(s, [
          "visits",
          "bounce_rate",
          "visit_duration",
          "pageviews",
        ]);

        const timeSeries = await fetchTimeSeriesData(s, [
          "visits",
          "bounce_rate",
          "visit_duration",
          "pageviews",
        ]);

        const plausibleData = {
          timeSeries,
          monthlyAggregate,
        };
        ctx.send({ status: 200, msg: "Access Granted!", plausibleData });
      } else {
        ctx.send({ status: 401, msg: "Access Denied!" });
      }
    } else {
      ctx.send({ status: 401, msg: "Access Denied!" });
    }
  },
};
