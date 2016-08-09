'use strict';

import Sequelize from 'sequelize';
import {
   GraphQLObjectType,
   GraphQLInputObjectType,
   GraphQLNonNull,
   GraphQLInt,
   GraphQLString,
   GraphQLList
} from 'graphql';

export default {
   sequelizeModel(sequelize) {
      const Posts = sequelize.define('Posts', {
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
      db.models.Posts.belongsTo(db.models.Users, {as: 'creator'});
   },

   graphQLTypes(db) {
      return {
         Post: new GraphQLObjectType({
            name: 'Post',
            description: 'A post',
            fields: () => {
               return {
                  id: {
                     type: new GraphQLNonNull(GraphQLInt),
                     description: 'The id of the post'
                  },
                  title: {
                     type: new GraphQLNonNull(GraphQLString),
                     description: 'The title of the post',
                  },
                  content: {
                     type: new GraphQLNonNull(GraphQLString),
                     description: 'The content of the post',
                  },
                  createdAt: {
                     type: new GraphQLNonNull(GraphQLString),
                     description: 'The creation date of this comment'
                  },
                  creator: {
                     type: new GraphQLNonNull(db.graphQLTypes.User),
                     description: 'The user who created this post',
                     resolve: (context) => {
                        return db.models.Users.findById(context.creatorId);
                     }
                  },
                  comments: {
                     type: new GraphQLNonNull(new GraphQLList(db.graphQLTypes.Comment)),
                     description: 'The user who created this post',
                     resolve: (context) => {
                        return db.models.Comments.findAll({
                           where: {
                              postId: context.id
                           }
                        })
                        // .then((res)=> {
                        //    console.log(res);
                        // });
                     }
                  }
               };
            }
         }),

         PostInput: new GraphQLInputObjectType({
            name: 'PostInput',
            description: 'A post',
            fields: () => {
               return {
                  title: {
                     type: new GraphQLNonNull(GraphQLString),
                     description: 'The title of the post',
                  },
                  content: {
                     type: new GraphQLNonNull(GraphQLString),
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
            type: new GraphQLList(db.graphQLTypes.Post),
            args: {
               id: {
                  type: GraphQLInt
               }
            },
            resolve: (context, {id, limit, order}) => {
               if (id != null) {
                  return db.models.Posts.findById(id).then((res) => {
                     return [res];
                  });
               } else {
                  return db.models.Posts.findAll({
                     order: [['createdAt', 'DESC']]
                  });
               }
            }
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
               post.creatorId = 1; // TODO get current logged in user
               return db.models.Posts.create(post);
            }
         },

         updatePost: {
            type: db.graphQLTypes.Post,
            description: 'Updates a new post, a post can only be updated by its creator or an admin',
            args: {
               id: {
                  type: GraphQLInt,
                  description: 'The ID of the post to be updated'
               },
               post: {
                  type: db.graphQLTypes.PostInput
               }
            },
            resolve: (value, {id, post}) => {
               const Posts = db.models.Posts;
               return db.sequelize.transaction(function ( t ) {
                  return Posts.findById(id, {transaction: t})
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
