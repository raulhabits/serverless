const axios = require('axios').default;

const instance = axios.create();

instance.defaults.timeout = 5000;

async function get() {
    response = await instance.get("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m&format=json&timeformat=unixtime");
    let data = {...response.data};
    let time = data.hourly.time.map(elem => new Date(elem * 1000).toISOString())
    data.hourly = time;
    return data;
}

module.exports.exchange = get;
