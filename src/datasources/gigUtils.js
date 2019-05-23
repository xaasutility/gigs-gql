const mapLocation = (q, city, distance) => {
    if (city) {
        q.location = { city };
        if (distance && distance > 0) {
            q.location.distance = distance
        }
    }
}

const mapCompensation = (q, comp, compType) => {
    if (comp) {
        q.compensation = {
            minimum: comp,
            type: compType
        }
    }
}

const mapQuery= (q) => {
    const query = {};
    if (q) {
        const {keywords, city, distance, compensation, compensationType} = q;
        query.keywords = keywords || '';
        mapLocation(query, city, distance);
        mapCompensation(query, compensation, compensationType)
    }
    return query
}

exports.makeSearchRequest = (query, token, offset, size) => {
    return {
        action: 'search',
        payload: {
            query: mapQuery(query),
            token: token,
            offset: offset || 0,
            size: size || 100
        }
    }
}

const mapDescription = (desc) => {
    if (desc) {
        desc = desc.substr(0, 253).concat('...')
    }
    return desc
}

exports.gigReducer = (gig) => {
    return {
        bid_avg: null,
        bid_count: null,
        budget_minimum: gig.minimum,
        budget_maximum: gig.maximum,
        type: gig.type.toUpperCase(),
        status: gig.status,
        title: gig.title,
        preview_description: mapDescription(gig.description),
        time_submitted: gig.datePosted,
        id: gig.zaasId,
        seo_url: gig.url,
        companyName: gig.companyName,
        location: {
            full_address: gig.location && gig.location.length > 0 ? gig.location[0] : ''
        }
    }
}



