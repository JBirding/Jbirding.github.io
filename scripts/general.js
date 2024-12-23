import './script-header.js';

let url = new URL(location);
let parameters = url.searchParams;

document.getElementById('year').textContent = ((new Date).getFullYear()>2024?'2024-'+(new Date).getFullYear():'2024');
document.getElementById('language').onchange = function () {updateLanguage(this.value)}
document.getElementById('theme').onclick = switchTheme;
document.getElementById('theme').onkeydown = triggerClickOnKey;

function updateURL (params) {
    let string = '?';

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

export {url, parameters, updateURL, triggerClickOnKey}
