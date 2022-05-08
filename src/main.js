chrome.storage.local.get({ sitelist: [] }, (res) => {
  for (let site of res.sitelist) {
    if (urlMatches(window.location.href, new RegExp(site.regexp, "i"))) {
      const observer = new MutationObserver((mutationList) => {
        setLoops(mutationList, site.enabled) }
      );
      observer.observe(document.body, { childList: true, subtree: true });

      break;
    }
  }
});

const urlMatches = (url, match) => {
  if (url.match(match)) {
    console.log(url + " matches against " + match);
    return true;
  }
  else {
    console.log(url + " does not match against " + match);
    return false;
  }
};

const setLoops = (mutationList, enable) => {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      for (let node of mutation.addedNodes) {
        if (node.tagName === "VIDEO")
          node.loop = enable;
      }
    }
  }
}