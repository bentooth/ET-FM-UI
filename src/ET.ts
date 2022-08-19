interface PlaylistItem {
    id: number,
    stream_id: number,
    title: string;
    cover: string;
    duration: number
}

class ETAudioPlayer {
    playlist: PlaylistItem[] | any;
    fullMobilePlayerShow: boolean;
    fullMobileListShow: boolean;
    currentSong: PlaylistItem | null;
    previousSongId: number;
    playing: boolean;
    loading: boolean;
    moving: boolean;
    isFetched: boolean;
    audio: any;
    playerTitle: any;
    playerSinger: any;
    playerCover: any;
    volumeContol: HTMLElement | null;
    fullPlayer: HTMLElement | null;
    fullPlaylistPanel: HTMLElement | null;
    progressBarTrack: HTMLElement | null;
    progressBar: HTMLElement | null;
    progressBarButton: HTMLElement | null;
    DesktopProgressBarTrack: HTMLElement | null;
    DesktopProgressBar: HTMLElement | null;
    DesktopProgressBarButton: HTMLElement | null;
    playButtons: any;
    miniPlayer: HTMLElement | null;
    miniProgressBarTrack: HTMLElement | null;
    miniProgressBar: HTMLElement | null;
    constructor() {
        this.playlist = [];
        this.fullMobilePlayerShow = false;
        this.fullMobileListShow = false;
        this.currentSong = null;
        this.previousSongId = -1;
        this.playing = false;
        this.loading = false;
        this.moving = false;
        this.isFetched = false;

        this.audio = document.getElementById('audio-ele');
        this.playerTitle = document.getElementsByClassName('player-title');
        this.playerSinger = document.getElementsByClassName('player-singer');
        this.playerCover = document.getElementsByClassName('fmp-img');

        this.volumeContol = document.getElementById('vol-control');

        this.fullPlayer = document.getElementById('fmp');
        this.fullPlaylistPanel = document.getElementById('fml');

        this.progressBarTrack = document.getElementById('progress-bar__track');
        this.progressBar = document.getElementById('progress-bar__progress');
        this.progressBarButton = document.getElementById('progress-bar__button');

        this.DesktopProgressBarTrack = document.getElementById(
            'desktop-player__progress-bar_track',
        );
        this.DesktopProgressBar = document.getElementById(
            'desktop-player__progress-bar_progress',
        );
        this.DesktopProgressBarButton = document.getElementById(
            'desktop-player__progress-bar_button',
        );

        this.playButtons = document.getElementsByClassName('play-icon');

        this.miniPlayer = document.getElementById('smp');
        this.miniProgressBarTrack = document.getElementById(
            'mini-progress-bar__track',
        );
        this.miniProgressBar = document.getElementById(
            'mini-progress-bar__progress',
        );

        this.loadPlaylistFromSC();
        this.initProgressBars();
        this.setEventListeners();
    }

    loadPlaylistFromSC = () => {
        fetch("https://electrictooth.com/fm/playlist", { method: 'GET' })
            .then((response: any) => response.json())
            .then((playlist: any) => {
                this.playlist = playlist;
                this.initPlayer();
            })
            .catch((error: any) => console.log('error', error));
    }

    initPlayer = () => {
        this.updatePlayer(this.playlist[0]);
        this.updatePlaylistPanel();
        this.updatePanel();
    }

    initProgressBars = () => {
        if (this.progressBar)
            this.progressBar.style.transform = `translateX(${-100}%)`;

        if (this.miniProgressBar)
            this.miniProgressBar.style.transform = `translateX(${-100}%)`;

        if (this.DesktopProgressBar)
            this.DesktopProgressBar.style.transform = `translateX(${-100}%)`;
    }

