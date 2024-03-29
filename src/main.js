chrome.storage.local.get({ sitelist: [] }, (res) => {
  for (const site of res.sitelist) {
    const regex = new RegExp(site.regexp, 'i');

    if (regex.test(window.location.href)) {
      const observer = new MutationObserver((mutationList) => {
        setLooping(mutationList, site.loop);
      });
      observer.observe(document.body, { childList: true, subtree: true });

      console.log(
        `[Video Looper] Url matches existing pattern!
        ${site.loop ? 'Enabling' : 'Disabling'} loop in every video.`
      );

      break;
    }
  }
});

const setLooping = (mutationList, loop) => {
  for (const mutation of mutationList) {
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        if (node.tagName === 'VIDEO') node.loop = loop;
      }
    }
  }
}