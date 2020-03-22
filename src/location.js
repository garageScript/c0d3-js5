const express = require('express')
const geoip = require('geoip-lite')
const { getData, setData } = require('./db')
const router = express.Router()

let cityToIpMappings = {}
getData('citymappings').then((data) => {
  cityToIpMappings = data || {}
})

const getIp = (req) => {
  const ipInfo = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress
  const ipv4 = ipInfo.split(':').pop()
  if (ipv4.includes('192.168')) { return '45.30.93.93' }
  return ipv4
}

router.use('*', async (req, res, next) => {
  const ip = getIp(req)
  const location = geoip.lookup(ip)
  if (!location) {
    return res.send('No ip available')
  }

  const city = location.city ? location.city + ', ' : ''
  const region = location.region ? location.region + ', ' : ''
  const cityStr = `${city} ${region} ${location.country}`
  const cityInfo = cityToIpMappings[cityStr] || {}
  cityInfo[ip] = cityInfo[ip] || { ...location, ip, cityStr, count: 0 }
  cityInfo[ip].count += 1
  req.user = cityInfo[ip]
  cityInfo[ip] = req.user
  cityToIpMappings[cityStr] = cityInfo
  setData('citymappings', cityToIpMappings)
  next()
})

const getCityCards = () => {
  const sortedCityMappings = Object.entries(cityToIpMappings).sort((city1, city2) => {
    return Object.keys(city1[1]) - Object.keys(city2[1])
  })
  return sortedCityMappings.reduce((acc, [cityname, cityInfo]) => {
    const count = Object.values(cityInfo).reduce((acc, city) => {
      return acc + city.count
    }, 0)
    return acc + `
    <a href="/location/city/${cityname}"> 
    <h2>${cityname} - ${count}</h2>
    </a>
    `
  }, '')
}

router.get('/city/:cityName', (req, res) => {
  const ipMappings = cityToIpMappings[req.params.cityName]
  const firstEntry = Object.values(ipMappings)[0]
  const html = getHtml(firstEntry.ll, firstEntry.cityStr, req.user)
  res.send(html)
})

router.get('/api/ip', (req, res) => {
  res.json(req.user)
})

const getHtml = (ll, cityStr, user = {}) => {
  const cityCards = getCityCards()

  const ipMappings = cityToIpMappings[cityStr]
  const ipMarkers = Object.values(ipMappings).reduce((acc, location) => {
    return acc + `
  new google.maps.Marker({
    position: {lat: ${location.ll[0]}, lng: ${location.ll[1]}},
    map: map,
    title: '${location.count} Hits'
  })
    `
  }, '')

  return `
  <h1>You are visiting from ${user.cityStr}</h1>
<div id="googleMap" style="width:100%;height:600px;"></div>
<h1>The cities our visitors come from</h1>
<div>${cityCards}</div>

<script>
  function myMap() {
    var mapProp= {
      center:new google.maps.LatLng(${ll[0]},${ll[1]}),
        zoom:11,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
    ${ipMarkers}
  }
</script>

<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB29pGpCzE_JGIEMLu1SGIqwoIbc0sHFHo&callback=myMap"></script>
  `
}

router.get('/', (req, res) => {
  const html = getHtml(req.user.ll, req.user.cityStr, req.user)
  res.send(html)
})

module.exports = router
