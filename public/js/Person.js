import {h} from 'hyperapp';
import Identicon from 'identicon.js';
import md5 from 'md5-jkmyers';

const IDENTICON_OPTIONS = {
    size: 72,
    margin: 0.2,
    format: 'svg'
};

export const Person = ({location, name, id, personID, avatar}) => (
    <div class="col-6 float-left" key={id}>
        <div class="Box rounded person flex shadow">
            <img src={avatar || `data:image/svg+xml;base64,${new Identicon(md5(personID), IDENTICON_OPTIONS)}`} alt="person icon" class="avatar circle border" width="72" height="72"/>
            <div class="ml-2 info">
                <div class="tooltipped tooltippped-se tooltipped-align-left-1" aria-label={name}>
                    <h2 class="truncate">{name}</h2>
                </div>
                <div class="location tooltipped tooltipped-se tooltipped-align-left-1" aria-label={location}>
                    <img src="img/location.svg" alt="location" class="inline-block"/>
                    <span class="ml-1 truncate">{location}</span>
                </div>
            </div>
        </div>
    </div>
);