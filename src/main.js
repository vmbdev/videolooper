chrome.storage.local.get({ sitelist: [] }, (res) => {
  for (const site of res.sitelist) {
    if (window.location.href.match(new RegExp(site.regexp, "i")) !== null) {
      console.log(`[Video Looper] Url matches existing pattern! ${site.loop ? "Enabling" : "Disabling"} loop in every video.`);
      const observer = new MutationObserver((mutationList) => {
        setLoops(mutationList, site.loop);
      });
      observer.observe(document.body, { childList: true, subtree: true });

      break;
    }
  }
});


const setLoops = (mutationList, loop) => {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      for (const node of mutation.addedNodes) {
        if (node.tagName === "VIDEO")
          node.loop = loop;
      }
    }
  }
}