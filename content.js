
(async () => {
  console.log('LeetCode Company Finder: Content script loaded (v2.0)');
  const path = window.location.pathname;
  const parts = path.split('/');
  if (parts.length < 3 || parts[1] !== 'problems') return;
  const problemPath = parts[2];
  console.log('Problem path detected:', problemPath);

  try {
    console.log('Fetching problem data from API...');
    const response = await fetch('https://jaindevshrut.github.io/weekly_json_build/folder-problems.json');
    if (!response.ok) throw new Error('Failed to load problem data');
    const data = await response.json();
    console.log('API data loaded, total entries:', Object.keys(data).length);
    
    // Find the problem entry by matching the URL path
    const currentUrl = `https://leetcode.com/problems/${problemPath}`;
    console.log('Looking for URL:', currentUrl);
    const problemEntry = data[currentUrl];
    console.log('Problem entry found:', problemEntry ? 'Yes' : 'No');
    
    // Extract companies from the matched problem entry
    const companies = problemEntry?.companies || [];
    console.log('Companies extracted:', companies.length);

    // Store for popup consumption
    chrome.storage.local.set({ currentProblemCompanies: companies }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error storing companies:', chrome.runtime.lastError);
      } else {
        console.log(`Found ${companies.length} companies for problem:`, problemPath);
        console.log('Companies:', companies);
      }
    });
  } catch (err) {
    console.error('Error fetching problem map:', err);
    console.error('Error details:', err.message, err.stack);
    // Store empty array on error to clear any stale data
    chrome.storage.local.set({ currentProblemCompanies: [] }, () => {
      console.log('Cleared companies storage due to error');
    });
  }
})();