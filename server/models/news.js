'use strict';

let Sequelize = require('sequelize'),
   GraphQL = require('graphql'),
   graphQLSequelize = require('graphql-sequelize'),
   resolver = require('graphql-sequelize').resolver;

module.exports = {
   sequelizeModel(sequelize) {
      let News = sequelize.define('News', {
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

      return News;
   },

   sequelizeAssociate(db) {
      db.models.News.belongsTo(db.models.Users);
   },

   graphQLType(db) {
      return new GraphQL.GraphQLObjectType({
         name: 'News',
         description: 'A news story',
         fields: () => {
            return {
               id: {
                  type: new GraphQL.GraphQLNonNull(GraphQL.GraphQLInt),
                  description: 'The id of the news.'
               },
               title: {
                  type: GraphQL.GraphQLString,
                  description: 'The title of the news story.',
               },
               content: {
                  type: GraphQL.GraphQLString,
                  description: 'The content of the news story.',
               },
               creator: {
                  type: db.graphQLTypes.Users,
                  description: 'The user who created this news story.',
                  resolve: resolver(db.models.Users)
               }
            };
         }
      });
   },

   graphQLInputType(db) {
      return new GraphQL.GraphQLInputObjectType({
         name: 'InputNews',
         description: 'A news story',
         fields: () => {
            return {
               title: {
                  type: GraphQL.GraphQLString,
                  description: 'The title of the news story.',
               },
               content: {
                  type: GraphQL.GraphQLString,
                  description: 'The content of the news story.',
               }
            };
         }
      });
   },

   graphQLQueries(db) {
      return {
         news: {
            type: new GraphQL.GraphQLList(db.graphQLTypes.News),
            args: {
               id: {
                  type: GraphQL.GraphQLInt
               },
               title: {
                  type: GraphQL.GraphQLString
               },
               limit: {
                  type: GraphQL.GraphQLInt
               },
               order: {
                  type: GraphQL.GraphQLString
               }
            },
            resolve: graphQLSequelize.resolver(db.models.News)
         }
      };
   },

   graphQLMutations(db) {
      return {
         createNews: {
            type: db.graphQLTypes.News,
            description: 'Create a new news story, with the creator as the current logged in user',
            args: {
               news: {
                  type: db.graphQLInputTypes.News
               }
            },
            resolve: (value, {news}) => {
               news.user = 1;
               news.User = 1;
               news.userId = 1; // TODO get current logged in user
               news['"UserId"'] = 1; // TODO get current logged in user
               news.UserId = 1; // TODO get current logged in user
               news['"userId"'] = 1; // TODO get current logged in user
               console.log(news);
               return db.models.News.create(news);
            }
         },

         updateNews: {
            type: db.graphQLTypes.News,
            description: 'Updates a new news story, a story can only be updated by its creator or an admin',
            args: {
               id: {
                  type: GraphQL.GraphQLInt,
                  description: 'The ID of the news story to be updated'
               },
               news: {
                  type: db.graphQLInputTypes.News
               }
            },
            resolve: (value, {id, news}) => {
               let News = db.models.News;
               return db.sequelize.transaction(function ( t ) {
                  return News.findById({id, transaction: t})
                     .then((dbNews) => {
                        // TODO check logged user
                        return dbNews.update(news, {transaction: t});
                     });
               });
            }
         }
      };
   }
};
