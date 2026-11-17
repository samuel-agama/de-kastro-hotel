const header = document.querySelector('.flex-header');
const desktopNavigation = header?.querySelector('.header-nav');

const contactBar = document.createElement('nav');
contactBar.className = 'floating-contact-bar';
contactBar.setAttribute('aria-label', 'Quick contact actions');
contactBar.innerHTML = `
  <div class="floating-contact-actions" id="floating-contact-actions">
    <a class="floating-contact-link floating-contact-call" href="tel:+2348062911356" aria-label="Call De Kastro Hotel's 24/7 emergency line at +234 806 291 1356">
      <span aria-hidden="true">🚨</span>
      <span>24/7 Emergency Call</span>
    </a>
    <a class="floating-contact-link floating-contact-whatsapp" href="https://wa.me/2348062911356?text=Hello%2C%20I%20would%20like%20to%20make%20an%20urgent%20enquiry." target="_blank" rel="noopener noreferrer" data-event="whatsapp_lead">
      <span aria-hidden="true">💬</span>
      <span>Chat on WhatsApp</span>
    </a>
  </div>
  <button class="floating-contact-toggle" type="button" aria-label="Hide quick contact actions" aria-controls="floating-contact-actions" aria-expanded="true">
    <span class="floating-contact-dismiss" aria-hidden="true">×</span>
    <span class="floating-contact-restore">Contact</span>
  </button>
`;
document.body.appendChild(contactBar);
document.body.classList.add('has-floating-contact-bar');

const contactActions = contactBar.querySelector('.floating-contact-actions');
const contactToggle = contactBar.querySelector('.floating-contact-toggle');
let touchStart = null;

function setContactBarCollapsed(isCollapsed) {
  contactBar.classList.toggle('is-collapsed', isCollapsed);
  contactToggle.setAttribute('aria-expanded', String(!isCollapsed));
  contactToggle.setAttribute(
    'aria-label',
    isCollapsed ? 'Show quick contact actions' : 'Hide quick contact actions'
  );

  if (isCollapsed && contactActions.contains(document.activeElement)) {
    contactToggle.focus();
  }
}

contactToggle.addEventListener('click', () => {
  setContactBarCollapsed(!contactBar.classList.contains('is-collapsed'));
});

contactBar.addEventListener('touchstart', event => {
  if (event.touches.length !== 1) {
    touchStart = null;
    return;
  }

  touchStart = {
    x: event.touches[0].clientX,
    y: event.touches[0].clientY
  };
}, { passive: true });

contactBar.addEventListener('touchend', event => {
  if (!touchStart || event.changedTouches.length !== 1) return;

  const deltaX = event.changedTouches[0].clientX - touchStart.x;
  const deltaY = event.changedTouches[0].clientY - touchStart.y;
  touchStart = null;

  if (Math.abs(deltaY) < 48 || Math.abs(deltaY) <= Math.abs(deltaX) * 1.25) return;

  event.preventDefault();
  const isCollapsed = contactBar.classList.contains('is-collapsed');
  if (deltaY > 0 && !isCollapsed) setContactBarCollapsed(true);
  if (deltaY < 0 && isCollapsed) setContactBarCollapsed(false);
}, { passive: false });

contactBar.addEventListener('touchcancel', () => {
  touchStart = null;
}, { passive: true });

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

const privacyNotice = document.createElement('aside');
privacyNotice.id = 'privacy-notice';
privacyNotice.className = 'privacy-notice';
privacyNotice.setAttribute('role', 'region');
privacyNotice.setAttribute('aria-label', 'Privacy notice');
privacyNotice.innerHTML = `
  <div>
    <h2>Your privacy matters</h2>
    <p>We use essential browser storage to support site features and remember when this notice is dismissed. We do not currently use this notice to enable analytics or advertising tracking. <a href="privacy-policy.html">Read our Privacy Policy</a>.</p>
  </div>
  <button type="button" aria-label="Dismiss privacy notice">Dismiss</button>
`;
document.body.appendChild(privacyNotice);

const dismissPrivacyNotice = privacyNotice.querySelector('button');
try {
  privacyNotice.hidden = localStorage.getItem('deKastroPrivacyNoticeDismissed') === 'true';
} catch (error) {
  console.warn('Unable to read the privacy notice preference:', error);
}

dismissPrivacyNotice.addEventListener('click', () => {
  privacyNotice.hidden = true;
  try {
    localStorage.setItem('deKastroPrivacyNoticeDismissed', 'true');
  } catch (error) {
    console.warn('Unable to save the privacy notice preference:', error);
  }
});
