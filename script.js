var playing = false;
var currentPlaylist = 0;
var sliderRun;
var songHistory = [];
var darkMode = true;
var atHome = true;
var runTime;
document.onkeydown = checkKey;
navigator.mediaSession.setActionHandler('previoustrack', function() { rewind() });
navigator.mediaSession.setActionHandler('nexttrack', function() { randomSong() });
navigator.mediaSession.setActionHandler('play', function() {  playPause() });
navigator.mediaSession.setActionHandler('pause', function() { playPause() });

function changePlaylist(newList) {
	forcePlay();
	currentPlaylist = newList;
	randomSong();
	var elem = document.getElementById("songList");
	var index = elem.children[0].children;
	var limit = 0;
	while (limit < 100 && index[1] !== undefined) {
		index[1].remove();
		limit++;
	}
	listSelect();
	var newIndex = songInfo[currentPlaylist].length;
	for (var j = 0; j < newIndex; j++) {
		console.log("J: " + j);
		var songRow = document.createElement("div");
		songRow.classList.add("songRow");
		//songRow.onclick = function() { chooseSong(j); }; //fff
		songRow.onclick = function() { console.log('c'); console.log(j); }; //fff
		var album = document.createElement("img");
		album.classList.add("albumChoose");
		album.src = "https://hailtothevictors.github.io/andromeda/" + songInfo[currentPlaylist][j][3];
		songRow.appendChild(album);
		var tont = document.createElement("div");
		tont.classList.add("chooseTont");
		songRow.appendChild(tont);
		var songName = document.createElement("div");
		songName.classList.add("chooseName");
		songName.innerHTML = songInfo[currentPlaylist][j][1];
		tont.appendChild(songName);
		var songArtist = document.createElement("div");
		songArtist.classList.add("chooseArtist");
		songArtist.innerHTML = songInfo[currentPlaylist][j][2];
		tont.appendChild(songArtist);
		elem.children[0].appendChild(songRow);
	}
}

function pageClose(elem) {
	var page = elem.parentElement.parentElement;
	$(page).fadeOut(200);
	$("#pageHome").delay(200).fadeIn(200);
	atHome = true;
}

function chooseSong(song) {
	playSong(song,false);
	songSelect();
	forcePlay();
}

function forcePlay() {
	if (playing == false) {
		playing = true;
		document.getElementById("play").style.display = "none";
		document.getElementById("pause").style.display = "block";
	}
}

function playPause() {
	const audioElem = document.getElementById("audio");
	var playIcon = document.getElementById("play");
	var pauseIcon = document.getElementById("pause");
	if (playing == false) {
		audioElem.play();
		playing = true;
		advanceSlider();
		playIcon.style.display = "none";
		pauseIcon.style.display = "block";
	} else {
		audioElem.pause();
		playing = false;
		clearInterval(sliderRun);
		playIcon.style.display = "block";
		pauseIcon.style.display = "none";
	}
}

function songSelect() {
	if (atHome == true) {
		$("#pageHome").fadeOut(200);
		$("#songList").delay(200).fadeIn(200);
		atHome = false;
	} else {
		$("#songList").fadeOut(200);
		$("#pageHome").delay(200).fadeIn(200);
		atHome = true;
	}
}

function listSelect() {
	if (atHome == true) {
		$("#pageHome").fadeOut(200);
		$("#playlists").delay(200).fadeIn(200);
		atHome = false;
	} else {
		$("#playlists").fadeOut(200);
		$("#pageHome").delay(200).fadeIn(200);
		atHome = true;
	}
}

function adjustTime() {
	var percent = document.getElementById("range").value;
	var runTime = document.getElementById("audio").duration;
	var newTime = percent / 100 * runTime;
	document.getElementById("audio").currentTime = newTime;
}

function toMins(time) {
	time = Math.round(time);
	var mins = Math.floor(time / 60);
	var secs = Number(time) - Number(mins) * 60;
	if (secs < 10) {
		secs = "0" + secs;
	}
	return mins + ":" + secs;
}

function randomSong() {
	var songLength = songInfo[currentPlaylist].length;
	var randomSong = Math.floor(Math.random() * songLength);
	var limiter = 0;
	var prev = [];
	prev[0] = songHistory[songHistory.length - 1];
	prev[1] = songHistory[songHistory.length - 2];
	prev[2] = songHistory[songHistory.length - 3];
	for (var i = 1; i < 3; i++) {
		if (songHistory[songHistory.length - i] == null) {
			prev[i - 1] = -1;
		}
	}
	while ((randomSong == prev[0] || randomSong == prev[1] || randomSong == prev[2]) && limiter < 30) {
		randomSong = Math.floor(Math.random() * songLength);
		limiter++;
	}
	playSong(randomSong,false);
}

