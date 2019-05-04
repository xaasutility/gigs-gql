const { RESTDataSource } = require('apollo-datasource-rest');

class GigsAPI extends RESTDataSource {

    constructor() {
        super();
        this.baseURL = 'https://us-central1-xsu-develop.cloudfunctions.net/xsu-agent/'
    }

    static mapLocation(q, city, distance) {
        if (city) {
            q.location = { city };
            if (distance && distance > 0) {
                q.location.distance = distance
            }
        }
    }

    static mapCompensation (q, comp, compType) {
        if (comp) {
            q.compensation = {
                minimum: comp,
                type: compType
            }
        }
    }

    static mapQuery(q) {
        const query = {};
        if (q) {
            const {keywords, city, distance, compensation, compensationType} = q;
            query.keywords = keywords || '';
            GigsAPI.mapLocation(query, city, distance);
            GigsAPI.mapCompensation(query, compensation, compensationType)
        }
        return query
    }

    static makeSearchRequest (query, token, offset, size) {
        return {
            action: 'search',
            payload: {
                query: GigsAPI.mapQuery(query),
                token: token,
                offset: offset || 0,
                size: size || 100
            }
        }
    }

    async searchGigs({ query, offset, size, token }) {
        console.log('gigs:searchGigs - ', query, offset, size, token);
        const response = await this.post('', GigsAPI.makeSearchRequest(query, token, offset, size));
        // console.log(' Response:', response.token)

        if (response) {
            const { token, totalSize, gigs } = response;
            return {
                gigs: gigs.map(gig => this.gigReducer(gig)),
                token,
                total: totalSize
            }
        }

        return {};
    }

    async getGigById({ gigId }) {
        return { id: gigId }
    }

    static mapDescription(desc) {
        if (desc) {
            desc = desc.substr(0, 253).concat('...')
        }
        return desc
    }

    gigReducer(gig) {
        return {
            bid_avg: null,
            bid_count: null,
            budget_minimum: gig.minimum,
            budget_maximum: gig.maximum,
            type: gig.type.toUpperCase(),
            status: gig.status,
            title: gig.title,
            preview_description: GigsAPI.mapDescription(gig.description),
            time_submitted: gig.datePosted,
            id: gig.zaasId,
            seo_url: gig.url,
            publisher: gig.publisher,
            location: {
                full_address: gig.location && gig.location.length > 0 ? gig.location[0] : ''
            }
        }
    }
}

module.exports = GigsAPI;