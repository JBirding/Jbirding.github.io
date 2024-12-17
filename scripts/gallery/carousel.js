import {closeFullScreen, toggleFullScreen} from '../script-gallery.js';
import {photos, names, sciNames, l} from "./table.js";


const carousel = document.getElementById('carousel');
let xDown, yDown, touchTimestamp;

carousel.addEventListener('touchstart', handleTouchStart, false); // make carousel swipable
carousel.addEventListener('touchmove', handleTouchMove, false);
carousel.addEventListener("wheel", (evt) => { //prevent scrolling on carousel
    evt.preventDefault();
});

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];

    if(document.elementFromPoint(firstTouch.clientX, firstTouch.clientY) === paddleright) paddleright.onpointerdown;
    else if(document.elementFromPoint(firstTouch.clientX, firstTouch.clientY) === paddleleft) paddleleft.onpointerdown;
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
    touchTimestamp = Date.now();
}

function handleTouchMove(evt) {

    if(document.elementFromPoint(xDown,yDown) === paddleleft || document.elementFromPoint(xDown,yDown) === paddleright) return;

    let w = window.innerWidth

    if ( ! xDown || ! yDown ) {
        return;
    }

    const xUp = evt.changedTouches[0].clientX;
    const yUp = evt.changedTouches[0].clientY;
    const timeElapsed = Date.now()-touchTimestamp;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) && Math.abs( xDiff ) >= w*0.05 && Math.abs(1000*xDiff/w/timeElapsed)>0.8 && l > 1 && evt.targetTouches.length === 1) {/*most significant*/
        if ( xDiff > 0 ) {
            carouselNext()
        } else {
            carouselPrevious()
        }

        xDown = null;
        yDown = null;
    }
}



document.addEventListener('keydown',(event) => { // carousel key functionality
    if (!carouselIsOpen()) return;
    if (event.code === 'ArrowRight' && l > 1) {// move right
        carouselNext();
        if(event.repeat) return;
        fastCarousel = setTimeout(accelerateCarousel,2000);
    } else if (event.code === 'ArrowLeft' && l > 1) { // move left
        carouselPrevious();
        if(event.repeat) return;
        fastCarousel = setTimeout(accelerateCarousel,2000);
    } else if (event.code === 'Escape') { // exit
        closeCarousel()
    }
})

document.addEventListener('keyup',function(ev) {
    if (ev.code === 'KeyO' && !carouselIsOpen() && l > 0) {
        forceOpen();
    } else if (ev.code === 'KeyF' && carouselIsOpen()) {
        toggleFullScreen();
    } else if(ev.code === 'ArrowLeft' || ev.code === 'ArrowRight') {
        clearTimeout(fastCarousel);
        document.querySelector(':root').style.removeProperty('--carousel-transition-duration');
    }
})

const fullscreen = document.getElementById('fullscreen')
const closefullscreen = document.getElementById('closefullscreen')

fullscreen.onclick = toggleFullScreen;
closefullscreen.onclick = toggleFullScreen;

document.onfullscreenchange = function(){
    if(document.fullscreenElement) {
        fullscreen.hidden = true
        closefullscreen.hidden = false
    } else {
        fullscreen.hidden = false
        closefullscreen.hidden = true
    }
}


const namecontainer = document.getElementById('namecontainer');
const scicontainer = document.getElementById('scicontainer');

const paddleleft = document.getElementById('paddleleft');
const paddleright = document.getElementById('paddleright');

let constMov;
let fastCarousel;
let accelerateCarousel = ()=>{document.querySelector(':root').style.setProperty('--carousel-transition-duration', '0.25s');}

paddleleft.onclick = carouselPrevious;
paddleright.onclick = carouselNext;
paddleleft.oncontextmenu = paddleright.oncontextmenu = function(ev) { ev.preventDefault() };

paddleright.onpointerdown = function() {carouselNext(); constMov = setInterval(carouselNext,100); clearTimeout(fastCarousel); fastCarousel = setTimeout(accelerateCarousel,2000); };
paddleleft.onpointerdown = function() {carouselPrevious(); constMov = setInterval(carouselPrevious,100); clearTimeout(fastCarousel); fastCarousel = setTimeout(accelerateCarousel,2000); }
carousel.onpointerup = carousel.ontouchend = carousel.ontouchcancel = function() {clearInterval(constMov); clearTimeout(fastCarousel); document.querySelector(':root').style.removeProperty('--carousel-transition-duration')};
//paddleright.onmouseout = paddleleft.onmouseout = function() {clearInterval(constMov)}
//paddleleft.onmouseover = paddleright.onmouseover = function(){if(this.clicked){this.onpointerdown()}};


