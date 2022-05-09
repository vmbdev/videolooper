chrome.storage.local.get({ sitelist: [] }, (res) => {
  for (let site of res.sitelist) {
    if (urlMatches(window.location.href, new RegExp(site.regexp, "i"))) {
      const observer = new MutationObserver((mutationList) => {
        setLoops(mutationList, site.loop) }
      );
      observer.observe(document.body, { childList: true, subtree: true });

      break;
    }
  }
});

const urlMatches = (url, match) => !(url.match(match) === null);

const setLoops = (mutationList, loop) => {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      for (let node of mutation.addedNodes) {
        if (node.tagName === "VIDEO")
          node.loop = loop;
      }
    }
  }
}