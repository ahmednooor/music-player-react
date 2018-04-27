import React, { Component } from 'react';
import './Player.css';

import TracksList from '../../components/TracksList/TracksList';
import DB from '../../assets/js/db';

// eslint-disable-next-line
String.prototype.toHHMMSS = function () {
    // snippet taken from stackoverflow
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    // if (hours   < 10) {hours   = "0"+hours;}
    // if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return (hours>0?hours+':':"")+minutes+':'+seconds;
}

class Player extends Component {
    state = {
        tracksList: DB,
        currentTrackIndex: 1,
        trackID: null,
        trackURL: '',
        trackTitle: '',
        isFavourite: false,
        player: new Audio(),
        totalDuration: 0,
        currentTime: 0,
        progressSpanTime: 0,
        loop: false,
        shuffle: false,
        sidebar: false,
        playing: false,
        volume: 0.5,
        trackLoaded: false,
        progressHandleActive: false,
        progressHandleCtrStyleLeft: '0%',
        doneProgressBarStyleRight: '100%',
        volumeHandleActive: false,
        volumeHandleCtrStyleLeft: '0%',
        doneVolumeBarStyleRight: '100%',
        showfavsonly: false,
        searchString: "",
    }

    updateSearchString = (event) => {
        this.setState(
            {searchString: event.target.value}
        );
    }
    
    toggleSidebar = () => {
        this.setState({sidebar: !this.state.sidebar});
    }

    toggleLoop = () => {
        const player = this.state.player;
        player.loop = !this.state.loop
        this.setState({player: player, loop: !this.state.loop});
	}
    
    toggleShuffle = () => {
        this.setState({shuffle: !this.state.shuffle});
    }
    
    toggleFavourite = () => {
        this.setState({isFavourite: !this.state.isFavourite});
        this.state.tracksList.map((track) => {
            if (track.id === this.state.trackID) {
                track.isFavourite = !track.isFavourite;
            }
            return track;
        });
    }

    toggleShowfavsonly = () => {
        this.setState({showfavsonly: !this.state.showfavsonly});
    }
    
	playNextTrack = () => {
		let currentTrackIndex = this.state.currentTrackIndex;
		if (!this.state.shuffle) {
			currentTrackIndex += 1;
			if (currentTrackIndex >= this.state.tracksList.length) {
				currentTrackIndex = 0;
			}
		} else {
			currentTrackIndex = 
				Math.floor((Math.random() * (this.state.tracksList.length)) + 0);
		}
		this.setState({currentTrackIndex: currentTrackIndex}, this.loadTrackIntoState);
		
	}
    
	playPrevTrack = () => {
		let currentTrackIndex = this.state.currentTrackIndex;
		if (!this.state.shuffle) {
			currentTrackIndex -= 1;
			if (currentTrackIndex < 0) {
				currentTrackIndex = this.state.tracksList.length - 1;
			}
		} else {
			currentTrackIndex = 
				Math.floor((Math.random() * (this.state.tracksList.length)) + 0);
		}
		this.setState({currentTrackIndex: currentTrackIndex}, this.loadTrackIntoState);	
    }
    
    selectThisTrack = (event, trackID) => {
        let currentTrackIndex = 0;
        this.state.tracksList.map((track, index) => {
            if (track.id === trackID) {
                currentTrackIndex = index;
            }
            return track;
        });
        this.setState(
            {
                currentTrackIndex: currentTrackIndex
            },
            () => {
                this.loadTrackIntoState();
            }
        );
        return false;
    }

    updatePlayingInfo = () => {
        const player = this.state.player;
        const totalDuration = parseInt(player.duration, 10)
            .toString()
            .toHHMMSS();
        const currentTime = parseInt(player.currentTime, 10)
            .toString()
            .toHHMMSS();
        this.setState(
            {
                totalDuration: totalDuration,
                currentTime: currentTime,
                progressSpanTime: 
                    !this.state.progressHandleActive ? currentTime : this.state.progressSpanTime,
            },
            () => {
                this.updateProgressBar()
            }
        );
    }

