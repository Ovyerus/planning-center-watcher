/* eslint-env browser */

import {h, app} from 'hyperapp'; 
import {Person} from './Person';

const ws = new WebSocket('ws://' + location.host + '/ws');
const state = {
    people: [],
    isLoaded: false
};
const actions = {
    addPerson: person => ({people}) => !people.find(p => p.id === person.id) && ({people: people.concat(person)}),
    removePerson: person => ({people}) => {
        people.splice(people.findIndex(p => p.id === person), 1);
        return {people};
    },
    loaded: () => () => ({isLoaded: true})
};
const view = state => (
    <div class="container">
        {
            !state.isLoaded ? (
                <div class="loading-container">
                    <svg class="spinner" width="128px" height="128px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                        <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
                    </svg>
                </div>
            ) : (
                <div class="clearfix gutter my-6">
                    {state.people.length ? state.people.map(p => <Person {...p}/>) : (
                        <div class="col-12">
                            <div class="flash">
                                <h2 class="subtitle">No check ins to display.</h2>
                            </div>
                        </div>
                    )}
                </div>
            )
        }
    </div>
);

const globApp = window.globApp = app(state, actions, view, document.body);

ws.addEventListener('open', () => {
    console.log('Connected to websocket');
    globApp.loaded();
});

ws.addEventListener('message', ev => {
    let data = JSON.parse(ev.data);

    if (data.type === 'checkin') data.people.forEach(p => globApp.addPerson(p));
    else if (data.type === 'checkout') data.people.forEach(p => globApp.removePerson(p));
    else console.warn(`Unknown type: ${data.type}`);
});

ws.addEventListener('error', err => {
    console.error(err);
});
