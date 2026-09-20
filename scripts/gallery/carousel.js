import {closeFullScreen, toggleFullScreen} from '/scripts/script-gallery.js';
import {names, photos, sciNames, total_photos} from "/scripts/gallery/table.js";
import {releaseFocus, trapFocus} from "/scripts/general.js";

const global = {
    xDown: null,
    yDown: null,
    touchTimestamp: null,
    constMov: null,
    fastCarousel: null,


    movingInternal: false,
    cachedMovingPromise: null,
    cachedMovingPromiseResolution: null,


    get moving() {return this.movingInternal},
    set moving(moving) {
        this.movingInternal = moving;

        if(!moving && this.cachedMovingPromiseResolution) {
            this.cachedMovingPromiseResolution();
            this.cachedMovingPromise = null;
            this.cachedMovingPromiseResolution = null;
        }
    },

    get carouselStops() {
        if(!this.movingInternal) return new Promise(resolve => resolve());

        if(this.cachedMovingPromise) return this.cachedMovingPromise
        this.cachedMovingPromise = new Promise(resolve => {
            this.cachedMovingPromiseResolution = resolve;
        });

        return this.cachedMovingPromise;

    },


    currentPhotoZoomInternal: 1,
    cachedPhotoZoomedPromise: null,
    cachedPhotoZoomedResolution: null,


    get photoIsZoomed() {return this.currentPhotoZoomInternal > 1},
    set photoIsZoomed(x) {
        if(this.photoIsZoomed && x) return;
        if(!this.photoIsZoomed && !x) return;

        if(this.photoIsZoomed && !x) this.currentPhotoZoomInternal = 1;
        else if(!this.photoIsZoomed && x) this.currentPhotoZoomInternal = 1.5;

        this.photoIsZoomedInternal = x;

        if(!x && this.cachedPhotoZoomedResolution) {
            this.cachedPhotoZoomedResolution();
            this.cachedPhotoZoomedResolution = null;
            this.cachedPhotoZoomedPromise = null;
        }
    },


    get currentPhotoZoom() {return this.currentPhotoZoomInternal},
    set currentPhotoZoom(zoom) {
        this.currentPhotoZoomInternal = zoom;

        if(!this.photoIsZoomed && this.cachedPhotoZoomedResolution) {
            this.cachedPhotoZoomedResolution();
            this.cachedPhotoZoomedResolution = null;
            this.cachedPhotoZoomedPromise = null;
        }
    },


    get photoZoomsOut() {
        if(!this.photoIsZoomed) return new Promise(resolve => resolve());

        if(this.cachedPhotoZoomedPromise) return this.cachedPhotoZoomedPromise;

        this.cachedPhotoZoomedPromise = new Promise(resolve => {
            this.cachedPhotoZoomedResolution = resolve;
        });
        return this.cachedPhotoZoomedPromise;
    },



    pointerEventCache: [],
    previousPointerDifference: -1,
    basePointerDifference: 0,
    basePhotoZoom: 1
}

let n;





const carousel = document.getElementById('carousel');
const centerPhotoContainer = document.getElementById('centerPhotoContainer');
[
    centerPhotoContainer,
    document.getElementById('leftPhotoContainer'),
    document.getElementById('rightPhotoContainer'),
    document.getElementById('hiddenPhotoLeft'),
    document.getElementById('hiddenPhotoRight'),
].forEach(el => el.oncontextmenu = (e) => {e.preventDefault(); e.stopPropagation(); });
const fullscreen = document.getElementById('fullscreen')
const closefullscreen = document.getElementById('closefullscreen')

const namecontainer = document.getElementById('namecontainer');
const scicontainer = document.getElementById('scicontainer');

const paddleleft = document.getElementById('paddleleft');
const paddleright = document.getElementById('paddleright');
let photoInfo = document.getElementById('photoinfo');


function accelerateCarousel(){document.querySelector(':root').style.setProperty('--carousel-transition-duration', '0.25s');}
function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];

    if(document.elementFromPoint(firstTouch.clientX, firstTouch.clientY) === paddleright) paddleright.onpointerdown;
    else if(document.elementFromPoint(firstTouch.clientX, firstTouch.clientY) === paddleleft) paddleleft.onpointerdown;
    global.xDown = firstTouch.clientX;
    global.yDown = firstTouch.clientY;
    global.touchTimestamp = Date.now();
}
function handleTouchMove(evt) {
    if(document.elementFromPoint(global.xDown,global.yDown) === paddleleft || document.elementFromPoint(global.xDown,global.yDown) === paddleright) return;

    let w = window.innerWidth

    if ( ! global.xDown || ! global.yDown ) {
        return;
    }

    const xUp = evt.changedTouches[0].clientX;
    const yUp = evt.changedTouches[0].clientY;
    const timeElapsed = Date.now() - global.touchTimestamp;

    const xDiff = global.xDown - xUp;
    const yDiff = global.yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) && Math.abs( xDiff ) >= w*0.05 && Math.abs(1000*xDiff/w/timeElapsed)>0.8 && total_photos > 1 && evt.targetTouches.length === 1) {/*most significant*/
        if ( xDiff > 0 ) {
            carouselNext()
        } else {
            carouselPrevious()
        }

        global.xDown = null;
        global.yDown = null;
    }
}

