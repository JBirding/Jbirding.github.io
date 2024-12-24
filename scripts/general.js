import './script-header.js';

let imgPrototype = HTMLImageElement.prototype;

imgPrototype.setNewImgOnLoad = function(src,place = document.body) {
    let dummyImg = document.createElement('img');
    dummyImg.originalImg = this;
    this.fullImageLoader = dummyImg;
    dummyImg.style.display = 'none';
    dummyImg.loadAttempts = 0;
    place?.appendChild(dummyImg);
    dummyImg.loading = 'eager';

    dummyImg.onload = function() {
        console.log(`dummyImg for ${src} has been loaded`);
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

function imgLoadError() {
    this.src = 'logos/noload.png';
    this.classList.remove('blurry');
    this.onerror = null;
}

let url = new URL(location);
let parameters = url.searchParams;

document.getElementById('year').textContent = ((new Date).getFullYear()>2024?'2024-'+(new Date).getFullYear():'2024');
document.getElementById('language').onchange = function () {updateLanguage(this.value)}
document.getElementById('theme').onclick = switchTheme;
document.getElementById('theme').onkeydown = triggerClickOnKey;

function updateURL (params) {
    let string = '?';
    string += params.toString();
    url.search = string;

    history.pushState(event.data,'',url.toString())
}

function switchTheme() {
    if(document.body.classList.contains('light-theme')) {
        document.body.classList.replace('light-theme','dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    }
    else {
        document.body.classList.replace('dark-theme','light-theme');
        localStorage.setItem('theme', 'light-theme');
    }
}

function triggerClickOnKey(event) {
    if(event.keyCode === 13 || event.keyCode === 32) {
        event.preventDefault();
        this.click();
    }
}

function updateLanguage(lan) {
    if(lan === 'ES') location.replace(location.pathname.replaceAll('/en',''));
    else location.replace(location.pathname.replace('/','/en/'));
}

export {url, parameters, imgLoadError, updateURL, triggerClickOnKey}
