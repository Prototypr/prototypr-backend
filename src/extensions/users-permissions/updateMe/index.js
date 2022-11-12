
  /**
   * Update a/an user record.
   * https://strapi.io/video-library/update-own-user-data
   * 
   * @return {Object}
   */
   const fs = require('fs');

   const _ = require('lodash');
   const utils = require('@strapi/utils');
   const { getService } = require('./libs/getService');
   const { validateUpdateUserBody } = require('./libs/userValidation');

   const { sanitize } = utils;
   const { ApplicationError, ValidationError } = utils.errors;

   const sanitizeOutput = (user, ctx) => {
    const schema = strapi.getModel('plugin::users-permissions.user');
    const { auth } = ctx.state;
  
    return sanitize.contentAPI.output(user, schema, { auth });
  };
  

   module.exports = {
     /**
      * delete avatar
      * @param {*} ctx 
      */
    async deleteAvatar(ctx){

      const { id } = ctx.params;
      // const fileo = await strapi.plugins['upload'].services.upload.findOne(263);
      // await strapi.plugins['upload'].services.upload.remove(fileo);

      //find the user 
      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        id,
        { populate: ['avatar'] }//with the avatar
      );
      // get the avatar id, and use it to delete
      const fileId = user?.avatar?.id
      if(fileId){
        try{
          //delete the avatar
          const file = await strapi.plugins['upload'].services.upload.findOne(fileId);
          await strapi.plugins['upload'].services.upload.remove(file);
        }catch(e){
          ctx.send({deleted:'false', message:e.message})
        }
        ctx.send({deleted:'true', message:'Profile picture deleted'});
      }else{
        ctx.send({deleted:'false', message:'No profile picture found'});
      }

    },
    async uploadAvatar(ctx){

      const { id } = ctx.params;
      const file = ctx?.request?.files?.files            
      if(file){
        try{
          await strapi.plugins['upload'].services.upload.upload({data: {
            ref: 'plugin::users-permissions.user',
            source:'users-permissions',
            field: 'avatar',
            refId: id
          }, files:file});
          
        }catch(e){
          ctx.send({uploaded:'false', message:e.message})
        }
        ctx.send({uploaded:'true', message:'Profile picture uploaded'});
      }else{
        ctx.send({uploaded:'false', message:'No file to be uploaded found'});
      }
    },
    /**
     * update me
     * @param {} ctx 
     */
    async updateMe(ctx) {
    const advancedConfigs = await strapi
      .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
      .get();
    const { id } = ctx.params;
    const { email, username, password } = ctx.request.body;

    const user = await getService('user').fetch(id);

    await validateUpdateUserBody(ctx.request.body);
    

    if (user.provider === 'local' && _.has(ctx.request.body, 'password') && !password) {
      throw new ValidationError('password.notNull');
    }

    /**
     * don't allow to change blocked
     */
    if (_.has(ctx.request.body, 'blocked')) {
        throw new ApplicationError('Cannot changed blocked status');
    }

    if (_.has(ctx.request.body, 'username')) {
      const userWithSameUsername = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { username } });

        console.log(id)
        console.log(userWithSameUsername?.id)
      if (userWithSameUsername && userWithSameUsername.id != id) {
        return ctx.throw('Username already taken', 400);
        // ctx.throw(400, 'name required');

        // ctx.send()
        // return false
        throw new ApplicationError('Username already taken', {foo:'bar'});
      }
    }

    let originalEmail = null, emailChanged = false
    if (_.has(ctx.request.body, 'email') && advancedConfigs.unique_email) {
      const userWithSameEmail = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { email: email.toLowerCase() } });

      originalEmail = user.email
      if (userWithSameEmail && userWithSameEmail.id != id) {
        return ctx.throw('Email already taken', 400);
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
    if (emailChanged) {
        if(ctx.request.body.email.toLowerCase() !== originalEmail?.toLowerCase()){
          console.log("email is changed")
          //reset email to not confirmed
          // ctx.request.body.confirmed=false
          //send new email confirmation
          try{
            // console.log(sanitizedData)
            user.email = ctx.request.body.email
            await strapi.plugins['users-permissions'].services.user.sendConfirmationEmail(user)
          }catch(e){
            console.log(e.message)
          }
        }
    }

  }
}