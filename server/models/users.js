'use strict';

let Sequelize = require('sequelize'),
   resolver = require('graphql-sequelize').resolver,
   gQL = require('graphql');

module.exports = {
   sequelizeModel: ( sequelize ) => {
      let Users = sequelize.define('Users', {
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
         User: new gQL.GraphQLObjectType({
            name: 'User',
            description: 'A user in the system',
            fields: () => {
               return {
                  id: {
                     type: new gQL.GraphQLNonNull(gQL.GraphQLInt),
                     description: 'The id of the user.'
                  },
                  email: {
                     type: new gQL.GraphQLNonNull(gQL.GraphQLString),
                     description: 'The email of the user.',
                  },
                  isAdmin: {
                     type: new gQL.GraphQLNonNull(gQL.GraphQLBoolean),
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
            type: new gQL.GraphQLList(db.graphQLTypes.User),
            args: {
               id: {
                  type: gQL.GraphQLInt
               },
               email: {
                  type: gQL.GraphQLString
               },
               isAdmin: {
                  type: gQL.GraphQLBoolean
               },
               limit: {
                  type: gQL.GraphQLInt
               },
               order: {
                  type: gQL.GraphQLString
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
