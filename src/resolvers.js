const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

module.exports = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(ast.value) // ast value is always in string format
            }
            return null;
        },
    }),
    Query: {
        gigs: async (_, { query = {}, offset = 0, size = 100, token = null }, { dataSources }) => {
            console.log('Query:gigs - ', query, offset, size, token)

            const response = await dataSources.gigsAPI.searchGigs({query, offset, size, token});
            console.log(' Response:', response)

            const { gigs, totalSize, newToken } = response
            return {
                gigs,
                token: newToken,
                hasMore: (offset + gigs.length) >= totalSize ? false : true,
                total: totalSize
            };
        },
        gig: (_, { id }, { dataSources }) =>
            dataSources.gigsAPI.getGigById({ gigId: id }),
        me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
    },
    User: {
        savedGigs: async (_, __, { dataSources }) => {
            return [];
        },
    },
    Mutation: {
        login: async (_, { email }, { dataSources }) => {
            const user = await dataSources.userAPI.findOrCreateUser({ email });
            if (user) return Buffer.from(email).toString('base64');
        },
    },
};