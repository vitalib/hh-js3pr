const {selectionMachine} = require("./SelectionMachine.js");

const [KEYDOWN, KEYUP, ENTER, KEYLEFT, KEYRIGHT, SPACE] = [40, 38, 13, 37, 39, 32];

const selectorInput = document.getElementsByClassName("selector-input")[0];

selectorInput.addEventListener("keyup", function(event) {
  if (event.keyCode === ENTER) {
      selectionMachine.transition('enter');
  }  else if (event.keyCode == KEYUP || event.keyCode == KEYDOWN) {
      selectionMachine.transition('upDownKeys', {'keyCode': event.keyCode})
  } else if(event.keyCode == KEYLEFT
      || event.keyCode == SPACE
      || event.keyCode == KEYRIGHT){
      event.preventDefault();
  } else {
      selectionMachine.transition('input', event);
  }
});

selectorInput.addEventListener("keydown", function(event) {
    if(event.keyCode == KEYLEFT
        || event.keyCode == KEYRIGHT
        || event.keyCode == KEYUP
        || event.keyCode == SPACE
        || event.keyCode == KEYDOWN){


        event.preventDefault();
    }
});
