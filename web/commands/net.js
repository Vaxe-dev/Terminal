function speedTestDownload(call) {
  var imageAddr = "https://cdn.orielhaim.tk/sgfp9.png";
  var downloadSize = 4995374; //bytes
  var startTime, endTime;
  var download = new Image();
  startTime = (new Date()).getTime();
  var cacheBuster = "?nnn=" + startTime;
  download.src = imageAddr + cacheBuster;
  download.onload = function () {
    var speedBps = ((downloadSize * 8) / (((new Date()).getTime() - startTime) / 1000)).toFixed(2);
    var speedKbps = (speedBps / 1024).toFixed(2);
    var speedMbps = (speedKbps / 1024).toFixed(2);
     call({status: "ok", test: [speedBps, speedKbps, speedMbps]});
  }
  download.onerror = function (err) {
    console.log(err)
    call({status: "err"})
  }
}
const name = "net"
const short = "Data options over the network"
const script = (cmd, op) => {
  if (!cmd[0]) {
        next()
      } else if (cmd[0] == "location") {
        op.write("<i id='load'>Loading data...</i>",true)
        navigator.geolocation.getCurrentPosition((pos) => {
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
          .then(response => response.json())
          .then(data => {
            op.next()
            document.getElementById("load").remove()
            op.write(`<strong>Your location data:</strong><br>
Latitude:  ${pos.coords.latitude}
Longitude: ${pos.coords.longitude}

Country:   ${data.address.country}
City:      ${data.address.town}
Street:    ${data.address.road}
Number:    ${data.address.house_number}
`,true)
          });
        },()=>{
          op.next();
          op.write("<b error>Error: The command uses the location services of the device. Please confirm access to the service.</b>",true);
          document.getElementById("load").remove()
        },{
          enableHighAccuracy: true,
          timeout: 100000
        });
      } else if (cmd[0] == "network") {
        op.write("<i id='load'>Network data collection...</i>",true)
        fetch('https://ipinfo.io/json')
        .then(response => response.json())
        .then(data => {
          document.getElementById("load").remove()
          op.write(`<strong>Your internet network data:</strong><br>
Hostname: ${data.org}
Type:     ${navigator.connection.effectiveType}
Downlink: ${navigator.connection.downlink}Mb/s
RTT:      ${navigator.connection.rtt}
`,true)
            op.next()
          });
        } else if (cmd[0] == "speedtest") {
          op.write("<strong>Your network speed data:</strong><br>",true)
          op.write("<i id='load'>Network speed tester...</i>",true)
          speedTestDownload((out) => {
            document.getElementById("load").remove()
            op.next()
            if (out.status == "ok") {
              op.write(`
Bps:  ${out.test[0]}
Kbps: ${out.test[1]}
Mbps: ${out.test[2]}
`,true)
            }
          })
        } else {
          op.next()
        }
}
export {name, short, script}