    setEventListeners = () => {

        if (this.audio) {
            this.audio.addEventListener('timeupdate', this.timeUpdate, false);
            this.audio.addEventListener('ended', () => this.next());
        }

        if (this.volumeContol) {
            this.volumeContol.addEventListener('change', (e: Event) => this.setVolume(e));
            this.volumeContol.addEventListener('input', (e: Event) => this.setVolume(e));
        }

        if (this.progressBarButton) {
            this.progressBarButton.addEventListener('touchstart', (e: Event) => this.touchplayhead(e), { passive: true });
            this.progressBarButton.addEventListener('touchmove', (e: Event) => this.touchplayhead(e), { passive: true });
            this.progressBarButton.addEventListener('touchend', (e: Event) => this.endTouch(e));
        }

        if (this.progressBarTrack) {
            this.progressBarTrack.addEventListener('touchstart', (e) => this.touchplayhead(e), { passive: true });
            this.progressBarTrack.addEventListener('touchmove', (e) => this.touchplayhead(e), { passive: true });
            this.progressBarTrack.addEventListener('touchend', (e) => this.endTouch(e));
        }


        if (this.DesktopProgressBarTrack) {
            this.DesktopProgressBarTrack.addEventListener('mousedown', this.mouseDown);
            this.DesktopProgressBarTrack.addEventListener('mouseup', (e) => this.mouseUp(e));
        }

        if (this.DesktopProgressBarButton) {
            this.DesktopProgressBarButton.addEventListener('mousedown', this.mouseDown);
        }
        document.addEventListener('mouseup', this.mouseUp);

        document.addEventListener('keypress', (e) => this.handleSpace(e));
    }

    handleSpace = (e: KeyboardEvent): void => {
        if (e.code === 'Space') {
            this.play();
        }
    };

    mouseDown = () => {
        this.moving = true;
        document.addEventListener('mousemove', this.moveplayhead, true);
        if (this.audio) {
            this.audio.removeEventListener('timeupdate', this.timeUpdate, false);
        }
    };

    moveplayhead = (e: MouseEvent) => {

        let shiftX: number;
        let newButtonPosition: number = 0;
        let newProgressBarPosition: number = 0;

        if (this.DesktopProgressBarTrack) {
            shiftX = e.clientX - this.DesktopProgressBarTrack.getBoundingClientRect().left;
            newButtonPosition = 100 * (shiftX / this.DesktopProgressBarTrack.offsetWidth);
            newProgressBarPosition = newButtonPosition - 100;
        }


        if (this.DesktopProgressBarButton && this.DesktopProgressBar) {
            if (newButtonPosition > 100) {
                this.DesktopProgressBarButton.style.left = `${100}%`;
                this.DesktopProgressBar.style.transform = `translateX(${0}%)`;
                return;
            }

            if (newButtonPosition < 0) {
                this.DesktopProgressBarButton.style.left = `${0}%`;
                this.DesktopProgressBar.style.transform = `translateX(${-100}%)`;
                return;
            }

            this.DesktopProgressBarButton.style.left = `${newButtonPosition}%`;
            this.DesktopProgressBar.style.transform = `translateX(${newProgressBarPosition}%)`;
        }

        return;
    };

    mouseUp = (e: MouseEvent) => {
        if (this.moving) {
            this.moveplayhead(e);
            document.removeEventListener('mousemove', this.moveplayhead, true);

            let buttonPositionInPercent: any;
            let percentDeci: any;

            if (this.DesktopProgressBarButton) {
                buttonPositionInPercent = this.DesktopProgressBarButton.style.left;
                percentDeci = buttonPositionInPercent.substring(0, buttonPositionInPercent.length - 1);
                percentDeci = percentDeci / 100;
            }

            if (this.currentSong && this.audio) {
                let newCurrentTime: any = this.currentSong.duration * percentDeci;
                newCurrentTime = newCurrentTime.toFixed(0);
                newCurrentTime = newCurrentTime / 1000;
                this.audio.currentTime = newCurrentTime;
                this.audio.addEventListener('timeupdate', this.timeUpdate, false);
            }
        }

        this.moving = false;
    };

    touchplayhead = (e: any) => {
        this.audio.removeEventListener('timeupdate', this.timeUpdate, false);

        let newClient: number = 0;
        let newbutton: number = 0;
        let newprogress: number = 0;

        if (e.touches[0].clientX && this.progressBarTrack) {
            newClient = e.touches[0].clientX - this.progressBarTrack.getBoundingClientRect().left;
        }

        if (e.clientX && this.progressBarTrack) {
            newClient = e.clientX - this.progressBarTrack.getBoundingClientRect().left;
        }

        if (this.progressBarTrack) {
            newbutton = 100 * (newClient / this.progressBarTrack.offsetWidth);
            newprogress = newbutton - 100;
        }


        if (this.progressBarButton && this.progressBar && this.miniProgressBar) {
            if (newbutton > 100) {
                this.progressBarButton.style.left = `${100}%`;
                this.progressBar.style.transform = `translateX(${0}%)`;
                this.miniProgressBar.style.transform = `translateX(${0}%)`;
                return;
            }

            if (newbutton < 0) {
                this.progressBarButton.style.left = `${0}%`;
                this.progressBar.style.transform = `translateX(${-100}%)`;
                this.miniProgressBar.style.transform = `translateX(${-100}%)`;
                return;
            }

            this.progressBarButton.style.left = `${newbutton}%`;
            this.progressBar.style.transform = `translateX(${newprogress}%)`;
            this.miniProgressBar.style.transform = `translateX(${newprogress}%)`;
        }
        return;
    };

