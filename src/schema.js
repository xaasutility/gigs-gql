const {gql} = require('apollo-server');

const typeDefs = gql`
    
    scalar Date
    
    type Query {
        gigs(query: GigQuery, offset: Int, size: Int, token: String): GigConnection!
        gig(id: ID!): Gig
        # Queries for the current user
        me: User
    }
    
    input GigQuery {
        keywords: String
        city: String
        distance: Int
        compensation: Int
        compensationType: CompensationType
    }
    
    type GigConnection {
        token: String!
        hasMore: Boolean!
        total: Int!
        gigs: [Gig]!
    }
    
    type User {
        id: ID!
        email: String!
        savedGigs: [Gig]!
    }
    
    type Mutation {
        deleteGigs(gigIds: [ID]!): GigUpdateResponse
        saveGig(gigId: ID!, savedStatus: Boolean!): GigUpdateResponse
        login(email: String): String
    }
    
    type GigUpdateResponse {
        success: Boolean!
        message: String
        gigs: [Gig]
    }
    
    type Location {
        full_address: String
    }
    
    enum CompensationType {
        HOURLY
        YEARLY
        FIXED
    }
    
    type Gig {
        bid_avg: Float
        bid_count: Int
        budget_minimum: Int
        budget_maximum: Int
        type: CompensationType!
        status: String
        title: String!
        preview_description: String
        time_submitted: Date
        id: ID!
        seo_url: String
        publisher: String
        location: Location
    }
`;

module.exports = typeDefs;