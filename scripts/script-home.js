import {imgLoadError} from '/scripts/general.js';
const DB_ACCESS_URL = "https://g4bc8210ff017d8-jbirding.adb.eu-madrid-1.oraclecloudapps.com/ords/jbirding/bird_photos/";
const langIndex = (document.getElementById('language').value === 'EN') + 0;


let loadedData = false;
const data = await fetch(DB_ACCESS_URL+'data/'+(langIndex?'en':'es'))
    .then(response => response.json())
    .then(json =>json.items)
    .then((a) => {
        loadedData = true;

        a.sort((a,b)=>Math.random() - 0.5);
        let galleryImg = document.getElementById('galleryImg');

        let imgContainer = galleryImg.parentElement.parentElement;
        imgContainer.classList.toggle('v',a[0].is_vertical);
        imgContainer.classList.toggle('h',!a[0].is_vertical);
        imgContainer.classList.toggle('special',a[0].highlight)

        galleryImg.src = DB_ACCESS_URL+'blur/'+a[0].filename;
        galleryImg.setNewImgOnLoad(DB_ACCESS_URL+a[0].filename);
        galleryImg.classList.add('blurry')
        galleryImg.onerror = imgLoadError;
        galleryImg.classList.add('blurry');

        return a;
    })

let photoIndex = 0;


let galleryImg = document.getElementById('galleryImg');
let nextImageLoader = document.createElement('img');
galleryImg.onload = function(){
    console.log('gallery image has been loaded')
    console.log('timeout :'+setTimeout(function(){
            nextImageLoader.setNewImgOnLoad(DB_ACCESS_URL+data[photoIndex = (++photoIndex + data.length) % data.length].filename);
        },2000))
}

let galleryLinkImgContainerHandler = function(){
    galleryImg.src = nextImageLoader.src;

    this.classList.toggle('v',data[photoIndex].is_vertical);
    this.classList.toggle('h',!data[photoIndex].is_vertical);
    this.classList.toggle('special',data[photoIndex].highlight)

    this.ontransitionend = null;
    this.classList.remove('changingImage');
}

nextImageLoader.onload = function(){
    galleryImg.parentElement.parentElement.ontransitionend = galleryLinkImgContainerHandler;
    galleryImg.parentElement.parentElement.classList.add('changingImage');
}
galleryImg.onerror = imgLoadError;



console.log(data)




