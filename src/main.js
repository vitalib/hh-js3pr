const {aMachine} = require("./SelectionMachine.js");

const [KEYDOWN, KEYUP, ENTER, KEYLEFT, KEYRIGHT] = [40, 38, 13, 37, 39];

const selectorInput = document.getElementsByClassName("selector-input")[0];

selectorInput.addEventListener("keyup", function(event) {
  if (event.keyCode === ENTER) {
      aMachine.transition('enter');
  }  else if (event.keyCode == KEYUP || event.keyCode == KEYDOWN) {
      aMachine.transition('upDownKeys', {'keyCode': event.keyCode})
  } else if(event.keyCode == KEYLEFT || event.keyCode == KEYRIGHT){
      event.preventDefault();
  } else {
      aMachine.transition('input', event);
  }
});

selectorInput.addEventListener("keydown", function(event) {
    if(event.keyCode == KEYLEFT
        || event.keyCode == KEYRIGHT
        || event.keyCode == KEYUP
        || event.keyCode == KEYDOWN){

        event.preventDefault();
    }
});
