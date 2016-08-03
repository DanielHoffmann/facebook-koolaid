'use strict';

require('pg').defaults.parseInt8 = true;
let fs = require('fs'),
   extend = require('util')._extend,
   path = require('path'),
   config = require('config'),
   Sequelize = require('sequelize'),
   graphQLSequelize = require('graphql-sequelize'),
   GraphQL = require('graphql'),
   dbHost = config.get('db.host'),
   dbName = config.get('db.name'),
   dbUser = config.get('db.user'),
   dbPass = config.get('db.pass'),
   colorOut = require('../util/colorOut.js'),
   tracer = require('tracer'),
   logger = tracer.console(colorOut());

let db = {
   graphQLTypes: {},
   graphQLInputTypes: {},
   graphQLQueries: {},
   graphQLMutations: {},
   models: {}
};

let schemas = {
   News: require('./news.js'),
   Users: require('./users.js')
};

logger.info('Connecting to database %s at %s as user @ %s', dbName, dbHost, dbUser);
let sequelize = new Sequelize(dbName, dbUser, dbPass, {
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

// initializing sequelize models
Object.keys(schemas).forEach((name) => {
   db.models[name] = schemas[name].sequelizeModel(sequelize);
});

// creating associations
Object.keys(schemas).forEach((name) => {
   schemas[name].sequelizeAssociate(db);
});

// initializing graphQL types
Object.keys(schemas).forEach((name) => {
   db.graphQLTypes[name] = schemas[name].graphQLType(db);
});

// getting graphQL input types
Object.keys(schemas).forEach((name) => {
   if (schemas[name].graphQLInputType != null) {
      db.graphQLInputTypes[name] = schemas[name].graphQLInputType(db);
   }
});

// getting graphQL queries
Object.keys(schemas).forEach((name) => {
   db.graphQLQueries = extend(db.graphQLQueries, schemas[name].graphQLQueries(db));
});

// getting graphQL mutations
Object.keys(schemas).forEach((name) => {
   db.graphQLMutations = extend(db.graphQLMutations, schemas[name].graphQLMutations(db));
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.schema = new GraphQL.GraphQLSchema({
   query: new GraphQL.GraphQLObjectType({
      name: 'RootQueryType',
      fields: db.graphQLQueries
   }),

   mutation: new GraphQL.GraphQLObjectType({
      name: 'Mutations',
      fields: db.graphQLMutations
   })
});

module.exports = db;