carousel.addEventListener('touchstart', handleTouchStart, false); // make carousel swipable
carousel.addEventListener('touchmove', handleTouchMove, false);
carousel.addEventListener("wheel", (evt) => { //prevent scrolling on carousel
    evt.preventDefault();
});

document.addEventListener('keydown',async (event) => { // carousel key functionality
    if (!carouselIsOpen()) return;
    if (event.code === 'ArrowRight' && total_photos > 1) {// move right
        carouselNext();
        if(event.repeat) return;
        paddleright.classList.add('active');
        paddleright.focus();
        global.fastCarousel = setTimeout(accelerateCarousel,2000);
    }
    else if (event.code === 'ArrowLeft' && total_photos > 1) { // move left
        carouselPrevious();
        if(event.repeat) return;
        paddleleft.classList.add('active');
        paddleleft.focus();
        global.fastCarousel = setTimeout(accelerateCarousel,2000);
    }
    else if (event.code === 'Escape') { // exit
        await global.carouselStops;
        closeCarousel()
    }
})
document.addEventListener('keyup',async function(ev) {
    if (ev.code === 'KeyO' && !carouselIsOpen() && total_photos > 0) {
        forceOpen();
    }
    else if (ev.code === 'KeyF' && carouselIsOpen()) {
        await global.carouselStops;
        toggleFullScreen();
        if(document.fullscreenElement) fullscreen.focus();
        else closefullscreen.focus();
    }
    else if(ev.code === 'ArrowLeft' || ev.code === 'ArrowRight') {
        clearTimeout(global.fastCarousel);
        document.querySelector(':root').style.removeProperty('--carousel-transition-duration');
        if(ev.code === 'ArrowLeft') paddleleft.classList.remove('active');
        else paddleright.classList.remove('active');
    }
})

fullscreen.onclick = toggleFullScreen;
closefullscreen.onclick = toggleFullScreen;

document.onfullscreenchange = function(){
    let hasFullscreen = document.fullscreenElement;
    fullscreen.hidden = !!hasFullscreen;
    fullscreen.disabled = !!hasFullscreen;
    closefullscreen.hidden = !hasFullscreen;
    closefullscreen.disabled = !hasFullscreen;
    carousel.classList.toggle('fullscreen',!!hasFullscreen);

    if(hasFullscreen)

    console.log(!!hasFullscreen);
}


paddleleft.onclick = carouselPrevious;
paddleright.onclick = carouselNext;
paddleleft.oncontextmenu = paddleright.oncontextmenu = function(ev) { ev.preventDefault() };

paddleright.onpointerdown = function() {carouselNext(); global.constMov = setInterval(carouselNext,50); clearTimeout(global.fastCarousel); global.fastCarousel = setTimeout(accelerateCarousel,2000); };
paddleleft.onpointerdown = function() {carouselPrevious(); global.constMov = setInterval(carouselPrevious,50); clearTimeout(global.fastCarousel); global.fastCarousel = setTimeout(accelerateCarousel,2000); }
carousel.onpointerup = carousel.ontouchend = carousel.ontouchcancel = function() {clearInterval(global.constMov); clearTimeout(global.fastCarousel); document.querySelector(':root').style.removeProperty('--carousel-transition-duration')};

photoInfo.ontransitionend = function () {
    namecontainer.textContent = names[n];
    scicontainer.textContent = sciNames[n];
    this.classList.remove('changingContent');
}




document.getElementById('closecar').onclick = closeCarousel;


function forceOpen() {
    openCarousel(photos[0])
}

function carouselIsOpen() {
    return carousel.open && carousel.classList.contains('open');
}

