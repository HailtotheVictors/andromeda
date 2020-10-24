var launched = false;
var extended = true;
var tempSongList = [];
var songList = [];
var songQueue = [];
var songIndex = 0;
var audio;
var updateScrub = false;
var animating = false;

window.onresize = adjust;

window.onload = function() {
  audio = document.getElementById('audio');
  document.getElementById('scrubBar').value = 0;
  audio.addEventListener('ended',nextSong);
  document.getElementsByClassName('currentAlbum')[0].addEventListener('click',playPause);
  navigator.mediaSession.setActionHandler('previoustrack',backAction);
  navigator.mediaSession.setActionHandler('nexttrack',nextSong);
  navigator.mediaSession.setActionHandler('play',playPause);
  navigator.mediaSession.setActionHandler('pause',playPause);
  navigator.mediaSession.setActionHandler('seekbackward', function() { skipInTrack(-10); });
  navigator.mediaSession.setActionHandler('seekforward', function() { skipInTrack(10); });
};

document.onkeydown = checkKey;
function checkKey(e) {
  e = e || window.event;
  if (e.keyCode == '38') {
    skipInTrack(10);
  } else if (e.keyCode == '40') {
	  skipInTrack(-10);
  } else if (e.keyCode == '37') {
	   prevSong();
  } else if (e.keyCode == '39') {
	   nextSong();
  } else if (e.keyCode == '32') {
	   playPause();
  }
}

function backAction() {
  if (audio.currentTime < 10) {
    prevSong();
  } else {
    audio.currentTime = 0;
  }
  document.getElementsByClassName('scrubTime')[0].textContent = '0:00';
}

function skipInTrack(secs) {
  audio.currentTime += secs;
  if (audio.currentTime < 0) {
    audio.currentTime = 0;
  } else if (audio.currentTime > audio.duration) {
    nextSong();
  }
  document.getElementsByClassName('scrubTime')[0].textContent = convertToTime(audio.currentTime);
}

function playPause() {
  if (!launched) {
    return;
  }
  if (audio.paused) {
    audio.play();
    document.getElementById('playPause').children[0].setAttribute('d','M14,19H18V5H14M6,19H10V5H6V19Z');
    document.getElementsByClassName('scrubTime')[0].textContent = convertToTime(audio.currentTime);
    document.getElementById('scrubBar').value = audio.currentTime / audio.duration * 100;
    startScrub();
  } else {
    audio.pause();
    document.getElementById('playPause').children[0].setAttribute('d','M8,5.14V19.14L19,12.14L8,5.14Z');
    stopScrub();
  }
}

function nextSong() {
  if (animating) {
    return;
  }
  stopScrub();
  songIndex++;
  goToSong();
  updateQueue();
  animateCovers(1);
}

function prevSong() {
  if (songIndex < 1 || animating) {
    return;
  }
  stopScrub();
  songIndex--;
  goToSong();
  updateQueue();
  animateCovers(-1);
}

function adjust() {
  if (!launched) {
    return;
  }
  let covers = document.getElementsByClassName('queueCover');
  let titles = document.getElementsByClassName('queueTitle');
  let artists = document.getElementsByClassName('queueArtist');
  setTimeout(function() {
    var st = document.getElementById('songTitle');
    st.textContent = checkOverflow(st,songs[songQueue[songIndex]].title);
    var sd = document.getElementById('songDesc');
    sd.textContent = checkOverflow(sd,`${songs[songQueue[songIndex]].artist} | ${decodeEntities(songs[songQueue[songIndex]].details)}`);
    for (let i = 0; i < 5; i++) {
      let song = songs[songQueue[songIndex + i]];
      titles[i].textContent = checkOverflow(titles[i],song.title);
      artists[i].textContent = checkOverflow(artists[i],song.artist);
    }
  }, 10);
}

