const {google} = require('googleapis')
const {auth} = require('google-auth-library');

const getClient = async scope => {
    const client = await auth.getClient({
        scopes: scope
    });
    return google.jobs({version: 'v3', auth: client})
}

exports.withClient = (scope, cb) => {
    getClient(scope).then(client => cb(client))
}

exports.getClient = getClient

