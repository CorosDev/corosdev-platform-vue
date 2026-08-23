/* ============================================================
   cta-modal.js — CorosDev Premium Bilingual Floating CTA Drawer
   ============================================================ */

(function() {
  // Brevo endpoint
  const BREVO_ACTION = 'https://8756b6e9.sibforms.com/serve/MUIFAKSh8xNxNu1k68CAUrSU-1pe6vuWPW7xwKd7CGDHHotwq4IrmYi4rmHXxIdPaUK9KrS9GkA8byZFdcgEXVmcuvpknY91tw4rl1QFgz2m2Dnkli1ietzEY80T98-1orF65YgnA86SG1HqVEkdqGQrDv6O6dj6R-uaW4-qJ5a_5pFTBIIDTFQm7_qVBIlphY3l7SZNkk3Brz5qlg==';

  // 1. Inject DOM elements when file is loaded
  function injectCtaMarkup() {
    if (document.getElementById('cd-drawer-overlay')) return;

    // Overlay & Drawer HTML
    const drawerHtml = `
      <div id="cd-drawer-overlay" class="cd-drawer-overlay" onclick="if(event.target === this) closeCtaModal()">
        <div class="cd-drawer-container" onclick="event.stopPropagation()">
          <div class="cd-modal-tag-glow"></div>
          
          <!-- Header -->
          <div class="cd-drawer-header">
            <div>
              <h3 id="cd-drawer-title" class="text-xl font-bold text-white tracking-tight" data-i18n="cta_drawer_title">Join the Ecosystem</h3>
              <p id="cd-drawer-subtitle" class="text-xs text-white/50 mt-1" data-i18n="cta_drawer_subtitle">Apply to be an early tester or investor.</p>
            </div>
            <button class="cd-drawer-close-btn" onclick="closeCtaModal()" aria-label="Close">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="cd-drawer-body">
            <!-- Form -->
            <form id="cd-drawer-form" onsubmit="submitCtaForm(event)">
              <input type="hidden" id="cd-form-context" name="context" value="">

              <div class="cd-form-group">
                <label class="cd-form-label" for="cd-input-name" data-i18n="form_name">Full Name</label>
                <input type="text" id="cd-input-name" name="NOMBRE" required class="cd-form-input" placeholder="e.g. John Doe" data-i18n="form_name_placeholder">
              </div>

              <div class="cd-form-group">
                <label class="cd-form-label" for="cd-input-email" data-i18n="form_email">Work Email</label>
                <input type="email" id="EMAIL" name="EMAIL" required class="cd-form-input" placeholder="e.g. john@company.com" data-i18n="form_email_placeholder">
              </div>

              <div class="cd-form-group">
                <label class="cd-form-label" for="cd-input-role" data-i18n="cta_form_role">Interest</label>
                <select id="cd-input-role" name="MULT_SLCT[]" required class="cd-form-select">
                  <option value="Testes de Accesso Anticipado / Usuario" data-i18n="cta_form_role_tester">Early Tester</option>
                  <option value="Inversor de Capital" data-i18n="cta_form_role_investor">Capital Investor</option>
                  <option value="Socio Estratégico / Cliente" data-i18n="cta_form_role_partner">Client / Strategic Partner</option>
                </select>
              </div>

              <div class="cd-form-group">
                <label class="cd-form-label" for="cd-input-message" data-i18n="cta_form_message">Message (Optional)</label>
                <textarea id="cd-input-message" name="MESSAGE" rows="3" class="cd-form-textarea" placeholder="How can we collaborate?" data-i18n="cta_form_message_placeholder"></textarea>
              </div>

              <!-- Brevo required hidden fields -->
              <input type="text" name="email_address_check" value="" style="display:none;">
              <input type="hidden" name="locale" value="es">
              <input type="hidden" name="html_type" value="simple">

              <button type="submit" id="cd-form-btn" class="cd-submit-btn" data-i18n="cta_form_submit">Apply Now</button>
            </form>

            <!-- Success message (hidden initially) -->
            <div id="cd-success-container" class="cd-success-container hidden">
              <div class="cd-success-icon-ring">
                <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 class="text-2xl font-bold text-white mb-3" data-i18n="cta_form_success_title">Application Sent!</h4>
              <p class="text-white/60 text-sm leading-relaxed" data-i18n="cta_form_success_desc">Thank you for your interest. We will get back to you shortly.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Bottom Right CTA Widget -->
      <div id="cd-floating-cta" class="cd-floating-cta-widget">
        <div class="cd-floating-label" data-i18n="cta_floating_label">Partner / Invest</div>
        <button class="cd-floating-btn" onclick="openCtaModal('floating')" aria-label="Partner or Invest">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = drawerHtml;
    document.body.appendChild(wrapper);

    // Initial scroll listener to reveal floating CTA
    window.addEventListener('scroll', handleCtaScroll, { passive: true });

    // Apply translations immediately after injection
    if (typeof window.cdApplyLang === 'function') {
      window.cdApplyLang(window._cdLang || 'en');
    }
  }

  function handleCtaScroll() {
    const ctaWidget = document.getElementById('cd-floating-cta');
    if (!ctaWidget) return;
    
    if (window.scrollY > 300) {
      ctaWidget.classList.add('visible');
    } else {
      ctaWidget.classList.remove('visible');
    }
  }

  // 2. Global Actions bound to window
  window.openCtaModal = function(context = 'general') {
    const overlay = document.getElementById('cd-drawer-overlay');
    const form = document.getElementById('cd-drawer-form');
    const success = document.getElementById('cd-success-container');
    const contextInput = document.getElementById('cd-form-context');
    
    if (!overlay) return;

    // Reset view
    form.classList.remove('hidden');
    success.classList.add('hidden');
    form.reset();

    // Set Context
    if (contextInput) contextInput.value = context;

    // Customize Title and fields based on context
    const titleEl = document.getElementById('cd-drawer-title');
    const subtitleEl = document.getElementById('cd-drawer-subtitle');
    const selectEl = document.getElementById('cd-input-role');

    if (context === 'ecosystem') {
      titleEl.setAttribute('data-i18n', 'cta_drawer_title_eco');
      subtitleEl.setAttribute('data-i18n', 'cta_drawer_subtitle_eco');
      if (selectEl) selectEl.value = 'Testes de Accesso Anticipado / Usuario';
    } else if (context === 'services') {
      titleEl.setAttribute('data-i18n', 'cta_drawer_title_svc');
      subtitleEl.setAttribute('data-i18n', 'cta_drawer_subtitle_svc');
      if (selectEl) selectEl.value = 'Socio Estratégico / Cliente';
    } else if (context === 'partners') {
      titleEl.setAttribute('data-i18n', 'cta_drawer_title_ptn');
      subtitleEl.setAttribute('data-i18n', 'cta_drawer_subtitle_ptn');
      if (selectEl) selectEl.value = 'Socio Estratégico / Cliente';
    } else {
      titleEl.setAttribute('data-i18n', 'cta_drawer_title');
      subtitleEl.setAttribute('data-i18n', 'cta_drawer_subtitle');
    }

    // Apply translations
    if (typeof window.cdApplyLang === 'function' && typeof window._cdLang !== 'undefined') {
      window.cdApplyLang(window._cdLang);
    }

    // Trigger Slide-in Animation
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Disable background scrolling
  };

  window.closeCtaModal = function() {
    const overlay = document.getElementById('cd-drawer-overlay');
    if (!overlay) return;

    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable background scrolling
  };

  window.submitCtaForm = function(event) {
    event.preventDefault();
    const btn = document.getElementById('cd-form-btn');
    const form = document.getElementById('cd-drawer-form');
    const success = document.getElementById('cd-success-container');
    
    if (!btn || !form || !success) return;

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="inline-flex items-center gap-2"><svg class="animate-spin h-5 w-5 text-brand-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...</span>`;

    // Build FormData for Brevo
    const formData = new FormData(form);

    fetch(BREVO_ACTION, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'   // Brevo doesn't return CORS headers; submission still goes through
    })
    .then(() => {
      // Show success regardless (no-cors means we can't inspect the response)
      form.classList.add('hidden');
      success.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = originalText;
    })
    .catch(() => {
      // Even on network error, show success to avoid blocking UX
      form.classList.add('hidden');
      success.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = originalText;
    });
  };

  // Run DOM injection
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCtaMarkup);
  } else {
    injectCtaMarkup();
  }
})();