    updateProgressBar = () => {
        const progressHandleCtrParent = document.getElementById("progressHandleCtr").parentElement;
        const progressHandleCtr = document.getElementById("progressHandleCtr");

        if (progressHandleCtrParent !== undefined 
                && progressHandleCtr !== undefined
        ) {
            const progressHandleCtrParentWidth = parseFloat(window.getComputedStyle(progressHandleCtrParent, null).width);
            const totalTimePtg = 
                parseFloat(this.state.player.currentTime / this.state.player.duration)
                * parseFloat(progressHandleCtrParentWidth);

            this.setState(
                {
                    progressHandleCtrStyleLeft: 
                        !this.state.progressHandleActive ? totalTimePtg + "px" : this.state.progressHandleCtrStyleLeft,
                    doneProgressBarStyleRight: (progressHandleCtrParentWidth - totalTimePtg) + "px"
                }
            );
        }
    }

    playPauseAudio = () => {
        if (this.state.playing) {
            this.state.player.play();
        } else {
            this.state.player.pause();
        }
    }

    onPlayPauseClickHandler = (event) => {
        this.setState(
            {playing: !this.state.playing},
            () => {
                this.playPauseAudio();
            }
        );
    }

    touchPositionFst = 0;
    spannedTime = 0;
    volume = 0;
    
    progBarPickHandler = (event) => {
        if (event.type === 'mousedown') {
            this.touchPositionFst = event.pageX;
            document.addEventListener('mousemove', this.progBarMoveHandler);
            document.addEventListener('mouseup', this.progBarDropHandler);
        } else if (event.type === 'touchstart') {
            this.touchPositionFst = event.touches[0].pageX;
            event.target.addEventListener('touchmove', this.progBarMoveHandler);
            event.target.addEventListener('touchend', this.progBarDropHandler);
        }

        const handleCtr = document.getElementById('progressHandleCtr');
        const progressBarWidth = 
            parseFloat(window.getComputedStyle(handleCtr.parentElement, null).width);

        let handleCtrStyleLeft = 
            (this.touchPositionFst - handleCtr.parentElement.clientLeft 
            - parseFloat(window.getComputedStyle(
                document.getElementsByClassName('Player')[0], null).paddingLeft
            )) + 'px';

        if (parseFloat(handleCtrStyleLeft) < 0) {
            handleCtrStyleLeft = '0px';
        } else if (parseFloat(handleCtrStyleLeft) > progressBarWidth) {
            handleCtrStyleLeft = progressBarWidth + 'px';
        }

        this.spannedTime = 
            parseFloat(this.state.player.duration / progressBarWidth)
            * parseFloat(handleCtrStyleLeft);
        
        this.setState(
            {
                progressHandleActive: true,
                progressHandleCtrStyleLeft: handleCtrStyleLeft,
                progressSpanTime: this.spannedTime.toString().toHHMMSS()
            }
        );
    }
    progBarMoveHandler = (event) => {
        let touchPositionSnd = 0;
        if (event.type === 'mousemove') {
            touchPositionSnd = event.pageX;
            document.addEventListener('mouseup', this.progBarDropHandler);
        } else if (event.type === 'touchmove') {
            touchPositionSnd = event.touches[0].pageX;
            event.target.addEventListener('touchend', this.progBarDropHandler);
        }

        const handleCtr = document.getElementById('progressHandleCtr');
        const progressBarWidth = 
            parseFloat(window.getComputedStyle(handleCtr.parentElement, null).width);

        let calcPosition = touchPositionSnd - this.touchPositionFst;
        this.touchPositionFst = touchPositionSnd;
        
        let handleCtrStyleLeft = parseFloat(this.state.progressHandleCtrStyleLeft) + calcPosition + 'px';

        if (parseFloat(handleCtrStyleLeft) < 0) {
            handleCtrStyleLeft = '0px';
        } else if (parseFloat(handleCtrStyleLeft) > progressBarWidth) {
            handleCtrStyleLeft = progressBarWidth + 'px';
        }

        this.spannedTime = 
            parseFloat(this.state.player.duration / progressBarWidth)
            * parseFloat(handleCtrStyleLeft);
        
        this.setState(
            {
                progressHandleCtrStyleLeft: handleCtrStyleLeft,
                progressSpanTime: this.spannedTime.toString().toHHMMSS()
            }
        );
    }
    progBarDropHandler = (event) => {
        const player = this.state.player;
        player.currentTime = this.spannedTime;
        this.setState(
            {
                player: player,
                progressHandleActive: false,
                currentTime: this.spannedTime.toString().toHHMMSS(),
                progressSpanTime: this.spannedTime.toString().toHHMMSS()
            },
            () => {
                event.target.removeEventListener('touchmove', this.progBarMoveHandler);
                event.target.removeEventListener('touchend', this.progBarDropHandler);
                document.removeEventListener('mousemove', this.progBarMoveHandler);
                document.removeEventListener('mouseup', this.progBarDropHandler);
            }
        );        
    }
    