document.getElementById('closecar').onclick = closeCarousel;



let n;
let moving;

function forceOpen() {
    openCarousel(photos[0])
}

function carouselIsOpen() {
    return carousel.open && carousel.classList.contains('open');
}

function openCarousel(photo) {
    if(carousel.open) return;

    document.addEventListener('keydown',disableTab);

    carousel.classList.remove('closed');
    carousel.classList.add('open');
    carousel.onanimationend = function(){this.onanimationend=null;this.open=true;};
    document.body.style.overflow = 'hidden';
    if (l === 1) {
        document.getElementById('carouselLeftSide').classList.add('hidden');
        document.getElementById('carouselRightSide').classList.add('hidden');
    } else {
        document.getElementById('carouselLeftSide').classList.remove('hidden');
        document.getElementById('carouselRightSide').classList.remove('hidden');
    }
    n = photo.index ?? this.index;
    console.log(n);
    display(n);
}

function closeCarousel() {
    if(!carousel.open) return;
    carousel.classList.remove('open');
    carousel.classList.add('closing');
    carousel.onanimationend = function() {
        carousel.classList.remove('closing');
        carousel.classList.add('closed');
        carousel.onanimationend = null;
        this.open=false;
    }
    //clearInterval(constmov)
    document.body.style.overflow = 'visible';
    closeFullScreen();
    document.removeEventListener('keydown', disableTab);
}


function carouselNext() {
    if(moving) return;

    moving = true;
    n = (n+1) % photos.length
    console.log(n);
    let leftPhoto = document.querySelector("#leftPhotoContainer");
    let centerPhoto = document.querySelector("#centerPhotoContainer");
    let rightPhoto = document.querySelector("#rightPhotoContainer");
    let hiddenPhoto = document.querySelector("#hiddenPhotoRight");

    centerPhoto.ontransitionend = function(){
        leftPhoto.classList.remove('nextPhoto');
        centerPhoto.classList.remove('nextPhoto');
        centerPhoto.style.removeProperty('scale');
        rightPhoto.classList.remove('nextPhoto');
        rightPhoto.style.removeProperty('scale');
        hiddenPhoto.classList.remove('nextPhoto');

        display(n);
        moving = false;
    }

    let sizeRatio = parseInt(getComputedStyle(centerPhoto).getPropertyValue('height'))/parseInt(getComputedStyle(leftPhoto).getPropertyValue('height'));
    centerPhoto.style.scale = 1/sizeRatio;
    rightPhoto.style.scale = sizeRatio;
    leftPhoto.classList.add('nextPhoto');
    centerPhoto.classList.add('nextPhoto');
    rightPhoto.classList.add('nextPhoto');
    hiddenPhoto.classList.add('nextPhoto');

    let photoInfo = document.getElementById('photoinfo');
    photoInfo.classList.add('changingContent');
    photoInfo.ontransitionend = function(){
        namecontainer.textContent = names[n];
        scicontainer.textContent = sciNames[n];
        this.classList.remove('changingContent');
    }

}

function carouselPrevious() {
    if(moving) return;
    moving = true;

    n = (n-1+photos.length) % photos.length
    console.log(n);
    let leftPhoto = document.querySelector("#leftPhotoContainer");
    let centerPhoto = document.querySelector("#centerPhotoContainer");
    let rightPhoto = document.querySelector("#rightPhotoContainer");
    let hiddenPhoto = document.querySelector("#hiddenPhotoLeft");

    centerPhoto.ontransitionend = function(){
        leftPhoto.classList.remove('previousPhoto');
        leftPhoto.style.removeProperty('scale');
        centerPhoto.classList.remove('previousPhoto');
        centerPhoto.style.removeProperty('scale');
        rightPhoto.classList.remove('previousPhoto');

        hiddenPhoto.classList.remove('previousPhoto');

        display(n);
        moving = false;
    }

    let sizeRatio = parseInt(getComputedStyle(centerPhoto).getPropertyValue('height'))/parseInt(getComputedStyle(leftPhoto).getPropertyValue('height'));
    leftPhoto.style.scale = sizeRatio;
    centerPhoto.style.scale = 1/sizeRatio;
    leftPhoto.classList.add('previousPhoto');
    centerPhoto.classList.add('previousPhoto');
    rightPhoto.classList.add('previousPhoto');
    hiddenPhoto.classList.add('previousPhoto');

    let photoInfo = document.getElementById('photoinfo');
    photoInfo.classList.add('changingContent');
    photoInfo.ontransitionend = function(){
        namecontainer.textContent = names[n];
        scicontainer.textContent = sciNames[n];
        this.classList.remove('changingContent');
    }
}

