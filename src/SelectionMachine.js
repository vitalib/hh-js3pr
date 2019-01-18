const {machine, useContext, useState} = require("./StateMachine");
const aMachine = machine({
    id: 'selector',
    initialState: 'noProposals',
    context: {
        prevInput: "",
        prevState: "",
        inputSelectorClass: "selector-input",
        proposalListClass: "proposal-list",
        selectedTownsClass: 'selected-towns',
        cities: [],
    },
    states: {
        'noProposals': {
            onEntry(event) {
                const[context, setContext] = useContext();
                const proposalList = document.getElementsByClassName(context.proposalListClass)[0];
                while (proposalList.firstChild) {
                    proposalList.removeChild(proposalList.firstChild);
                }
            },
            on: {
                'input': {
                    service: (event) => {
                        const[state, setState] = useState();
                        const[context, setContext] = useContext();
                        const selectedTowns = document.getElementsByClassName(
                            context.selectedTownsClass
                        )[0]
                        const BACKSPACE = 8;
                        if (event.keyCode == BACKSPACE
                                && !context.prevInput
                                && selectedTowns.children.length){
                            selectedTowns.removeChild(selectedTowns.lastChild);
                            setState('noProposals')
                        } else {
                            setContext({prevState: state});
                            setState('request');
                        }
                    }
                },
                'upDownKeys': {
                    target: 'noProposals',
                },
                'enter': {
                    target: 'noProposals'
                }

            }

        },
        'request': {
            onEntry(event) {
                const[state, setState] = useState();
                const[context, setContext] = useContext();
                const curInput = document
                                    .getElementsByClassName(context.inputSelectorClass)[0]
                                    .value;
                if (curInput.length < 2) {
                    setState('noProposals');
                    setContext({prevInput: curInput})
                    return;
                }
                if (context.prevInput === curInput) {
                    setState(context.prevState);
                    return;
                }
                let url = new URL("https://api.hh.ru/suggests/areas")
                let params = {text: curInput};
                url.search = new URLSearchParams(params)
                window.fetch(url)
                    .then(blob => blob.json())
                    .then(data => {
                        const towns = data.items.map(i => i.text);
                        if (towns.length == 0) {
                            setState('noProposals');
                        } else {
                            setContext({"cities": towns});
                            setState('display');
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        setState('noProposals');
                    })
                setContext({prevInput: curInput})
            },
            on: {
                'input': {
                    target: 'noProposals'
                },
                'upDownKeys': {
                    target: 'noProposals'
                },
                'enter': {
                    target: 'noProposals'
                }

            }

        },
        'display': {
            onEntry(event) {
                const[context, setContext] = useContext();
                const proposalList = document
                    .getElementsByClassName(context.proposalListClass)[0]
                while (proposalList.firstChild) {
                    proposalList.removeChild(proposalList.firstChild);
                }
                const cities = context.cities;
                for (let proposal of cities) {
                    let proposalItem = document.createElement("li");
                    proposalItem.className = "proposal-element";
                    proposalItem.appendChild(document.createTextNode(proposal));
                    proposalList.appendChild(proposalItem);
                }
                const firstChild = proposalList.firstChild;
                firstChild.classList.add("highlighted");
                setContext({highlighted: firstChild.innerText})
            },
            on: {
                'input': {
                    service: (event) => {
                        const[state, setState] = useState();
                        const[context, setContext] = useContext();
                        setContext({prevState: state});
                        setState('request');
                    }
                },
                'upDownKeys': {
                    service: (event) => {
                        const[context, setContext] = useContext();
                        const proposalList = document.getElementsByClassName(
                            context.proposalListClass
                        )[0]
                        if (proposalList.children.length < 2) {
                            return;
                        }
                        let neighbor;
                        const highlightedTown = document.getElementsByClassName("highlighted")[0]
                        const UP = 38;
                        if (event.keyCode === UP) {
                            if (highlightedTown == proposalList.firstChild){
                                neighbor = proposalList.lastChild;
                            } else {
                                neighbor = highlightedTown.previousSibling;
                            }
                        } else {
                            if (highlightedTown == proposalList.lastChild) {
                                neighbor = proposalList.firstChild;
                            } else {
                                neighbor = highlightedTown.nextSibling;
                            }
                        }
                        highlightedTown.classList.remove("highlighted");
                        neighbor.classList.add("highlighted");
                        setContext({'highlighted': neighbor.innerText})
                    }
                },
                'enter': {
                    service: (event) => {
                        const[context, setContext] = useContext();
                        const selectedTowns = document.getElementsByClassName(
                            context.selectedTownsClass
                        )[0]
                        const town = document.createElement("div");
                        town.className = "town";
                        town.appendChild(document.createTextNode(
                            context.highlighted
                        ))
                        selectedTowns.appendChild(town);
                        const[state, setState] = useState();
                        document.getElementsByClassName(context.inputSelectorClass)[0].value = "";
                        setContext({prevInput: ""});
                        setState('noProposals')
                    },
                }
            },
        }
    }
    ,
    actions: {

    },
});
module.exports = {aMachine};