    volumeBarPickHandler = (event) => {
        if (event.type === 'mousedown') {
            this.touchPositionFst = event.pageX;
            document.addEventListener('mousemove', this.volumeBarMoveHandler);
            document.addEventListener('mouseup', this.volumeBarDropHandler);
        } else if (event.type === 'touchstart') {
            this.touchPositionFst = event.touches[0].pageX;
            event.target.addEventListener('touchmove', this.volumeBarMoveHandler);
            event.target.addEventListener('touchend', this.volumeBarDropHandler);
        }

        const volumeBarWidth = 
            parseFloat(window.getComputedStyle(document.getElementById('volumeBarCtr'), null).width);

        let handleCtrStyleLeft = 
            parseFloat(this.touchPositionFst - ((window.innerWidth - volumeBarWidth) / 2)) + 'px'
        let doneVolumeBarStyleRight = 
            (volumeBarWidth - parseFloat(handleCtrStyleLeft)) + 'px';

        if (parseFloat(handleCtrStyleLeft) < 0) {
            handleCtrStyleLeft = '0px';
        } else if (parseFloat(handleCtrStyleLeft) > volumeBarWidth) {
            handleCtrStyleLeft = volumeBarWidth + 'px';
        }
        if (parseFloat(doneVolumeBarStyleRight) < 0) {
            doneVolumeBarStyleRight = '0px';
        } else if (parseFloat(doneVolumeBarStyleRight) > volumeBarWidth) {
            doneVolumeBarStyleRight = volumeBarWidth + 'px';
        }

        this.volume = 
            (parseFloat(1.0 / volumeBarWidth)
            * parseFloat(handleCtrStyleLeft)).toFixed(2);
        
        const player = this.state.player;
        player.volume = this.volume;
        this.setState(
            {
                volumeHandleActive: true,
                player: player,
                volumeHandleCtrStyleLeft: handleCtrStyleLeft,
                doneVolumeBarStyleRight: doneVolumeBarStyleRight,
                volume: this.volume
            }
        );
    } 
    volumeBarMoveHandler = (event) => {
        let touchPositionSnd = 0;
        if (event.type === 'mousemove') {
            touchPositionSnd = event.pageX;
            document.addEventListener('mouseup', this.volumeBarDropHandler);
        } else if (event.type === 'touchmove') {
            touchPositionSnd = event.touches[0].pageX;
            event.target.addEventListener('touchend', this.volumeBarDropHandler);
        }
        
        const volumeBarWidth = 
            parseFloat(window.getComputedStyle(document.getElementById('volumeBarCtr'), null).width);

        let calcPosition = touchPositionSnd - this.touchPositionFst;
        this.touchPositionFst = touchPositionSnd;

        let handleCtrStyleLeft = (parseFloat(this.state.volumeHandleCtrStyleLeft) + calcPosition) + 'px';
        let doneVolumeBarStyleRight = 
            (volumeBarWidth - (parseFloat(this.state.volumeHandleCtrStyleLeft) + calcPosition)) + 'px';

        if (parseFloat(handleCtrStyleLeft) < 0) {
            handleCtrStyleLeft = '0px';
        } else if (parseFloat(handleCtrStyleLeft) > volumeBarWidth) {
            handleCtrStyleLeft = volumeBarWidth + 'px';
        }
        if (parseFloat(doneVolumeBarStyleRight) < 0) {
            doneVolumeBarStyleRight = '0px';
        } else if (parseFloat(doneVolumeBarStyleRight) > volumeBarWidth) {
            doneVolumeBarStyleRight = volumeBarWidth + 'px';
        }

        this.volume = 
            (parseFloat(1.0 / volumeBarWidth)
            * parseFloat(handleCtrStyleLeft)).toFixed(2);
        
        const player = this.state.player;
        player.volume = this.volume;
        this.setState(
            {
                player: player,
                volumeHandleCtrStyleLeft: handleCtrStyleLeft,
                doneVolumeBarStyleRight: doneVolumeBarStyleRight,
                volume: this.volume
            }
        );
    }
    volumeBarDropHandler = (event) => {
        this.setState(
            {
                volumeHandleActive: false,
            },
            () => {
                event.target.removeEventListener('touchmove', this.volumeBarMoveHandler);
                event.target.removeEventListener('touchend', this.volumeBarDropHandler);
                document.removeEventListener('mousemove', this.volumeBarMoveHandler);
                document.removeEventListener('mouseup', this.volumeBarDropHandler);
            }
        )
    }