function openCarousel(photo) {
    if(carousel.open) return;
    trapFocus(carousel);
    carousel.focus();

    //document.addEventListener('keydown',disableTab);

    carousel.onanimationend = function(){this.onanimationend=null;this.open=true;};

    if (total_photos === 1) {
        document.getElementById('carouselLeftSide').classList.add('hidden');
        document.getElementById('carouselRightSide').classList.add('hidden');
    } else {
        document.getElementById('carouselLeftSide').classList.remove('hidden');
        document.getElementById('carouselRightSide').classList.remove('hidden');
    }
    n = photo.index ?? this.index;
    console.log(n);
    display(n);


    carousel.classList.remove('closed');
    carousel.classList.add('open');
    carousel.open = true;
}

function closeCarousel() {
    if(!carousel.open) return;
    releaseFocus(carousel);
    carousel.addEventListener('animationend', function () {
        this.classList.remove('closing');
        this.classList.add('closed');
        this.open = false;
    },{once:true});
    carousel.classList.remove('open');
    carousel.classList.add('closing');


    closeFullScreen();
    //document.removeEventListener('keydown', disableTab);
}


async function carouselNext() {
    if(global.moving) return;
    global.moving = true;
    await zoomPhotoOut();

    n = (n + 1) % photos.length
    console.log(n);
    let leftPhoto = document.querySelector("#leftPhotoContainer");
    let centerPhoto = document.querySelector("#centerPhotoContainer");
    let rightPhoto = document.querySelector("#rightPhotoContainer");
    let hiddenPhoto = document.querySelector("#hiddenPhotoRight");

    centerPhoto.ontransitionend = function () {
        leftPhoto.classList.remove('nextPhoto');
        centerPhoto.classList.remove('nextPhoto');
        centerPhoto.style.removeProperty('scale');
        rightPhoto.classList.remove('nextPhoto');
        rightPhoto.style.removeProperty('scale');
        hiddenPhoto.classList.remove('nextPhoto');

        display(n);
        global.moving = false;
    }

    let sizeRatio = parseInt(getComputedStyle(centerPhoto).getPropertyValue('height')) / parseInt(getComputedStyle(leftPhoto).getPropertyValue('height'));
    centerPhoto.style.scale = 1 / sizeRatio;
    rightPhoto.style.scale = sizeRatio;
    leftPhoto.classList.add('nextPhoto');
    centerPhoto.classList.add('nextPhoto');
    rightPhoto.classList.add('nextPhoto');
    hiddenPhoto.classList.add('nextPhoto');



    if (!document.fullscreenElement) {
        photoInfo.classList.add('changingContent');
    }
    else {
        photoInfo.ontransitionend();
    }

}

