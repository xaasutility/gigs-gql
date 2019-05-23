const {ApolloServer} = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const GigsAPI = require('./datasources/gigs');
const SourceAPI = require('./datasources/sources');

const server = new ApolloServer({
    context: async ({req}) => {
        return {request: req};
    },
    typeDefs,
    resolvers,
    dataSources: () => ({
        gigsAPI: new GigsAPI(),
        sourceAPI: new SourceAPI()
    })
});

server.listen().then(({url}) => {
    console.log(`🚀 Server ready at ${url}`);
});