function rewind() {
	if(songHistory.length !== 1) {
		playSong(songHistory[songHistory.length - 2],true);
	}
}

function playSong(song,rewind) {
	const audioElem = document.getElementById("audio");
	audioElem.src = "https://hailtothevictors.github.io/andromeda/AndromedaX/" + songInfo[currentPlaylist][song][0] + ".mp3";
	counter = 0;
	var verification = setInterval(function() {
		if (audioElem.readyState > 3 && counter < 30) {
			advanceSlider();
			audioElem.play();
			document.getElementById("album").src = "https://hailtothevictors.github.io/andromeda/" + songInfo[currentPlaylist][song][3];
			document.getElementById("nameCont").innerHTML = songInfo[currentPlaylist][song][1];
			document.getElementById("descCont").innerHTML = songInfo[currentPlaylist][song][2] + " | " + songInfo[currentPlaylist][song][4];
			if (rewind == false) {
				songHistory.push(song);
			}
			updateMeta(song);
			clearInterval(verification);
		} else {
			if (counter < 30) {
			} else {
				clearInterval(verification);
				randomSong();
			}
		}
		counter++;
	}, 100);
}

function advanceSlider() {
	const rangeElem = document.getElementById("range");
	const audioElem = document.getElementById("audio");
	const songDisplay = document.getElementsByClassName("songTime");
	runTime = audioElem.duration;
	songDisplay[1].innerHTML = toMins(runTime);
	sliderRun = setInterval(function() {
		var currentTime = audioElem.currentTime;
		rangeElem.value = currentTime / runTime * 100;
		if (currentTime == runTime) {
			randomSong();
			clearInterval(sliderRun);
		}
		songDisplay[0].innerHTML = toMins(currentTime);
	}, 50);
}

function updateMeta(song) {
	var titlex = songInfo[currentPlaylist][song][1];
	var artistx = songInfo[currentPlaylist][song][2];
	var albumx = songInfo[currentPlaylist][song][4];
	navigator.mediaSession.metadata = new MediaMetadata({
		title: titlex,
		artist: artistx,
		album: albumx,
		artwork: [
			{ src: 'https://hailtothevictors.github.io/andromeda/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
			{ src: 'https://hailtothevictors.github.io/andromeda/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
			{ src: 'https://hailtothevictors.github.io/andromeda/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
			{ src: 'https://hailtothevictors.github.io/andromeda/icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
			{ src: 'https://hailtothevictors.github.io/andromeda/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
			{ src: 'https://hailtothevictors.github.io/andromeda/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
		]
	});
}

function restartSong() {
	document.getElementById('audio').currentTime = 0;
	document.getElementById("audio").play();
	playing = true;
	advanceSlider();
	document.getElementById("play").style.display = "none";
	document.getElementById("pause").style.display = "block";
}

function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == '37') {
       rewind();
    }
    else if (e.keyCode == '39') {
       randomSong();
    }
	else if (e.keyCode == '32') {
		playPause();
	}
}

function displayMode() {
	var bottom = document.getElementById("bottom");
	var forehead = document.getElementById("forehead");
	var content = document.getElementById("content");
	var logo = document.getElementById("logo");
	var nameCont = document.getElementById("nameCont");
	var descCont = document.getElementById("descCont");
	var times = document.getElementsByClassName("songTime");
	if (darkMode == true) {
		bottom.style.backgroundColor = "#ccc";
		forehead.style.backgroundColor = "#ccc";
		content.style.backgroundColor = "#eee";
		logo.src = "logo_d_c.png";
		for (var i = 0; i < times.length; i++) {
			times[i].style.color = "#333";
		}
		nameCont.style.color = "#333";
		descCont.style.color = "#555";
		darkMode = false;
	} else {
		bottom.style.backgroundColor = "#222";
		forehead.style.backgroundColor = "#222";
		content.style.backgroundColor = "#444";
		logo.src = "logo2_c.png";
		for (var j = 0; j < times.length; j++) {
			times[j].style.color = "#eee";
		}
		nameCont.style.color = "#eee";
		descCont.style.color = "#ccc";
		darkMode = true;
	}
}
