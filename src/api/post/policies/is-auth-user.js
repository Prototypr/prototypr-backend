module.exports = (policyContext, config, { strapi }) => {
  console.log("CONFIG -:::", policyContext.state.user, config);
  if (policyContext.state.user.role.code === config.role) {
    // if user's role is the same as the one described in configuration
    return true;
  }

  return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
};
