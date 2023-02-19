const getBrowserName = () => {
  const agent = window.navigator.userAgent.toLowerCase();
  if (agent.indexOf("edge") > -1) {
    return "Edge";
  } else if (agent.indexOf("edg/") > -1) {
    return "Edge (Chromium based)";
  } else if (agent.indexOf("opr") > -1 && !!window.opr) {
    return "Opera";
  } else if (agent.indexOf("chrome") > -1 && !!window.chrome) {
    return "Chrome";
  } else if (agent.indexOf("trident") > -1) {
    return "MS IE";
  } else if (agent.indexOf("firefox") > -1) {
    return "Mozilla Firefox";
  } else if (agent.indexOf("safari") > -1) {
    return "Safari";
  } else {
    return "other";
  }
};

const name = "systeminfo";
const short = "Get your system data";
const script = (cmd, op) => {
  op.write("<i id='load'>System data collection...</i>", true);

  const data = {
    browser: true,
    type: getBrowserName(),
    cookie: window.navigator.cookieEnabled,
    version: window.navigator.appVersion.split(" ")[0],
    platform: window.navigator.platform,
    lang: window.navigator.language,
    online: window.navigator.onLine,
    java: window.navigator.javaEnabled(),
  };

  setTimeout(() => {
    document.getElementById("load").remove();
    op.next();
    op.write(`<strong>Details of the system. (browser)</strong><br>
Type browser:       ${data.type}
Version:            ${data.version}
Language:           ${data.lang}
Cookie enabled:     ${data.cookie}
Platform:           ${data.platform}
Online:             ${data.online}
Java enabled:       ${data.java}
Screen size:        ${screen.width}px / ${screen.height}px
Screen color depth: ${screen.colorDepth
      .toString()
      .replace("8", "256")
      .replace("16", "65,536")
      .replace("24", "16,777,216")
      .replace("32", "4,294,967,296")}
Screen pixel depth: ${screen.pixelDepth}
RAM:                ${navigator.deviceMemory}Gb
Cores:              ${navigator.hardwareConcurrency}
`, true);
  }, 500);
};

export { name, short, script };