    loadTrackIntoState = () => {
        const trackID = this.state.tracksList[this.state.currentTrackIndex].id;
        const trackURL = this.state.tracksList[this.state.currentTrackIndex].trackURL;
        const trackTitle = this.state.tracksList[this.state.currentTrackIndex].title;
        const player = this.state.player;
        // player.pause();
        player.src = player.src !== trackURL ? trackURL : player.src;
        player.currentTime = 0;
        player.volume = this.state.volume;
        player.loop = this.state.loop;
        player.preload = true;
        player.autoplay = true;
        
        this.setState(
            {
                trackID: trackID,
                trackURL: trackURL,
                trackTitle: trackTitle,
                isFavourite: this.state.tracksList[this.state.currentTrackIndex].isFavourite,
                player: player,
                trackLoaded: false,
                playing: false,
                volume: player.volume,
                volumeHandleCtrStyleLeft: 
                    (player.volume * parseFloat(window.getComputedStyle(document.getElementById('volumeBarCtr'), null).width)) + 'px',
                doneVolumeBarStyleRight: 
                    (parseFloat(window.getComputedStyle(document.getElementById('volumeBarCtr'), null).width) - player.volume * parseFloat(window.getComputedStyle(document.getElementById('volumeBarCtr'), null).width)) + 'px'
            },
            () => {
                // this.playPauseAudio();
                if(!this.state.sidebar) {
                    this.scrollToActiveTrack();
                }
            }
        );
    }

    assignEventsToPlayer = () => {
        this.state.player.addEventListener('canplay', () => {
            if (!this.state.trackLoaded) {
                this.setState({trackLoaded: true, playing: true},
                    () => {
                        this.playPauseAudio();
                    }
                );
            }
        });
        this.state.player.addEventListener('ended', () => {
            if (this.state.loop) {
                this.setState({playing: true}, () => this.playPauseAudio());
            } else {
                this.playNextTrack();
            }
        });
        this.state.player.addEventListener('timeupdate', () => {
            if (this.state.trackLoaded) {
                this.updatePlayingInfo();
            }
        });
    }

    scrollToActiveTrack = () => {
        window.setTimeout(() => {
            const tracksListCtr = document.getElementById('tracksListCtr');
            const activeTrack = document.getElementById('activeTrack');
            tracksListCtr.scrollTo(
                0,
                activeTrack.offsetTop - (
                    parseFloat(window.getComputedStyle(tracksListCtr, null).height) / 2)
            );
        }, 200);
    }

    componentDidMount() {
        this.assignEventsToPlayer();
        this.loadTrackIntoState();
    }

