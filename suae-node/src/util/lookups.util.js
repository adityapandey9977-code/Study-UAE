const { countries } = require("../constants/countries");
const MasterService = require("../services/master.service");
const LandingPageService = require("../services/landing.service");

exports.countriesIdName = () => {
    let obj = {};
    countries.forEach(c => {
        obj[c.id] = c.name;
    })
    return obj;
}

exports.countriesCodeId = async (req) => {
    const rows = await MasterService.countries(req);
    let obj = {};
    rows.forEach(c => {
        obj[c.iso3] = c.id;
    })
    return obj;
}

exports.statesIdName = async (req) => {
    const rows = await MasterService.states(req);
    let obj = {};
    rows.forEach(c => {
        obj[c.id] = c.name;
    })
    return obj;
}

exports.statesIdCode = async (req) => {
    const rows = await MasterService.states(req);
    let obj = {};
    rows.forEach(c => {
        obj[c.id] = c.code;
    })
    return obj;
}

exports.statesCodeId = async (req) => {
    const rows = await MasterService.states(req);
    let obj = {};
    rows.forEach(c => {
        obj[c.code] = c.id;
    })
    return obj;
}

exports.utmSourcesIdName = async (req) => {
    const rows = await MasterService.listUtmSources(req);
    let obj = {};
    rows.forEach(c => {
        obj[c.id] = c.name;
    })
    return obj;
}

exports.landingPagesIdName = async (req) => {
    const rows = await LandingPageService.list(req);
    let obj = { 1: 'Offline' };
    rows.forEach(c => {
        obj[c.id] = c.name;
    })
    return obj;
}

exports.landingPagesIdUrl = async (req) => {
    const rows = await LandingPageService.list(req);
    let obj = {};
    rows.forEach(c => {
        obj[c.id] = c.url;
    })
    return obj;
}

exports.classesIdName = async (req) => {
    const rows = await MasterService.classes(req);
    let obj = {};
    rows.forEach(c => {
        obj[c.id] = c.name;
    })
    return obj;
}

exports.classesNameId = async (req) => {
    const rows = await MasterService.classes(req);
    let obj = {};
    rows.forEach(c => {
        obj[c.name] = c.id;
    })
    return obj;
}