    timeUpdate = () => {
        if (
            this.currentSong &&
            this.progressBarButton &&
            this.progressBar &&
            this.DesktopProgressBarButton &&
            this.DesktopProgressBar &&
            this.miniProgressBar
        ) {
            let buttonPercent = 100000 * (this.audio.currentTime / this.currentSong.duration);
            let trackPercent = buttonPercent - 100;
            this.progressBarButton.style.left = `${buttonPercent}%`;
            this.progressBar.style.transform = `translateX(${trackPercent}%)`;

            this.DesktopProgressBarButton.style.left = `${buttonPercent}%`;
            this.DesktopProgressBar.style.transform = `translateX(${trackPercent}%)`;

            this.miniProgressBar.style.transform = `translateX(${trackPercent}%)`;
        }
    };

    endTouch = (_e: any) => {
        let buttonPositionInPercent: any;
        let percentDeci: number = 0;

        if (this.progressBarButton && this.currentSong) {
            buttonPositionInPercent = this.progressBarButton.style.left;
            percentDeci = buttonPositionInPercent.substring(0, buttonPositionInPercent.length - 1,);
            percentDeci = percentDeci / 100;
            let newCurrentTime: any = this.currentSong.duration * percentDeci;
            newCurrentTime = newCurrentTime.toFixed(0);
            newCurrentTime = newCurrentTime / 1000;
            this.audio.currentTime = newCurrentTime;
            this.audio.addEventListener('timeupdate', this.timeUpdate, false);
        }
    };

    play = () => {
        if (this.playing) {
            this.playing = false;
            this.audio.pause();
            this.showPlay();
        } else {
            this.playing = true;
            this.isFetched ? this.audio.play() : this.fetchPlay();
            this.showPause();
            this.updatePanel();
        }
    }

    fetchPlay = () => {
        console.log('fetching play');
        console.log('loading playlist');

        if (this.currentSong) {
            fetch(`https://electrictooth.com/fm/stream/${this.currentSong.stream_id}`, { method: 'GET' })
                .then((response: any) => response.blob())
                .then((blob: any) => {
                    // @ts-ignore
                    const url = window.webkitURL.createObjectURL(blob);
                    this.audio.src = url;
                    this.audio.load();
                    this.audio.play();
                    this.showPause();
                    this.isFetched = true;
                })
                .catch((error: any) => console.log('error', error));
        }
    }

    updatePanel = () => {
        if (this.currentSong) {
            if (this.currentSong.id !== this.previousSongId) {

                if (this.currentSong) {
                    let current = document.getElementById(`${this.currentSong.id}`);
                    if (current) {
                        current.style.fontWeight = 'bold';
                        current.style.color = '#05aea5';
                    }
                }

                let previous = document.getElementById(`${this.previousSongId}`);
                if (previous) {
                    previous.style.fontWeight = 'normal';
                    previous.style.color = 'black';
                }
            }
        }
    }


    updatePlayer = (newSong: PlaylistItem) => {
        for (let e of this.playerTitle) {
            e.innerHTML = newSong.title;
        }
        // for (let s of this.playerSinger) {
        //   s.innerHTML = newSong.singer;
        // }
        for (let i of this.playerCover) {
            i.src = newSong.cover;
        }

        this.currentSong = newSong;
    }

