const header = document.querySelector('.flex-header');
const desktopNavigation = header?.querySelector('.header-nav');

if (header && desktopNavigation) {
  const menuButton = document.createElement('button');
  menuButton.className = 'mobile-menu-btn';
  menuButton.type = 'button';
  menuButton.setAttribute('aria-label', 'Open navigation menu');
  menuButton.setAttribute('aria-controls', 'mobile-menu-overlay');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = '☰';

  const overlay = document.createElement('div');
  overlay.id = 'mobile-menu-overlay';
  overlay.className = 'mobile-menu-overlay';
  overlay.setAttribute('aria-label', 'Main navigation');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.inert = true;

  const menuHeading = document.createElement('div');
  menuHeading.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;';

  const heading = document.createElement('h2');
  heading.textContent = 'Menu';

  const closeButton = document.createElement('button');
  closeButton.className = 'mobile-menu-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close navigation menu');
  closeButton.textContent = '✕';
  menuHeading.append(heading, closeButton);

  const menuLinks = document.createElement('nav');
  menuLinks.className = 'mobile-menu-links';
  menuLinks.setAttribute('aria-label', 'Main navigation');
  desktopNavigation.querySelectorAll('a').forEach(link => {
    const mobileLink = link.cloneNode(true);
    mobileLink.removeAttribute('style');
    mobileLink.className = 'mobile-menu-link';
    menuLinks.appendChild(mobileLink);
  });
  overlay.append(menuHeading, menuLinks);
  header.appendChild(menuButton);
  document.body.appendChild(overlay);

  function setMenuOpen(isOpen) {
    overlay.classList.toggle('active', isOpen);
    overlay.setAttribute('aria-hidden', String(!isOpen));
    overlay.inert = !isOpen;
    menuButton.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';

    if (isOpen) {
      closeButton.focus();
    } else {
      menuButton.focus();
    }
  }

  menuButton.addEventListener('click', () => {
    setMenuOpen(!overlay.classList.contains('active'));
  });
  closeButton.addEventListener('click', () => setMenuOpen(false));
  menuLinks.addEventListener('click', event => {
    if (event.target.closest('a')) {
      setMenuOpen(false);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay.classList.contains('active')) {
      setMenuOpen(false);
    }
  });
}
