'use strict';

import Sequelize from 'sequelize';
import {
   GraphQLObjectType,
   GraphQLNonNull,
   GraphQLInt,
   GraphQLID,
   GraphQLString,
   GraphQLBoolean,
   GraphQLList
} from 'graphql';

export default {
   sequelizeModel: ( sequelize ) => {
      const Users = sequelize.define('Users', {
         pk: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
         },
         email: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
         },
         password_hash: {
            type: Sequelize.TEXT,
            allowNull: false
         },
         reset_token: {
            type: Sequelize.STRING,
         },
         token_expires: {
            type: Sequelize.DATE,
         },
         isAdmin: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
         }
      });

      return Users;
   },

   sequelizeAssociate(db) {
   },

   graphQLTypes: (db) => {
      return {
         User: new GraphQLObjectType({
            name: 'User',
            description: 'A user in the system',
            interfaces: [db.graphQLTypes.Node],
            fields: () => {
               return {
                  pk: {
                     type: new GraphQLNonNull(GraphQLInt),
                     description: 'The database primary key of the user'
                  },
                  id: {
                     type: new GraphQLNonNull(GraphQLID),
                     description: 'The relayId of the user',
                     resolve: (obj) => {
                        return 'User_' + obj.pk
                     }
                  },
                  email: {
                     type: new GraphQLNonNull(GraphQLString),
                     description: 'The email of the user',
                  },
                  isAdmin: {
                     type: new GraphQLNonNull(GraphQLBoolean),
                     description: 'True if the user is an admin',
                  },
                  posts: {
                     type: new GraphQLNonNull(new GraphQLList(db.graphQLTypes.Post)),
                     description: 'Posts made by this user',
                     resolve: (context) => {
                        return db.models.Posts.findAll({
                           where: {
                              creatorPk: context.pk
                           }
                        });
                     }
                  },
                  comments: {
                     type: new GraphQLNonNull(new GraphQLList(db.graphQLTypes.Comment)),
                     description: 'Comments made by this user',
                     resolve: (context) => {
                        return db.models.Comments.findAll({
                           where: {
                              creatorPk: context.pk
                           }
                        });
                     }
                  }
               };
            }
         })
      };
   },

   graphQLQueries: (db) => {
      return {
         users: {
            type: new GraphQLList(db.graphQLTypes.User),
            resolve: (context) => {
               return db.models.Users.findAll();
            }
         }
      };
   },

   graphQLMutations: (db) => {
      return {};
   }
};
