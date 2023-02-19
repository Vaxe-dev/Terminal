function ping(url, method, callback) {
  var pingStart = new Date();
  fetch(url, { method: method })
    .then(response => {
      callback({
        status: true,
        ping: new Date() - pingStart,
        response: response
      });
    })
    .catch(error => {
      callback({ status: false, error: error });
    });
}

const name = "ping";
const short = "Perform a network check for a web address";

const script = (cmd, op) => {
  if (!cmd[0]) {
    op.next();
    op.write("Please add an address to perform a test.\n");
  } else {
    if (!cmd[2]) cmd[2] = "GET";
    if (cmd[2] === "GET" || cmd[2] === "POST") {
      op.write(`Pinging ${cmd[2]} ${cmd[0]} of data:<br>`, true);
      ping(cmd[0], cmd[2], out => {
        op.next();
        if (out.status) {
          op.write(
            `Reply answer: status=${out.response.status} ping=${out.ping}ms\n`
          );
        } else {
          op.write(
            `Reply answer: status=<u title="${out.error}" style="cursor:pointer;">error</u><br>`,
            true
          );
        }
      });
    } else {
      op.next();
      op.write("Unknown/unsupported method.\n");
    }
  }
};

export { name, short, script };