const socket = io()
const commands = {
  help: {
    short:"Provides Help information for Terminal commands",
    script: (cmd) => {
      next()
      if (!cmd[0]) {
        write(`<strong>For more information on a specific command, type HELP command-name:</strong><br><br>`,true);
        commandNames.map((a) => {write(`${a.toUpperCase()}${new Array(10).fill(" ").join(" ").substring(a.length)}${commands[a].short}.\n`)})
        write("<br><strong>Plugins</strong><br><br>",true)
        pluginNames.map((a) => {write(`${a.toUpperCase()}${new Array(10).fill(" ").join(" ").substring(a.length)}${plugins[a].short}.\n`)})
      } else {
        if (commandNames.includes(cmd[0])) {
          write(`<strong>Name:</strong>
    ${cmd[0]}
<strong>Type:</strong>
    Command
<strong>Description:</strong>
    ${commands[cmd[0]].description}
`,true)
        } else if (pluginNames.includes(cmd[0])) {
          write(`<strong>Name:</strong>
    ${cmd[0]}
<strong>Type:</strong>
    Plugin
<strong>Description:</strong>
    ${plugins[cmd[0]].description}
`,true)
        } else {
          write(`'${cmd[0]}' This command is not supported by the help utility.`)
        }
      }
    }
  },
  history: {
    short: "Get the command history list",
    script: (cmd) => {
      write("Id  CommandLine\n")
      write("--  -----------\n")
      history.map((a,i)=>{write((((i + 1) < 10) ? " " : "") + (i + 1) + "  " + a + "\n")})
      next()
    }
  },
  account: {
    short: "User connection and management options",
    script: (cmd) => {
      if (!cmd[0]) {
        if (!account.username) {
          next()
          write("You are not connected to any account. To log in, run the command: account login\n")
        } else {
          socket.emit("account info",account.username, account.password, (data) => {
            next()
            write(`<strong>Account Info</strong><br>
Username:
  ${account.username}
Role:
  ${data.role}
Plugin Saveds:
  ${data.pluginSavedsCount}
`,true)
          })
        }
      } else if (cmd[0] == "login") {
        write("Username: ")
        input("text", (name) => {
          write(name)
          write("<br>Password: ",true)
          input("password", (pass) => {
            write("<i id='load'>Validates user data...</i>",true)
            socket.emit("account login", name, pass, (data) => {
              $("#load").remove()
              if (data.status == 200) {
                write("<br><b success>authenticated You are now logged in.</b><br>",true)
                $("#name").html(name + "@$>")
                account.username = name
                account.password = pass
                if (cmd[1] == "--save") {
                  localStorage.setItem("username",name)
                  localStorage.setItem("password",pass)
                }
              } else {
                write("<br><b error>Error: Invalid user data. Please try again</b><br>",true)
              }
              next()
            })
          })
        })
      } else if (cmd[0] == "logout") {
      if (!account.username) {
        write("<b error>You are not currently logged in to any account.</b><br>",true)
        next()
      } else {
        socket.emit("account logout", account.username, account.password, (check) => {
          next()
          if (check) {
            $("#name").html("@$>")
            write("<b success>Logout of the account was done successfully.</b><br>",true)
            localStorage.setItem("username","")
            localStorage.setItem("password","")
          } else {
            write("Error: A login error occurred with the account details.\n")
          }
        })
      }
    } else {
      write(`'${cmd.join(" ")}' This command is not supported by the account utility.<br>`)
    }
    }
  },
  window: {
    short: "Control browser window options",
    script: (cmd) => {
      next()
      if (!cmd[0]) {
    
      } else if (cmd[0] == "open") {
        write("A new window opens.\n")
        if (cmd.includes("--new")) {
          cmd.splice(cmd.indexOf("--new"),1)
          var a = `width=${window.width},height=${window.height}`
        } else {
          var a = ""
        }
        win.push(window.open(cmd[1] || "","",a))
      } else if (cmd[0] == "close") {
        if (!win[0])
          return write("<b erroe>Error: No windows were opened.</b><br>",true)
        if (cmd[1] == "--all") {
          win.map((w) => {if (!w.closed) {w.close()}})
          write("All windows were closed successfully. (" + win.length + ")\n")
          win.splice(0, win.length)
          return;
        }
        if (win[(cmd[1] - 1 || win.length - 1)].closed) {
          win.splice((cmd[1] - 1|| win.length - 1),1)
          return write("<b error>Error: The window has already been closed.</b><br>",true)
        }
        win[(cmd[1] - 1 || win.length - 1)].close()
        write("The window closed successfully.\n")
        win.splice((cmd[1] - 1 || win.length - 1),1)
      } else if (cmd[0] == "count") {
        win.map((a, i) => {if (a.closed) return win.splice(i,1)})
        write(win.length + ` windows are currently open<br>`,true)
      } else {
        write(`'${cmd.join(" ")}' This command is not supported by the window utility.<br>`)
      }
    }
  },
  refresh: {
    short: "Refresh the terminal window",
    script: () => {
      window.location.reload()
    }
  },
  fullscreen: {
    short: "Toggle full screen mode",
    script: () => {
      next()
      toggleFullScreen()
    }
  },
  listener: {
    short: "Speech to text translation",
    script: (cmd) => {
      voic.lang = (cmd[0] || window.navigator.language)
      voicToText((cmd[0] || window.navigator.language))
    }
  },
  tpm: {
    short: "Terminal Plugin Manager",
    script: (cmd) => {
      if (cmd[0] == "install" || cmd[0] == "i") {
        if (!cmd[1]) return next()
        cmd[1] = cmd[1].replace("https://","")
        cmd[1] = "https://" + cmd[1]
        import(cmd[1]).then((data) => {
          if (!data.certificate) {
            write(`This plugin does not have a security certificate, are you sure you want to install it? (y/n)\n`)
            input("text", (out) => {
              if (out == "y") {
                pluginInstall(cmd[1], "low", (cmd[2] == "--save"))
              } else {
                next()
              }
            })
          } else {
            socket.emit("check certificate", cmd[1], data.certificate, (status) => {
              if (status.exists == true && status.status == true && data.type == status.type) {
                pluginInstall(cmd[1], status.level, (cmd[2] == "--save"))
              } else {
                write("The plugin is advertised under a fake security certificate, it cannot be installed.\n")
                next()
              }
            })
          }
        }).catch((error) => {
          console.log(error)
          next()
        })
      } else if (cmd[0] == "uninstall") {
        next()
        if (pluginNames.includes(cmd[1])) {
          pluginUninstall(cmd[1], (cmd[2] == "--global"))
          write(`<b success>The '${cmd[1]}' plugin has been successfully removed</b><br>`,true)
        } else {
          write(`<b error>Error: '${cmd[1]}' No such plugin was installed.</b><br>`,true)
        }
      }
    }
  }
}
const commandNames = ["help","history","account","window","refresh","fullscreen","tpm"]
const plugins = {}
const pluginNames = []
let account = {username:"",password:""}
let pass = ""
let win = []
let history = [];
//const voic = new SpeechRecognition();
//voic.interimResults = true;
const normalizePozition = (mouseX, mouseY) => {
  const scope = document.querySelector("body");
  const contextMenu = document.getElementById("board-menu");
        // ? compute what is the mouse position relative to the container element (scope)
        let {
          left: scopeOffsetX,
          top: scopeOffsetY,
        } = scope.getBoundingClientRect();
        scopeOffsetX = scopeOffsetX < 0 ? 0 : scopeOffsetX;
        scopeOffsetY = scopeOffsetY < 0 ? 0 : scopeOffsetY;
       
        const scopeX = mouseX - scopeOffsetX;
        const scopeY = mouseY - scopeOffsetY;
        // ? check if the element will go out of bounds
        const outOfBoundsOnX =
          scopeX + contextMenu.clientWidth > scope.clientWidth;
        const outOfBoundsOnY =
          scopeY + contextMenu.clientHeight > scope.clientHeight;
        let normalizedX = mouseX;
        let normalizedY = mouseY;
        // ? normalize on X
        if (outOfBoundsOnX) {
          normalizedX =
            scopeOffsetX + scope.clientWidth - contextMenu.clientWidth;
        }
        // ? normalize on Y
        if (outOfBoundsOnY) {
          normalizedY =
            scopeOffsetY + scope.clientHeight - contextMenu.clientHeight;
        }
        return { normalizedX, normalizedY };
      };
