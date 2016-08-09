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
      const Comments = sequelize.define('Comments', {
         id: {
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
            fields: () => {
               return {
                  id: {
                     type: new GraphQLNonNull(GraphQLInt),
                     description: 'The id of the comment'
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
                        return db.models.Posts.findById(context.postId);
                     }
                  },
                  creator: {
                     type: new GraphQLNonNull(db.graphQLTypes.User),
                     description: 'The user who created this comment',
                     resolve: (context) => {
                        return db.models.Users.findById(context.creatorId);
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
                  postId: {
                     type: new GraphQLNonNull(GraphQLInt),
                     description: 'The id of the post this comment belongs to',
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
            args: {
               id: {
                  type: GraphQLInt
               }
            },
            resolve: (context, {id}) => {
               if (id != null) {
                  return db.models.Comments.findById(id);
               } else {
                  return db.models.Comments.findAll();
               }
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
               comment.creatorId = 1; // TODO get current logged in user
               return db.models.Comments.create(comment);
            }
         }
      };
   }
};
