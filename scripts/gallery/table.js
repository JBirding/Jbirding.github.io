import {openCarousel} from "/scripts/gallery/carousel.js";
import {parameters, imgLoadError, updateURL, triggerClickOnKey} from '/scripts/general.js';

const DB_ACCESS_URL = "https://g4bc8210ff017d8-jbirding.adb.eu-madrid-1.oraclecloudapps.com/ords/jbirding/bird_photos/";
const langIndex = (document.getElementById('language').value === 'EN') + 0;
const errorMessageES = "Hubo un error cargando los datos. Por favor, recarga la página."
const errorMessageEN = "There was an error fetching photograph data! Please try again.";

/*let total_photos = await fetch(DB_ACCESS_URL+'count')
    .then(response => response.json())
    .then(json => json.count)*/

let minWaitTime = 500+(Math.random()**2)*2000;
//console.log("Waiting for at least "+(minWaitTime/1000)+" seconds before data is loaded");
let minWait = new Promise(resolve => setTimeout(resolve, minWaitTime));
let dataPromise = fetch(DB_ACCESS_URL+'data/'+(langIndex?'en':'es'))
    .then(response => response.json())
    .then(json => json.items)
    .catch(() => window.alert(langIndex ? errorMessageEN : errorMessageES));
let data;
let total_photos = 0;




let currentPage, filterData;
let option;

const photoLimit = 48;

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
const nameLanguages = ['name_es','name_en']

const searchFilter = function(elem) {
    let globalAcum = false;
    let query = search.value;

    query.split('/').forEach(function(r){
        let orTerm = r.trim()
        let andAcum = true;

        orTerm.split('&').forEach(function(s){
            let searchParam = s.trim();
            if(sciOptions.includes(searchParam)) {
                andAcum = andAcum && elem.name_sci === searchParam
            } else if (commonOptions.includes(searchParam)) {
                andAcum = andAcum && elem.name_common === searchParam
            } else if (saOptions[langIndex].includes(searchParam.toLowerCase())) {
                andAcum = andAcum && sa[elem.class][2-langIndex].toLowerCase().trim() === searchParam.toLowerCase()
            } else {
                andAcum = andAcum && (elem.name_sci.toLowerCase().includes(searchParam.toLowerCase())
                    || (sa[elem.class][langIndex]+elem.name_common+sa[elem.class][2+langIndex]).
                    toLowerCase().includes(searchParam.toLowerCase()))
            }
        })

        globalAcum = globalAcum || andAcum;
    })
    return globalAcum;
}


let main = document.getElementById("photoGallery");

let dataList = document.getElementById('birds');
let search = document.getElementById('search');
search.onchange = tableFiltered;
let sortSelect = document.getElementById('sort')
sortSelect.onchange = changeSort;
search.onkeydown = search.onkeyup = sortSelect.onkeydown = sortSelect.onkeyup = (ev)=>ev.stopPropagation();
let shuffle = document.getElementById('shuffle')
shuffle.onclick = resetGrid;
shuffle.onkeydown = triggerClickOnKey;
let closeSearch = document.getElementById('closesearch')
closeSearch.onclick = clearSearch;

let pageListTop = document.getElementById("pageListTop");
let pageListBottom = document.getElementById("pageListBottom");
let footer = document.querySelector('footer');
let nobird = document.getElementById('nobird');


let sortOptions = {
    'Random': ()=>Math.random()-0.5,
    'Species A-Z': (a,b)=>a.name_common.localeCompare(b.name_common)+Math.random()*0.1-0.05,
    'Species Z-A': (a,b)=>b.name_common.localeCompare(a.name_common)+Math.random()*0.1-0.05,
    'Scientific name A-Z': (a,b)=>a.name_sci.localeCompare(b.name_sci)+Math.random()*0.1-0.05,
    'Scientific name Z-A': (a,b)=>b.name_sci.localeCompare(a.name_sci)+Math.random()*0.1-0.05,
    'Latest': (a,b)=>Date.parse(b.date_shot)-Date.parse(a.date_shot),
    'Oldest': (a,b)=>Date.parse(a.date_shot)-Date.parse(b.date_shot),
    'Best': (a,b)=>Math.sign(b.priority-a.priority)+Math.random()*0.1-0.05,
    'Highlight': (a,b)=>(b.highlight - a.highlight)*2 + Math.sign(b.priority-a.priority),

    get default() {return this.Latest}
}

