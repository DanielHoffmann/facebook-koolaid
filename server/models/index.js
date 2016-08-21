'use strict';

import pg from 'pg'
pg.defaults.parseInt8 = true;
import {_extend as extend } from 'util';
import config from 'config';
import Sequelize from 'sequelize';
import {
   GraphQLSchema,
   GraphQLObjectType,
   GraphQLInterfaceType,
   GraphQLID,
   GraphQLNonNull,
} from 'graphql';
import colorOut from '../util/colorOut.js';
import tracer from 'tracer';

import Users from './users.js';
import Posts from './posts.js';
import Comments from './comments.js';

const schemas = {
   Users,
   Posts,
   Comments
};

const logger = tracer.console(colorOut()),
   dbHost = config.get('db.host'),
   dbName = config.get('db.name'),
   dbUser = config.get('db.user'),
   dbPass = config.get('db.pass');

const db = {};

db.graphQLTypes = {
   Node: new GraphQLInterfaceType({
      name: 'Node',
      fields: {
         id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Unique id among all entities in the Schema, used for Relay.',
            resolve: (...args) => {
               console.log(args);
            }
         }
      },
      resolveType: () => {
         return db.graphQLTypes.User;
      }
   })
};

db.graphQLQueries = {
   node: {
      type: db.graphQLTypes.Node,
      args: {
         id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'The relayId of the node',
         }
      },
      resolve: (context, {id}) => {
         let [entity, id2] = id.split('_');
         id2 = parseInt(id2, 10);
         return db.models[entity].findById(id2);
      }
   }
};

db.graphQLMutations = {};

db.models = {};


logger.info('Connecting to database %s at %s as user @ %s', dbName, dbHost, dbUser);

db.sequelize = new Sequelize(dbName, dbUser, dbPass, {
   host: dbHost,
   dialect: 'postgres',
   maxConcurrentQueries: 50,
   pool: {
      maxConnections: 20,
      minConnections: 1,
      maxIdleTime: 90
   },
   logging: logger.debug
});

const schemaKeys = Object.keys(schemas);

// initializing sequelize models
schemaKeys.forEach((name) => {
   db.models[name] = schemas[name].sequelizeModel(db.sequelize);
});

// creating sequelize associations
schemaKeys.forEach((name) => {
   schemas[name].sequelizeAssociate(db);
});

// initializing graphQL types
schemaKeys.forEach((name) => {
   db.graphQLTypes = extend(db.graphQLTypes, schemas[name].graphQLTypes(db));
});

// getting graphQL queries
schemaKeys.forEach((name) => {
   db.graphQLQueries = extend(db.graphQLQueries, schemas[name].graphQLQueries(db));
});

// getting graphQL mutations
schemaKeys.forEach((name) => {
   db.graphQLMutations = extend(db.graphQLMutations, schemas[name].graphQLMutations(db));
});

db.schema = new GraphQLSchema({
   query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: db.graphQLQueries
   }),

   mutation: new GraphQLObjectType({
      name: 'Mutations',
      fields: db.graphQLMutations
   })
});

export default db;
