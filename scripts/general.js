let imgPrototype = HTMLImageElement.prototype;



let dummyImageLoadFunc = async function() {
    if(this.wait) await this.wait;

    //console.log(`dummyImg for ${this.src} has been loaded`);
    //setTimeout(function(){
    this.originalImg.classList.add('loadTransition');
    this.originalImg.src = this.src;
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

let dummyImageErrorFunc = function() {
    this.loadAttempts++;
    if(this.loadAttempts >= 5) {
        this.remove();
        return;
    }
    setTimeout(function(){
        console.log('Failed to load '+this.src+'. Attempting to load again')
        this.src = this.src+'?'+this.loadAttempts;
    },1000*(2**this.loadAttempts))
}

imgPrototype.setNewImgOnLoad = function(src,place = document.body) {
    let dummyImg = document.createElement('img');
    dummyImg.originalImg = this;
    this.fullImageLoader = dummyImg;
    dummyImg.style.display = 'none';
    dummyImg.loadAttempts = 0;
    place?.appendChild(dummyImg);
    dummyImg.loading = 'eager';

    let randomTime = 200 + ((Math.random())**2)*1500
    //console.log(`[${src}] will wait for at least ${randomTime/1000} seconds...`);
    dummyImg.wait = new Promise(resolve => setTimeout(resolve, randomTime));
    dummyImg.onload = dummyImageLoadFunc;

    dummyImg.onerror = dummyImageErrorFunc;

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
    this.src = '/logos/noload.png';
    this.classList.remove('blurry');
    this.onerror = null;
}

let url = new URL(location);
let parameters = url.searchParams;

document.getElementById('year').textContent = ((new Date).getFullYear()>2024?'2024-'+(new Date).getFullYear():'2024');
document.getElementById('language').onchange = function () {updateLanguage(this.value)}

function updateURL (params) {
    let string = '?';
    string += params.toString();
    url.search = string;

    history.replaceState(null,'',url.toString())
}

function triggerClickOnKey(event) {
    if(event.keyCode === 13 || event.keyCode === 32) {
        event.preventDefault();
        this.click();
    }
}

function updateLanguage(lan) {
    if(lan === 'ES') location.host = "en.jbirding.com"
    else if (lan === 'EN') location.host = 'jbirding.com';
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

document.getElementById('theme').onclick = switchTheme;
document.getElementById('theme').onkeydown = triggerClickOnKey;

export {url, parameters, imgLoadError, updateURL, triggerClickOnKey, switchTheme}
