// initialization 🔴

import './general.js';
import {initializePhotos, urlFix} from "./gallery/table.js";

let imgPrototype = HTMLImageElement.prototype;

imgPrototype.setNewImgOnLoad = function(src,place = null) {
  let dummyImg = document.createElement('img');
  dummyImg.originalImg = this;
  this.fullImageLoader = dummyImg;
  dummyImg.style.width = '0px';
  dummyImg.loadAttempts = 0;
  place?.appendChild(dummyImg);
  dummyImg.loading = place ? 'lazy': '';

  dummyImg.onload = function() {
    //setTimeout(function(){
      this.originalImg.classList.add('loadTransition');
      this.originalImg.src = dummyImg.src;
      this.originalImg.classList.remove('blurry')
      this.originalImg.loaded = true;
      this.originalImg.linked?.classList.add('loadTransition');
      this.originalImg.linked?.setAttribute('src',this.src);
      this.originalImg.linked?.classList.remove('blurry')
      this.originalImg.linked?.setAttribute('loaded',true);
      this.originalImg.linked?.fullImageLoader?.remove();
      delete this.originalImg.linked?.fullImageLoader;

      this.originalImg.ontransitionend = function() {this.classList.remove('loadTransition');this.ontransitionend = null;}
    //}.bind(dummyImg),500);

    this.remove();
    delete this.originalImg.fullImageLoader;
  }

  dummyImg.onerror = function() {
    this.loadAttempts++;
    if(this.loadAttempts >= 5) {
      this.remove();
      return;
    }
    setTimeout(function(){
      console.log('Failed to load '+src+'. Attempting to load again')
      dummyImg.src = src+'?'+dummyImg.loadAttempts;
    },1000*(2**this.loadAttempts))
  }

  dummyImg.src = src;
}

imgPrototype.createLinkedCopy = function(){
  let newImg = this.cloneNode(true);
  this.linked = newImg;
  newImg.linked = this;

  newImg.loaded = this.loaded;

  return newImg;
}

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