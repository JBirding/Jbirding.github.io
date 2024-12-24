// initialization 🔴

import './general.js';
import {initializePhotos, urlFix} from "./gallery/table.js";

  window.focus();
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

    screen.orientation.lock('landscape')
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

  window.addEventListener('resize',handleRotate)

  screen.orientation.addEventListener('change',handleRotate)

  function handleRotate() {
    console.log(window.innerWidth/window.innerHeight)
  }

export {closeFullScreen, toggleFullScreen};