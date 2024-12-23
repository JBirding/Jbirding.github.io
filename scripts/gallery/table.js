import data from "/data.json" with {type: 'json'};
import {openCarousel} from "./carousel.js";
import {parameters, updateURL, triggerClickOnKey} from '../general.js';
console.log(data);

let langIndex;
let currentPage, filterData;
let l, option;

let photoLimit = 48;

const photos = [];
const names = [];
const sciNames = [];
let sciOptions = []
let commonOptions = []
const saOptions = [['macho','hembra','juvenil'],['male','female','juvenile']]
const sa = {
    A: ['','','',''],
    M: ['','Male ',' macho',''],
    F: ['','Female ',' hembra',''],
    J: ['','Juvenile ',' juvenil',''],
}

let main = document.getElementById("photoGallery");

let sciList = document.getElementById('scinames');
let commonList = document.getElementById('commonnames');
let search = document.getElementById('search')
search.onchange = tableFiltered;
let sortSelect = document.getElementById('sort')
sortSelect.onchange = changeSort;
search.onkeydown = search.onkeyup = sortSelect.onkeydown = sortSelect.onkeyup = (ev)=>ev.stopPropagation();
let shuffle = document.getElementById('shuffle')
shuffle.onclick = resetGrid;
shuffle.onkeydown = triggerClickOnKey;
let closeSearch = document.getElementById('closesearch')
closeSearch.onclick = clearSearch;

let pageList = document.getElementById("pageList");
let footer = document.querySelector('footer');
let nobird = document.getElementById('nobird');
let progbar = document.getElementById('progress')
progbar.hidden = false

let sortOptions = {
    'Random': ()=>Math.random()-0.5,
    'Species A-Z': (a,b)=>a[5+langIndex].localeCompare(b[5+langIndex])+Math.random()*0.1-0.05,
    'Species Z-A': (a,b)=>b[5+langIndex].localeCompare(a[5+langIndex])+Math.random()*0.1-0.05,
    'Scientific name A-Z': (a,b)=>a[1].localeCompare(b[1])+Math.random()*0.1-0.05,
    'Scientific name Z-A': (a,b)=>b[1].localeCompare(a[1])+Math.random()*0.1-0.05,
    'Latest': (a,b)=>b.slice(-1)-a.slice(-1),
    'Oldest': (a,b)=>a.slice(-1)-b.slice(-1),
    'default': (a,b)=>(b[3]-a[3])*2+Math.sign(b[4]-a[4])+Math.random()*0.1-0.05,
}

function initializePhotos() {
    data.forEach(function (r) {
        sciOptions.push(r[1]);
        commonOptions.push(r[5 + langIndex]);
    })

    filterData = filterSomething(data, search.value);

    if (search.value) {
        closeSearch.hidden = false;
    }

    sciOptions = unique(sciOptions).sort();
    commonOptions = unique(commonOptions).sort();

    sciOptions.forEach(function (r) {
        option = document.createElement('option');
        option.value = r;
        sciList.appendChild(option);
    })

    commonOptions.forEach(function (r) {
        option = document.createElement('option');
        option.value = r;
        commonList.appendChild(option);
    })

    updatePageList();
    filterData.sort(sortOptions[sortSelect.value] ?? sortOptions.default);
    generateTable(filterData);
    document.getElementById('loadcontainer').hidden = true;
}


function unique (arr) {
    const hash = {}, result = [];
    for (let i = 0; i < arr.length; i++)
        if (!(arr[i] in hash)) { //it works with objects! in FF, at least
            hash[arr[i]] = true;
            result.push(arr[i]);
        }
    return result;
}

function urlFix () {
    let lang;
    if (parameters.has('lang')) {
        lang = parameters.get('lang');
    } else {
        lang = 'ES'
    }
    langIndex = (lang === 'EN') + 0;

    console.log(parameters.has('search'));
    if (parameters.has('search')) {
        console.log(search.value);
        search.value = parameters.get('search')
        closeSearch.hidden = false
    }
    if (parameters.has('sort')) {
        if(parameters.get('sort') === 'Random') {
            shuffle.hidden = false
            sortSelect.style.paddingRight = '60px'
        }
        sortSelect.value = parameters.get('sort')
    }
}



function resetGrid() {
    main.innerHTML = '';
    let sortType = sortSelect.value;
    let sortFunction = sortOptions[sortType]??sortOptions.default;
    filterData.sort(sortFunction);
    currentPage = 1;
    updatePageList();
    generateTable(filterData);
}

