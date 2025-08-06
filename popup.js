document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('companyList');
  
  // Add loading state
  listEl.innerHTML = '<div class="loading">Loading companies</div>';
  
  // Function to get company logo URL dynamically
  const getCompanyLogo = (companyName) => {
    const company = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    
    // Dynamic logo generation with multiple fallback strategies
    const generateLogoUrls = (companyName) => {
      const cleanName = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      
      // Common domain variations for companies
      const domainVariations = [
        `${cleanName}.com`,
        `${cleanName}.io`,
        `${cleanName}.net`,
        `${cleanName}.org`,
        `${cleanName}.co`,
        `${cleanName}hq.com`,
        `${cleanName}.ai`,
        `${cleanName}.tech`,
        `www.${cleanName}.com`
      ];
      
      // Special cases for known domain patterns
      const specialDomains = {
        'jpmorgan': 'jpmorganchase.com',
        'jpmorganchase': 'jpmorganchase.com',
        'goldmansachs': 'goldmansachs.com',
        'morganstanley': 'morganstanley.com',
        'bankofamerica': 'bankofamerica.com',
        'wellsfargo': 'wellsfargo.com',
        'square': 'squareup.com',
        'zoom': 'zoom.us',
        'elastic': 'elastic.co',
        'confluent': 'confluent.io',
        'datadog': 'datadoghq.com',
        'notion': 'notion.so',
        'twitch': 'twitch.tv',
        'discord': 'discord.com',
        'reddit': 'reddit.com',
        'github': 'github.com',
        'gitlab': 'gitlab.com',
        'stackoverflow': 'stackoverflow.com'
      };
      
      // If we have a special domain mapping, use it
      if (specialDomains[cleanName]) {
        return [`https://logo.clearbit.com/${specialDomains[cleanName]}`];
      }
      
      // Generate multiple logo service URLs
      return [
        `https://logo.clearbit.com/${cleanName}.com`,
        `https://logo.clearbit.com/${cleanName}.io`,
        `https://logo.clearbit.com/${cleanName}.net`,
        `https://img.logo.dev/${cleanName}.com?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ`,
        `https://logo.clearbit.com/www.${cleanName}.com`,
        `https://favicons.githubusercontent.com/${cleanName}`,
        `https://logo.clearbit.com/${cleanName}hq.com`
      ];
    };
    
    // Return the first URL to try (Clearbit with .com domain)
    const logoUrls = generateLogoUrls(companyName);
    return logoUrls[0];
  };
  
  // Function to create company item with dynamic logo loading
  const createCompanyItem = (company, index) => {
    const li = document.createElement('li');
    li.className = 'company-item';
    li.title = company; // Tooltip for full name if truncated
    
    // Always create and show the fallback icon first
    const fallbackIcon = document.createElement('div');
    fallbackIcon.className = 'company-fallback-icon';
    fallbackIcon.textContent = company.charAt(0).toUpperCase();
    
    // Create company name span
    const companyName = document.createElement('span');
    companyName.className = 'company-name';
    companyName.textContent = company;
    
    // Add rank badge for top 5 companies
    if (index < 5) {
      const rankBadge = document.createElement('span');
      rankBadge.className = 'rank-badge';
      rankBadge.textContent = `#${index + 1}`;
      rankBadge.classList.add('top-rank');
      li.appendChild(rankBadge);
    }
    
    // Add elements to the list item
    li.appendChild(fallbackIcon);
    li.appendChild(companyName);
    
    // Try to load logo in the background
    const tryLoadLogo = () => {
      const cleanName = company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      
      // Special domain mappings
      const specialMappings = {
        'jpmorgan': 'jpmorganchase.com',
        'jpmorganchase': 'jpmorganchase.com',
        'goldmansachs': 'goldmansachs.com',
        'square': 'squareup.com',
        'zoom': 'zoom.us',
        'elastic': 'elastic.co',
        'confluent': 'confluent.io',
        'datadog': 'datadoghq.com',
        'notion': 'notion.so',
        'twitch': 'twitch.tv'
      };
      
      // Logo URLs to try
      const logoUrls = [
        `https://logo.clearbit.com/${specialMappings[cleanName] || cleanName + '.com'}`,
        `https://logo.clearbit.com/${cleanName}.io`,
        `https://logo.clearbit.com/${cleanName}.net`,
        `https://logo.clearbit.com/www.${cleanName}.com`
      ];
      
      let currentAttempt = 0;
      
      const attemptLoad = () => {
        if (currentAttempt >= logoUrls.length) return; // Give up after all attempts
        
        const img = new Image();
        img.onload = function() {
          // Logo loaded successfully, replace fallback icon
          fallbackIcon.style.display = 'none';
          const logoImg = document.createElement('img');
          logoImg.className = 'company-logo';
          logoImg.src = logoUrls[currentAttempt];
          logoImg.alt = `${company} logo`;
          li.insertBefore(logoImg, companyName);
        };
        
        img.onerror = function() {
          // Try next URL
          currentAttempt++;
          attemptLoad();
        };
        
        img.src = logoUrls[currentAttempt];
      };
      
      attemptLoad();
    };
    
    // Start logo loading (non-blocking)
    setTimeout(tryLoadLogo, 10); // Small delay to ensure DOM is ready
    
    return li;
  };
  
  chrome.storage.local.get(['currentProblemCompanies'], result => {
    if (chrome.runtime.lastError) {
      console.error('Error retrieving companies from storage:', chrome.runtime.lastError);
      listEl.innerHTML = '<div class="error">Error loading companies</div>';
      return;
    }
    
    console.log('Retrieved companies from storage:', result);
    const companies = result.currentProblemCompanies || [];
    console.log('Companies array:', companies, 'Length:', companies.length);
    
    listEl.innerHTML = '';
    
    if (companies.length) {
      // Add company count as data attribute for CSS
      listEl.setAttribute('data-count', companies.length);
      console.log('Setting company count to:', companies.length);
      
      // Sort companies alphabetically for better organization
      // For large lists, prioritize known big tech companies first
      const bigTechCompanies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Facebook', 'Meta', 'Netflix', 'Uber', 'Airbnb'];
      const sortedCompanies = companies.sort((a, b) => {
        const aIsBigTech = bigTechCompanies.some(big => a.toLowerCase().includes(big.toLowerCase()));
        const bIsBigTech = bigTechCompanies.some(big => b.toLowerCase().includes(big.toLowerCase()));
        
        if (aIsBigTech && !bIsBigTech) return -1;
        if (!aIsBigTech && bIsBigTech) return 1;
        return a.localeCompare(b);
      });
      
      console.log('Sorted companies:', sortedCompanies);
      
      // Use document fragment for better performance with large lists
      const fragment = document.createDocumentFragment();
      
      sortedCompanies.forEach((company, index) => {
        console.log(`Creating item for company ${index + 1}:`, company);
        const companyItem = createCompanyItem(company, index);
        fragment.appendChild(companyItem);
      });
      
      listEl.appendChild(fragment);
      console.log('Added all companies to DOM. Total items:', listEl.children.length);
    } else {
      console.log('No companies found, removing data-count attribute');
      // The CSS will handle the empty state message
      listEl.removeAttribute('data-count');
    }
  });
});