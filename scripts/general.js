let imgPrototype = HTMLImageElement.prototype;



let dummyImageLoadFunc = async function() {
    if(this.wait) await this.wait;

    //console.log(`dummyImg for ${this.src} has been loaded`);
    //setTimeout(function(){

    this.originalImg.ontransitionend = function() {this.classList.remove('loadTransition');this.ontransitionend = null;}

    this.originalImg.classList.add('loadTransition');
    this.originalImg.src = this.src;
    this.originalImg.classList.remove('blurry')
    this.originalImg.classList.remove('unloaded');
    this.originalImg.loaded = true;
    this.originalImg.linked?.classList.add('loadTransition');
    this.originalImg.linked?.setAttribute('src',this.src);
    this.originalImg.linked?.classList.remove('blurry')
    this.originalImg.linked?.setAttribute('loaded',true);
    this.originalImg.linked?.fullImageLoader?.remove();
    this.originalImg.linked?.classList?.remove('unloaded');
    delete this.originalImg.linked?.fullImageLoader;


    //}.bind(dummyImg),500);

    this.remove();
    delete this.originalImg.fullImageLoader;
}

let retryErrorFunction = function() {
    this.loadAttempts = (this.loadAttempts ?? 0) + 1;
    if(this.loadAttempts >= 5) {
        this.remove();
        return;
    }
    console.log('Failed to load '+this.src+'. Attempting to load again in '+(2**this.loadAttempts)+' seconds.')
    setTimeout((function(){
        this.src = this.src+'?'+this.loadAttempts;
    }).bind(this),1000*(2**this.loadAttempts))
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

    dummyImg.onerror = retryErrorFunction;

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
    this.classList.add('unloaded')
    this.classList.remove('blurry');
    //this.onerror = null;
    //this.onload = function() {this.classList.remove('unloaded')}
}



let url = new URL(location);
let parameters = url.searchParams;


document.getElementById('year').textContent = ((new Date).getFullYear()>2024?'2024-'+(new Date).getFullYear():'2024');
document.getElementById('language').value = location.host.includes("en") ? "EN" : "ES";
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

document.getElementById('language').value = 'ES'
function updateLanguage(lan) {
    console.log(lan)
    let newURL = new URL(location);
    if(lan === 'ES') newURL.host = "jbirding.com"
    else if (lan === 'EN') newURL.host = 'en.jbirding.com';
    newURL.port = '';
    console.log(newURL);
    location.assign(newURL);
    console.log(location);
}

function switchTheme() {
    if(document.body.classList.contains('light-theme')) {
        document.body.classList.replace('light-theme','dark-theme');
        localStorage.setItem('theme', 'dark-theme');
        document.getElementById('theme').setAttribute('title', 'Tema oscuro');
    }
    else {
        document.body.classList.replace('dark-theme','light-theme');
        localStorage.setItem('theme', 'light-theme');
        document.getElementById('theme').setAttribute('title', 'Tema claro');
    }
}

function normalizeString(str) {
    return str?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "");
}


document.getElementById('theme').setAttribute('title', document.body.classList.contains('light-theme') ? 'Tema claro' : 'Tema oscuro');
document.getElementById('theme').onclick = switchTheme;
document.getElementById('theme').onkeydown = triggerClickOnKey;


export function getFocusableElements(container = document.body ) {
    return {
        get all () {
            const elements = Array.from(
                container.querySelectorAll(
                    `a,
                            button,
                            input,
                            textarea,
                            select,
                            details,
                            iframe,
                            embed,
                            object,
                            summary,
                            dialog,
                            audio[controls],
                            video[controls],
                            [contenteditable],
                            [tabindex]
                          `,
                )
            )
            return elements.filter(el => {
                if (el.hasAttribute('disabled')) return false
                if (el.hasAttribute('hidden')) return false
                return window.getComputedStyle(el).display !== 'none';

            })
        },
        get keyboardOnly() {
            const elements = Array.from(
                container.querySelectorAll(
                    `a,
            button,
            input,
            textarea,
            select,
            details,
            iframe,
            embed,
            object,
            summary,
            dialog,
            audio[controls],
            video[controls],
            [contenteditable],
            [tabindex]
          `,
                )
            )
            return this.all.filter(el => el.tabIndex > -1)
        },
        get first() { return this.keyboardOnly[0] },
        get last() {let keyboardOnly = this.keyboardOnly; return keyboardOnly[keyboardOnly.length - 1];},
    }
}

const trapFocusFunction = function (event) {

    let isTab = event.code === 'Tab'
    let isShift = event.shiftKey;
    if(!isTab) return;

    if(this.focusTrapContainer.contains(event.target)) {
        const focusables = getFocusableElements(this.focusTrapContainer);
        const first = focusables.first;
        const last = focusables.last;

        if (document.activeElement === last && isTab && !isShift) {
            first.focus({'focusvisible': true});
            event.preventDefault();
        }
        if (document.activeElement === first && isTab && isShift) {
            last.focus({'focusvisible': true});
            event.preventDefault();
        }
    }
    else {
        getFocusableElements(this.focusTrapContainer).first.focus({'focusvisible': true});
        event.preventDefault();
    }
};

export function trapFocus(container = document.body) {
    document.focusTrapContainer = container;
    document.addEventListener('keydown', trapFocusFunction);
}

export function releaseFocus(container = document.body) {
    document.focusTrapContainer = null;
    document.removeEventListener('keydown', trapFocusFunction);
}

export {url, parameters, imgLoadError, retryErrorFunction, updateURL, triggerClickOnKey, switchTheme, normalizeString}