function generateTable(a){
    l = a.length
    let h = window.innerHeight
    let limit = Math.ceil((h-270)/330)*2
    photos.length = 0;
    names.length = 0;
    sciNames.length = 0;

    for (let i = photoLimit*(currentPage-1); i < photoLimit*currentPage && i<l; i++) {

        let mainContainer = document.createElement('div')
        let imgDataContainer = document.createElement('div');
        imgDataContainer.className = 'imgDataContainer'
        let imgContainer = document.createElement('div');
        imgContainer.className = 'imgContainer'
        let imgBorder = document.createElement('div');
        imgBorder.className = 'imgBorder'

        let photo = document.createElement('img')
        photo.onload = function() {
            this.setNewImgOnLoad('images/'+a[i][0]+'.JPG',mainContainer)
            let elementToChange = this.parentElement.parentElement
            elementToChange.classList.remove('v');
            elementToChange.classList.remove('h');
            elementToChange.classList.add(this.naturalHeight > this.naturalWidth ? 'v' : 'h');
            this.onload = '';
        };
        photo.src = 'images-blur/'+a[i][0]+'-blur.JPG'
        photo.classList.add('blurry')
        photo.onerror = imgLoadError;
        imgBorder.tabIndex = 0;
        imgBorder.onclick = openCarousel.bind(photo);
        imgBorder.onkeydown = triggerClickOnKey;
        photos.push(photo);

        photo.loading = (i>limit && i+2<=l) ? 'lazy' : 'eager'

        photo.index = i - photoLimit*(currentPage-1);
        let name = document.createElement('div')
        name.textContent = sa[a[i][2]][langIndex]+a[i][5+langIndex]+sa[a[i][2]][2+langIndex]

        name.classList.add('name');
        names.push(name.textContent);

        let sci = document.createElement('div')
        sci.textContent = a[i][1]
        sci.classList.add('sci');
        sciNames.push(sci.textContent);

        mainContainer.appendChild(imgDataContainer);
        imgDataContainer.appendChild(imgContainer);
        imgDataContainer.appendChild(name);
        imgDataContainer.appendChild(sci);
        imgContainer.appendChild(imgBorder);
        imgBorder.appendChild(photo);

        if(a[i][3]) {
            let star = document.createElement('div')
            let specialBg = document.createElement('div');
            star.textContent = '\u2605'
            star.classList.add('star')
            specialBg.classList.add('specialBg')
            imgContainer.classList.add('special')
            imgContainer.appendChild(specialBg);
            imgContainer.appendChild(star)
        }

        main.appendChild(mainContainer);
    }

    progbar.hidden = true
    footer.classList.remove('hidden')
    nobird.hidden = l !== 0;
    if(l<=48) pageList.classList.add('hidden');
    else pageList.classList.remove('hidden');
}



function clearSearch() {
    search.value = ''
    tableFiltered()
}

function filterSomething(a,query) {
    let f = function(elem) {
        let globalAcum = false

        query.split('/').forEach(function(r){
            let orTerm = r.trim()
            let andAcum = true;

            orTerm.split('&').forEach(function(s){
                let searchParam = s.trim();
                if(sciOptions.includes(searchParam)) {
                    andAcum = andAcum && elem[1] === searchParam
                } else if (commonOptions.includes(searchParam)) {
                    andAcum = andAcum && elem[5+langIndex] === searchParam
                } else if (saOptions[langIndex].includes(searchParam.toLowerCase())) {
                    andAcum = andAcum && sa[elem[2]][2-langIndex].toLowerCase().trim() === searchParam.toLowerCase()
                } else {
                    andAcum = andAcum && (elem[1].toLowerCase().includes(searchParam.toLowerCase())
                        || (sa[elem[2]][langIndex]+elem[5+langIndex]+sa[elem[2]][2+langIndex]).
                        toLowerCase().includes(searchParam.toLowerCase()))
                }
            })

            globalAcum = globalAcum || andAcum;
        })
        return globalAcum;
    }

    return a.filter(f)
}

function changeSort() {
    let sortType = sortSelect.value


    if (sortType === 'Random') {
        shuffle.hidden = false
        sortSelect.style.paddingRight = '60px'
    } else {
        shuffle.hidden = true
        sortSelect.removeAttribute('style')
    }

    let now = new Date();
    if (sortType) {
        parameters.set('sort',sortType)
    } else {
        parameters.delete('sort')
    }
    updateURL(parameters)

    resetGrid()
}

function tableFiltered() {
    let query = search.value

    main.innerHTML = ''

    filterData = filterSomething(data,query)

    let now = new Date();
    if (query) {
        parameters.set('search',query)
        closeSearch.hidden = false
    } else {
        parameters.delete('search')
        closeSearch.hidden = true
    }
    updateURL(parameters)

    updatePageList();

    resetGrid();
}


function updatePageList() {
    let totalPages = Math.ceil(filterData.length / photoLimit);
    while (pageList.children.length > 2) {
        pageList.children[1].remove();
    }
    let nextPaddle = pageList.children[1];

    for(let i = 1; i <= totalPages; i++) {
        let pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.onclick = function(){
            if(currentPage===i) return;
            pageList.children[currentPage].classList.remove('current');
            currentPage=i;
            this.classList.add('current');
            main.innerHTML='';
            hidePaddles(currentPage);

            generateTable(filterData);
        };
        pageList.insertBefore(pageButton, nextPaddle);
    }

    currentPage = 1;
    if(totalPages>0) pageList.children[1].classList.add('current');
    hidePaddles(currentPage);
}

document.getElementById('nextPage').onclick = function nextPage() {
    if(currentPage >= Math.ceil(filterData.length / photoLimit)) return;
    pageList.children[currentPage].classList.remove('current');
    currentPage++;
    pageList.children[currentPage].classList.add('current');
    main.innerHTML='';
    hidePaddles(currentPage);

    generateTable(filterData);
}

document.getElementById('previousPage').onclick = function previousPage() {
    if(currentPage <= 1) return;
    pageList.children[currentPage].classList.remove('current');
    currentPage--;
    pageList.children[currentPage].classList.add('current');
    main.innerHTML='';
    hidePaddles(currentPage);

    generateTable(filterData);
}

function hidePaddles(pageNumber) {
    let totalPages = Math.ceil(filterData.length / photoLimit);
    let rightPaddle = pageList.children[pageList.children.length-1];
    let leftPaddle = pageList.children[0]

    if(pageNumber >= totalPages) {
        rightPaddle.classList.add('hidden');
    } else {
        rightPaddle.classList.remove('hidden');
    }

    if(pageNumber <= 1) {
        leftPaddle.classList.add('hidden');
    } else {
        leftPaddle.classList.remove('hidden');
    }
}

function imgLoadError() {
    this.src = 'logos/noload.png';
    this.classList.remove('blurry');
    this.onerror = null;
}


export {photos, names, sciNames, l, initializePhotos, urlFix}