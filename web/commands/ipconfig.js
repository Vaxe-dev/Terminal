const name = "ipconfig"
const short = "Show your ip address"
const script = (cmd, op) => {
  op.write("<i id='load'>Loading...</i>",true)
  fetch('https://api.ipify.org?format=json').then(res => res.json()).then(data => {
  document.getElementById("load").remove()
  op.next()
  op.write(`<strong>Terminal IP Configuration</strong><br>
IP: ${data.ip}<br>`,true)
  })
}
export {name, short, script}