function goTo(num) {
  if (!launched && num == 0) {
    num = 2;
  }
  let pages = document.getElementsByClassName('content');
  let tabs = document.getElementsByClassName('sideNav');
  for (let i = 0; i < pages.length; i++) {
    if (i == num) {
      pages[i].style.display = 'block';
      if (tabs[i]) {
        tabs[i].style.borderLeftColor = 'currentColor';
      }
    } else {
      pages[i].style.display = 'none';
      if (tabs[i]) {
        tabs[i].style.borderLeftColor = '#222';
      }
    }
  }
  if (num == 4) {
    tabs[2].style.borderLeftColor = 'currentColor';
  } else if (num == 0) {
    setTimeout(function() {
      var st = document.getElementById('songTitle');
      st.textContent = checkOverflow(st,songs[songQueue[songIndex]].title);
      var sd = document.getElementById('songDesc');
      sd.textContent = checkOverflow(sd,`${songs[songQueue[songIndex]].artist} | ${decodeEntities(songs[songQueue[songIndex]].details)}`);
    }, 10);
  } else if (num == 1) {
    goToSearch();
  }
}

function goToSearch() {
  document.getElementById('searchBar').value = '';
  var parent = document.getElementById('searchOuputCont');
  parent.innerHTML = '';
  var iter = 0;
  for (let song of songs) {
    let newRow = document.createElement('DIV');
    newRow.classList.add('searchRow');
    parent.append(newRow);
    let newCont = document.createElement('DIV');
    newCont.classList.add('searchCont');
    newRow.append(newCont);
    let newImg = document.createElement('IMG');
    newImg.src = getAlbumCoverFromSong(song);
    newCont.append(newImg);
    let newTont = document.createElement('DIV');
    newTont.classList.add('searchTont');
    newCont.append(newTont);
    let newTitle = document.createElement('DIV');
    newTitle.classList.add('searchTitle');
    newTont.append(newTitle);
    let newArtist = document.createElement('DIV');
    newArtist.classList.add('searchArtist');
    newTont.append(newArtist);
    let newPlay = makeSVG('M8,5.14V19.14L19,12.14L8,5.14Z');
    newPlay.setAttribute('data-id',iter);
    newPlay.addEventListener('click',function() { playSpecificSong(this) });
    newCont.append(newPlay);
    let newQueue = makeSVG('M2,16H10V14H2M18,14V10H16V14H12V16H16V20H18V16H22V14M14,6H2V8H14M14,10H2V12H14V10Z');
    newQueue.setAttribute('data-id',iter);
    newPlay.addEventListener('click',function() { playSpecificSong(this) });
    newCont.append(newQueue);
    let newDivider = document.createElement('DIV');
    newDivider.classList.add('searchDivider');
    newRow.append(newDivider);
    setTimeout(function() {
      newTitle.textContent = checkOverflow(newTitle,song.title);
      newArtist.textContent = checkOverflow(newArtist,song.artist);
    }, 10);
    iter++;
  }
}

function search() {
  var query = document.getElementById('searchBar').value;
  var rows = document.getElementsByClassName('searchRow');
  for (let i = 0; i < songs.length; i++) {
    let song = songs[i];
    if (song['title'].replace('/','').indexOf(query) !== -1 || song['artist'].indexOf(query) !== -1 || song['details'].indexOf(query) !== -1) {
      rows[i].style.display = 'block';
    } else {
      rows[i].style.display = 'none';
    }
  }
}