async function initializePhotos() {
    data = await dataPromise;
    await minWait;
    document.getElementById('loadcontainer').classList.add('closed');

    data.forEach(function (r) {
        sciOptions.push(r.name_sci);
        commonOptions.push(r.name_common);
    })

    if (search.value) {
        closeSearch.hidden = false;
    }

    sciOptions = unique(sciOptions).sort();
    commonOptions = unique(commonOptions).sort();

    commonOptions.forEach(function (r) {
        option = document.createElement('option');
        option.value = r;
        dataList.appendChild(option);
    })

    sciOptions.forEach(function (r) {
        option = document.createElement('option');
        option.value = r;
        dataList.appendChild(option);
    })


    tableFiltered()
}

function generateTable(data){
    let h = window.innerHeight
    let limit = Math.ceil((h-270)/330)*2
    photos.length = 0;
    names.length = 0;
    sciNames.length = 0;

    for (let i = photoLimit*(currentPage-1); i < photoLimit*currentPage && i<total_photos; i++) {

        console.log(data[i]);

        let mainContainer = document.createElement('div')
        let imgDataContainer = document.createElement('div');
        imgDataContainer.className = 'imgDataContainer'
        let imgContainer = document.createElement('div');
        imgContainer.className = 'imgContainer'
        let imgBorder = document.createElement('div');
        imgBorder.className = 'imgBorder'

        let photo = document.createElement('img')

        imgContainer.classList.toggle('v',data[i].is_vertical);
        imgContainer.classList.toggle('h',!data[i].is_vertical);
        photo.src = DB_ACCESS_URL+'blur/'+data[i].filename
        photo.setNewImgOnLoad(DB_ACCESS_URL+data[i].filename,mainContainer)
        photo.classList.add('blurry')
        photo.onerror = imgLoadError;
        imgBorder.tabIndex = 0;
        imgBorder.onclick = openCarousel.bind(photo);
        imgBorder.onkeydown = triggerClickOnKey;
        photos.push(photo);

        photo.loading = (i>limit && i+2<=total_photos) ? 'lazy' : 'eager'

        photo.index = i - photoLimit*(currentPage-1);
        let name = document.createElement('div')
        name.textContent = sa[data[i].class][langIndex]+data[i].name_common+sa[data[i].class][2+langIndex]

        name.classList.add('name');
        names.push(name.textContent);

        let sci = document.createElement('div')
        sci.textContent = data[i].name_sci
        sci.classList.add('sci');
        sciNames.push(sci.textContent);

        mainContainer.appendChild(imgDataContainer);
        imgDataContainer.appendChild(imgContainer);
        imgDataContainer.appendChild(name);
        imgDataContainer.appendChild(sci);
        imgContainer.appendChild(imgBorder);
        imgBorder.appendChild(photo);

        if(data[i].highlight) {
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

    //loader.hidden = true
    footer.classList.remove('hidden')
    nobird.hidden = total_photos !== 0;
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
    console.log(parameters.has('search'));
    if (parameters.has('search') || localStorage.getItem('search')) {
        console.log(search.value);
        search.value = parameters.get('search') ?? localStorage.getItem('search');
        closeSearch.hidden = false
    }
    if (parameters.has('sort') || localStorage.getItem('sort')) {
        console.log(parameters.get('sort') ?? localStorage.getItem('sort') === 'Random');
        if((parameters.get('sort') ?? localStorage.getItem('sort')) === 'Random') {
            shuffle.hidden = false
            sortSelect.style.paddingRight = '60px'
        }
        sortSelect.value = parameters.get('sort') ?? localStorage.getItem('sort')
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


function clearSearch() {
    search.value = ''
    tableFiltered()
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

    if (sortType) {
        parameters.set('sort',sortType)
    } else {
        parameters.delete('sort')
    }
    updateURL(parameters)
    localStorage.setItem('sort',sortType);

    resetGrid()
}

function tableFiltered() {
    let query = search.value

    main.innerHTML = ''

    filterData = data.filter(searchFilter)
    total_photos = filterData.length;

    if (query) {
        parameters.set('search',query)
        closeSearch.hidden = false
    } else {
        parameters.delete('search')
        closeSearch.hidden = true
    }
    updateURL(parameters)
    localStorage.setItem('search', query)

    updatePageList();

    resetGrid();
}


function updatePageList() {
    let totalPages = Math.ceil(total_photos / photoLimit);
    while (pageListTop.children.length > 2 && pageListBottom.children.length > 2) {
        pageListTop.children[1].remove();
        pageListBottom.children[1].remove();
    }
    let nextPaddleTop = pageListTop.children[1];
    let nextPaddleBottom = pageListBottom.children[1];

    if(totalPages <= 1) {
        pageListTop.classList.add('hidden');
        pageListBottom.classList.add('hidden');
    } else {
        pageListTop.classList.remove('hidden');
        pageListBottom.classList.remove('hidden');
    }

    for(let i = 1; i <= totalPages; i++) {
        let pageButton = document.createElement('button');
        pageButton.innerText = i.toString();
        pageButton.onclick = function(){
            if(currentPage===i) return;
            pageListTop.children[currentPage].classList.remove('current');
            pageListBottom.children[currentPage].classList.remove('current');
            currentPage=i;
            pageListTop.children[currentPage].classList.add('current');
            pageListBottom.children[currentPage].classList.add('current');
            main.innerHTML='';
            hidePaddles(currentPage);

            generateTable(filterData);
        };
        pageListTop.insertBefore(pageButton, nextPaddleTop);

        let pageButtonClone = pageButton.cloneNode(true);
        pageButtonClone.onclick = pageButton.onclick;
        pageListBottom.insertBefore(pageButtonClone, nextPaddleBottom);
    }

    currentPage = 1;
    if(totalPages>0) {
        pageListTop.children[1].classList.add('current');
        pageListBottom.children[1].classList.add('current');
    }
    hidePaddles(currentPage);
}


function nextPage() {
    if(currentPage >= Math.ceil(total_photos / photoLimit)) return;
    pageListTop.children[currentPage].classList.remove('current');
    pageListBottom.children[currentPage].classList.remove('current');
    currentPage++;
    pageListTop.children[currentPage].classList.add('current');
    pageListBottom.children[currentPage].classList.add('current');
    main.innerHTML='';
    hidePaddles(currentPage);

    generateTable(filterData);
}

function previousPage() {
    if(currentPage <= 1) return;
    pageListTop.children[currentPage].classList.remove('current');
    pageListBottom.children[currentPage].classList.add('current');
    currentPage--;
    pageListTop.children[currentPage].classList.add('current');
    pageListBottom.children[currentPage].classList.remove('current');
    main.innerHTML='';
    hidePaddles(currentPage);

    generateTable(filterData);
}

document.getElementById('nextPageTop').onclick = nextPage;
document.getElementById("nextPageBottom").onclick = nextPage;

document.getElementById('previousPageTop').onclick = previousPage;
document.getElementById('previousPageBottom').onclick = previousPage;

function hidePaddles(pageNumber) {
    let totalPages = Math.ceil(total_photos / photoLimit);
    let rightPaddleTop = pageListTop.children[pageListTop.children.length-1];
    let leftPaddleTop = pageListTop.children[0]

    let rightPaddleBottom = pageListBottom.children[pageListBottom.children.length-1];
    let leftPaddleBottom = pageListBottom.children[0];

    if(pageNumber >= totalPages) {
        rightPaddleTop.classList.add('hidden');
        rightPaddleBottom.classList.add('hidden');
    } else {
        rightPaddleTop.classList.remove('hidden');
        rightPaddleBottom.classList.remove('hidden');
    }

    if(pageNumber <= 1) {
        leftPaddleTop.classList.add('hidden');
        leftPaddleBottom.classList.add('hidden');
    } else {
        leftPaddleTop.classList.remove('hidden');
        leftPaddleBottom.classList.remove('hidden');
    }
}


export {photos, names, sciNames, total_photos, initializePhotos, urlFix}