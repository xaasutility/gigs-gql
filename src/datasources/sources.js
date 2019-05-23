const { DataSource } = require('apollo-datasource');

const sources = require('../gts/gigSource')

class SourceAPI extends DataSource {
    constructor() {
        super();
    }

    initialize(config) {
        console.log('SourceAPI::config - ', config);
    }

    allSources() {
        return sources.all()
    }

    getSourceById(id) {
        return sources.get(id)
    }

    getSourceByName(name) {
        return sources.getByName(name)
    }
}

module.exports = SourceAPI;