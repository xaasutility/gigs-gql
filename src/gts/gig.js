const sources = require('./gigSource')

const mapType = unit => {
    if (unit == "HOURLY") return 'hourly'
    if (unit == "ONE_TIME") return 'fixed'
    return 'unspecified'
}

function mapLocations(project) {
    // console.log(project.location)
    // const {administrative_area, city, country, vicinity, full_address} = project.location
    const results = []
    // if (administrative_area) results.push(administrative_area)
    // if (city) results.push(city)
    // if (country && country.name) results.push(country.name)
    // if (vicinity) results.push(vicinity)
    // if (full_address) results.push(full_address)
    // console.log('Mapped addresses:', results)
    if (project && project.currency && project.currency.country) results.push(project.currency.country)
    return results
}

function mapCompToGTS(gig) {
    const unit = gig.type == 'hourly' ? 'HOURLY' : 'ONE_TIME'
    return {
        entries: [{
            type: 'BASE',
            unit: unit,
            range: {
                maxCompensation: {
                    currencyCode: gig.currency,
                    units: gig.maximum
                },
                minCompensation: {
                    currencyCode: gig.currency,
                    units: gig.minimum
                }
            }
        }]
    }
}

function mapCompGTSToGig(job) {
    let type = 'unspecified',
        currency = 'USD',
        minimum = 0,
        maximum = 0

    if (job && job.compensationInfo && (job.compensationInfo.entries.length > 0)) {
        // console.log(job.compensationInfo)
        const {unit, amount, range} = job.compensationInfo.entries[0]
        // console.log(unit, amount, range)
        type = mapType(unit)
        if (amount) {
            maximum = minimum = amount.units
            if (amount.currencyCode) currency = amount.currencyCode
        } else if (range) {
            maximum = Number(range.maxCompensation.units)
            minumum = Number(range.minCompensation.units)
            if (range.maxCompensation.currencyCode) currency = range.maxCompensation.currencyCode
            if (range.minCompensation.currencyCode) currency = range.minCompensation.currencyCode
        }
    }
    return {type: type, currency: currency, minimum: minimum, maximum: maximum}
}

const makeAttribute = (value, filterable) => {
    return {
        filterable: filterable,
        stringValues: [ value ]
    }
}

const makeLongAttribute = (value, filterable) => {
    return {
        filterable: filterable,
        longValues: [ value ]
    }
}

const makeCustomAttributes = gig => ({
    "isSaved": makeAttribute(gig.isSaved ? "true" : "false"),
    "rank": makeLongAttribute(gig.rank, false)
})

const mapCustomAttributes = job => {
    const result = {}
    const map = job.customAttributes
    // console.log(map)
    if (map) {
        const savedAttr = map["isSaved"]
        const rankAttr = map["rank"]
        if (savedAttr) {
            const val = savedAttr.stringValues[0]
            result.isSaved = val == "true" ? true : false
        }
        if (rankAttr) {
            const val = rankAttr.longValues[0]
            result.rank = val
        }
    }
    return result
}

exports.create = () => ({
    title: '<No Title>',
    description: '',
    url: '',
    datePosted: Date.now(),
    location: '',
    status: 'NEW',
    zaaasId: '',
    rank: 0,
    isSaved: false
})

exports.fromGTS = (job) => ({
    title: job.title,
    description: job.description,
    url: job.applicationInfo.uris[0],
    datePosted: job.postingUpdateTime,
    location: job.addresses,
    status: 'active',
    zaasId: job.name,
    ...mapCustomAttributes(job),
    id: job.requisitionId,
    ...mapCompGTSToGig(job),
    companyName: job.companyName
})

exports.toGTS = gig => ({
    companyName: gig.source.gtsId,
    requisitionId: gig.id.toString(),
    addresses: mapLocations(gig),
    title: gig.title,
    description: gig.description,
    applicationInfo: {
        uris: [ gig.url ]
    },
    name: gig.zaaasId,
    compensationInfo: mapCompToGTS(gig),
    customAttributes: makeCustomAttributes(gig),
    addresses: gig.location
})

exports.fromFreelancer = (project, source) => ({
    title: project.title,
    description: project.preview_description,
    url: source.baseUrl + project.seo_url,
    datePosted: project.time_updated,
    location: mapLocations(project),
    status: project.frontend_project_status,
    zaasId: null,
    rank: 0,
    isSaved: false,
    id: project.id,
    type: project.type,
    currency: project.currency.code,
    minimum: project.budget.minimum,
    maximum: project.budget.maximum,
    source: source
})

const mapBudget = budget => {
    let minimum = 0,
        maximum = budget

    // if (budgetString.startsWith('-')) {
    //     maximum = Number(budgetString.substr(1))
    // } else if (budgetString.endsWith('-')) {
    //     minimum = Number(budgetString.substr(-1))
    // } else if (budgetString.startsWith('[')) {
    //     const parts = budgetString.slice(1, -1).split(' ')
    //     minimum = Number(parts[0])
    //     maximum = Number(parts[-1])
    // } else {
    //     minimum = maximum = Number(budgetString)
    // }
    return {
        minimum: minimum,
        maximum: maximum
    }
}

exports.fromUpwork = (job, source) => ({
    title: job.title,
    description: job.snippet,
    url: job.url,
    datePosted: new Date(job.date_created),
    location: job.client.country,
    status: job.job_status,
    zaasId: null,
    rank: 0,
    isSaved: false,
    id: job.id,
    type: job.job_type,
    currency: 'USD',
    ...mapBudget(job.budget),
    source: source
})

exports.setSaved = (gig, saved) => {
    if (gig.isSaved != saved) {
        // TODO Need to send updates (patch)
        // Not sure that we want to save this in GTS. How would we discriminate
        // by user?
    }
}

exports.validate = gig => (true)
