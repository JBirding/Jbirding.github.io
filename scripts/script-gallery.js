// initialization 🔴
  // getting search queries
  let parameters = new URLSearchParams(location.search)
  let lang
  if (parameters.has('lang')) {
	  lang = parameters.get('lang')
  } else {
	  lang = 'ES'
  }
  let langIndex = (lang == 'EN') + 0
  

  // getting document elements
  let carousel
  let carouselinfo
  let photoinfo
  let namecontainer
  let scicontainer
  let paddleleft
  let paddleright
  let scilist
  let commonlist
  let search
  let sortselect
  let progbar
  let table
  
  let footer
  let nobird

  let closesearch
  let closesort
  let shuffle

  let fullscreen
  let closefullscreen
  
  function urlFix () {
		if (parameters.has('search')) {
		  search.value = parameters.get('search')
		}
		if (parameters.has('sort')) {
		  if(parameters.get('sort') == 'Random') {
			shuffle.hidden = false
		  }
		  sortselect.value = parameters.get('sort')
		  sortselect.style.color = '#b30000'
		  sortselect.style.fontWeight = 500
		  closesort.hidden = false
		} else {
		  sortselect.style.color = '#454545'
		  sortselect.style.fontWeight = 300
		}

	  document.getElementById('gallery').classList.add('active')
	  let links = document.querySelectorAll('li.nav')
	  links.forEach(function(r){
		if (r.dataset.tab != 'gallery') {
		  r.onclick = function(){
			window.top.postMessage(r.dataset.tab,'*')
		  }
		}
	  })
  }
  
  // getting elements in classes
  let photos = document.getElementsByClassName('photo')
  let names = document.getElementsByClassName('name')
  let scis = document.getElementsByClassName('sci')
  let carphoto = document.getElementsByClassName('carphoto')[0]

  // preparing things
  let data
  let scioptions = []
  let commonoptions = []
  let saoptions = [['macho','hembra','juvenil'],['male','female','juvenile']]

  const base = 'https://drive.google.com/uc?export=view&id='
  
  const sa = {
    A: ['','','',''],
    M: ['','Male ',' macho',''],
    F: ['','Female ',' hembra',''],
    J: ['','Juvenile ',' juvenil',''],
  }

  const running = {}

  // declaring variables
  let star, row, cell, photo, name, sci, tbl, l, photocell, space, space2, space3, n, newPhoto, prevPhoto, antPhoto, nextPhoto, postPhoto, option, xDown, yDown, filterData, w, h, photowidth, photoheight, barprog, moving
  
  let width = 0

  //store function
        function store(dat) {
          dat.forEach(function(r){
            scioptions.push(r[2])
            commonoptions.push(r[7+langIndex])
          })

          filterData = filterSomething(data,search.value)

          if (search.value) {
            closesearch.hidden = false
          }

          scioptions = unique(scioptions).sort()
          commonoptions = unique(commonoptions).sort()

          scioptions.forEach(function(r){
            option = document.createElement('option')
            option.value = r
            scilist.appendChild(option)
          })

          commonoptions.forEach(function(r){
            option = document.createElement('option')
            option.value = r
            commonlist.appendChild(option)
          })

          generateTable(filterData)
          document.getElementById('loadcontainer').hidden = true
        }
		
	function updateURL (params) {
		let par = new URLSearchParams(params)
		let string = '?'
			string += par.toString()
			if (par.has('lang') && par.get('lang') != lang) {	
				location = string.replace(/(\&|\?)$/,'')
			} else {
				history.pushState(event.data,'',string.replace(/(\&|\?)$/,''))
			}
	}

  // initialization 🔴


  // animations 🟩

  function fadeIn(element,time) {

    let rand = Math.random()
    running[rand] = true

    let opacity

    if(element.style.opacity === '') {
      opacity = 0
      element.style.opacity = 0
    } else {
      opacity = element.style.opacity * 100
    }

    let initial = 100-opacity

    element.hidden = false
    element.style.pointerEvents = 'auto'
    let int = setInterval(function(){

      if (opacity > 100) {
        element.style.opacity = 1
        clearInterval(int)
        delete running[rand]
      } else {
        element.style.opacity = opacity/100
        opacity += initial/time
      }
      

    },1)
  }

  function fadeOut(element,time) {

    let rand = Math.random()
    running[rand] = true
    
    let opacity

    if(element.style.opacity === '') {
      opacity = 100
      element.style.opacity = 1
    } else {
      opacity = element.style.opacity * 100
    }
    
    let initial = opacity

    element.style.pointerEvents = 'none'
    
    let int = setInterval(function(){

      if (opacity <= 0) {
        element.style.opacity = 0
        element.hidden = true
        if (element == carousel) {
          element.style.display = 'none'
        }
        clearInterval(int)
        delete running[rand]
      } else {
        element.style.opacity = opacity/100
        opacity -= initial/time
      }

    },1)

    
    
  }

  function mutate(el1, el2, time, align) {

    let rand = Math.random()
    running[rand] = true

    w = window.innerWidth
    h = window.innerHeight

    let i = 1

    let el1params = el1.getBoundingClientRect()
    let el2params = el2.getBoundingClientRect()

    let x = el1params.x
    let y = el1params.y
    let h1 = el1params.height
    if(el1.style.opacity === '') {
      el1.style.opacity = 1
    }
    let op = Number(el1.style.opacity)

    

    let xdif = x - el2params.x
    let ydif =  y - el2params.y
    let hdif = h1 - el2params.height
    if(el2.style.opacity === '') {
      el2.style.opacity = 1
    }
    let opdif = op - el2.style.opacity

    let w2 = el1params.width * el2params.height / h1

    if(align == 'center') {
      xdif += (w2 - el2params.width)/2
    } else if (align == 'right') {
      xdif += w2 - el2params.width
    }

    el1.style.position = 'absolute'
    el1.style.top = y+'px'
    el1.style.left = x+'px'
    el1.style.right = ''
    el1.style.height = h1+'px'
    el1.style.width = 'auto'

    let int = setInterval(function(){
      if(i > time) {
        clearInterval(int)
        delete running[rand]

      } else {
        x -= xdif/time
        y -= ydif/time
        h1 -= hdif/time
        op -= opdif/time

        el1.style.left = x+'px'
        el1.style.top = y+'px'
        el1.style.height = h1+'px'
        el1.style.opacity = op

        i++
      }
    },1)

  }

  function changeNames(n,time) {

    let rand = Math.random()
    running[rand] = true

    let halftime = Math.floor(time/2)

    let params = photoinfo.getBoundingClientRect()
    let left = params.x
    carousel.appendChild(photoinfo)
    photoinfo.style.position = 'absolute'
    photoinfo.style.top = params.y+'px'

    let w1 = params.width

    let opacity = 1

    let i = 1

    let int = setInterval(function(){
      if(i < halftime) {
        photoinfo.style.opacity = opacity
        opacity -= 2/time
      } else if(i == halftime) {
        photoinfo.style.opacity = 0
        opacity = 0
        namecontainer.textContent = names[n].textContent
        scicontainer.textContent = scis[n].textContent
      } else if(i <= time) {
        photoinfo.style.opacity = opacity
        opacity += 2/time
      } else {
        photoinfo.style.opacity = 1
        clearInterval(int)
        delete running[rand]
      }

      i++
    },1)
}

  // adding event listeners 🟡
  
  window.addEventListener("message",(event) => {
	  data = event.data
	  store(data)
  })

  document.addEventListener("DOMContentLoaded",function(){ // loading the photos into the page
    window.focus()
	
	carousel = document.getElementById('carousel')
	carouselinfo = document.getElementById('carouselinfo')
	photoinfo = document.getElementById('photoinfo')
	namecontainer = document.getElementById('namecontainer')
	scicontainer = document.getElementById('scicontainer')
	paddleleft = document.getElementById('paddleleft')
	paddleright = document.getElementById('paddleright')
	scilist = document.getElementById('scinames')
	commonlist = document.getElementById('commonnames')
	search = document.getElementById('search')
	sortselect = document.getElementById('sort')
	progbar = document.getElementById('progress')
	table = document.getElementById("table")
	
	footer = document.getElementById('footer')
	nobird = document.getElementById('nobird')
	
	progbar.hidden = false
    progress()

	closesearch = document.getElementById('closesearch')
	closesort = document.getElementById('closesort')
	shuffle = document.getElementById('shuffle')

	fullscreen = document.getElementById('fullscreen')
	closefullscreen = document.getElementById('closefullscreen')
	
	urlFix()
	
	  carousel.addEventListener('touchstart', handleTouchStart, false); // make carousel swipable   
	  carousel.addEventListener('touchend', handleTouchMove, false);

	  carousel.addEventListener("wheel", (evt) => { //prevent scrolling on carousel
		evt.preventDefault();
	  });

	  search.onkeydown = function() {
		if (carousel.style.display == 'flex') {return false}
	  }

	  sortselect.onkeydown = search.onkeydown
  })
  
  

  document.addEventListener('keydown',(event) => { // carousel key functionality
    let isCar = !carousel.hidden
    if (isCar && event.code == 'ArrowRight' && l > 1) { // move right
      carouselNext()
    } else if (isCar && event.code == 'ArrowLeft' && l > 1) { // move left
      carouselPrevious()
    } else if (isCar && event.code == 'Escape') { // exit
      closeCarousel()
    }
  })

  document.addEventListener('keyup',function(e) {
    let ev = window.event || e
    if (ev.code == 'KeyO' && (carousel.hidden || carousel.style.display != 'flex') && document.activeElement != search && document.activeElement != sortselect && l > 0) {
      openCarousel(photos[0])
    } else if (ev.code == 'KeyF' && carousel.style.display == 'flex') {
      toggleFullScreen()
    }
  })

  document.onfullscreenchange = function(){
    if(document.fullscreenElement) {
      fullscreen.hidden = true
      closefullscreen.hidden = false
    } else {
      fullscreen.hidden = false
      closefullscreen.hidden = true
    }
  }

  function fullScreen() {
    let docel = document.documentElement
	console.log(screen.orientation)
    try {
      if (docel.requestFullscreen) {
        docel.requestFullscreen()
		screen.orientation.lock('landscape')
      }
      else if (docelem.mozRequestFullScreen) {
          docel.mozRequestFullScreen();
		  screen.orientation.lock('landscape')
      }
      else if (docelem.webkitRequestFullScreen) {
          docel.webkitRequestFullScreen();
		  screen.orientation.lock('landscape')
      }
      else if (docelem.msRequestFullscreen) {
		  docel.msRequestFullscreen();
		  screen.orientation.lock('landscape')
      }
    }

    catch{}
      
  }

  function closeFullScreen() {
    if(document.fullscreenElement) {
      document.exitFullscreen()
    }
  }
  
  function toggleFullScreen() {
    if(document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      fullScreen()
    }
  }

  window.addEventListener('resize',handleRotate) // fix size for scaling

  screen.orientation.addEventListener('change',handleRotate) // fix size for rotations (same thing)

  // adding event listeners 🟡



  // carousel functions 🟢

  function forceOpen() {
    openCarousel(photos[0])
  }

  function openCarousel(photo) {
    document.body.style.overflow = 'hidden'
    carousel.style.display = 'flex'
    try {
      carousel.removeChild(antPhoto)
      carousel.removeChild(nextPhoto)
      carousel.removeChild(prevPhoto)
      carousel.removeChild(postPhoto)
    }
    catch {}
    carouselinfo.innerHTML = ''
    fadeIn(carousel,50)
    if (l == 1) {
      paddleleft.hidden = true
      paddleright.hidden = true
    } else {
      paddleleft.hidden = false
      paddleright.hidden = false
    }
    try {n = photo.currentTarget.index}
    catch {n = photo.index}
    display(n)
  }

  function carouselNext() {
    if(!isRunning() && !moving) {
      moving = true
      n = (n+1) % photos.length

      changeNames(n,50)
      mutate(postPhoto,nextPhoto,50,'')
      mutate(nextPhoto,newPhoto,50,'center')
      mutate(newPhoto,prevPhoto,50,'right')
      fadeOut(prevPhoto,50)

      let int = setInterval(function(){
        if(!isRunning()) {
          clearInterval(int)
          display(n)
          moving = false
        }
      },10)
    }
  }

  function carouselPrevious() {
    if(!isRunning() && !moving) {
      moving = true
      n = (photos.length+n-1) % photos.length

      changeNames(n,50)
      mutate(antPhoto,prevPhoto,50,'right')
      mutate(prevPhoto,newPhoto,50,'center')
      mutate(newPhoto,nextPhoto,50,'')
      fadeOut(nextPhoto,50)

      let int = setInterval(function(){
        if(!isRunning()) {
          clearInterval(int)
          display(n)
          moving = false
        }
      },10)
    }
  }

  function closeCarousel() {
    document.body.style.overflow = 'visible'
    closeFullScreen()
    fadeOut(carousel,50)
  }

  function display(n) {

    try {
      carousel.removeChild(antPhoto)
      carousel.removeChild(prevPhoto)
      carouselinfo.removeChild(newPhoto)
      carousel.removeChild(nextPhoto)
      carousel.removeChild(postPhoto)
    } catch{}

    w = window.innerWidth
    h = window.innerHeight

    paddleright.style.top = ''
    paddleleft.style.top = ''
    paddleleft.style.display = 'flex'
    paddleright.style.display = 'flex'
    paddleleft.style.width = ''
    paddleright.style.width = ''
    paddleleft.style.height = ''
    paddleright.style.height = ''
    paddleleft.style.left = ''
    paddleleft.style.right = ''
    paddleright.style.right = ''
    paddleright.style.left = ''
    paddleleft.style.fontSize = ''
    paddleright.style.fontSize = ''
    photoinfo.position = 'auto'
    photoinfo.style.top = ''
    photoinfo.style.left = ''

    antPhoto = photos[(photos.length+n-2)%photos.length].cloneNode(true)
    antPhoto.className = 'sidephotos'
    antPhoto.style.opacity = 0
    prevPhoto = photos[(photos.length+n-1)%photos.length].cloneNode(true)
    prevPhoto.style.opacity = 0.6
    prevPhoto.className = 'sidephotos'
    prevPhoto.style.zIndex = 2
    newPhoto = photos[n].cloneNode(true)
    nextPhoto = photos[(n+1)%photos.length].cloneNode(true)
    nextPhoto.style.opacity = 0.6
    nextPhoto.className = 'sidephotos'
    nextPhoto.style.zIndex = 2
    postPhoto = photos[(n+2)%photos.length].cloneNode(true)
    postPhoto.className = 'sidephotos'
    postPhoto.style.opacity = 0

    carousel.appendChild(antPhoto)
    carousel.appendChild(prevPhoto)
    carouselinfo.appendChild(newPhoto)
    carousel.appendChild(nextPhoto)
    carousel.appendChild(postPhoto)


    namecontainer.textContent = names[n].textContent
    scicontainer.textContent = scis[n].textContent
    carouselinfo.appendChild(photoinfo)
    
    newPhoto.classList.add('carphoto')
    newPhoto.classList.remove('photo')

    photowidth = h*0.8*0.85*4/3
    photoheight = h*0.8*0.85

    photoinfo.style.position = 'relative'

    if (h*0.85*4/3 <= w) {
      carouselinfo.style.height = '85%'
      carouselinfo.style.width = 'auto'
      newPhoto.style.height = '80%'
      newPhoto.style.width = 'auto'

      newPhoto.style.position = 'relative'
      newPhoto.style.top = '5%'
      
      photoinfo.style.top = '5%'
    } else {
      carouselinfo.style.width = '90%'
      carouselinfo.style.height = 90*3/4+'vw'
      newPhoto.style.width = 'auto'
      newPhoto.style.height = 0.9*75+'vw'

      prevPhoto.style.right = '100%'
      prevPhoto.style.height = '30vw'
      nextPhoto.style.left = '100%'
      nextPhoto.style.height = '30vw'

      paddleleft.style.left = '7.5%'
      paddleleft.style.width = '10vw'
      paddleright.style.right = '7.5%'
      paddleright.style.width = '10vw'
      paddleleft.style.height = '10vw'
      paddleright.style.height = '10vw'
      paddleleft.style.fontSize = '6vw'
      paddleright.style.fontSize = '6vw'
    }

    

    if (photowidth <= (44-2/3)*w/100) {
      prevPhoto.style.right = 55+photowidth*50/w+'%'

      nextPhoto.style.left = 55+photowidth*50/w+'%'

      paddleright.style.left = 70.5+1/3+photowidth*50/w+'%'
      paddleleft.style.right = 70.5+1/3+photowidth*50/w+'%'

    } else if (photowidth <= (27-1/3)*w/50) {
      prevPhoto.style.right = 55+photowidth*50/w+'%'

      nextPhoto.style.left = 55+photowidth*50/w+'%'

      paddleright.style.left = 59+1/6+photowidth*50/w+'%'
      paddleleft.style.right = 59+1/6+photowidth*50/w+'%'

      paddleright.style.top = 55+5*w/h+'%'
      paddleleft.style.top = 55+5*w/h+'%'

    } else if (photowidth <= 0.8*w) {
      paddleright.style.left = 52.5+photowidth*50/w+'%'
      paddleleft.style.right = 52.5+photowidth*50/w+'%'

      prevPhoto.style.right = '100%'
      nextPhoto.style.left = '100%'
    }

    antPhoto.style.right = prevPhoto.style.right
    postPhoto.style.left = nextPhoto.style.left

    if(l <= 1) {
      antPhoto.hidden = true
      prevPhoto.hidden = true
      nextPhoto.hidden = true
      postPhoto.hidden = true
      paddleleft.style.display = 'none'
      paddleright.style.display = 'none'

    } else if(paddleleft.hidden) {
      antPhoto.hidden = false
      prevPhoto.hidden = false
      nextPhoto.hidden = false
      postPhoto.hidden = false
    }

  }

  function handleRotate() {
    if (carousel.style.display == 'flex') {
      display(n)
    }
  }

  // carousel functions 🟢



  // swiping carousel 🔵

  function getTouches(evt) {
    return evt.touches ||             // browser API
          evt.originalEvent.touches; // jQuery
  }                                                     
                                                                         
  function handleTouchStart(evt) {
      const firstTouch = getTouches(evt)[0];                                      
      xDown = firstTouch.clientX;                                      
      yDown = firstTouch.clientY;                                      
  };                                                
                                                                         
  function handleTouchMove(evt) {
    w = window.innerWidth

      if ( ! xDown || ! yDown ) {
          return;
      }

      var xUp = evt.changedTouches[0].clientX;                                    
      var yUp = evt.changedTouches[0].clientY;

      var xDiff = xDown - xUp;
      var yDiff = yDown - yUp;
                                                                          
      if ( Math.abs( xDiff ) > Math.abs( yDiff ) && Math.abs( xDiff ) >= w*0.05 && !carousel.hidden && l > 1 && evt.targetTouches.length < 1) {/*most significant*/
          if ( xDiff > 0 ) {
              carouselNext()
          } else {
              carouselPrevious()
          }                       
      }
      /* reset values */
      xDown = null;
      yDown = null;                                             
  };

  // swiping carousel 🔵



  // table generation 🟣

  function genTable() {
    table.innerHTML = ''
    generateTable(filterData)
  }

  function generateTable(a){
    let sorttype = sortselect.value
    sort(sorttype,a)
    l = a.length
    h = window.innerHeight
    let limit = Math.ceil((h-270)/330)*2
    
    for (let i = 0; i < a.length; i = i + 2) {

      row = document.createElement('tr')
      row2 = document.createElement('tr')
      row3 = document.createElement('tr')

      cell = document.createElement('td')
      cell.classList.add('imgcell')
      star = document.createElement('div')
      star.textContent = '★'
      star.classList.add('star')
      if(a[i][5]) {
        cell.classList.add('special')
        cell.appendChild(star)
      }
      photo = document.createElement('img')
      photo.src = base+a[i][1]
      photo.classList.add('photo')
      if(i>limit) {
        photo.loading = 'lazy'
      }
      photo.index = i
      name = document.createElement('td')
      name.textContent = sa[a[i][3]][langIndex]+a[i][7+langIndex]+sa[a[i][3]][2+langIndex]
      
      name.classList.add('name')
      sci = document.createElement('td')
      sci.textContent = a[i][2]
      sci.classList.add('sci')

      cell.appendChild(photo)
      
      row.appendChild(cell)
      row2.appendChild(name)
      row3.appendChild(sci)

      if (l > 1) {
        space = document.createElement('td')
        space.classList.add('sp')
        space2 = document.createElement('td')
        space2.classList.add('sp')
        space3 = document.createElement('td')
        space3.classList.add('sp')

        row.appendChild(space)
        row2.appendChild(space2)
        row3.appendChild(space3)
      }

      if (i+2 <= l) {

      cell = document.createElement('td')
      cell.classList.add('imgcell')
      star = document.createElement('div')
      star.textContent = '★'
      star.classList.add('star')
      if(a[i+1][5]) {
        cell.classList.add('special')
        cell.appendChild(star)
      }
      photo = document.createElement('img')
      photo.src = base+a[i+1][1]
      photo.classList.add('photo')
      photo.index = i+1
      if(i>limit) {
        photo.loading = 'lazy'
      }
      name = document.createElement('td')
      name.textContent = sa[a[i+1][3]][langIndex]+a[i+1][7+langIndex]+sa[a[i+1][3]][2+langIndex]
      name.classList.add('name')
      sci = document.createElement('td')
      sci.textContent = a[i+1][2]
      sci.classList.add('sci')

      cell.appendChild(photo)
      
      row.appendChild(cell)
      row2.appendChild(name)
      row3.appendChild(sci)
      }


      
      table.appendChild(row)
      table.appendChild(row2)
      table.appendChild(row3)
    }

    progbar.hidden = true
	footer.classList.remove('hidden')
	if (l == 0) {
		nobird.hidden = false
	} else {nobird.hidden = true}
    for (let i=0; i<photos.length; i++) {
      photos[i].addEventListener('click',openCarousel)
    }
  }

  // table generation 🟣


  // other utility I'm not gonna touch in ages 🟠

  function clearSearch() {
    search.value = ''
    tableFiltered()
  }

  function clearSort() {
    sortselect.value = 'choose'

    sortselect.style.color = '#454545'
    sortselect.style.fontWeight = 300
    closesort.hidden = true
    shuffle.hidden = true

    changeSort()
  }

  function filterSomething(a,query) {
    let searchparam, acum
    f = function(elem) {
      acum = false

      query.split('/').forEach(function(r){
        searchparam = r.trim()

        if(scioptions.includes(searchparam)) {
          acum = acum || elem[2] == searchparam
        } else if (commonoptions.includes(searchparam)) {
          acum = acum || elem[7+langIndex] == searchparam
        } else if (saoptions[langIndex].includes(searchparam.toLowerCase())) {
          acum = acum || sa[elem[3]][2-langIndex].toLowerCase().trim() == searchparam.toLowerCase()
        } else {
          acum = acum || elem[2].toLowerCase().includes(searchparam.toLowerCase())
            || (sa[elem[3]][langIndex]+elem[7+langIndex]+sa[elem[3]][2+langIndex]).
            toLowerCase().includes(searchparam.toLowerCase()) 
        }
        
      })

      return acum
    }

    a.forEach(f)

    return a.filter(f)
  }

  function changeSort() {
    let sorttype = sortselect.value


    if(sorttype != 'choose') {
      sortselect.style.color = '#b30000'
      sortselect.style.fontWeight = 500
      closesort.hidden = false
      if (sorttype == 'Random') {
        shuffle.hidden = false
      } else {
        shuffle.hidden = true
      }
    }

    let now = new Date();
    let state = {
      'timestamp': now.getTime()
    };
    if (sorttype && sorttype != 'choose') {
      parameters.append('sort',sorttype)
    } else {
      parameters.delete('sort')
    }
    updateURL(parameters)

    genTable()

  }

  function tableFiltered() {
    let query = search.value

    table.innerHTML = ''
    
    filterData = filterSomething(data,query)

    let now = new Date();
    let state = {
      'timestamp': now.getTime()
    };
    if (query) {
      parameters.append('search',query)
      closesearch.hidden = false
    } else {
      parameters.delete('search')
      closesearch.hidden = true
    }
    updateURL(parameters)

    generateTable(filterData)
  }

  function is_valid_datalist_value(idDataList, inputValue) {
    var option = document.querySelector("#" + idDataList + " option[value ='" + inputValue + "']");
    if (option != null) {
      return option.value.length > 0;
    }
    return false;
  }

  function progress() {

    let int = setInterval(advance,10)
    function advance() {
      if (width >= 100) {
        clearInterval(advance)
      } else {
        width++
        progbar.style.width = width+'%'
        progbar.innerHTML = width+'%'
      }
    }
    
  }

  function sort(type,data) {
    let a = data
    if (type=='Random') {
      a.sort(sortrand)
    } else if (type == 'Species A-Z') {
      a.sort(sortspeciesaz)
    } else if(type == 'Species Z-A') {
      a.sort(sortspeciesza)
    } else if (type == 'Scientific name A-Z') {
      a.sort(sortsciaz)
    } else if(type == 'Scientific name Z-A') {
      a.sort(sortsciza)
    } else if(type == 'Latest') {
      a.sort(sortlatest)
    } else if(type == 'Oldest') {
      a.sort(sortoldest)
    } else {
      a.sort(sortdefault)
    }
  }

  function sortrand() {
    return Math.random()-0.5
  }

  function sortspeciesaz(a,b) {
    return a[7+langIndex].localeCompare(b[7+langIndex])+Math.random()*0.1-0.05
  }

  function sortspeciesza(a,b) {
    return b[7+langIndex].localeCompare(a[7+langIndex])+Math.random()*0.1-0.05
  }

  function sortsciaz(a,b) {
    return a[2].localeCompare(b[2])+Math.random()*0.1-0.05
  }

  function sortsciza(a,b) {
    return b[2].localeCompare(a[2])+Math.random()*0.1-0.05
  }

  function sortlatest(a,b) {
    return b[11]-a[11]
  }

  function sortoldest(a,b) {
    return a[11]-b[11]
  }

  function sortdefault(a,b) {
    return (b[5]-a[5])*2+Math.sign(b[6]-a[6])+Math.random()*0.1-0.05
  }

  function unique (arr) {
    var hash = {}, result = [];
    for (var i = 0; i < arr.length; i++)
        if (!(arr[i] in hash)) { //it works with objects! in FF, at least
            hash[arr[i]] = true;
            result.push(arr[i]);
        }
    return result;
  }

  function isRunning() {
    let x = false
    for (const key in running) {
      x = x || running[key]
    }
    return x
  }

  // other utility I'm not gonna touch in ages 🟠