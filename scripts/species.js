import {retryErrorFunction} from "./general.js";

const DB_ACCESS_URL = "https://g4bc8210ff017d8-jbirding.adb.eu-madrid-1.oraclecloudapps.com/ords/jbirding/bird_photos/";
const langIndex = (document.getElementById('language').value === 'EN') + 0;
let photosMap = {};
let speciesMap = {};
let speciesKeys = [];
await fetch(DB_ACCESS_URL+'data/'+(langIndex?'en':'es'))
    .then(response => response.json())
    .then(response => {console.log(response); return response.items;})
    .then(items => {
        items.forEach(item => {
            if(photosMap[item.name_sci]) photosMap[item.name_sci].push(item);
            else photosMap[item.name_sci] = [item];

            speciesMap[item.name_sci] = item.name_common;
        })
    }).catch(error =>
        document.querySelectorAll('.requiresJS').forEach(element => element.style.display = 'none')
    );

for (const key in photosMap) {
    photosMap[key].sort((a,b)=>Math.sign(b.priority-a.priority))
}

document.querySelectorAll('img.awaiting-photo').forEach(img => {
    img.src = DB_ACCESS_URL + photosMap[img.dataset.species][0].filename;
    img.classList.remove('awaiting-photo');
})


for(const key in speciesMap) {
    speciesKeys.push(key);
}

speciesKeys.sort((a,b) => speciesMap[a]?.localeCompare(speciesMap[b]));
const all_species = document.getElementById('all-species');
speciesKeys.forEach(species => {
    let anchorElement = document.createElement('a');

    let sciName = photosMap[species][0].name_sci;
    let commonName = photosMap[species][0].name_common;
    let photoURL = DB_ACCESS_URL + photosMap[species][0].filename;

    anchorElement.href = `/gallery?search=${sciName.replaceAll(/\s/g,'+')}`;

    anchorElement.innerHTML = `
            <div class="species-name">
                <p>
                    ${commonName}<br>
                    <span class="sci-name">(${sciName})</span><br>
                    <span class="see-gallery-text">Ver en la galería</span>
                </p> 
            </div>
            <div class="image-container">
                <img alt="${commonName}" src="${photoURL}" loading="lazy">
            </div>`

    all_species.appendChild(anchorElement);
});

document.querySelectorAll('img').forEach(img => img.onerror = retryErrorFunction);