function goToPlaylist(img) {
  var parent = document.getElementById('playlistCont');
  parent.innerHTML = '';
  parent.scrollTo(0,0);
  document.getElementById('playlistName').textContent = decodeEntities(img.getAttribute('data-name'));
  document.getElementById('playlistCover').src = img.src;
  var qualifiers = [{attr:'master',lim:'musica'},{attr:'artist',lim:'Imagine Dragons'},{attr:'artist',lim:'Avicii'},{attr:'master',lim:'phineas'}];
  var qualifier = qualifiers[Number(img.getAttribute('data-qual'))];
  var songsInPlaylist = [];
  var songIds = [];
  var playlistLength = 0;
  for (let song in songs) {
    if (songs[song][qualifier.attr].indexOf(qualifier.lim) !== -1) {
      songsInPlaylist.push(songs[song]);
      playlistLength += songs[song].length;
      tempSongList.push(Number(song));
      songIds.push(song);
    }
  }
  document.getElementById('playlistInfo').textContent = `${songsInPlaylist.length} songs, ${convertSecsToText(playlistLength)}`;
  var iter = 0;
  for (let song of songsInPlaylist) {
    let newRow = document.createElement('DIV');
    newRow.classList.add('playlistRow');
    let newCover = document.createElement('IMG');
    newCover.src = getAlbumCoverFromSong(song);
    newRow.append(newCover);
    let newTont = document.createElement('DIV');
    newTont.classList.add('playlistRowTont');
    let newTitle = document.createElement('DIV');
    newTitle.classList.add('playlistTitle');
    newTont.append(newTitle);
    let newArtist = document.createElement('DIV');
    newArtist.classList.add('playlistArtist');
    newTont.append(newArtist);
    newRow.append(newTont);
    parent.append(newRow);
    let newPlay = makeSVG('M8,5.14V19.14L19,12.14L8,5.14Z');
    newPlay.setAttribute('data-id',songIds[iter]);
    newPlay.addEventListener('click',function() { playSpecificSong(this) });
    newRow.append(newPlay);
    let newQueue = makeSVG('M2,16H10V14H2M18,14V10H16V14H12V16H16V20H18V16H22V14M14,6H2V8H14M14,10H2V12H14V10Z');
    newQueue.setAttribute('data-id',songIds[iter]);
    newQueue.addEventListener('click',function() { addToQueue(this) });
    newRow.append(newQueue);
    setTimeout(function() {
      newTitle.textContent = checkOverflow(newTitle,song.title);
      newArtist.textContent = checkOverflow(newArtist,song.artist);
    }, 10);
    iter++;
  }
}

function shufflePlaylist() {
  launched = true;
  songQueue.length = 0;
  songList.length = 0;
  for (let song of tempSongList) {
    songList.push(song);
  }
  tempSongList.length = 0;
  songIndex = 0;
  while (songQueue.length < 10) {
    let randomSong = Math.floor(Math.random() * songList.length);
    if (songQueue.includes(songList[randomSong]) == false) {
      songQueue.push(songList[randomSong]);
    }
  }
  document.getElementsByClassName('currentAlbum')[0].src = getAlbumCoverFromSong(songs[songQueue[songIndex]]);
  document.getElementsByClassName('flankingAlbums')[0].src = 'https://hailtothevictors.github.io/andromeda/albums/placeholder.png';
  document.getElementsByClassName('flankingAlbums')[1].src = getAlbumCoverFromSong(songs[songQueue[songIndex + 1]]);
  goToSong();
  updateQueue();
}

function addToQueue(elem) {
  if (!launched) {
    return;
  }
  var id = Number(elem.getAttribute('data-id'));
  songQueue.splice(songIndex + 1,0,id);
  document.getElementsByClassName('flankingAlbums')[1].src = getAlbumCoverFromSong(songs[id]);
  updateQueue();
}

function playSpecificSong(elem) {
  if (!launched) {
    return;
  }
  var id = Number(elem.getAttribute('data-id'));
  songQueue[songIndex] = id;
  song = songs[id];
  document.getElementsByClassName('currentAlbum')[0].src = getAlbumCoverFromSong(song);
  goToSong();
  updateQueue();
}

function playPlaylist() {
  launched = true;
  songQueue.length = 0;
  songList.length = 0;
  for (let song of tempSongList) {
    songList.push(song);
    songQueue.push(song);
  }
  tempSongList.length = 0;
  songIndex = 0;
  document.getElementsByClassName('currentAlbum')[0].src = getAlbumCoverFromSong(songs[songQueue[songIndex]]);
  document.getElementsByClassName('flankingAlbums')[0].src = 'https://hailtothevictors.github.io/andromeda/albums/placeholder.png';
  document.getElementsByClassName('flankingAlbums')[1].src = getAlbumCoverFromSong(songs[songQueue[songIndex + 1]]);
  goToSong();
  updateQueue();
}

function goToSong() {
  var newSong = songs[songQueue[songIndex]];
  audio.currentTime = 0;
  audio.src = getAudioSourceFromSong(newSong);
  audio.play();
  document.getElementsByClassName('scrubTime')[0].textContent = '0:00';
  document.getElementsByClassName('scrubTime')[1].textContent = '0:00';
  document.getElementById('scrubBar').value = 0;
  document.getElementById('home').style.backgroundImage = `url('${getAlbumCoverFromSong(newSong)}')`;
  goTo(0);
  adjust();
  updateMeta();
}