    updatePlaylistPanel = () => {

        let temp: HTMLTemplateElement = document.getElementsByTagName('template')[0];
        let item: any = temp.content.querySelector('div');
        let plist: HTMLElement | null = document.getElementById('mp');
        let newPlaylistNode: HTMLElement;

        for (let i = 0; i < this.playlist.length; i++) {
            //Create a new node, based on the template:
            newPlaylistNode = document.importNode(item, true);

            newPlaylistNode.id = `${this.playlist[i].id}`;
            newPlaylistNode.setAttribute('onclick', `ETPlayer.playNow(${this.playlist[i].id})`);

            let playlistImg = newPlaylistNode.querySelector('img');

            if (playlistImg) {
                playlistImg.src = this.playlist[i].cover
            }

            let playlistTitle = newPlaylistNode.querySelector('p');

            if (playlistTitle) {
                playlistTitle.innerHTML = `${this.playlist[i].title}`;
            }

            if (plist) {
                plist.appendChild(newPlaylistNode);
            }

        }
    }

    showPause = () => {
        for (let b of this.playButtons) {
            b.classList.remove('fa-play');
            b.classList.add('fa-pause');
        }
    }

    showPlay = () => {
        for (let b of this.playButtons) {
            b.classList.remove('fa-pause');
            b.classList.add('fa-play');
        }
    }

    playNow = (id: number) => {
        if (this.currentSong) {
            this.previousSongId = this.currentSong.id;
            this.updatePlayer(this.playlist[id]);
            this.updatePanel();
            this.showPause();

            this.playing = false;
            this.isFetched = false;
            this.play();
        }
    }

    next = () => {
        if (this.currentSong) {
            this.previousSongId = this.currentSong.id;
            let next = this.currentSong.id + 1;

            if (this.playlist.length === next) {
                next = 0;
            }

            this.updatePlayer(this.playlist[next]);
            this.updatePanel();
            this.showPause();

            this.playing = false;
            this.isFetched = false;
            this.play();
        }
    }

    prev = () => {
        if (this.currentSong) {
            this.previousSongId = this.currentSong.id;
            let prev = this.currentSong.id - 1;

            if (prev < 0) {
                prev = this.playlist.length - 1;
            }

            this.updatePlayer(this.playlist[prev]);
            this.updatePanel();
            this.showPause();

            this.playing = false;
            this.isFetched = false;
            this.play();
        }
    }
    toggleMobileList = () => {
        if (this.fullMobileListShow && this.fullPlaylistPanel) {
            history.pushState(null, '', '/index.html#player');
            this.fullPlaylistPanel.style.transform = 'translateY(100vh)';
            this.fullMobileListShow = !this.fullMobileListShow;
            return;
        }

        if (this.fullMobileListShow === false && this.fullPlaylistPanel) {
            history.pushState(null, '', '/index.html#playlist');
            this.fullPlaylistPanel.style.transform = 'translateY(0)';
            this.fullMobileListShow = !this.fullMobileListShow;
            return;
        }
    }

    toggleMobilePlayer = () => {
        if (this.fullMobilePlayerShow && this.miniPlayer && this.fullPlayer) {
            history.pushState(null, '', '/index.html');
            this.miniPlayer.style.transitionDelay = '350ms';
            this.miniPlayer.style.transform = 'translateY(0)';
            this.fullPlayer.style.transform = 'translateY(200vh)';
            this.fullMobilePlayerShow = !this.fullMobilePlayerShow;
            return;
        }

        if (this.fullMobilePlayerShow === false && this.miniPlayer && this.fullPlayer) {
            history.pushState(null, '', '/index.html#player');
            this.miniPlayer.style.transitionDelay = '0ms';
            this.miniPlayer.style.transform = 'translateY(160px)';
            this.fullPlayer.style.transform = 'translateY(0)';
            this.fullMobilePlayerShow = !this.fullMobilePlayerShow;
            return;
        }
    }

    setVolume = (e: any) => {
        this.audio.volume = e.target.value / 100;
    };
};

const ETPlayer = new ETAudioPlayer();

window.onload = function () {
    if (ETPlayer.miniPlayer) {
        ETPlayer.miniPlayer.style.transform = 'translateY(0)';
        history.pushState(null, '', '/index.html');
    }
};

window.onpopstate = function () {
    if (ETPlayer.fullMobileListShow && ETPlayer.fullMobilePlayerShow) {
        ETPlayer.toggleMobileList();
        return;
    }

    if (ETPlayer.fullMobilePlayerShow) {
        ETPlayer.toggleMobilePlayer();
        return;
    }
}; 