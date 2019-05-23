const { DataSource } = require('apollo-datasource');

const { makeSearchRequest, gigReducer } = require('./gigUtils');
const gts = require('../gts/gts');
const gig = require('../gts/gig');

class GigsAPI extends DataSource {

    constructor() {
        super();
    }

    initialize(config) {
        console.log('GigsAPI::config - ', config);
    }

    static mapJob(job) { return job ? gigReducer(gig.fromGTS(job)) : {}; }

    async searchGigs({query, offset, size, token}) {
        console.log('gigs:searchGigs - ', query, offset, size, token);

        const result = await gts.searchJobs(null, query, token, offset, size);

        console.log('Result:', result);

        if (result) {
            const { matchingJobs, nextPageToken, totalSize } = result;
            return {
                gigs: matchingJobs ? matchingJobs.map(match => GigsAPI.mapJob(match.job)) : [],
                token: nextPageToken,
                total: totalSize
            }
        }

        // const response = await this.post('', makeSearchRequest(query, token, offset, size));
        // console.log(' Response:', response.token)

        // if (response) {
        //     const {token, totalSize, gigs} = response;
        //     return {
        //         gigs: gigs ? gigs.map(gig => gigReducer(gig)) : [],
        //         token,
        //         total: totalSize
        //     }
        // }

        return {};
    }

    async getGigById({gigId}) {
        const job = await gts.getJob(gigId);
        return GigsAPI.mapJob(job)
    }
}

module.exports = GigsAPI;