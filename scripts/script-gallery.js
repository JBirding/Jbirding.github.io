// initialization 🔴
let imgPrototype = document.createElement('img').__proto__

imgPrototype.setNewImgOnLoad = function(src,place = null) {
  let ogImg = this;
  let dummyImg = document.createElement('img');
  dummyImg.style.width = '0px';
  dummyImg.loadAttempts = 0;
  place?.appendChild(dummyImg);
  dummyImg.loading = place ? 'lazy': '';

  dummyImg.onload = function() {
    setTimeout(function(){ogImg.src = dummyImg.src;ogImg.classList.remove('blurry')},1000);
    dummyImg.remove();
    
  }

  dummyImg.onerror = function() {
    this.loadAttempts++;
    if(this.loadAttempts >= 5) {dummyImg.remove(); return}
    setTimeout(function(){
      dummyImg.src = src+'?'+dummyImg.loadAttempts;
    },1000*(2**this.loadAttempts))
  }

  dummyImg.src = src;
  
}

let sortOptions = {
  'Random': ()=>Math.random()-0.5,
  'Species A-Z': (a,b)=>a[5+langIndex].localeCompare(b[5+langIndex])+Math.random()*0.1-0.05,
  'Species Z-A': (a,b)=>b[5+langIndex].localeCompare(a[5+langIndex])+Math.random()*0.1-0.05,
  'Scientific name A-Z': (a,b)=>a[1].localeCompare(b[1])+Math.random()*0.1-0.05,
  'Scientific name Z-A': (a,b)=>b[1].localeCompare(a[1])+Math.random()*0.1-0.05,
  'Latest': (a,b)=>b.slice(-1)-a.slice(-1),
  'Oldest': (a,b)=>a.slice(-1)-b.slice(-1),
}

