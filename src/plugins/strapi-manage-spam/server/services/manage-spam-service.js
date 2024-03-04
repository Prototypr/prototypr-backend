
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
    const users = await findUsersWithUnpublishedPosts(options, pageSize, currentPage)
    return users.length > 0 ? users : null;
  },
  async deletePotentialSpammers({ ids }) {
    // Find users who are not approved
    if(ids){
      try{
        ids = JSON.parse(ids)
      }catch(e){
        return false
      }
    }
    const deletedUserCount = await deleteUserAndPosts(strapi, ids)
    return deletedUserCount > 0 ? deletedUserCount : null;
  },
  async approveUsers({ ids }) {
    // Find users who are not approved
    if(ids){
      try{
        ids = JSON.parse(ids)
      }catch(e){
        return false
      }
    }
    const approvedUserCount = await approveUsersByIds(strapi, ids)
    return approvedUserCount > 0 ? approvedUserCount : null;
  }
}

async function findUsersWithUnpublishedPosts(options, pageSize, currentPage) {
  // Start constructing the query with the initial SELECT statement
  let query = `
    SELECT u.*, f.url as avatar_url
    FROM "up_users" u
    LEFT JOIN "files_related_morphs" frm ON u.id = frm.related_id AND frm.related_type = 'plugin::users-permissions.user'
    LEFT JOIN "files" f ON frm.file_id = f.id AND frm.field = 'avatar'
  `;

  let whereIncluded = false; // Flag to track if a WHERE clause has been included

  // If options.usersWithPosts is true, include the clause that checks for the existence of unpublished posts
  if (options.usersWithPosts) {
    query += `
    WHERE EXISTS (
        SELECT 1 
        FROM "posts_user_links" pul
        INNER JOIN "posts" p ON pul.post_id = p.id
        WHERE pul.user_id = u.id AND p.published_at IS NULL
    )`;
    whereIncluded = true; // Set flag as WHERE clause is included
  }

  // If options.usersWithPosts is not true, or the check for not having published posts is needed, append the AND NOT EXISTS clause
  if (!options.usersWithPosts) {
    query += `
    WHERE NOT EXISTS (
        SELECT 1
        FROM "posts_user_links" pul
        INNER JOIN "posts" p ON pul.post_id = p.id
        WHERE pul.user_id = u.id AND p.published_at IS NOT NULL
    )`;
    whereIncluded = true; // Set flag as WHERE clause is included
  }

  // Additional options checks
  if (options.noFirstName) {
    query += whereIncluded ? " AND" : " WHERE"; // Check if WHERE clause is already included
    query += " u.first_name IS NULL";
    whereIncluded = true;
  }
  if (options.noGithub) {
    query += whereIncluded ? " AND" : " WHERE"; // Check if WHERE clause is already included
    query += " u.github IS NULL";
    whereIncluded = true;
  }
  if (options.noKofi) {
    query += whereIncluded ? " AND" : " WHERE"; // Check if WHERE clause is already included
    query += " u.kofi IS NULL";
    whereIncluded = true;
  }
  if (options.noTwitter) {
    query += whereIncluded ? " AND" : " WHERE"; // Check if WHERE clause is already included
    query += " u.twitter IS NULL";
    whereIncluded = true;
  }
  if (options.noDribbble) {
    query += whereIncluded ? " AND" : " WHERE"; // Check if WHERE clause is already included
    query += " u.dribbble IS NULL";
    whereIncluded = true;
  }
  
  if (options.noAvatar) {
    query += whereIncluded ? " AND" : " WHERE";
    query += ` NOT EXISTS (
        SELECT 1
        FROM "files_related_morphs" frm
        WHERE frm.related_id = u.id AND frm.field = 'avatar'
    )`;
    whereIncluded = true;
  }
  
  if (options.noBio) {
    query += whereIncluded ? " AND" : " WHERE"; // Check if WHERE clause is already included
    query += " u.bio IS NULL";
    whereIncluded = true;
  }

  if (options.userHasWebsite) {
    query += whereIncluded ? " AND" : " WHERE";
    query += " u.website IS NOT NULL";
    whereIncluded = true;
  }

  if (options.providerIsMagicLink) { // Assuming you want to check for NULL provider
    query += whereIncluded ? " AND" : " WHERE";
    query += " u.provider IS NULL";
  }
  if (options.providerIsGoogle) { // Assuming you want to check for NULL provider
    query += whereIncluded ? " AND" : " WHERE";
    query += " u.provider = 'google'";
  }

  query += whereIncluded ? " AND" : " WHERE";
  query += " u.approved IS NOT TRUE";

  query += ` ORDER BY u.created_at DESC`;
  // Pagination
  if (pageSize) {
    query += ` LIMIT ${parseInt(pageSize, 10)}`;
  }

  if (currentPage) {
    query += ` OFFSET ${parseInt(currentPage, 10)}`;
  }

  // Finalize query with a semicolon
  query += ';';
  
  // Execute the dynamically constructed query
  try {
    const result = await strapi.db.connection.raw(query);
    return result.rows; // Adjust based on your SQL dialect / ORM
  } catch (error) {
    console.error('Error executing raw SQL query:', error);
    throw error;
  }
}


// Fetch and delete users and their non-published posts
async function deleteUserAndPosts(strapi, givenIds) {
  console.log(givenIds)
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
      id: { $in: givenIds }, // Filter users based on given IDs
      // approved: { $ne: true }, // Additional condition: Users where approved is not true
    },
  });

  let deletedUsersCount = 0;

  // Delete each user and their non-published posts
  for (const user of users) {
    // Delete non-published posts for the user
    for (const post of user.posts) {
      if (post.status !== 'publish') {
        await strapi.entityService.delete('api::post.post', post.id);
      }
    }
    // Finally, delete the user
    await strapi.entityService.delete('plugin::users-permissions.user', user.id);
    deletedUsersCount++;
  }

  return deletedUsersCount > 0 ? deletedUsersCount : null;
}

async function approveUsersByIds(strapi, givenIds) {
  console.log('ids to approve',givenIds);
  const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
    fields: ['id', 'approved'], // Only need 'id' and 'approved' for update
    filters: {
      id: { $in: givenIds }, // Filter users based on given IDs
      // approved: { $ne: true }, // Additional condition: Users where approved is not true
    },
  });

  let approvedUsersCount = 0;

  // Approve each user by setting 'approved' to true
  for (const user of users) {
    if (!user.approved) {
      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          approved: true,
        },
      });
      approvedUsersCount++;
    }
  }

  return approvedUsersCount > 0 ? approvedUsersCount : null;
}
