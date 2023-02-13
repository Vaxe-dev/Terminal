const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const fs = require("fs");
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Origin-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization")
  if (req.methos === "OPTIONS") {
    res.header("Access-Control-Allow-Origin-Methods", "PUT, POST, PATCH, DELETE, GET")
    return res.status(200).json({});
  }
  next()
})
app.use(express.static('web'));
app.use((req, res) => {
  console.log(req.path)
  if (req.path == "/") {
    res.sendFile(__dirname + "/web/index,html")
  } else if (req.path.split("/")[1] == "plugin") {
    if (fs.existsSync(__dirname + "/plugins/" + req.path.split("/")[2] + ".js")) {
      res.sendFile(__dirname + "/plugins/" + req.path.split("/")[2] + ".js")
    }
  }
})
io.on('connection', function(socket) {
  socket.on("start", function (reply) {
    reply(JSON.parse(fs.readFileSync(__dirname + "/config.json")), fs.readdirSync(__dirname + "/web/commands"))
    fs.writeFileSync(__dirname + "/online/" + socket.id + ".json",JSON.stringify({ip: socket.handshake.address.split(":")[3], account:""}))
  })
  socket.on("account login", function (name, pass, call) {
    const accs = fs.readdirSync(__dirname + "/accounts")
    if (!accs.includes(name + ".json")) return call({status: 400})
    const acc = JSON.parse(fs.readFileSync(__dirname + "/accounts/" + name + ".json"))
    if (acc.password != pass) return call({status: 400})
    call({status: 200, pluginSaveds: acc.pluginSaveds})
    fs.writeFileSync(__dirname + "/online/" + socket.id + ".json",JSON.stringify({account:name}))
  })
  socket.on("account logout", function (name, pass, call) {
    const accs = fs.readdirSync(__dirname + "/accounts")
    if (!accs.includes(name + ".json")) return call(false)
    const acc = JSON.parse(fs.readFileSync(__dirname + "/accounts/" + name + ".json"))
    if (acc.password != pass) return call(false)
    call(true)
    fs.writeFileSync(__dirname + "/online/" + socket.id + ".json",JSON.stringify({account:""}))
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
    acc.pluginSaveds.push({url: url, name: nam})
    fs.writeFileSync(__dirname + "/accounts/" + name + ".json", JSON.stringify(acc))
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
