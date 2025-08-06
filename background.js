chrome.runtime.onInstalled.addListener(() => {
  console.log('LeetCode Company Finder installed.');
});

// Add debugging for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes);
  if (changes.currentProblemCompanies) {
    console.log('Companies updated:', changes.currentProblemCompanies.newValue);
  }
});