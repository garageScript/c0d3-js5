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

router.get('/', (req, res) => {
  const sortedCityMappings = Object.entries(cityToIpMappings).sort((city1, city2) => {
    return Object.keys(city1[1]) - Object.keys(city2[1])
  })
  const cityCards = sortedCityMappings.reduce((acc, [cityname, cityInfo]) => {
    const count = Object.values(cityInfo).reduce((acc, city) => {
      return acc + city.count
    }, 0)
    return acc + `
    <h2>${cityname} - ${count}</h2>
    `
  }, '')

  const ipMappings = cityToIpMappings[req.user.cityStr]
  const ipMarkers = Object.values(ipMappings).reduce((acc, location) => {
    return acc + `
  new google.maps.Marker({
    position: {lat: ${location.ll[0]}, lng: ${location.ll[1]}},
    map: map,
    title: '${location.count} Hits'
  })
    `
  }, '')

  const html = `
<div id="googleMap" style="width:100%;height:600px;"></div>
<div>${cityCards}</div>

<script>
  function myMap() {
    var mapProp= {
      center:new google.maps.LatLng(${req.user.ll[0]},${req.user.ll[1]}),
        zoom:11,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
    ${ipMarkers}
  }
</script>

<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB29pGpCzE_JGIEMLu1SGIqwoIbc0sHFHo&callback=myMap"></script>
  `
  res.send(html)
})

module.exports = router
