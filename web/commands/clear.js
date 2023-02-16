const name = "clear"
const short = "Cleans the terminal board"
const script = (cmd, op) => {
  document.getElementById("output").innerHTML = ""
  op.next()
}
export {name, short, script}