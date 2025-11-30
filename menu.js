(() => {
    const burger = document.getElementById('header-burger');
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = document.querySelector('[data-menu-overlay]');

    if (!burger || !mobileMenu || !overlay) return;

    const body = document.body;
    const menuLinks = mobileMenu.querySelectorAll('a');

    const openMenu = () => {
        body.classList.add('menu-open');
        burger.classList.add('is-active');
        burger.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
        body.classList.remove('menu-open');
        burger.classList.remove('is-active');
        burger.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = () => {
        const isOpen = body.classList.contains('menu-open');
        isOpen ? closeMenu() : openMenu();
    };

    burger.addEventListener('click', (event) => {
        event.preventDefault();
        toggleMenu();
    });

    overlay.addEventListener('click', closeMenu);
    menuLinks.forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && body.classList.contains('menu-open')) {
            closeMenu();
        }
    });
})();
