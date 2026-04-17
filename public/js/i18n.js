// Initialize i18next
i18next.use(i18nextHttpBackend)
  .init({
    fallbackLng: 'en',
    debug: false,
    backend: {
      loadPath: 'locales/{{lng}}/translation.json'
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  }, function(err, t) {
    if (err) return console.error('i18next initialization error:', err);
    console.log('i18next initialized');
    
    // Update the page with initial language
    updatePageLanguage();
  });

// Update page content with current language
function updatePageLanguage() {
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = i18next.t(key);
    if (element.tagName === 'OPTION') {
      element.textContent = translation;
    } else {
      element.textContent = translation;
    }
  });
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = i18next.t(key);
  });
  
  console.log(`Updated page to language: ${i18next.language}`);
}

// Change language function
function changeLanguage(lang) {
  i18next.changeLanguage(lang, function(err, t) {
    if (err) return console.error('Language change error:', err);
    console.log(`Language changed to: ${lang}`);
    updatePageLanguage();
    
    // Re-render dynamic content (restaurant cards)
    if (typeof displayFeaturedRestaurants !== 'undefined') {
      displayFeaturedRestaurants();
    }
    if (typeof displayRestaurantsList !== 'undefined') {
      displayRestaurantsList();
    }
    
    // Update language selector value
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
      langSelect.value = lang;
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  const currentLang = i18next.language || 'en';
  const langSelect = document.getElementById('languageSelect');
  if (langSelect) {
    langSelect.value = currentLang;
  }
  console.log(`i18next ready with language: ${currentLang}`);
});

