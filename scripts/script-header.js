let lastScrollTop = 0;
let delta = 5;
let pages = document.getElementById('pages');
let navbarHeight = 70;

window.onscroll = hasScrolled;

function hasScrolled() {
    const st = this.scrollY;

    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;

    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight || st < Math.min(120, window.innerHeight*0.25)){
        // Scroll Down
        pages.classList.remove('nav-down');
        pages.classList.add('nav-up');
    } else {
        // Scroll Up
        if(st + window.innerHeight < parseInt(getComputedStyle(document.body).height)) {
            pages.classList.remove('nav-up');
            pages.classList.add('nav-down');
        }
    }

    lastScrollTop = st;
}


