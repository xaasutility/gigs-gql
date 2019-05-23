const { ApolloServer, gql } = require('apollo-server-cloud-functions');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const GigsAPI = require('./datasources/gts');
//const UserAPI = require('./datasources/user');
const SourceAPI = require('./datasources/sources');

console.log('Creating Apollo server...');

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        gigsAPI: new GigsAPI(),
        // userAPI: new UserAPI({ store }),
        sourceAPI: new SourceAPI()
    }),
    playground: true,
    introspection: true,
});

console.log('...', server);

exports.handler = server.createHandler();