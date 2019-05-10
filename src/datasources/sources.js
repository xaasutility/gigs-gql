const { DataSource } = require('apollo-datasource');

const sources = require('../gts/gigSource')

class SourceAPI extends DataSource {
    constructor() {
        super();
    }

    initialize(config) {
        console.log('SourceAPI::config - ', config);
    }

    async allSources() {
        return sources.all()
    }

    async getSourceById(id) {
        return sources.get(id)
    }
}