function pluginInstall(url, level, save, hash) {
  import(url).then((data) => {
    if (data.type == "script") {
      pluginNames.push(data.name)
      plugins[data.name] = {}
      plugins[data.name].short = data.short
      plugins[data.name].script = data.script
      plugins[data.name].url = url
      if (level == "low" || level == "medium" || level == "high") {
        if (!!data.css) {
          const css = `<style id="plugin_${data.name}_css">${data.css}</style>`
          $("head").append(css)
        }
      }
      if (level == "medium" || level == "high") {
        if (!!data.html) {
          const html = `<div id="plugin_${data.name}_html">${data.html}</div>`
          $("body").append(html)
        }
      }
      if (level == "high") {
        if (!!data.js) {
        const js = `<script id="plugin_${data.name}_js">${data.js}</script>`
        $("body").append(js)
        }
      }
    }
    next()
    if (!hash)
      write(`<b success>The plugin has been successfully installed.</b><br>`,true)
    if (save) {
      if (!localStorage.getItem("plugins")) {
        localStorage.setItem("plugins", JSON.stringify([]))
      }
      const p = JSON.parse(localStorage.getItem("plugins"))
      p.push(url)
      localStorage.setItem("plugins", JSON.stringify(p))
      if (!!account.username) {
        socket.emit("save plugin", account.username, account.password, url, data.name)
      }
    }
  })
}
function pluginUninstall(name, global) {
  $(`#plugin_${name}_html`).remove()
  $(`#plugin_${name}_css`).remove()
  $(`#plugin_${name}_js`).remove()
  $(`.plugin_${name}`).remove()
  if (JSON.parse(localStorage.getItem("plugins")).includes(plugins[name].url) && global) {
    const p = JSON.parse(localStorage.getItem("plugins")).filter(function(arrayItem) {
    return arrayItem !== plugins[name].url;
  });
    localStorage.setItem("plugins", JSON.stringify(p))
    if (!!account.username) {
        socket.emit("remove plugin", account.username, account.password, name)
      }
  }
  pluginNames.splice(pluginNames.indexOf(name),1)
  delete plugins[name]
}
function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen){
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {   /* Chrome, Safari & Opera */
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (document.msRequestFullscreen) { /* IE/Edge */
      document.documentElement.msRequestFullscreen();
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {   /* Chrome, Safari and Opera */
      document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
  }
}
const randomString = (len, an) => {
  an = an && an.toLowerCase();
  var str = "",
    i = 0,
    min = an == "a" ? 10 : 0,
    max = an == "n" ? 10 : 62;
  for (; i++ < len;) {
    var r = Math.random() * (max - min) + min << 0;
    str += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48);
  }
  return str;
}
const write = (msg, sys) => {
  msg = msg.toString()
  if (!sys)
    msg = msg.replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll("\n","<br>")
  $("#output").append(msg)
}
const input = (type,call) => {
  write(`<input id="wait">`,true)
  $("#wait").focus()
  $("#wait").keydown((e) => {
    if (e.key == "Enter") {
      let val = $("#wait").val()
      $("#wait").remove()
      if (type == "text") {
        call(val)
      } else {
        call(pass)
        pass = ""
      }
      return;
    }
    if (type == "password") {
      if (e.key == "Backspace") {
        pass = pass.replace(/.$/, '')
        alert(pass)
      } else {
        pass += e.key
      }
    }
  })
  if (type == "password") {
      $("#wait").on("input",function () {
        $("#wait").val("")
      })
    }
}
const next = () => {
  $("#prompt").css("display","block")
  $("#cmdline").focus()
  $('html,body').animate({scrollTop: document.body.scrollHeight},"fast");
}
function cmdFillter(cmd) {
  if (cmd.startsWith("account login")) {
    cmd = cmd.replace("--save", "<i blur>--save</i>")
  } else if (cmd.startsWith("window open")) {
    cmd = cmd.replace("--new", "<i blur>--new")
  } else if (cmd.startsWith("window close")) {
    cmd = cmd.replace("--all", "<i blur>--all")
  }
  return cmd
}

function capture(hash, com) {
  var cmd = ($("#cmdline").val() || com);
  if (!cmd) 
    return write(`<br>${account.username}@$>`,true)
  if (!hash) {
    $("#cmdline").val("");
    history.push(cmd)
    write(`<br>${account.username}@$>${cmdFillter(cmd)}<br>`,true);
  }
  document.getElementById("prompt").style.display = "none"
  cmd = cmd.split(" ")
  const c = cmd[0]
  cmd.splice(0,1)
  const op = {write: write, next: next, input: input, randomString: randomString}
  if (commandNames.includes(c)) {
    commands[c].script(cmd, op)
  } else if (pluginNames.includes(c)) {
    plugins[c].script(cmd, op)
  } else {
    next()
    write(`'${c}' is not recognized as an internship or externship command.<br>`,true);
    history.splice(history.length - 1,1)
  }
}
$("#cmdline").keydown(function (e) {
  if (e.key == "Enter") {
    capture(false)
  }
})
function cmdfocus() {
  if ($("#cmdline").css("display") == "inline-block")
    $("#cmdline").focus()
}
socket.emit("start", (data, cmds) => {
  cmds.map((a) => {cmdAdd(a)})
  if (!!localStorage.getItem("plugins")) {
    JSON.parse(localStorage.getItem("plugins")).map((a, b) => {
      import(JSON.parse(localStorage.getItem("plugins"))[b]).then((data) => {
          if (!data.certificate) {
            write(`This plugin does not have a security certificate, are you sure you want to install it? (y/n)\n`)
            input("text", (out) => {
              if (out == "y") {
                pluginInstall(JSON.parse(localStorage.getItem("plugins"))[b], "low", false, true)
              } else {
                next()
              }
            })
          } else {
            socket.emit("check certificate", JSON.parse(localStorage.getItem("plugins"))[b], data.certificate, (status) => {
              if (status.exists == true && status.status == true && data.type == status.type) {
                pluginInstall(JSON.parse(localStorage.getItem("plugins"))[b], status.level, false, true)
              } else {
                next()
              }
            })
          }
        })
    })
  }
  socket.emit("account login", localStorage.getItem("username"), localStorage.getItem("password"), (out) => {
    if (out.status == 200) {
      out.pluginSaveds.map((a) => {
        if (!pluginNames.includes(a.name)) {
          pluginInstall(a.url, status.level, false, true)
        }
      })
      $("#name").html(localStorage.getItem("username") + "@$>")
      account.username = localStorage.getItem("username")
      account.password = localStorage.getItem("password")
    }
    write(`Terminal [Version ${data.version}]<br>Vaxe Corporation. All rights reserved.<br>`, true)
  if (data.mode == "open") {
    next()
  } else {
    $("#prompt").remove()
    $("script").remove()
    write("<b error>The terminal is now closed. Please try again later.</b>",true)
  }
  })
})
function cmdAdd(cmd) {
  $("body").append(`<script src="${cmd}" type="module" id="a"></script>`)
  import("/commands/" + cmd).then((data) => {
    $("#a").remove()
    commandNames.push(data.name)
    commands[data.name] = {}
    commands[data.name].short = data.short
    commands[data.name].script = data.script
  })
}
jQuery(document).ready(function ($) {
  $("body").click(cmdfocus)
  $("#cmdline").blur(cmdfocus)
  $("body").keydown(function (e) {
    if (e.ctrlKey) {
      if (e.key == "r") {
        capture(true, "refresh")
      }
    }
  })
  $("input").on("contextmenu", function(event) {
    event.preventDefault();
    event.stopPropagation();
    const contextMenu = document.getElementById("board-menu");
    const { clientX: mouseX, clientY: mouseY } = event;
    const { normalizedX, normalizedY } = normalizePozition(mouseX, mouseY);
    contextMenu.classList.remove("visible");
    contextMenu.style.top = `${normalizedY}px`;
    contextMenu.style.left = `${normalizedX}px`;
    if (!window.getSelection().toString()) {
      $("#menu-copy").hide()
    } else {
      $("#menu-copy").click(function () {
        navigator.clipboard.writeText(window.getSelection().toString())
      }).show()
    }
    if ($(event.target).closest('input').length) {
      $("#menu-paste").show().click(function () {
        navigator.clipboard.readText()
  .then(pase => {
    const input = $(event.target).closest('input');
    const startPos = input[0].selectionStart;
    const endPos = input[0].selectionEnd;
    const text = input.val();
    const newText = text.substring(0, startPos) + pase + text.substring(endPos, text.length);
    input.val(newText);
  })
  .catch(err => console.log(err));
      })
    } else {
      $("#menu-paste").hide()
    }
    contextMenu.classList.add("visible");
  });
  $("body").on("click", (e) => {
    const contextMenu = document.getElementById("board-menu");
    if (e.target.offsetParent != contextMenu) {
      contextMenu.classList.remove("visible");
    }
  });
})