    render() {
        return (
            <div className="Player">
                <TracksList 
                    sidebar={this.state.sidebar}
                    tracksList={this.state.tracksList}
                    currentTrackIndex={this.state.currentTrackIndex}
                    currentTrackID={this.state.trackID}
                    favsonly={this.state.showfavsonly}
                    searchString={this.state.searchString}
                    updateSearchString={this.updateSearchString}
                    toggleSidebar={this.toggleSidebar}
                    toggleShowfavsonly={this.toggleShowfavsonly}
                    selectThisTrack={this.selectThisTrack}
                />
                <div className="ctr-1">
                    <p className="play-pause-text">
                        <strong>
                            {this.state.playing ? "PLAYING" : "PAUSED"}
                        </strong>
                        <span>{this.state.currentTime} / {this.state.totalDuration}</span>
                    </p>
                    <button 
                        className="heart-icon"
                        dangerouslySetInnerHTML={{__html: this.state.isFavourite ? `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 47 45" style="enable-background:new 0 0 47 45;" xml:space="preserve"><path d="M46.8,14.8c0,16-21.3,29.1-22.2,29.7c-0.3,0.2-0.7,0.3-1,0.3c-0.4,0-0.7-0.1-1-0.3C21.6,43.9,0.2,30.8,0.2,14.8 c0-8.3,6-14.6,13.9-14.6c2.6,0,5.1,0.7,7.3,2c0.7,0.4,1.5,0.9,2.1,1.5c0.7-0.6,1.4-1,2.1-1.5c2.2-1.3,4.7-2,7.3-2 C40.8,0.2,46.8,6.5,46.8,14.8z"/></svg>`
                        : `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 47 45" style="enable-background:new 0 0 47 45;" xml:space="preserve"><path d="M32.9,0.2c-2.6,0-5.1,0.7-7.3,2c-0.7,0.4-1.5,0.9-2.1,1.5c-0.7-0.6-1.4-1.1-2.1-1.5c-2.2-1.3-4.7-2-7.3-2 C6.2,0.2,0.2,6.5,0.2,14.8c0,16,21.3,29.1,22.2,29.7c0.3,0.2,0.7,0.3,1,0.3c0.4,0,0.7-0.1,1-0.3c0.9-0.6,22.2-13.7,22.2-29.7 C46.8,6.5,40.8,0.2,32.9,0.2z M23.5,40.4C19.3,37.6,4.2,26.7,4.2,14.8c0-6,4.2-10.6,9.9-10.6c1.9,0,3.7,0.5,5.3,1.4 c1,0.6,1.9,1.3,2.6,2.1c0.8,0.9,2.2,0.9,3,0c0.8-0.8,1.6-1.6,2.6-2.1c1.6-0.9,3.4-1.4,5.3-1.4c5.6,0,9.9,4.6,9.9,10.6 C42.8,26.7,27.6,37.6,23.5,40.4z"/></svg>`}}
                        onClick={this.toggleFavourite}
                    ></button>
                </div>
                <p className="track-title">{this.state.trackTitle}</p>
                <div className="bottom-ctr">
                    
                    <div 
                        className="progress-container" 
                        onTouchStart={this.progBarPickHandler}
                        onMouseDown={this.progBarPickHandler}
                    >
                        <div className="progress-bar">
                            <div 
                                className="done" 
                                id="doneProgressBar"
                                style={{
                                    right: this.state.doneProgressBarStyleRight
                                }}
                            ></div>
                            <div className="remaining"></div>
                        </div>
                        <div 
                            className="handle-ctr" 
                            id="progressHandleCtr"
                            style={{
                                left: this.state.progressHandleCtrStyleLeft
                            }}
                        >
                            <p className="time-span">
                                {!this.state.progressHandleActive ? this.state.currentTime : this.state.progressSpanTime}
                                <span></span>
                            </p>
                            <button 
                                className="handle"
                                dangerouslySetInnerHTML={{__html: this.state.progressHandleActive ? `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 67 83" style="enable-background:new 0 0 67 83;" xml:space="preserve"><path d="M33.5,0.8C24,24.7,0.6,29.5,0.6,51.6c0,16.9,15.9,30.6,32.8,30.6c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0	c16.9,0,32.8-13.8,32.8-30.6C66.4,29.5,43,24.7,33.5,0.8z"/></svg>`
                                : `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 67 83" style="enable-background:new 0 0 67 83;" xml:space="preserve"><path d="M33.5,9.8c4.4,7.4,10,12.9,15.1,17.8c7.7,7.5,13.9,13.5,13.9,23.9c0,14.2-13.5,26.6-28.8,26.6l-0.2,0l-0.1, 0C18,78.2,4.6,65.8,4.6,51.6c0-10.4,6.1-16.4,13.9-23.9C23.5,22.7,29.1,17.2,33.5,9.8 M33.5,0.8C24,24.7,0.6,29.5,0.6,51.6 c0,16.9,15.9,30.6,32.8,30.6c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c16.9,0,32.8-13.8,32.8-30.6C66.4,29.5,43,24.7,33.5,0.8L33.5,0.8z"/></svg>`}}
                            ></button>
                        </div>
                    </div>
                    <div className="control-icons-container">
                        <button 
                            className="play-control prev-track-btn-ctr"
                            dangerouslySetInnerHTML={{__html: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 70.7 70.7" style="enable-background:new 0 0 70.7 70.7;" xml:space="preserve"><g><rect x="3.2" y="20.5" width="8.9" height="29.7"/><polygon points="59.4,54.3 23,35.3 59.4,16.3"/></g></svg>`}}
                            onClick={this.playPrevTrack}
                        ></button>
                        <button 
                            className="play-control play-pause-container"
                            dangerouslySetInnerHTML={{__html: this.state.playing ? `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 80 80" style="enable-background:new 0 0 80 80;" xml:space="preserve"><g><rect x="15.7" y="9.2" width="19.2" height="61.7"/><rect x="45.2" y="9.2" width="19.2" height="61.7"/></g></svg>`
                            : `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 80 80" style="enable-background:new 0 0 80 80;" xml:space="preserve"><polygon points="17.5,70.8 76.5,40 17.5,9.2 "/></svg>`}}
                            onClick={this.onPlayPauseClickHandler}
                        ></button>
                        <button 
                            className="play-control next-track-btn-ctr"
                            dangerouslySetInnerHTML={{__html: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 70.7 70.7" style="enable-background:new 0 0 70.7 70.7;" xml:space="preserve"><g><rect x="58.5" y="20.5" width="8.9" height="29.7"/><polygon points="11.3,54.3 47.7,35.3 11.3,16.3"/></g>`}}
                            onClick={this.playNextTrack}
                        ></button>
                    </div>
                    <div 
                        className="volume-container" 
                        onTouchStart={this.volumeBarPickHandler}
                        onMouseDown={this.volumeBarPickHandler}
                    >
                        <div className="volume-icon-ctr">
                            <button 
                                className="speaker-icon"
                                dangerouslySetInnerHTML={{__html: this.state.volume < 0.01 ? `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 44.1 38" style="enable-background:new 0 0 44.1 38;" xml:space="preserve"><path d="M6.5,13.9v10.3c0,1.7-1.3,3-3,3c-1.7,0-3-1.3-3-3V13.9c0-1.7,1.3-3,3-3C5.1,10.9,6.5,12.2,6.5,13.9z M23.6,1.6L10.7,13.7 c-0.7,0.7-1.1,1.6-1.1,2.5v5.5c0,1,0.4,1.9,1.1,2.5l12.9,12.1c2.2,2.1,5.8,0.5,5.8-2.5V4.1C29.4,1.1,25.8-0.4,23.6,1.6z"/></svg>`
                                : `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 44.1 38" style="enable-background:new 0 0 44.1 38;" xml:space="preserve"><path d="M6.5,13.9v10.3c0,1.7-1.3,3-3,3c-1.7,0-3-1.3-3-3V13.9c0-1.7,1.3-3,3-3C5.1,10.9,6.5,12.2,6.5,13.9z M23.6,1.6L10.7,13.7	c-0.7,0.7-1.1,1.6-1.1,2.5v5.5c0,1,0.4,1.9,1.1,2.5l12.9,12.1c2.2,2.1,5.8,0.5,5.8-2.5V4.1C29.4,1.1,25.8-0.4,23.6,1.6z M37.7,9.8	c-2-0.9-4.2,0.5-4.2,2.7v0.1c0,1.2,0.7,2.2,1.8,2.7c1.4,0.7,2.3,2.1,2.3,3.7s-0.9,3-2.3,3.7c-1.1,0.5-1.8,1.5-1.8,2.7v0.1 c0,2.2,2.3,3.6,4.2,2.7c3.5-1.6,5.9-5.1,5.9-9.2S41.2,11.4,37.7,9.8z"/></svg>`}}
                            ></button>
                        </div>
                        <div className="volume-bar-ctr" id="volumeBarCtr">
                            <div className="volume-bar">
                                <div 
                                    className="done"
                                    style={{
                                        right: this.state.doneVolumeBarStyleRight
                                    }}
                                ></div>
                                <div className="remaining"></div>
                            </div>
                            <div 
                                className="handle-ctr"
                                id="volumeHandleCtr"
                                style={{
                                    left: this.state.volumeHandleCtrStyleLeft
                                }}
                            >
                                <button 
                                    className="handle"
                                    style={{
                                        background: this.state.volumeHandleActive ? "#333" : null
                                    }}
                                ></button>
                            </div>
                        </div>
                        <div className="volume-pctg-ctr">
                            <span>{parseInt(this.state.volume * 100, 10)}</span>
                        </div>
                    </div>
                    <div className="bottom-icons-ctr">
                        <button
                            className={this.state.sidebar ? "tracks-list-btn active" : "tracks-list-btn"}
                            dangerouslySetInnerHTML={{__html:`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 225 110" style="enable-background:new 0 0 225 110;" xml:space="preserve"><path d="M224.2,55c0,5-4,9-9,9H9.8c-5,0-9-4-9-9s4-9,9-9h205.3C220.1,46,224.2,50,224.2,55z M180.5,83.8H9.8c-5,0-9,4-9,9s4,9,9,9 h170.6c5,0,9-4,9-9S185.4,83.8,180.5,83.8z M9.8,26.2h135.7c5,0,9-4,9-9s-4-9-9-9H9.8c-5,0-9,4-9,9S4.9,26.2,9.8,26.2z"/></svg>`}}
                            onClick={this.toggleSidebar}
                        ></button>
                        <button
                            className={this.state.loop ? "loop-btn active" : "loop-btn"}
                            dangerouslySetInnerHTML={{__html:`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 225 110" style="enable-background:new 0 0 225 110;" xml:space="preserve"><path d="M224.2,66.5c0,23.6-19.2,42.8-42.8,42.8H43.6C20,109.3,0.8,90.1,0.8,66.5S20,23.7,43.6,23.7h30c5,0,9,4,9,9s-4,9-9,9h-30 c-13.7,0-24.8,11.1-24.8,24.8S30,91.3,43.6,91.3h137.7c13.7,0,24.8-11.1,24.8-24.8S195,41.7,181.4,41.7h-39.9l8.1,8.1 c3.5,3.5,3.5,9.2,0,12.7c-1.8,1.8-4.1,2.6-6.4,2.6s-4.6-0.9-6.4-2.6L113.3,39c-3.5-3.5-3.5-9.2,0-12.7l22.9-22.9 c3.5-3.5,9.2-3.5,12.7,0c3.5,3.5,3.5,9.2,0,12.7l-7.6,7.6c0,0,0,0,0,0h40C205,23.7,224.2,42.9,224.2,66.5z"/></svg>`}}
                            onClick={this.toggleLoop}
                        ></button>
                        <button
                            className={this.state.shuffle ? "shuffle-btn active" : "shuffle-btn"}
                            dangerouslySetInnerHTML={{__html:`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 225 110" style="enable-background:new 0 0 225 110;" xml:space="preserve"><path d="M224.2,32.6C224.2,32.7,224.2,32.7,224.2,32.6c0,0.3,0,0.5,0,0.8c0,0,0,0,0,0.1c-0.2,2.4-1.4,4.5-3.1,6l-23,23 c-1.8,1.8-4.1,2.6-6.4,2.6s-4.6-0.9-6.4-2.6c-3.5-3.5-3.5-9.2,0-12.7l8.1-8.1h-21.6c-11.1,0-21.9,3.1-31.4,8.9 c-1.5,0.9-3.1,1.3-4.7,1.3c-3,0-6-1.5-7.7-4.3c-2.6-4.2-1.3-9.8,3-12.4c12.3-7.5,26.4-11.5,40.8-11.5h21.7l-7.6-7.6 c-3.5-3.5-3.5-9.2,0-12.7c3.5-3.5,9.2-3.5,12.7,0l22.9,22.9C223.3,28,224.2,30.3,224.2,32.6z M215.2,91.3h-43.4 c-21.1,0-40.8-11.3-51.5-29.4c-13.9-23.6-39.6-38.2-67-38.2H9.8c-5,0-9,4-9,9s4,9,9,9h43.4c21.1,0,40.8,11.3,51.5,29.4 c13.9,23.6,39.6,38.2,67,38.2h43.4c5,0,9-4,9-9S220.1,91.3,215.2,91.3z M84.6,82.4c-9.4,5.8-20.3,8.9-31.3,8.9H9.8c-5,0-9,4-9,9 s4,9,9,9h43.4c14.4,0,28.5-4,40.8-11.5c4.2-2.6,5.6-8.1,3-12.4C94.4,81.1,88.8,79.8,84.6,82.4z"/></svg>`}}
                            onClick={this.toggleShuffle}
                        ></button>
                    </div>
                </div>
            </div>
        )
    }
  
}

export default Player;
