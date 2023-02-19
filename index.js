const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const fs = require("fs");
const path = require('path');
const fetch = require('node-fetch');

const PLUGINS_DIR = path.join(__dirname, 'plugins');
const WEB_DIR = path.join(__dirname, 'web');
var RateLimit = require('express-rate-limit');
var limiter = new RateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: 20
});

app.use(limiter);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// Serve the static files in the 'web' directory
app.use(express.static(WEB_DIR));

// Handle all other routes
app.use((req, res) => {
  console.log(req.path);
  if (req.path == '/') {
    res.sendFile(path.join(WEB_DIR, 'index.html'));
  } else if (req.path.startsWith('/plugin/')) {
    const pluginName = req.path.split('/')[2];
    const pluginPath = path.join(PLUGINS_DIR, `${pluginName}.js`);
    if (fs.existsSync(pluginPath)) {
      res.sendFile(pluginPath);
    } else {
      res.status(404).send('Plugin not found');
    }
  } else {
    res.status(404).send('Not found');
  }
});
io.on('connection', function(socket) {
  socket.on("start", function (reply) {
    const ip = socket.handshake.address;
    fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`)
    .then(response => response.json())
    .then(data => {
      console.log('User location:', data);
    })
    .catch(error => {
      console.log('Error:', error);
    });
    const browserName = () => {
      const userAgent = socket.handshake.headers['user-agent'];
      if (userAgent.indexOf("Chrome") > -1) {
        return "Chrome"
      } else if (userAgent.indexOf("Firefox") > -1) {
        return "Firefox"
      } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) {
        return "Edge"
      } else if (userAgent.indexOf("Safari") > -1) {
        return "Safari"
      } else {
        return "Unknow"
      }
    }
    reply(JSON.parse(fs.readFileSync(__dirname + "/config.json")), fs.readdirSync(__dirname + "/web/commands"))
    fs.writeFileSync(__dirname + "/online/" + socket.id + ".json",JSON.stringify({ip: ip.split(":")[3], account:"",browser:browserName()}))
  })
  socket.on("account login", function (name, pass, call) {
    const accs = fs.readdirSync(__dirname + "/accounts")
    if (!accs.includes(name + ".json")) return call({status: 400})
    const acc = JSON.parse(fs.readFileSync(__dirname + "/accounts/" + name + ".json"))
    if (acc.password != pass) return call({status: 400})
    call({status: 200, pluginSaveds: acc.pluginSaveds})
    const a = JSON.parse(fs.readFileSync(__dirname + "/online/" + socket.id + ".json"))
    a.account = name
    fs.writeFileSync(__dirname + "/online/" + socket.id + ".json",JSON.stringify(a))
  })
  socket.on("account logout", function (name, pass, call) {
    const accs = fs.readdirSync(__dirname + "/accounts")
    if (!accs.includes(name + ".json")) return call(false)
    const acc = JSON.parse(fs.readFileSync(__dirname + "/accounts/" + name + ".json"))
    if (acc.password != pass) return call(false)
    call(true)
    const a = JSON.parse(fs.readFileSync(__dirname + "/online/" + socket.id + ".json"))
    a.account = ""
    fs.writeFileSync(__dirname + "/online/" + socket.id + ".json",JSON.stringify(a))
  })
  socket.on("account info", function (name, pass, call) {
    const accs = fs.readdirSync(__dirname + "/accounts")
    if (!accs.includes(name + ".json")) return call({status:false})
    const acc = JSON.parse(fs.readFileSync(__dirname + "/accounts/" + name + ".json"))
    if (acc.password != pass) return call({status:false})
    call({status:true,role:acc.role,pluginSavedsCount:acc.pluginSaveds.length})
  })
  socket.on("check certificate", function (url, cer, call) {
    if (!fs.existsSync(__dirname + "/certificates/" + cer + ".json")) return call({exists: false})
    const cert = JSON.parse(fs.readFileSync(__dirname + "/certificates/" + cer + ".json"))
    if (cert.url != url) return call({exists: true, status: false})
    call({exists: true, status: true, type: cert.type, level: cert.level})
  })
  socket.on("save plugin", function (name, pass, url, nam) {
    const accs = fs.readdirSync(__dirname + "/accounts")
    if (!accs.includes(name + ".json")) return;
    const acc = JSON.parse(fs.readFileSync(__dirname + "/accounts/" + name + ".json"))
    if (acc.password != pass) return;
    if (!acc.pluginSaveds.includes({url: url, name: nam})) {
      acc.pluginSaveds.push({url: url, name: nam})
      fs.writeFileSync(__dirname + "/accounts/" + name + ".json", JSON.stringify(acc))
    }
  })
  socket.on("remove plugin", function (name, pass, nam) {
    const accs = fs.readdirSync(__dirname + "/accounts")
    if (!accs.includes(name + ".json")) return;
    const acc = JSON.parse(fs.readFileSync(__dirname + "/accounts/" + name + ".json"))
    if (acc.password != pass) return;
    acc.pluginSaveds = acc.pluginSaveds.filter(function(arrayItem) {
      return arrayItem.name !== nam
    });
    fs.writeFileSync(__dirname + "/accounts/" + name + ".json", JSON.stringify(acc))
  })
  socket.on('disconnect', function() {
    if (fs.existsSync(__dirname + "/online/" + socket.id + ".json")) {
      fs.unlinkSync(__dirname + "/online/" + socket.id + ".json")
    }
  });
});

server.listen(8080, () => {
  fs.rmSync("online", { recursive: true })
  fs.mkdirSync("online")
});