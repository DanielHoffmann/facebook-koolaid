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
      const Comments = sequelize.define('Comments', {
         pk: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
         },
         content: {
            type: Sequelize.TEXT,
            allowNull: false
         }
      });

      return Comments;
   },

   sequelizeAssociate(db) {
      db.models.Comments.belongsTo(db.models.Users, {as: 'creator'});
      db.models.Comments.belongsTo(db.models.Posts, {as: 'post'});
   },

   graphQLTypes(db) {
      return {
         Comment: new GraphQLObjectType({
            name: 'Comment',
            description: 'A comment on a post',
            interfaces: [db.graphQLTypes.Node],
            fields: () => {
               return {
                  pk: {
                     type: new GraphQLNonNull(GraphQLInt),
                     description: 'The database primary key of the comment'
                  },
                  id: {
                     type: new GraphQLNonNull(GraphQLID),
                     description: 'The relayId of the comment',
                     resolve: (obj) => {
                        return 'Comment_' + obj.pk
                     }
                  },
                  content: {
                     type: new GraphQLNonNull(GraphQLString),
                     description: 'The content of the comment',
                  },
                  createdAt: {
                     type: new GraphQLNonNull(GraphQLString),
                     description: 'The creation date of this comment'
                  },
                  post: {
                     type: new GraphQLNonNull(db.graphQLTypes.Post),
                     description: 'The post this comment belongs to',
                     resolve: (context) => {
                        return db.models.Posts.findById(context.postPk);
                     }
                  },
                  creator: {
                     type: new GraphQLNonNull(db.graphQLTypes.User),
                     description: 'The user who created this comment',
                     resolve: (context) => {
                        return db.models.Users.findById(context.creatorPk);
                     }
                  }
               };
            }
         }),

         CommentInput: new GraphQLInputObjectType({
            name: 'CommentInput',
            description: 'A post',
            fields: () => {
               return {
                  content: {
                     type: new GraphQLNonNull(GraphQLString),
                     description: 'The content of the comment',
                  },
                  postPk: {
                     type: new GraphQLNonNull(GraphQLInt),
                     description: 'The  of the post this comment belongs to',
                  }
               };
            }
         })
      };
   },

   graphQLQueries(db) {
      return {
         comments: {
            type: new GraphQLList(db.graphQLTypes.Comment),
            resolve: (context) => {
               return db.models.Comments.findAll();
            }
         }
      };
   },

   graphQLMutations(db) {
      return {
         createComment: {
            type: db.graphQLTypes.Comment,
            description: 'Create a new comment on a post, with the creator as the current logged in user',
            args: {
               comment: {
                  type: db.graphQLTypes.CommentInput
               }
            },
            resolve: (value, {comment}) => {
               comment.creatorPk = 1; // TODO get current logged in user
               return db.models.Comments.create(comment);
            }
         }
      };
   }
};
