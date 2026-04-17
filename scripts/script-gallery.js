// initialization 🔴

import '/scripts/general.js';
import {initializePhotos, urlFix} from "/scripts/gallery/table.js";

  window.focus();
  console.log('fixing url');
  urlFix();
  initializePhotos();

  document.addEventListener('keydown', function(e){
    if(e.code === 'KeyP'){
      console.log(document.activeElement);
    }
  })

  function fullScreen() {
    let docel = document.documentElement
      if (docel.requestFullscreen) {
        docel.requestFullscreen()
      }
      else if (docel.mozRequestFullScreen) {
        docel.mozRequestFullScreen();
      }
      else if (docel.webkitRequestFullScreen) {
        docel.webkitRequestFullScreen();
      }
      else if (docel.msRequestFullscreen) {
        docel.msRequestFullscreen();
      }

    try{screen.orientation.lock('landscape')} catch (_){}
  }

  function closeFullScreen() {
    if(document.fullscreenElement) {
      document.exitFullscreen()
    }
  }
  
  function toggleFullScreen() {
    console.log(window.innerWidth, window.innerHeight, window.innerWidth/window.innerHeight);
    if(document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      fullScreen()
    }
  }


export {closeFullScreen, toggleFullScreen};