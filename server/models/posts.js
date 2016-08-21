'use strict';

import Sequelize from 'sequelize';
import {
   GraphQLObjectType,
   GraphQLInputObjectType,
   GraphQLNonNull,
   GraphQLInt,
   GraphQLID,
   GraphQLString,
   GraphQLList
} from 'graphql';

export default {
   sequelizeModel(sequelize) {
      const Posts = sequelize.define('Posts', {
         pk: {
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
            interfaces: [db.graphQLTypes.Node],
            fields: () => {
               return {
                  pk: {
                     type: new GraphQLNonNull(GraphQLInt),
                     description: 'The database primary key of the post'
                  },
                  id: {
                     type: new GraphQLNonNull(GraphQLID),
                     description: 'The relayId of the post',
                     resolve: (obj) => {
                        return 'Post_' + obj.pk
                     }
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
                        return db.models.Users.findById(context.creatorPk);
                     }
                  },
                  comments: {
                     type: new GraphQLNonNull(new GraphQLList(db.graphQLTypes.Comment)),
                     description: 'The user who created this post',
                     resolve: (context) => {
                        return db.models.Comments.findAll({
                           where: {
                              postPk: context.pk
                           }
                        });
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
            resolve: (context) => {
               return db.models.Posts.findAll();
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
               post.creatorPk = 1; // TODO get current logged in user
               return db.models.Posts.create(post);
            }
         }
      };
   }
};
