
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
  async getPotentialSpammers({ pageSize, currentPage }) {
    /**
     * users who are not approved and have zero published posts
     */
    //used in the admin route only
    const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
      fields: ['id', 'username', 'email', 'firstName', 'secondName', 'slug', 'approved'], // Include 'approved' in the selection
      populate: {
        posts: {
          fields: ['id', 'status'], // Assuming 'posts' is the correct relation name and 'status' is the field in posts
          filters: {
            status: { $ne: 'publish' }, // Include posts that are not published
          },
        },
      },
      filters: {
        $or: [
          { approved: {$ne: true}  }, // Users where approved is not true
          // { posts: { $null: true } }, // Users with no posts
          // { 'posts.status': { $ne: 'publish' } }, // Users with no published posts
        ],
      },
      start: currentPage ? currentPage : 0,
      limit: pageSize ? pageSize : 10,
    });

    const filteredUsers = users?.filter(user => {
      // Check if the user has no posts or all posts are not published
      return user.posts.length === 0 || user.posts.every(post => post.status !== 'publish');
    });
    
    return filteredUsers.length > 0 ? filteredUsers : null;
  },
  async deletePotentialSpammers({ pageSize, currentPage }) {
    // Find users who are not approved
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
    const usersToDelete = users.filter(user => {
      return user.posts.length === 0 || user.posts.every(post => post.status !== 'publish');
    });
  
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