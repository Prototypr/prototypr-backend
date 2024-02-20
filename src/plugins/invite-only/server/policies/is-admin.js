module.exports = async (policyContext, config, { strapi }) => {
    /**
     * Regarding your concern that a user might pass something that has the credentials.type set to full-access but the token is invalid — this scenario is mitigated by Strapi's initial authentication check. An invalid token would prevent the request from proceeding to your policy, ensuring that only requests with valid authentication can be processed and checked for additional conditions like the one you've specified.
     */
    if (policyContext?.state?.auth?.credentials?.type == 'full-access') {
        return true; // Proceed to the next middleware/policy
    } else {
          // Correct way to handle unauthorized access in Strapi policy
          policyContext.status = 401; // Set the HTTP status code
          policyContext.body = "Unauthorized"; // Set the response body
          return false; // Stop further processing
    }
};