function updateQueue() {
  var lastTen = [];
  for (let i = songIndex; i < songIndex + 10; i++) {
    if (songQueue[i]) {
      lastTen.push(songQueue[i]);
    }
  }
  while (songQueue.length < songIndex + 10) {
    let randomSong = Math.floor(Math.random() * songList.length);
    if (lastTen.includes(songList[randomSong]) == false) {
      songQueue.push(songList[randomSong]);
    }
  }
  let covers = document.getElementsByClassName('queueCover');
  let titles = document.getElementsByClassName('queueTitle');
  let artists = document.getElementsByClassName('queueArtist');
  for (let i = 0; i < 5; i++) {
    let song = songs[songQueue[songIndex + i]];
    covers[i].src = getAlbumCoverFromSong(song);
    titles[i].textContent = checkOverflow(titles[i],song.title);
    artists[i].textContent = checkOverflow(artists[i],song.artist);
  }
}

function audioReady() {
  if (!launched) {
    return;
  }
  document.getElementById('playPause').children[0].setAttribute('d','M14,19H18V5H14M6,19H10V5H6V19Z');
  document.getElementsByClassName('scrubTime')[1].textContent = convertToTime(audio.duration);
  audio.play();
  startScrub();
}

function startScrub() {
  if (updateScrub == false) {
    updateScrub = setInterval(function() {
      document.getElementsByClassName('scrubTime')[0].textContent = convertToTime(audio.currentTime);
      document.getElementById('scrubBar').value = audio.currentTime / audio.duration * 100;
    }, 10);
  }
}

function stopScrub() {
  clearInterval(updateScrub);
  updateScrub = false;
}

function animateCovers(dir) {
  var parent = document.getElementById('coversCont');
  var newCover = document.createElement('IMG');
  if (dir == 1) {
    newCover.src = getAlbumCoverFromSong(songs[songQueue[songIndex + 1]]);
    parent.append(newCover);
  } else if (songIndex > 0) {
    newCover.src = getAlbumCoverFromSong(songs[songQueue[songIndex - 1]]);
    parent.prepend(newCover);
  } else {
    newCover.src = 'https://hailtothevictors.github.io/andromeda/albums/placeholder.png';
    parent.prepend(newCover);
  }
  newCover.style.width = '0%';
  var iter = 0;
  var covers = parent.children;
  animating = true;
  if (dir == 1) {
    var promotedCover = covers[2];
    var goneCover = covers[0];
    var demotedCover = covers[1];
  } else {
    var promotedCover = covers[1];
    var goneCover = covers[3];
    var demotedCover = covers[2];
  }
  var animation = setInterval(function() {
    iter++;
    newCover.style.width = `${iter * 1.5}%`;
    newCover.style.margin = `${iter}px`;
    newCover.classList.add('flankingAlbums');
    goneCover.style.width = `${30 - iter * 1.5}%`;
    goneCover.style.margin = `${20 - iter}px`;
    demotedCover.style.width = `${45 - iter * 0.75}%`;
    demotedCover.style.margin = `${iter}px`;
    demotedCover.classList.add('flankingAlbums');
    demotedCover.classList.remove('currentAlbum');
    demotedCover.removeEventListener('click',playPause);
    promotedCover.style.width = `${30 + iter * 0.75}%`;
    promotedCover.style.margin = `${20 - iter}px`;
    promotedCover.classList.remove('flankingAlbums');
    promotedCover.classList.add('currentAlbum');
    promotedCover.addEventListener('click',playPause);
    if (iter == 20) {
      goneCover.remove();
      animating = false;
      clearInterval(animation);
    }
  }, 10);
}

function updateMeta() {
  var currentSong = songs[songQueue[songIndex]];
	var titlex = currentSong.title;
	var artistx = currentSong.artist;
	var albumx = decodeEntities(currentSong.details);
	var url = getAlbumCoverFromSong(currentSong);
	var arg = {src: url};
	var sys = [];
	sys[0] = arg;
	navigator.mediaSession.metadata = new MediaMetadata({
		title: titlex,
		artist: artistx,
		artwork: sys,
		album: albumx
	});
}

