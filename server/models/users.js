'use strict';

import Sequelize from 'sequelize';
import {resolver} from 'graphql-sequelize';
import {
   GraphQLObjectType,
   GraphQLNonNull,
   GraphQLInt,
   GraphQLString,
   GraphQLBoolean,
   GraphQLList
} from 'graphql';

export default {
   sequelizeModel: ( sequelize ) => {
      const Users = sequelize.define('Users', {
         id: {
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
            fields: () => {
               return {
                  id: {
                     type: new GraphQLNonNull(GraphQLInt),
                     description: 'The id of the user.'
                  },
                  email: {
                     type: new GraphQLNonNull(GraphQLString),
                     description: 'The email of the user.',
                  },
                  isAdmin: {
                     type: new GraphQLNonNull(GraphQLBoolean),
                     description: 'True if the user is an admin.',
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
            args: {
               id: {
                  type: GraphQLInt
               },
               email: {
                  type: GraphQLString
               },
               isAdmin: {
                  type: GraphQLBoolean
               },
               limit: {
                  type: GraphQLInt
               },
               order: {
                  type: GraphQLString
               }
            },
            resolve: resolver(db.models.Users)
         }
      };
   },

   graphQLMutations: (db) => {
      return {};
   }
};
