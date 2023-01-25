module.exports = (strapi) => {
    return () => ({
      typeDefs: `
      type Query {
        popularTags(pageSize: Int, offset: Int, postType:String): PopularTags
        count: Int
        total: Int
      }
      type PopularTags {
        tags:[PopularTag]
      }
      type PopularTag {
        name: String
        slug: String
        icon: String
        count: Int
        tag_id: ID
      }`,
      resolvers: {
        Query: {
           popularTags: {
            resolve: async (parent, args, context) => {
              // https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/data/sql-relations.html#many-to-many-relations-n-n
            // https://www.w3schools.com/sql/sql_groupby.asp
            //   const tagsOnArticles =  await strapi.db.connection.raw(`
            //  SELECT tag_id
            //  FROM posts_tags_links
            //   INNER JOIN posts ON posts_tags_links.post_id = posts.id 
            //   WHERE posts.type = 'article'
            //  `)
            //  console.log(tagsOnArticles)
              const popularTagQuery =  await strapi.db.connection.raw(`
             SELECT Count(tag_id), tag_id, tags.name, tags.slug, files.url as icon
             FROM posts_tags_links
             LEFT JOIN tags ON posts_tags_links.tag_id = tags.id 
             LEFT JOIN posts ON posts_tags_links.post_id = posts.id 
             LEFT JOIN files_related_morphs ON posts_tags_links.tag_id = files_related_morphs.related_id AND files_related_morphs.field='icon'
             LEFT JOIN files ON files_related_morphs.file_id = files.id 
             ${args.postType?`WHERE posts.type = '${args.postType}'`:''}
             GROUP BY posts_tags_links.tag_id, tags.name, tags.slug, files_related_morphs.file_id, files.url
             ORDER BY Count(tag_id) DESC
             LIMIT ${args.pageSize ||12} OFFSET ${args.offset || 0};
             `)

             console.log(popularTagQuery)

             var entries = [], count = 0
             if(popularTagQuery?.rows?.length){
              
              entries = popularTagQuery.rows
              count = popularTagQuery.rowCount
             }

              return {
                tags:entries,
                count,
                // total
              }
          },
        },
      },
    },
      resolversConfig: {
        "Query.popularTags": {
          auth: false, //requires auth
        },
      },
    });
  };
  