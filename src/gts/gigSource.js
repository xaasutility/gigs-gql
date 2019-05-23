const Firestore = require('@google-cloud/firestore');
const Timestamp = Firestore.Timestamp;

const firestore = new Firestore();

const fromUpdateTime = secs => secs*1000
const toUpdateTime = ms => Math.floor(ms / 1000)

const fromDate = dt => toUpdateTime(dt.setMilliseconds(0))

const fromTimestamp = ts => toUpdateTime(ts.toMillis())
const toTimestamp = secs => Timestamp.fromMillis(fromUpdateTime(secs))

const preStore = source => {
    source.lastUpdate = toTimestamp(source.lastUpdate)
    return source
}

const postLoad = source => {
    source.lastUpdate = fromTimestamp(source.lastUpdate)
    return source
}

const fetchSource = async (ref) => {
    console.log('Fetching:', ref);
    let document = await ref.get();
    console.log('Document:', document);
    let doc = null;

    if (document.exists) {
        doc = postLoad(document.data())
    }

    console.log('Result:', doc);
    return doc;
}

const fetchSourceByCompanyName = async name => {
    console.log('Fetch by name:', name);
    const result =
        await firestore.collection('gig-sources')
            .where('gtsId', '==', name)
            .get();
    console.log('Fetched:', result);

    if (result) {
        const sources = [];
        result.forEach(src => {
            console.log('Source:', src);
            sources.push(src.data())
        });
        return sources.length > 0 ? sources[0] : {}
    }
    return {};
}

const allSources = async () => {
    const result = await firestore.collection('gig-sources').get()
    const sources = []
    result.forEach(src => sources.push(src.data()))
    return sources
}

const getSource = async (name) =>  await fetchSource(firestore.doc('gig-sources/'+name))

const createSource = async (name, title, id) => {
    let doc = await getSource(name)

    if (doc == null) {
        const update = toUpdateTime(new Date())
        const docRef = firestore.doc('gig-sources/'+name)
        await docRef.set({
            name: name,
            title: title,
            lastUpdate: toTimestamp(fromDate(new Date())),
            gtsId: id
        })
        doc = await docRef.get()
        doc = doc.data()
    }
    return doc
}

const updateSource = async source => {
    const docRef = firestore.doc('gig-sources/'+source.name)
    await docRef.set(preStore(source))
    doc = await fetchSource(docRef)
    return doc
}

exports.get = getSource
exports.getByName = fetchSourceByCompanyName
exports.create = createSource
exports.update = updateSource
exports.all = allSources
exports.fromDate = fromDate
