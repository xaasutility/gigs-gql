const { DataSource } = require('apollo-datasource');

const { makeSearchRequest, gigReducer } = require('./gigUtils')

class GigsAPI extends DataSource {

    constructor() {
        super();
    }

    initialize(config) {
        console.log('GigsAPI::config - ', config);
    }

    async searchGigs({query, offset, size, token}) {
        console.log('gigs:searchGigs - ', query, offset, size, token);
        const response = await this.post('', makeSearchRequest(query, token, offset, size));
        // console.log(' Response:', response.token)

        if (response) {
            const {token, totalSize, gigs} = response;
            return {
                gigs: gigs.map(gig => gigReducer(gig)),
                token,
                total: totalSize
            }
        }

        return {};
    }

    async getGigById({gigId}) {
        return {id: gigId}
    }
}

module.exports = GigsAPI;