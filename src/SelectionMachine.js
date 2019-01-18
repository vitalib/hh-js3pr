const {machine, useContext, useState} = require("./StateMachine");
const BACKSPACE = 8;
const selectionMachine = machine({
    id: 'selector',
    initialState: 'noProposals',
    context: {
        prevInput: "",
        prevState: "",
        inputSelectorClass: "selector-input",
        proposalListClass: "proposal-list",
        selectedTownsClass: 'selected-towns',
        suggestList: [],
        selectedAreas: [],
        api: {
            url: "https://api.hh.ru/suggests/areas",
            parameter: "text",
            mapping: "text",
        },
    }
    ,
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
                        const selectedAreas = context.selectedAreas;
                        if (event.keyCode == BACKSPACE
                                && !context.prevInput
                                && selectedAreas.length){
                            selectedTowns.removeChild(selectedTowns.lastChild);
                            selectedAreas.pop();
                            setContext({selectedAreas: selectedAreas})
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
                let api = context.api;
                let url = new URL(api.url);
                let params = {[api.parameter]: curInput};
                url.search = new URLSearchParams(params);
                window.fetch(url)
                    .then(res => {
                        if (res.ok) {
                            return res.json();
                        } else {
                            throw Error(`Request rejected with status ${res.status}`)
                        }
                    })
                    .then(data => {
                        const towns = data.items.map(i => i[api.mapping]);
                        if (towns.length == 0) {
                            setState('noProposals');
                        } else {
                            setContext({"suggestList": towns});
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
                const cities = context.suggestList;
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
                        const selectedAreas = context.selectedAreas;
                        const area = context.highlighted;
                        if (selectedAreas.includes(area)) {
                            return;
                        }
                        selectedAreas.push(area);
                        setContext({selectedAreas: selectedAreas});
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
});
module.exports = {selectionMachine: selectionMachine};
