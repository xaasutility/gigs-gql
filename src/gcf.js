const { ApolloServer, gql } = require('apollo-server-cloud-functions');

const typeDefs = require('./schema');
const resolvers = require('./resolvers')

const GigsAPI = require('./datasources/gigs');
const UserAPI = require('./datasources/user');
const SourceAPI = require('./datasources/sources')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        gigsAPI: new GigsAPI(),
        userAPI: new UserAPI({ store })
    }),
    playground: true,
    introspection: true,
});

exports.handler = server.createHandler();