async function carouselPrevious() {
    if(global.moving) return;
    global.moving = true;
    await zoomPhotoOut();

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
        global.moving = false;
    }

    let sizeRatio = parseInt(getComputedStyle(centerPhoto).getPropertyValue('height'))/parseInt(getComputedStyle(leftPhoto).getPropertyValue('height'));
    leftPhoto.style.scale = sizeRatio;
    centerPhoto.style.scale = 1/sizeRatio;
    leftPhoto.classList.add('previousPhoto');
    centerPhoto.classList.add('previousPhoto');
    rightPhoto.classList.add('previousPhoto');
    hiddenPhoto.classList.add('previousPhoto');

    if (!document.fullscreenElement) {
        photoInfo.classList.add('changingContent');
    }
    else {
        photoInfo.ontransitionend();
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
    if(!hiddenPhotoLeft.loaded) hiddenPhotoLeft.setNewImgOnLoad(hiddenPhotoLeft.src.replaceAll('/blur',''));
    hiddenPhotoLeftContainer.classList.remove('v');
    hiddenPhotoLeftContainer.classList.remove('h');
    hiddenPhotoLeftContainer.classList.add(hiddenPhotoLeft.linked?.parentElement.parentElement.classList.contains('v') ? 'v' : 'h');

    leftPhotoContainer.innerHTML = '';
    leftPhotoContainer.appendChild(leftPhoto);
    if(!leftPhoto.loaded) leftPhoto.setNewImgOnLoad(leftPhoto.src.replaceAll('/blur',''));
    leftPhotoContainer.classList.remove('v');
    leftPhotoContainer.classList.remove('h');
    leftPhotoContainer.classList.add(leftPhoto.linked?.parentElement.parentElement.classList.contains('v') ? 'v' : 'h');

    centerPhotoContainer.innerHTML = '';
    centerPhotoContainer.appendChild(centerPhoto);
    if(!centerPhoto.loaded) centerPhoto.setNewImgOnLoad(centerPhoto.src.replaceAll('/blur',''));
    centerPhotoContainer.classList.remove('v');
    centerPhotoContainer.classList.remove('h');
    centerPhotoContainer.classList.add(centerPhoto.linked.parentElement.parentElement.classList.contains('v') ? 'v' : 'h');

    rightPhotoContainer.innerHTML = '';
    rightPhotoContainer.appendChild(rightPhoto);
    if(!rightPhoto.loaded) rightPhoto.setNewImgOnLoad(rightPhoto.src.replaceAll('/blur',''));
    rightPhotoContainer.classList.remove('v');
    rightPhotoContainer.classList.remove('h');
    rightPhotoContainer.classList.add(rightPhoto.linked.parentElement.parentElement.classList.contains('v') ? 'v' : 'h');

    hiddenPhotoRightContainer.innerHTML = '';
    hiddenPhotoRightContainer.appendChild(hiddenPhotoRight);
    if(!hiddenPhotoRight.loaded) hiddenPhotoRight.setNewImgOnLoad(hiddenPhotoRight.src.replaceAll('/blur',''));
    hiddenPhotoRightContainer.classList.remove('v');
    hiddenPhotoRightContainer.classList.remove('h');
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



function onDoubleClick(event) {
    if(!document.fullscreenElement) return;

    console.log(event)
    let isZoomed = global.photoIsZoomed;
    let [mouseX, mouseY] = [event.x, event.y];
    if(!isZoomed) {
        let {x, y, width, height} = centerPhotoContainer.getBoundingClientRect();

        let originX = (mouseX-x)*100/width;
        let originY = (mouseY-y)*100/height;
        centerPhotoContainer.style.setProperty('--transform-origin',`${originX}% ${originY}%`);
        centerPhotoContainer.style.setProperty('--center-image-zoom',2);

        global.currentPhotoZoom = 2;
    } else zoomPhotoOut();
}

async function zoomPhotoOut() {
    if(global.photoIsZoomed) {
        centerPhotoContainer.ontransitionend = function () {
            global.photoIsZoomed = false;
            this.ontransitionend = null;
        };
        centerPhotoContainer.style.setProperty('--center-image-zoom',1);
        await global.photoZoomsOut;
    }
}

centerPhotoContainer.addEventListener('dblclick', onDoubleClick);




function handlePointerUp(event) {
    if(!document.fullscreenElement) return;
    const index = global.pointerEventCache.findIndex(cached => cached.pointerId === event.pointerId);
    if (index > -1) global.pointerEventCache.splice(index, 1);
}

function handlePointerDown(event) {
    if(!document.fullscreenElement) return;
    global.pointerEventCache.push(event);
    if(global.pointerEventCache.length === 2) {
        global.basePointerDifference = Math.hypot(
            global.pointerEventCache[0].clientX - global.pointerEventCache[1].clientX,
            global.pointerEventCache[0].clientY - global.pointerEventCache[1].clientY
        );

        global.basePhotoZoom = global.currentPhotoZoom;
    }
}

function handlePointerMove(event) {
    if(!document.fullscreenElement) return;
    const index = global.pointerEventCache.findIndex(cached => cached.pointerId === event.pointerId);
    global.pointerEventCache[index] = event;

    if(global.pointerEventCache.length === 2) {
        const currDiff = Math.hypot(
            global.pointerEventCache[0].clientX - global.pointerEventCache[1].clientX,
            global.pointerEventCache[0].clientY - global.pointerEventCache[1].clientY
        );

        const avg = {
            x: (global.pointerEventCache[0].clientX + global.pointerEventCache[1].clientX)/2,
            y: (global.pointerEventCache[0].clientY + global.pointerEventCache[1].clientY)/2,
        }


        let {x, y, width, height} = centerPhotoContainer.getBoundingClientRect();

        let originX = (avg.x-x)*100/width;
        let originY = (avg.y-y)*100/height;

        let newZoom = Math.max(1,Math.min(global.currentPhotoZoom + (currDiff - global.basePointerDifference)/50,2))
        console.log(currDiff,newZoom);
        if (currDiff > global.basePointerDifference && currDiff > 50 || currDiff < global.basePointerDifference) {
            centerPhotoContainer.style.setProperty('--transform-origin',`${originX}% ${originY}%`);
            centerPhotoContainer.style.setProperty('--center-image-zoom',newZoom);

            global.currentPhotoZoom = newZoom;
        }


        global.previousPointerDifference = currDiff;
    }
}



centerPhotoContainer.onpointerdown = handlePointerDown;
centerPhotoContainer.onpointermove = handlePointerMove;

centerPhotoContainer.onpointerup = handlePointerUp;
centerPhotoContainer.onpointercancel = handlePointerUp;
centerPhotoContainer.onpointerout = handlePointerUp;
centerPhotoContainer.onpointerleave = handlePointerUp;








export {carousel, forceOpen, carouselIsOpen, openCarousel, closeCarousel, carouselNext, carouselPrevious}