function display(n) {

    let hiddenPhotoLeftContainer = document.querySelector("#hiddenPhotoLeft .imgBorder");
    let leftPhotoContainer = document.querySelector("#leftPhotoContainer .imgBorder");
    let centerPhotoContainer = document.querySelector("#centerPhotoContainer .imgBorder");
    let rightPhotoContainer = document.querySelector("#rightPhotoContainer .imgBorder");
    let hiddenPhotoRightContainer = document.querySelector("#hiddenPhotoRight .imgBorder");

    let hiddenPhotoLeft = photos[(n-2+photos.length)%photos.length].createLinkedCopy();
    let leftPhoto = photos[(n-1+photos.length)%photos.length].createLinkedCopy();
    let centerPhoto = photos[n].createLinkedCopy();
    let rightPhoto = photos[(n+1)%photos.length].createLinkedCopy();
    let hiddenPhotoRight = photos[(n+2)%photos.length].createLinkedCopy();

    hiddenPhotoLeftContainer.innerHTML = '';
    hiddenPhotoLeftContainer.appendChild(hiddenPhotoLeft);
    if(!hiddenPhotoLeft.loaded) hiddenPhotoLeft.setNewImgOnLoad(hiddenPhotoLeft.src.replaceAll('-blur',''));
    hiddenPhotoLeftContainer.classList.add(hiddenPhotoLeft.linked.parentElement.parentElement.classList.contains('v') ? 'v' : 'h');

    leftPhotoContainer.innerHTML = '';
    leftPhotoContainer.appendChild(leftPhoto);
    if(!leftPhoto.loaded) leftPhoto.setNewImgOnLoad(leftPhoto.src.replaceAll('-blur',''));
    leftPhotoContainer.classList.add(leftPhoto.linked.parentElement.parentElement.classList.contains('v') ? 'v' : 'h');

    centerPhotoContainer.innerHTML = '';
    centerPhotoContainer.appendChild(centerPhoto);
    if(!centerPhoto.loaded) centerPhoto.setNewImgOnLoad(centerPhoto.src.replaceAll('-blur',''));
    centerPhotoContainer.classList.add(centerPhoto.linked.parentElement.parentElement.classList.contains('v') ? 'v' : 'h');

    rightPhotoContainer.innerHTML = '';
    rightPhotoContainer.appendChild(rightPhoto);
    if(!rightPhoto.loaded) rightPhoto.setNewImgOnLoad(rightPhoto.src.replaceAll('-blur',''));
    rightPhotoContainer.classList.add(rightPhoto.linked.parentElement.parentElement.classList.contains('v') ? 'v' : 'h');

    hiddenPhotoRightContainer.innerHTML = '';
    hiddenPhotoRightContainer.appendChild(hiddenPhotoRight);
    if(!hiddenPhotoRight.loaded) hiddenPhotoRight.setNewImgOnLoad(hiddenPhotoRight.src.replaceAll('-blur',''));
    hiddenPhotoRightContainer.classList.add(hiddenPhotoRight.linked.parentElement.parentElement.classList.contains('v') ? 'v' : 'h');

    namecontainer.textContent = names[n];
    scicontainer.textContent = sciNames[n];

}

function disableTab(event) {
    if(event.keyCode === 9) event.preventDefault();
}

function disableTabIndex() {
    document.querySelectorAll(':not(#carousel) [tabindex=""]').forEach(el => {el.tabIndex = -1;});
}

export {carousel, forceOpen, carouselIsOpen, openCarousel, closeCarousel, carouselNext, carouselPrevious}