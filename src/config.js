module.exports = {
    project: 'projects/xsu-develop',
    topics: {
        feed: 'xsu-gig-feed',
        gts: 'xsu-gts'
    },
    authScope: 'https://www.googleapis.com/auth/jobs',
    sources: {
        freelancer: {       // TODO Most of this has been moved to the datastore
            displayName: 'Freelancer',
            name: 'xsu-freelancer',
            baseUrl: 'https://www.freelancer.com/api/projects/0.1/projects/active/',
            linkBase: 'https://www.freelancer.com/projects/'
        },
        upwork: {
            name: 'xsu-upwork'
        }
    },
    // TODO Make these real
    rqMeta: {
        domain: 'UNKNOWN',
        sessionId: 'UNKNOWN',
        userId: 'UNKNOWN'
    }
}