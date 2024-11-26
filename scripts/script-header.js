let didScroll;
  let lastScrollTop = 0;
  let delta = 5;
  let navbarHeight = $('#pages').outerHeight();

  $(window).scroll(function(event){
      hasScrolled()
  });

  function hasScrolled() {
      var st = $(this).scrollTop();
      
      // Make sure they scroll more than delta
      if(Math.abs(lastScrollTop - st) <= delta)
          return;
      
      // If they scrolled down and are past the navbar, add class .nav-up.
      // This is necessary so you never see what is "behind" the navbar.
      if (st > lastScrollTop && st > navbarHeight || st < Math.min(140, window.innerHeight*0.25)){
          // Scroll Down
          $('#pages').removeClass('nav-down').addClass('nav-up');
      } else {
          // Scroll Up
          if(st + window.innerHeight < $(document).height()) {
              $('#pages').removeClass('nav-up').addClass('nav-down');
          }
      }
      
      lastScrollTop = st;
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