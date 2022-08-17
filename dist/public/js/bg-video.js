const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';

const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: 'ec_xGmM_tJc',
        playerVars: { autoplay: 1, playsinline: 1 },
        events: {
            onReady: onPlayerReady,
        },
    });
}

function onPlayerReady(event) {
    event.target.mute();
    event.target.playVideo();
}
