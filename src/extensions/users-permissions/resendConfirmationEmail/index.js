
  /**
   * Update a/an user record.
   * https://strapi.io/video-library/update-own-user-data
   * 
   * @return {Object}
   */
   const _ = require('lodash');
   const utils = require('@strapi/utils');
   const { getService } = require('./libs/getService');
   const { validateUpdateUserBody } = require('./libs/userValidation');
   const jwt_decode = require("jwt-decode"); 
   const { sanitize } = utils;
   const { ApplicationError, ValidationError } = utils.errors;

   const sanitizeOutput = (user, ctx) => {
    const schema = strapi.getModel('plugin::users-permissions.user');
    const { auth } = ctx.state;
  
    return sanitize.contentAPI.output(user, schema, { auth });
  };
  

   module.exports = {
    async resendConfirmationEmail(ctx) {
    const advancedConfigs = await strapi
      .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
      .get();


      
      // const { id } = ctx.params;
      const { email} = ctx.request.body;
      console.log(email)
      const token = ctx.request.headers.authorization
    let decoded = jwt_decode(token); //data is what you sent in.

    const id = decoded.id;

    const user = await getService('user').fetch(id);

    console.log(user)

    /**
     * don't allow to change blocked
     */
    if (_.has(user.body, 'blocked')) {
        throw new ApplicationError('Cannot changed blocked status');
    }


    let originalEmail = null, emailChanged = false
    if (_.has(ctx.request.body, 'email') && advancedConfigs.unique_email) {
      const userWithSameEmail = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { email: email.toLowerCase() } });

      originalEmail = user.email
      console.log(userWithSameEmail)
      if (userWithSameEmail && userWithSameEmail.id != id) {
        console.log('emil taken')
        throw new ApplicationError('Email already taken');
      }else{
        emailChanged = true
        if(ctx.request.body.email.toLowerCase() !== originalEmail?.toLowerCase()){
          //reset email to not confirmed
          ctx.request.body.confirmed=false
        }
      }
      ctx.request.body.email = ctx.request.body.email.toLowerCase();
    }

    let updateData = {
      ...ctx.request.body,
    };

    const data = await getService('user').edit(user.id, updateData);
    const sanitizedData = await sanitizeOutput(data, ctx);

    ctx.send(sanitizedData);


    /**
     * email confirmation when changing email address
     */
    console.log('email changed', emailChanged)
    if (emailChanged) {
        // if(ctx.request.body.email.toLowerCase() !== originalEmail?.toLowerCase()){
          console.log("email is changed")
          //reset email to not confirmed
          // ctx.request.body.confirmed=false
          //send new email confirmation
          try{
            user.email = ctx.request.body.email
            await strapi.plugins['users-permissions'].services.user.sendConfirmationEmail(user)
          }catch(e){
            console.log(e.message)
          }
        // }
    }

  }
}