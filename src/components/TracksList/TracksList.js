import React from 'react';
import './TracksList.css';

const TracksList = (props) => {
    let tracksList = props.tracksList;
    const tracksListElems = tracksList.map((track, index) => {
        return (
            <li
                key={track.id}
                isfavourite={track.isFavourite.toString()}
                index={index}
                data-trackid={track.id}
                className={track.id === props.currentTrackID ? "active" : ""}
                id={track.id === props.currentTrackID ? "activeTrack" : ""}
                style={{
                    display: (
                        (props.favsonly && !track.isFavourite)
                        || (
                            props.searchString !== "" 
                            && !track.title.toLowerCase().includes(props.searchString.toLowerCase())
                        )) ? "none" : null
                }}
                onClick={(ev) => props.selectThisTrack(ev, track.id)}
            >
                <span>
                    <strong>{track.id === props.currentTrackID ? '> ' : ''}</strong>
                    {track.title}
                </span>
            </li>
        );
    });

    return (
        <div 
            className="TracksList"
            style={{
                transform: props.sidebar ? "translateX(0%)" : null
            }}
        >
            <div className="tracks-list-ctr" id="tracksListCtr">
                {
                    props.searchString === "" ?
                    <div className="tracks-list-upper-elem">
                        <p>PLAYLIST</p>
                    </div>
                    : null
                }
                <ul>
                    {tracksListElems}
                </ul>
            </div>
            <div className="bottom-ctr">
                <div className="search-ctr">
                    <input 
                        className="search-bar" 
                        placeholder="Search"
                        value={props.searchString}
                        onInput={props.updateSearchString}
                    />
                </div>
                <div className="bottom-btns-ctr">
                    <button
                        className="back-btn"
                        dangerouslySetInnerHTML={{
                            __html: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 225 115.8" style="enable-background:new 0 0 225 115.8;" xml:space="preserve"><path d="M224.2,57.9c0,5-4,9-9,9H31.6l32.6,32.6c3.5,3.5,3.5,9.2,0,12.7c-3.5,3.5-9.2,3.5-12.7,0l-48-48c-0.2-0.2-0.4-0.4-0.6-0.7 c-0.1-0.1-0.2-0.2-0.2-0.3c-0.1-0.1-0.2-0.3-0.3-0.4c-0.1-0.1-0.2-0.3-0.2-0.4C2,62.4,2,62.3,1.9,62.2c-0.1-0.1-0.1-0.3-0.2-0.4 c-0.1-0.1-0.1-0.3-0.2-0.4c-0.1-0.1-0.1-0.3-0.1-0.4c-0.1-0.1-0.1-0.3-0.1-0.4c0-0.1-0.1-0.3-0.1-0.4C1.1,60,1,59.8,1,59.7 c0-0.2,0-0.3-0.1-0.5c0-0.1,0-0.3-0.1-0.4c0-0.3,0-0.6,0-0.9l0,0l0,0c0-0.3,0-0.6,0-0.9c0-0.1,0-0.3,0.1-0.4c0-0.2,0-0.3,0.1-0.5 c0-0.2,0.1-0.3,0.1-0.4c0-0.1,0.1-0.3,0.1-0.4c0-0.1,0.1-0.3,0.1-0.4c0-0.1,0.1-0.3,0.1-0.4c0.1-0.1,0.1-0.3,0.2-0.4 c0.1-0.1,0.1-0.3,0.2-0.4C2,53.5,2,53.4,2.1,53.3c0.1-0.1,0.2-0.3,0.2-0.4c0.1-0.1,0.2-0.3,0.3-0.4c0.1-0.1,0.2-0.2,0.2-0.3 c0.2-0.2,0.4-0.5,0.6-0.7l48-48c3.5-3.5,9.2-3.5,12.7,0c3.5,3.5,3.5,9.2,0,12.7L31.6,48.9h183.6C220.1,48.9,224.2,52.9,224.2,57.9z"/></svg>`
                        }}
                        onClick={props.toggleSidebar}
                    ></button>
                    <button
                        className="favs-btn"
                        dangerouslySetInnerHTML={{__html: props.favsonly ? `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 47 45" style="enable-background:new 0 0 47 45;" xml:space="preserve"><path d="M46.8,14.8c0,16-21.3,29.1-22.2,29.7c-0.3,0.2-0.7,0.3-1,0.3c-0.4,0-0.7-0.1-1-0.3C21.6,43.9,0.2,30.8,0.2,14.8 c0-8.3,6-14.6,13.9-14.6c2.6,0,5.1,0.7,7.3,2c0.7,0.4,1.5,0.9,2.1,1.5c0.7-0.6,1.4-1,2.1-1.5c2.2-1.3,4.7-2,7.3-2 C40.8,0.2,46.8,6.5,46.8,14.8z"/></svg>`
                        : `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 47 45" style="enable-background:new 0 0 47 45;" xml:space="preserve"><path d="M32.9,0.2c-2.6,0-5.1,0.7-7.3,2c-0.7,0.4-1.5,0.9-2.1,1.5c-0.7-0.6-1.4-1.1-2.1-1.5c-2.2-1.3-4.7-2-7.3-2 C6.2,0.2,0.2,6.5,0.2,14.8c0,16,21.3,29.1,22.2,29.7c0.3,0.2,0.7,0.3,1,0.3c0.4,0,0.7-0.1,1-0.3c0.9-0.6,22.2-13.7,22.2-29.7 C46.8,6.5,40.8,0.2,32.9,0.2z M23.5,40.4C19.3,37.6,4.2,26.7,4.2,14.8c0-6,4.2-10.6,9.9-10.6c1.9,0,3.7,0.5,5.3,1.4 c1,0.6,1.9,1.3,2.6,2.1c0.8,0.9,2.2,0.9,3,0c0.8-0.8,1.6-1.6,2.6-2.1c1.6-0.9,3.4-1.4,5.3-1.4c5.6,0,9.9,4.6,9.9,10.6 C42.8,26.7,27.6,37.6,23.5,40.4z"/></svg>`}}
                        onClick={props.toggleShowfavsonly}
                    ></button>
                </div>
            </div>
        </div>
    );
}

export default TracksList;