let photoLimit = 48;






  // getting search queries
  let url = new URL(location)
  let parameters = url.searchParams
  let lang
  if (parameters.has('lang')) {
	  lang = parameters.get('lang')
  } else {
	  lang = 'ES'
  }
  let langIndex = (lang == 'EN') + 0
  

  // getting document elements
  let carousel
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
  let main
  let currentPage;
  let pageList;
  
  let footer
  let nobird

  let closesearch
  let closesort
  let shuffle

  let fullscreen
  let closefullscreen
  
  let constmov
  
  function urlFix () {
		if (parameters.has('search')) {
		  search.value = parameters.get('search')
      closesearch.hidden = false
		}
		if (parameters.has('sort')) {
		  if(parameters.get('sort') == 'Random') {
        shuffle.hidden = false
        sortselect.style.paddingRight = '60px'
		  }
		  sortselect.value = parameters.get('sort')
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
  let scioptions = []
  let commonoptions = []
  let saoptions = [['macho','hembra','juvenil'],['male','female','juvenile']]

  const base = 'https://www.googleapis.com/drive/v3/files/'
  const driveKey = '?alt=media&key=AIzaSyDM8Zj-e-dzD8otHJ0m9zydIv5E-uCed-8'
  
  const sa = {
    A: ['','','',''],
    M: ['','Male ',' macho',''],
    F: ['','Female ',' hembra',''],
    J: ['','Juvenile ',' juvenil',''],
  }

  const running = {}

  // declaring variables
  let tbl, l, photocell, n, newPhoto, prevPhoto, antPhoto, nextPhoto, postPhoto, option, xDown, yDown, filterData, w, h, photowidth, photoheight, barprog, moving
  
  let width = 0

  //store function
        function store(d) {
			    data = d
          d.forEach(function(r){
            scioptions.push(r[1])
            commonoptions.push(r[5+langIndex])
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

          updatePageList();
          filterData.sort(sortOptions[sortselect.value]??function(a,b){return(b[3]-a[3])*2+Math.sign(b[4]-a[4])+Math.random()*0.1-0.05});
          generateTable(filterData)
          document.getElementById('loadcontainer').hidden = true
        }
		
	function updateURL (params) {
		let string = '?'
			string += params.toString()
			url.search = string
			if (params.has('lang') && params.get('lang') != lang) {	
				location = url.toString()
			} else {
				history.pushState(event.data,'',url.toString())
			}
	}

  // initialization 🔴


  // animations 🟩

  function fadeIn(element,time,pointer='auto',op = 1) {

    let rand = Math.random()
    running[rand] = true

    let opacity

    if(element.style.opacity === '') {
      opacity = 0
      element.style.opacity = 0
    } else {
      opacity = element.style.opacity * 100
    }

    let initial = 100*op-opacity

    element.hidden = false
    element.style.pointerEvents = pointer
    let int = setInterval(function(){

      if (opacity > 100*op) {
        element.style.opacity = op
        clearInterval(int)
        delete running[rand]
      } else {
        element.style.opacity = opacity/100
        opacity += initial/time
      }
      

    },1)
  }

  function fadeOut(element,time,pointer='none') {

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

    element.style.pointerEvents = pointer
    
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

  document.addEventListener("DOMContentLoaded",function(){ // loading the photos into the page
    window.focus()
	
	carousel = document.getElementById('carousel')
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
	main = document.getElementById("main")
    pageList = document.getElementById("pageList")
	
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

  store(data)
	
	paddleright.onpointerdown = function() {this.clicked = true; constmov = setInterval(carouselNext,50)}
  paddleright.ontouchstart = paddleright.onpointerdown
	paddleleft.onpointerdown = function() {this.clicked = true; constmov = setInterval(carouselPrevious,50)}
  paddleright.ontouchstart = paddleleft.onpointerdown
	
	paddleright.onpointerup = function() {this.clicked = false; clearInterval(constmov)}
  paddleright.onmouseout = function() {clearInterval(constmov)}
  paddleright.ontouchend = paddleright.onpointerup
	paddleleft.onpointerup = paddleright.onpointerup
  paddleleft.onpointerup = paddleright.onpointerup
  paddleleft.ontouchend = paddleright.onpointerup

  paddleright.onmouseover = function(){if(this.clicked){this.onpointerdown()}}
  paddleleft.onmouseover = paddleright.onmouseover
	
	paddleleft.oncontextmenu = function(ev) { ev.preventDefault() }
	paddleright.oncontextmenu = paddleleft.oncontextmenu
	
	  carousel.addEventListener('touchstart', handleTouchStart, false); // make carousel swipable   
	  carousel.addEventListener('touchend', handleTouchMove, false);
    carousel.addEventListener('transitionend',function(e){
      if(e.propertyName != 'opacity') return
      this.hidden = this.style.opacity == 0
    })

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
    carousel.hidden = false
    carousel.offsetHeight
    carousel.style.opacity = 1
    carousel.style.pointerEvents = 'all'
    if (l == 1) {
      paddleleft.hidden = true
      paddleright.hidden = true
    } else {
      paddleleft.hidden = false
      paddleright.hidden = false
    }
    console.log(photo.currentTarget?.index)
    n = photo.currentTarget?.index ?? photo.index
    display(n)
  }

  function closeCarousel() {
    clearInterval(constmov)
    document.body.style.overflow = 'visible'
    closeFullScreen()
    carousel.style.opacity = 0
    carousel.style.pointerEvents = 'none'
  }

  function doATest(el1, el2, align = 'l') {
    el1.style.position = 'absolute'
    let el2params = el2.getBoundingClientRect(), el1params = el1.getBoundingClientRect();
    
    el1.style.position = 'absolute'
    el1.style.top = el1params.y+'px'
    
    
    setTimeout(function(){if(align == 'r') {
      /*el1.style.right = (window.innerWidth - el1params.right)+'px'
      el1.style.top = el1params.y+'px'*/
      el1.style.transition = 'all 5s linear'
      el1.style.right = (window.innerWidth - el2params.right)+'px'
      el1.style.top = el2params.y+'px'
    } else if (align == 'l') {
      console.log(el1.style.top)
      
      
      el1.style.transitionProperty = 'all'
      el1.style.transitionDuration = '0.5s'
      el1.style.transitionTimingFunction = 'ease-out'
      el1.style.left = el2params.x+'px'
      el1.style.top = el2params.y+'px'
    }

    el1.style.opacity = el2.style.opacity
    el1.style.height = el2params.height+'px'},100)
  }
  

  function carouselNext() {
    if(!isRunning() && !moving) {
      moving = true
      n = (n+1) % photos.length

      changeNames(n,50)
      //fadeIn(postPhoto,50,undefined,0.6)
      postPhoto.style.opacity = 0.6
	    postPhoto.loading = 'eager'
      doATest(nextPhoto,newPhoto)
      //doATest(newPhoto,prevPhoto)
      /*mutate(nextPhoto,newPhoto,50,'center')
      mutate(newPhoto,prevPhoto,50,'right')
      fadeOut(prevPhoto,50)*/
      prevPhoto.style.opacity = '0'
	    prevPhoto.loading = 'lazy'

      setTimeout(function(){
        display(n)
        moving = false
      }, 1000)

      /*let int = setInterval(function(){
        if(!isRunning()) {
          clearInterval(int)
          display(n)
          moving = false
        }
      },10)*/
    }
  }

  function carouselPrevious() {
    if(!isRunning() && !moving) {
      moving = true
      n = (photos.length+n-1) % photos.length

      changeNames(n,50)
      //fadeIn(postPhoto,50,undefined,0.6)
      antPhoto.style.opacity = 0.6
	    antPhoto.loading = 'eager'
      doATest(prevPhoto,newPhoto)
      doATest(newPhoto,nextPhoto)
      /*mutate(nextPhoto,newPhoto,50,'center')
      mutate(newPhoto,prevPhoto,50,'right')
      fadeOut(prevPhoto,50)*/
      nextPhoto.style.opacity = '0'
	    nextPhoto.loading = 'lazy'

      setTimeout(function(){
        display(n)
        moving = false
      }, 500)
    }
  }

  function display(n) {

    if(newPhoto != undefined) {
      antPhoto.remove()
      prevPhoto.remove()
      newPhoto.remove()
      nextPhoto.remove()
      postPhoto.remove()
    }

    w = window.innerWidth
    h = window.innerHeight
	
	  photoinfo.style = ''

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

    antPhoto = photos[(photos.length+n-2)%photos.length].cloneNode(true)
    antPhoto.setNewImgOnLoad(antPhoto.src.replace(/\-blur/g,""))
    antPhoto.classList.add('sidephotos')
    antPhoto.style.opacity = 0
    prevPhoto = photos[(photos.length+n-1)%photos.length].cloneNode(true)
    prevPhoto.setNewImgOnLoad(prevPhoto.src.replaceAll(/\-blur/g,""))
    prevPhoto.style.opacity = 0.6
    prevPhoto.classList.add('sidephotos')
    prevPhoto.style.zIndex = 2
	  prevPhoto.loading = 'eager'
    newPhoto = photos[n].cloneNode(true)
    newPhoto.setNewImgOnLoad(newPhoto.src.replace(/\-blur/g,""))
    newPhoto.classList.add(photos[n].parentElement.classList.contains('v') ? 'v' : 'h')
	  newPhoto.style.zIndex = 3
	  newPhoto.loading = 'eager'
    nextPhoto = photos[(n+1)%photos.length].cloneNode(true)
    nextPhoto.setNewImgOnLoad(nextPhoto.src.replaceAll(/\-blur/g,""))
    nextPhoto.style.opacity = 0.6
    nextPhoto.classList.add('sidephotos')
    nextPhoto.style.zIndex = 2
	  nextPhoto.loading = 'eager'
    postPhoto = photos[(n+2)%photos.length].cloneNode(true)
    postPhoto.setNewImgOnLoad(postPhoto.src.replace(/\-blur/g,""))
    postPhoto.classList.add('sidephotos')
    postPhoto.style.opacity = 0

    carousel.appendChild(antPhoto)
    carousel.appendChild(prevPhoto)
    carousel.appendChild(newPhoto)
    carousel.appendChild(nextPhoto)
    carousel.appendChild(postPhoto)
	
	namecontainer.textContent = names[n].textContent
	scicontainer.textContent = scis[n].textContent
	carousel.appendChild(photoinfo)
	
	newPhoto.classList.add('carphoto')

  antPhoto.classList.remove('photo')
  prevPhoto.classList.remove('photo')
	newPhoto.classList.remove('photo')
  nextPhoto.classList.remove('photo')
  postPhoto.classList.remove('photo')
	
	if (document.fullscreenElement && w >= h*5/3) {
		
		newPhoto.style.height = '100vh'
		newPhoto.style.width = 'auto'
		newPhoto.style.position = 'absolute'
    newPhoto.classList.add('fullscreenPhoto');
		newPhoto.style.left = 0
		newPhoto.style.top = 0
		
		nextPhoto.style.opacity = 0
		prevPhoto.style.opacity = 0
		
		photoinfo.style.position = 'absolute'
		photoinfo.style.width = (w - h*4/3 - 20) + 'px'
		photoinfo.style.right = '10px'
		photoinfo.style.top = (h/2 - 40)+'px'
		
		paddleleft.style.position = 'absolute'
		paddleright.style.position = 'absolute'
		
		paddleright.style.left = (w/2 + h*4/6 + 20) + 'px'
		paddleleft.style.right = (w-h*4/3)/2 + 20 + 'px'
		paddleleft.style.top = (h*0.55)+'px'
		paddleright.style.top = (h*0.55)+'px'

    return
	}

    photowidth = h*0.8*0.85*4/3
    photoheight = h*0.8*0.85

    if (h*0.85*4/3 <= w) {
    } else {
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

    

    /*if (photowidth <= (44-2/3)*w/100) {
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
    }*/

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
    console.log(window.innerWidth/window.innerHeight)
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

  function resetGrid() {
    main.innerHTML = '';
    let sortType = sortselect.value;
    let sortFunction = sortOptions[sortType]??function(a,b){return(b[3]-a[3])*2+Math.sign(b[4]-a[4])+Math.random()*0.1-0.05}
    console.log(sortType,sortFunction);
    filterData.sort(sortFunction);
    console.log(filterData);
    console.log(currentPage);
    generateTable(filterData)
  }

  function generateTable(a){
    l = a.length
    h = window.innerHeight
    let limit = Math.ceil((h-270)/330)*2
    
    for (let i = photoLimit*(currentPage-1); i < photoLimit*currentPage && i<l; i++) {

      let mainContainer = document.createElement('div')
      let imgDataContainer = document.createElement('div');
      imgDataContainer.className = 'imgDataContainer'
      let imgContainer = document.createElement('div');
      imgContainer.className = 'imgContainer'
      let imgBorder = document.createElement('div');
      imgBorder.className = 'imgBorder'
      
      let photo = document.createElement('img')
      photo.onload = function() {this.parentElement.parentElement.classList.add(this.naturalHeight > this.naturalWidth ? 'v' : 'h')}
      photo.src = 'images-blur/'+a[i][0]+'-blur.JPG'
      photo.classList.add('blurry')
      photo.setNewImgOnLoad('images/'+a[i][0]+'.JPG',mainContainer)
      photo.onerror = imgloadError
      photo.classList.add('photo')

      photo.loading = (i>limit) ? 'lazy' : ''

      photo.index = i
      let name = document.createElement('div')
      name.textContent = sa[a[i][2]][langIndex]+a[i][5+langIndex]+sa[a[i][2]][2+langIndex]
      
      name.classList.add('name')

      let sci = document.createElement('div')
      sci.textContent = a[i][1]
      sci.classList.add('sci')

      mainContainer.appendChild(imgDataContainer);
      imgDataContainer.appendChild(imgContainer);
      imgDataContainer.appendChild(name);
      imgDataContainer.appendChild(sci);
      imgContainer.appendChild(imgBorder);
      imgBorder.appendChild(photo);

      if(a[i][3]) {
        let star = document.createElement('div')
        star.textContent = '\u2605'
        star.classList.add('star')
        imgContainer.classList.add('special')
        imgContainer.appendChild(star)
      }
      
      main.appendChild(mainContainer);
    }

    progbar.hidden = true
    footer.classList.remove('hidden')
    nobird.hidden = l != 0;
    for (let i=0; i<photos.length; i++) {
      photos[i].onclick = openCarousel
    }
  }

  // table generation 🟣


  // other utility I'm not gonna touch in ages 🟠
  
  function imgloadError() {
	  this.src = 'logos/noload.png'
    this.classList.remove('blurry')
	  this.onerror = null
  }

  function clearSearch() {
    search.value = ''
    tableFiltered()
  }

  function filterSomething(a,query) {
    let searchparam, acum
    f = function(elem) {
      acum = false

      query.split('/').forEach(function(r){
        searchparam = r.trim()

        if(scioptions.includes(searchparam)) {
          acum = acum || elem[1] == searchparam
        } else if (commonoptions.includes(searchparam)) {
          acum = acum || elem[5+langIndex] == searchparam
        } else if (saoptions[langIndex].includes(searchparam.toLowerCase())) {
          acum = acum || sa[elem[2]][2-langIndex].toLowerCase().trim() == searchparam.toLowerCase()
        } else {
          acum = acum || elem[1].toLowerCase().includes(searchparam.toLowerCase())
            || (sa[elem[2]][langIndex]+elem[5+langIndex]+sa[elem[2]][2+langIndex]).
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



    if (sorttype == 'Random') {
      shuffle.hidden = false
      sortselect.style.paddingRight = '60px'
    } else {
      shuffle.hidden = true
      sortselect.removeAttribute('style')
    }

    let now = new Date();
    if (sorttype && sorttype != 'choose') {
      parameters.set('sort',sorttype)
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
      closesearch.hidden = false
    } else {
      parameters.delete('search')
      closesearch.hidden = true
    }
    updateURL(parameters)

    updatePageList();

    resetGrid();
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

  function updatePageList() {
    let totalPages = Math.ceil(filterData.length / photoLimit);
    while (pageList.children.length > 2) {
      pageList.children[1].remove();
    }
    let nextPaddle = pageList.children[1];

    for(let i = 1; i <= totalPages; i++) {
      let pageButton = document.createElement('div');
      pageButton.innerText = i;
      pageButton.onclick = function(){
          if(currentPage==i) return;
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

  function nextPage() {
    if(currentPage >= Math.ceil(filterData.length / photoLimit)) return;
    pageList.children[currentPage].classList.remove('current');
    currentPage++;
    pageList.children[currentPage].classList.add('current');
    main.innerHTML='';
    hidePaddles(currentPage);

    generateTable(filterData);
  }

  function previousPage() {
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

  // other utility I'm not gonna touch in ages 🟠