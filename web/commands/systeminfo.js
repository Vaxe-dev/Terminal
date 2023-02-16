var browserName = (function (agent) {
  switch (true) {
    case agent.indexOf("edge") > -1: return "Edge";
    case agent.indexOf("edg/") > -1: return "Edge (Chromium based)";
    case agent.indexOf("opr") > -1 && !!window.opr: return "Opera";
    case agent.indexOf("chrome") > -1 && !!window.chrome: return "Chrome";
    case agent.indexOf("trident") > -1: return "MS IE";
    case agent.indexOf("firefox") > -1: return "Mozilla Firefox";
    case agent.indexOf("safari") > -1: return "Safari";
    default: return "other";
  }
})(window.navigator.userAgent.toLowerCase());
const name = "systeminfo"
const short = "Get your system data"
const script = (cmd, op) => {
  op.write("<i id='load'>System data collection...</i>",true)
  let data = {browser:true,type:browserName,cookie:window.navigator.cookieEnabled,version:window.navigator.appVersion.split(" ")[0],platform:window.navigator.platform,lang:window.navigator.language,online:window.navigator.onLine,java:window.navigator.javaEnabled()}
      setTimeout(() => {
        document.getElementById("load").remove()
        op.next()
        op.write(`<strong>Details of the system. (browser)</strong><br>
Type browser:       ${data.type}
Version:            ${data.version}
Language:           ${data.lang}
Cookie enabled:     ${data.cookie}
Platform:           ${data.platform}
Online:             ${data.online}
Java enabled:       ${data.java}
Screen size:        ${screen.width}px / ${screen.height}px
Screen color depth: ${screen.colorDepth} (${screen.colorDepth.toString().replace(8,"256").replace(16,"65,536").replace(24,"16,777,216").replace(32,"4,294,967,296")})
Screen pixel depth: ${screen.pixelDepth}
RAM:                ${navigator.deviceMemory}Gb
Cores:              ${navigator.hardwareConcurrency}
`,true)
      }, 500)
}
export {name, short, script}