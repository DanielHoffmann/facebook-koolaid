'use strict';

let Sequelize = require('sequelize'),
   GraphQL = require('graphql'),
   graphQLSequelize = require('graphql-sequelize'),
   resolver = require('graphql-sequelize').resolver;

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

   graphQLType: (db) => {
      return new GraphQL.GraphQLObjectType({
         name: 'Users',
         description: 'A user in the system',
         fields: () => {
            return {
               id: {
                  type: new GraphQL.GraphQLNonNull(GraphQL.GraphQLInt),
                  description: 'The id of the user.'
               },
               email: {
                  type: GraphQL.GraphQLString,
                  description: 'The email of the user.',
               },
               isAdmin: {
                  type: GraphQL.GraphQLBoolean,
                  description: 'True if the user is an admin.',
               }
            };
         }
      });
   },

   graphQLQueries: (db) => {
      return {
         users: {
            type: new GraphQL.GraphQLList(db.graphQLTypes.Users),
            args: {
               id: {
                  type: GraphQL.GraphQLInt
               },
               email: {
                  type: GraphQL.GraphQLString
               },
               isAdmin: {
                  type: GraphQL.GraphQLBoolean
               },
               limit: {
                  type: GraphQL.GraphQLInt
               },
               order: {
                  type: GraphQL.GraphQLString
               }
            },
            resolve: graphQLSequelize.resolver(db.models.Users)
         }
      };
   },

   graphQLMutations: (db) => {
      return {};
   }
};
