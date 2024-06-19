module.exports = (strapi) => ({
  typeDefs: `
      type Query {
        userNotifications(read:Boolean, pageSize: Int, offset: Int): UserNotifications
        count: Int
      }
  
      type UserNotifications {
  
        notifications: [UserNotification]
        count: Int
      }
  
      type UserNotification {
        id: ID
        read: String
        post: JSON
        notifiers: [JSON]
        actor: JSON
        entity_type: String
        action_type: String
        createdAt: String
      }
    `,
  resolvers: {
    Query: {
      userNotifications: {
        resolve: async (parent, args, context) => {
            // console.log('userid',context.state.user?.id)
          const where = { notifiers: context.state.user?.id};

          if (args.read===false || args.read===true) {
            where.read = args.read;
          }

          // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html#findwithcount
          try {
            const [entries, count] = await strapi.db
              .query("api::notification.notification")
              .findWithCount({
                select: [
                  "id",
                  "read",
                  "entity_type",
                  "action_type",
                  "createdAt",
                ],
                where: where,
                limit: args.pageSize,
                offset: args.offset,
                orderBy: { createdAt: "DESC" },
                populate: {
                  post: {
                    select: [
                      "id",
                      "slug",
                      "title",
                      "date",
                      "status",
                      "type",
                      "excerpt",
                    ],
                    populate: {
                      featuredImage: true,
                    },
                  },
                  notifiers: {
                    select: ["id", "username", "slug"],
                    populate: {
                      avatar: true,
                    },
                  },
                  actor: {
                    select: ["id", "username", "slug"],
                    populate: {
                      avatar: true,
                    },
                  },
                },
              });

              // console.log(entries)
            let posts = entries.map((post) => {
              return {
                id: post.id,
                read: post.read,
                post: post.post,
                notifiers: post.notifiers,
                actor: post.actor,
                entity_type: post.entity_type,
                action_type: post.action_type,
                createdAt: post.createdAt,
              };
            });
            return {
              notifications: posts,
              count,
            };
          } catch (err) {
            console.log(err);
            return {
              notifications: [],
              count: 0,
            };
          }

          return {
            notifications: [],
            count: 0,
          };
        },
      },
    },
  },
  resolversConfig: {
    "Query.userNotifications": {
      auth: true, //requires auth
    },
  },
});
