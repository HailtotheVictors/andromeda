var version = "V 3.6.0";
var playing = false;
var currentPlaylist = 0;
var sliderRun;
var songHistory = [];
var darkMode = true;
var atHome = true;
var runTime;
var seeSearch = false;
var youtube = false;
var player = 0;
var firstCustom = true;
var time_update_interval;
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
		songRow.onclick = function() { console.log('Trying to change song'); console.log(j); };
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
		if (youtube == false) {
			audioElem.play();
		} else {
			player.playVideo();
		}
		playing = true;
		advanceSlider();
		playIcon.style.display = "none";
		pauseIcon.style.display = "block";
	} else {
		if (youtube == false) {
			audioElem.pause();
		} else {
			player.pauseVideo();
		}
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
	var runTime;
	var newTime;
	if (youtube == false) {
		runTime = document.getElementById("audio").duration;
		newTime = percent / 100 * runTime;
		document.getElementById("audio").currentTime = newTime;
	} else {
		runTime = player.getDuration();
		newTime = percent / 100 * runTime;
		player.seekTo(newTime);

	}
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
	if (player !== 0) {
		player.pauseVideo();
	}
	youtube = false;
	const audioElem = document.getElementById("audio");
	var playIcon = document.getElementById("play");
	var pauseIcon = document.getElementById("pause");
	audioElem.src = "https://hailtothevictors.github.io/andromeda/AndromedaX/" + songInfo[currentPlaylist][song][0] + ".mp3";
	counter = 0;
	var verification = setInterval(function() {
		if (audioElem.readyState > 3 && counter < 30) {
			advanceSlider();
			audioElem.play();
			playing = true;
			playIcon.style.display = "none";
			pauseIcon.style.display = "block";
			document.getElementById("album").style.backgroundImage = "url('https://hailtothevictors.github.io/andromeda/" + songInfo[currentPlaylist][song][3] + "')";
			document.getElementById("album").classList.remove("adjust");
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
	console.log('Advancing');
	const rangeElem = document.getElementById("range");
	const audioElem = document.getElementById("audio");
	const songDisplay = document.getElementsByClassName("songTime");
	if (youtube == false) {
		runTime = audioElem.duration;
	} else {
		runTime = player.getDuration();
	}
	songDisplay[1].innerHTML = toMins(runTime);
	sliderRun = setInterval(function() {
		var currentTime;
		if (youtube == false) {
			currentTime = audioElem.currentTime;
		} else {
			currentTime = player.getCurrentTime();
		}
		rangeElem.value = currentTime / runTime * 100;
		if (youtube == true && Math.round(currentTime) >= (runTime - 0.5)) {
			randomSong();
			clearInterval(sliderRun);
		} else if (youtube == false && currentTime == runTime) {
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
			{ src: 'https://hailtothevictors.github.io/andromeda/newicons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
			{ src: 'https://hailtothevictors.github.io/andromeda/newicons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
			{ src: 'https://hailtothevictors.github.io/andromeda/newicons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
			{ src: 'https://hailtothevictors.github.io/andromeda/newicons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
			{ src: 'https://hailtothevictors.github.io/andromeda/newicons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
			{ src: 'https://hailtothevictors.github.io/andromeda/newicons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
		]
	});
}

function restartSong() {
	if (youtube == false) {
		document.getElementById('audio').currentTime = 0;
		document.getElementById("audio").play();
	} else {
		player.seekTo(0);
		player.playVideo();
	}
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
	else if (e.keyCode == '32' && e.target.nodeName !== 'INPUT') {
		playPause();
	}
}

function toggleSearch() {
	if (seeSearch == false) {
		var index = document.getElementsByClassName("control");
		var box = document.getElementById("search");
		for (var i = 0; i < 3; i++) {
			index[i + 4].style.display = "none";
		}
		box.style.display = "block";
		seeSearch = true;
	} else {
		var index = document.getElementsByClassName("control");
		var box = document.getElementById("search");
		box.style.display = "none";
		for (var i = 0; i < 3; i++) {
			index[i + 4].style.display = "block";
		}
		seeSearch = false;
		if (document.getElementById("search").value !== "") {
			searchSongs();
		}
	}
}

function searchSongs() {
	clearInterval(sliderRun);
	document.getElementById("audio").pause();
	youtube = true;
	var searchinput = document.getElementById("gsc-i-id1");
	var searchbutton = document.getElementsByClassName("gsc-search-button")[1];
	var query = document.getElementById("search").value;
	searchinput.value = query;
	searchbutton.click();
	document.getElementById("search").value = "";
	setTimeout(function() { mettwo(); }, 1200);
}

function mettwo() {
	var index = document.getElementsByClassName("gs-visibleUrl");
	var titles = document.getElementsByClassName("gs-title");
	var vidName = titles[1].innerHTML.replace(/(<([^>]+)>)/ig,"");
	var limit = 0;
	var finalPos = 0;
	while (limit < vidName.length) {
		var chara = vidName.substring(limit,limit + 1);
		if (chara == " " && limit <= 16) {
			finalPos = limit;
		}
		limit++;
	}
	document.getElementById("nameCont").innerHTML = vidName.substring(0,finalPos) + "...";
	if (vidName.substring(0,finalPos) == "") {
		document.getElementById("nameCont").innerHTML = vidName.substring(0,16) + "...";
	}
	document.getElementById("descCont").innerHTML = "Playing on YouTube";
	var link = index[1].innerHTML;
	var start = link.indexOf("=");
	var code = link.substring(start + 1,link.length);
	document.getElementById("album").style.backgroundImage = "url('https://img.youtube.com/vi/" + code + "/0.jpg')";
	document.getElementById("album").classList.add("adjust");
    if (firstCustom == true) {
		player = new YT.Player('video-placeholder', {
			width: 600,
			height: 400,
			videoId: code,
			autoplay: 1,
			events: {
				onReady: advanceSlider
			}
		});
		firstCustom = false;
	} else {
		player.loadVideoById(code);
		loadVideoById(code);
	}
	$("#video-placeholder")[0].src += "&autoplay=1";
	forcePlay();
	console.log('Calling to Advance');
	advanceSlider();
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
