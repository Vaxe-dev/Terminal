const name = "ipconfig"
const short = "Show your ip address"
const script = async (cmd, op) => {
  op.write("<i id='load'>Loading...</i>",true);
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) {
      throw new Error('Failed to get IP address');
    }
    const data = await response.json();
    document.getElementById("load").remove();
    op.next();
    op.write(`<strong>Terminal IP Configuration</strong><br>
IP: ${data.ip}<br>`,true);
  } catch (error) {
    op.next();
    op.write(`Error: ${error.message}<br>`, true);
  }
}
export {name, short, script};