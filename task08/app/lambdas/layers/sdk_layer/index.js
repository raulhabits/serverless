const axios = require('axios').default;

const instance = axios.create();

instance.defaults.timeout = 5000;

async function get() {
    response = await instance.get("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m");
    //let data = {...response.data};
    //let time = data.hourly.time.map(elem => new Date(elem * 1000).toISOString().substring(0, 16))
    //data.hourly = time;
    return response.data;
}

module.exports.exchange = get;
