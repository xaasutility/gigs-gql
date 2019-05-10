const {getClient, withClient} = require('./jobsClient');
const {project, authScope, rqMeta} = require('../config')

const makeRequestMetadata = () => rqMeta

exports.getCompany = async externalId => {
    const client = await getClient(authScope);
    const company = await client.projects.companies.get({
        name: externalId
    })
    return company
}

exports.createCompany = async (name, id) => {
    const client = await getClient(authScope);
    client.projects.companies.create({
        parent: project,
        resource: {
            company: {
                displayName: name,
                externalId: id,
            }
        }
    }).then((res, err) => {
        if (err) console.log('Error:', err)
        if (res) console.log('Created company:', res.data)
    }).catch(err => {
        console.log('Exception:', err)
    })
}

const findJob = async (company, reqId) => {
    const client = await getClient(authScope);
    console.log('Finding job:', reqId)
    const res = await client.projects.jobs.list({
        parent: project,
        filter: 'companyName="' + company + '" AND requisitionId="' + reqId + '"'
    }).catch(err => console.log('Caught error', err))
    if (res) {
        console.log(res)
        if (res.data && res.data.jobs && res.data.jobs.length > 0)
            return res.data.jobs[0]
    }
    return null
}

exports.findJob = findJob

exports.getJob = async jobId => {
    const client = await getClient(authScope);
    const name = project + '/jobs/' + jobId
    console.log('Getting job:', name)
    const res = await client.projects.jobs.get({name: name}).catch(err => console.log('Caught error'))
    if (res) {
        // console.log(res)
        return res.data
    }
    return null
}

exports.createJob = async (company, data) => {
    const client = await getClient(authScope);
    const id = data.requisitionId

    if (await findJob(company, id) == null) {
        return client.projects.jobs.create({
            parent: project,
            resource: {
                job: data
            }
        }).then(job => console.log('Created job:', job.data)).catch(err => console.log('Job creation failed:', err))
    }

    return Promise.resolve(null)
}

const makeListQuery = (query) => ({})

const mapSortBy = sortBy => {
    let result = 'relevance desc'
    switch (sortBy) {
        case 'compensation':
            result = 'annualized_total_compensation desc'
            break
        case 'title':
            result = 'title'
            break
        case 'time':
            result = 'postingUpdateTime desc'
            break
    }
    return result
}
//{
//  keywords: 'Software'
//  location: {
//      city: 'Andover',
//      distance: 25
//  },
//  compensation: {
//      type: 'hourly',
//      minimum: 20
//  },
//  sortBy: 'relevance' OR 'title' OR 'compensation' OR 'time' OR 'distance' (not implemented)
//}
const makeSearchQuery = (query) => {
    const request = {};
    if (query) {
        if (query.keywords) {
            request.query = query.keywords
        }
        if (query.location) {
            request.locationFilters = [
                {
                    address: query.location.city,
                    distanceInMiles: query.location.distance
                }
            ]
        }
        if (query.compensation) {
            request.compensationFilter = {
                type: 2, //UNIT_AND_AMOUNT(2),
                units: [
                    query.compensation.type === 'hourly' ? 1 : query.compensation.type === 'yearly' ? 5 : 6, //HOURLY(1) or YEARLY(5)
                ],
                range: {
                    minCompensation: {
                        currencyCode: 'USD',
                        units: query.compensation.minimum
                    }
                }
            }
        }
    }
    return request
}

const makeQuery = (query, companies, token, offset, size, sortBy) => ({
    jobQuery: {
        ...query,
        companyNames: companies
    },
    // TODO Need to find the enum for this, or an appropriate value
    // JobView is a number from 0 to 4
    jobView: 4,
    offset: offset || 0,
    pageSize: size || 500,
    pageToken: token,
    orderBy: mapSortBy(sortBy || 'relevance'),
    searchMode: 'JOB_SEARCH',
    requestMetadata: makeRequestMetadata()
})

exports.listJobs = async (companies, token, offset, size) => {
    const client = await getClient(authScope);

    const query = makeQuery(
        makeListQuery(),
        companies,
        token,
        offset,
        size,
        'time')

    const results = await client.projects.jobs.search({
        parent: project,
        resource: query,
    })

    return results
}

exports.searchJobs = async (companies, query, token, offset, size) => {

    console.log('GTS:searchJobs', companies, query, token, offset, size)
    const client = await getClient(authScope);

    const req = makeQuery(
        makeSearchQuery(query),
        companies,
        token,
        offset,
        size,
        query.sortBy)

    console.log('GTS:searchJobs (query)', req)

    const results = await client.projects.jobs.search({
        parent: project,
        resource: req,
    })

    return results && results.data ? results.data : {}
}

const getJob = async (client, name) => {
    const result = await client.projects.jobs.get({
        // parent: project,
        name: name
    })
    return result
}

const patchObject = (obj, patch) => {
    let result = obj || {}
    const mask = []

    if (patch) {
        result = {
            ...result,
            ...patch
        }
        mask.concat(Object.keys(patch))
    }
    return [result, mask]
}

const executePatch = async (client, job, patch) => {
    const [ res, mask ] = patchObject(job, patch)
    result = await client.projects.jobs.patch({
        name: res.name,
        resource: {
            job: res,
            updateMask: mask.join(',')
        }
    })
}

exports.patchJob = async (job, patch) => {
    console.log('GTS:patchJob', job.name, patch)
    const client = await getClient(authScope);
    let result = {}
    result = await executePatch(client, job, patch)
    return result
}

exports.patch = async (name, patch) => {
    console.log('GTS:patch', name, patch)
    const client = await getClient(authScope);
    let result = {}
    if (name && name.length > 0) {
        const temp = await getJob(client, name)
        console.log('Found job', temp)
        if (temp) {
            result = await executePatch(client, temp.data, patch)
            console.log('Result:', result)
        }
    }
    return result
}
