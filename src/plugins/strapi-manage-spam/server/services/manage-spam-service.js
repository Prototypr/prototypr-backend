
module.exports = {
  async getUnpublishedPosts({ pageSize, currentPage }) {
    //used in the admin route only
    const posts = await strapi.entityService.findMany('api::post.post', { // Assuming 'post' is the correct entity name
      fields: ['id', 'publishedAt', 'createdAt', 'updatedAt', 'status'], // Specify the fields you want to include for posts
      populate: {
        author: { // Assuming each post has an 'author' relation
          fields: ['id', 'username', 'email'], // Include fields from the author you want to populate
        },
        // Add any other relations you need to populate here
      },
      filters: {
        // published: false, // Assuming 'published' is a boolean field indicating if the post is published
        $or: [
          { status: { $containsi: 'draft' } }, // Assuming you want to search within the title
          { status: { $containsi: 'pending' } }, // Assuming you want to search within the content
          // Add any other fields you want to include in your search filter
        ],
      },
      start: currentPage ? currentPage : 0,
      limit: pageSize ? pageSize : 10,
    });
    return posts.length > 0 ? posts : null;
  },
  async getPotentialSpammers({ pageSize, currentPage, options }) {
   
    if(options){
      try{
        options = JSON.parse(options)
      }catch(e){

      }
    }
    /**
     * users who are not approved and have zero published posts
     */
    //used in the admin route only
    const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
      fields: ['id', 'username', 'email', 'firstName', 'secondName', 'slug', 'approved', "website"], // Include 'approved' in the selection
      populate: {
        posts: {
          fields: ['id', 'status'], // Assuming 'posts' is the correct relation name and 'status' is the field in posts
          // filters: {
          //   status: { $ne: 'publish' }, // Include posts that are not published
          // },
        },
      },
      filters: {
        // $or: [
        //   { approved: {$ne: true}  }, // Users where approved is not true
        //   // { posts: { $null: true } }, // Users with no posts
        //   // { 'posts.status': { $ne: 'publish' } }, // Users with no published posts
        // ],
        posts:{publishedAt:{$null:true}}
        // posts:{status:{$ne:'publish'}}
      },
      start: currentPage ? currentPage : 0,
      limit: pageSize ? pageSize : 10,
    });

    const filteredUsers = filterUsers(users, options)
    
    return filteredUsers.length > 0 ? filteredUsers : null;
  },
  async deletePotentialSpammers({ pageSize, currentPage, options }) {
    // Find users who are not approved
    if(options){
      try{
        options = JSON.parse(options)
      }catch(e){

      }
    }
    const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
      fields: ['id'], // Only need 'id' for deletion
      populate: {
        posts: {
          fields: ['id', 'status'], // Need 'id' and 'status' to filter which posts to delete
          filters: {
            status: { $ne: 'publish' }, // Include posts that are not published
          },
        },
      },
      filters: {
        approved: { $ne: true }, // Users where approved is not true
      },
      start: currentPage ? currentPage : 0,
      limit: pageSize ? pageSize : 10,
    });
  
    // Filter users who have no published posts
    const usersToDelete = filterUsers(users, options)
  
    // Delete each user and their non-published posts
    for (const user of usersToDelete) {
      // Delete non-published posts for the user
      for (const post of user.posts) {
        if (post.status !== 'publish') {
          await strapi.entityService.delete('api::post.post', post.id);
        }
      }
      // Finally, delete the user
      await strapi.entityService.delete('plugin::users-permissions.user', user.id);
    }
  
    return usersToDelete.length > 0 ? usersToDelete.length : null;
  },
  
};


const filterUsers = (users, options) =>{
  const filteredUsers = users?.filter(user => {
    console.log(user)
    // Check for users with posts
    let hasValidPosts = false;
    if (options?.usersWithPosts) {
      hasValidPosts = user.posts.length > 0 && user.posts.every(post => post.status === 'publish');
    } else {
      hasValidPosts = user.posts.length === 0 || user.posts.every(post => post.status !== 'publish');
    }
  
    // Check for users with a first name
    let hasFirstName = true;
    if (options?.firstNameComplete) {
      hasFirstName = Boolean(user.firstName);
    }
  
    // Check for users with an email
    let usesEmailProvider = true;
    if (options?.providerIsMagicLink) {
      usesEmailProvider = Boolean(user.email);
    }
  
    // Include other checks as needed
    // Example: let hasOtherCondition = true;
    // if (options?.otherCondition) {
    //   hasOtherCondition = // your condition here;
    // }
  
    // Return true if all conditions are met
    return hasValidPosts && hasFirstName && usesEmailProvider; // && hasOtherCondition for additional conditions
  });

  return filteredUsers
}