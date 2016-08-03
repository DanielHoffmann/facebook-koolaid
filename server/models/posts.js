'use strict';

let Sequelize = require('sequelize'),
   resolver = require('graphql-sequelize').resolver,
   gQL = require('graphql');

module.exports = {
   sequelizeModel(sequelize) {
      let Posts = sequelize.define('Posts', {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
         },
         title: {
            type: Sequelize.STRING,
            allowNull: false
         },
         content: {
            type: Sequelize.TEXT,
            allowNull: false
         }
      });

      return Posts;
   },

   sequelizeAssociate(db) {
      db.models.Posts.belongsTo(db.models.Users);
   },

   graphQLTypes(db) {
      return {
         Post: new gQL.GraphQLObjectType({
            name: 'Post',
            description: 'A post',
            fields: () => {
               return {
                  id: {
                     type: new gQL.GraphQLNonNull(gQL.GraphQLInt),
                     description: 'The id of the post'
                  },
                  title: {
                     type: new gQL.GraphQLNonNull(gQL.GraphQLString),
                     description: 'The title of the post',
                  },
                  content: {
                     type: new gQL.GraphQLNonNull(gQL.GraphQLString),
                     description: 'The content of the post',
                  },
                  creator: {
                     type: new gQL.GraphQLNonNull(db.graphQLTypes.User),
                     description: 'The user who created this post',
                     resolve: resolver(db.models.Users)
                  }
               };
            }
         }),

         PostInput: new gQL.GraphQLInputObjectType({
            name: 'PostInput',
            description: 'A post',
            fields: () => {
               return {
                  title: {
                     type: new gQL.GraphQLNonNull(gQL.GraphQLString),
                     description: 'The title of the post',
                  },
                  content: {
                     type: new gQL.GraphQLNonNull(gQL.GraphQLString),
                     description: 'The content of the post',
                  }
               };
            }
         })
      };
   },

   graphQLQueries(db) {
      return {
         posts: {
            type: new gQL.GraphQLList(db.graphQLTypes.Post),
            args: {
               id: {
                  type: gQL.GraphQLInt
               },
               title: {
                  type: gQL.GraphQLString
               },
               limit: {
                  type: gQL.GraphQLInt
               },
               order: {
                  type: gQL.GraphQLString
               }
            },
            resolve: resolver(db.models.Posts)
         }
      };
   },

   graphQLMutations(db) {
      return {
         createPost: {
            type: db.graphQLTypes.Post,
            description: 'Create a new post, with the creator as the current logged in user',
            args: {
               post: {
                  type: db.graphQLTypes.PostInput
               }
            },
            resolve: (value, {post}) => {
               post.UserId = 1; // TODO get current logged in user
               return db.models.Posts.create(post);
            }
         },

         updatePost: {
            type: db.graphQLTypes.Post,
            description: 'Updates a new post, a post can only be updated by its creator or an admin',
            args: {
               id: {
                  type: gQL.GraphQLInt,
                  description: 'The ID of the post to be updated'
               },
               post: {
                  type: db.graphQLTypes.PostInput
               }
            },
            resolve: (value, {id, post}) => {
               let Posts = db.models.Posts;
               return db.sequelize.transaction(function ( t ) {
                  return Posts.findById({id, transaction: t})
                     .then((dbPost) => {
                        // TODO check logged user
                        return dbPost.update(post, {transaction: t});
                     });
               });
            }
         }
      };
   }
};