function scrubSong(val) {
  var point = val / 100 * audio.duration;
  audio.currentTime = point;
  document.getElementsByClassName('scrubTime')[0].textContent = convertToTime(point);
}

//resources

function getAudioSourceFromSong(song) {
  return `https://hailtothevictors.github.io/andromeda/AndromedaX/${song.src}.mp3`;
}

function makeSVG(path) {
  var newSVG = document.createElementNS('http://www.w3.org/2000/svg','svg');
  newSVG.setAttribute('viewBox','0 0 24 24');
  var newPath = document.createElementNS('http://www.w3.org/2000/svg','path');
  newPath.setAttribute('d',path);
  newSVG.append(newPath);
  return newSVG;
}

function getAlbumCoverFromSong(song) {
  return `https://hailtothevictors.github.io/andromeda${song.cover}`;
}

function checkOverflow(elem,str) {
  let testDiv = document.createElement('DIV');
  let display = getComputedStyle(elem.parentElement).display;
  testDiv.style.fontSize = getComputedStyle(elem).fontSize;
  testDiv.style.fontFamily = getComputedStyle(elem).fontFamily;
  testDiv.style.width = getComputedStyle(elem).width;
  elem.parentElement.display = 'block';
  testDiv.style.whiteSpace = 'nowrap';
  testDiv.textContent = str;
  elem.parentElement.appendChild(testDiv);
  if (testDiv.scrollWidth <= testDiv.offsetWidth) {
    elem.parentElement.display = display;
    elem.parentElement.removeChild(testDiv);
    return str;
  }
  for (let i = str.length; i >= 0; i--) {
    testDiv.textContent = str.substring(0,i) + '...';
    if (testDiv.scrollWidth <= testDiv.offsetWidth) {
      elem.parentElement.display = display;
      elem.parentElement.removeChild(testDiv);
      return str.substring(0,i - 1) + '...';
    }
  }
}

function toggleSidebar(elem) {
  let sideBar = document.getElementById('sideBar');
  let container = document.getElementById('container');
  var oldext = extended;
  if (oldext == true) {
    var d = 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z';
  } else if (oldext == false) {
    var d = 'M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z';
  }
  extended = undefined;
  var iter = 0;
  let animation = setInterval(function() {
    iter += 12;
    elem.children[0].style.opacity = Math.abs(1 - iter / 120);
    if (iter == 120) {
      elem.children[0].setAttribute('d',d);
    }
    if (oldext == true) {
      w = 240 - iter;
    } else {
      w = iter;
    }
    sideBar.style.width = `${w}px`;
    container.style.width = `calc(100% - ${w}px)`;
    if (iter == 240) {
      extended = !oldext;
      adjust();
      clearInterval(animation);
    }
  }, 10);
}

function convertSecsToText(time) {
  if (time < 3600) { //less than an hour
    let secs = time % 60;
    let mins = (time - secs) / 60;
    if (secs > 0) {
      return `${mins} ${plural('minute',mins,false)} ${secs} ${plural('second',secs,false)}`;
    } else {
      return `${mins} ${plural('minute',mins,false)}`;
    }
  } else {
    let hours = Math.floor(time / 3600);
    let mins = Math.round((time - hours * 3600) / 60);
    if (mins > 0) {
      return `${hours} ${plural('hour',hours,false)} ${mins} ${plural('minute',mins,false)}`;
    } else {
      return `${hours} ${plural('hour',hours,false)}`;
    }
  }
}

function convertToTime(time) {
  time = Math.round(time);
  var secs = time % 60;
  var mins = (time - secs) / 60;
  if (secs < 10) {
    secs = '0' + secs;
  }
  return `${mins}:${secs}`;
}

function plural(str,num,size) {
  if (num == 1) {
    return str;
  } else if (size == true) {
    return `${str}S`;
  } else {
    return `${str}s`;
  }
}

var decodeEntities = (function() {
  var element = document.createElement('div');
  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }
    return str;
  }
  return decodeHTMLEntities;
})();
