class Sitelist {
  currentId = 0;
  sites = [];

  constructor(root, cssPrefix = "list") {
    if (typeof root === "object") {
      this.root = root;
      // for reutilisation purposes, in case it clashes with other CSS classes
      this.cssPrefix = cssPrefix;

      this.root.classList.add(this.cssPrefix);
      this.root.addEventListener("click", (event) => {
        const id = event.target.dataset.id;

        if (id) this.remove(id);
      });
    }
    else
      throw new Error("Root element must be an object");
  }

  load() {
    chrome.storage.local.get({ sitelist: [] }, res => {
      if (res.sitelist && res.sitelist.length > 0) {
        for (const site of res.sitelist) {
          this.addElement(site.pattern, site.loop, site.id);
        }

        this.currentId = res.sitelist.at(-1).id + 1;
      }
    });
  }

  add(pattern, loop) {
    const regexp = this.preparePattern(pattern);

    chrome.storage.local.get({ sitelist: [] }, (res) => {
      res.sitelist.push({
        id: this.currentId,
        pattern: pattern,
        regexp: regexp,
        loop: loop
      });

      chrome.storage.local.set({ sitelist: res.sitelist }, () => {
        this.addElement(pattern, loop, this.currentId);
        this.currentId++;
      });
    });
  }

  addElement(pattern, loop, id) {
    const container = document.createElement("div");
    const removebutton = document.createElement("div");
    const patternElem = document.createElement("div");
    const loopElem = document.createElement("div");

    container.classList.add(`${this.cssPrefix}__item`);
    removebutton.classList.add(`${this.cssPrefix}__removebutton`);
    removebutton.dataset.id = id;
    removebutton.appendChild(document.createTextNode("X"));
    patternElem.classList.add(`${this.cssPrefix}__patterninput`);
    patternElem.appendChild(document.createTextNode(pattern));
    loopElem.classList.add(`${this.cssPrefix}__loopcheck`);
    loopElem.classList.add(
      `${this.cssPrefix}__loopcheck--${loop ? "enable" : "disable"}`
    );
    loopElem.appendChild(
      document.createTextNode(loop ? "Enabled" : "Disabled")
    );

    container.appendChild(removebutton);
    container.appendChild(patternElem);
    container.appendChild(loopElem);

    this.root.appendChild(container);
    this.sites.push(container);
  }

  remove(id) {
    chrome.storage.local.get({ sitelist: [] }, (res) => {
      const index = res.sitelist.findIndex(site => site.id == id);
      this.sites[index].remove();
      this.sites.splice(index, 1);
      res.sitelist.splice(index, 1);

      chrome.storage.local.set({ sitelist: res.sitelist });
    });
  }

  preparePattern(pattern) {
    const rxUrlSplit = /((?:http|ftp)s?):\/\/([^\/]+)(\/.*)?/;
    const parts = pattern.match(rxUrlSplit);
    let preparedUrl = "";

    if (parts) {
      preparedUrl = parts[1] + "://";
      preparedUrl += parts[2]
          .replace(/[?()[\]\\.+^$|]/g, "\\$&")
          .replace(/\*\\./g, "(?:[^/]*\\.)*")
          .replace(/\*$/, "[^/]*");
  
      if (parts[3]) {
        preparedUrl += parts[3]
          .replace(/[?()[\]\\.+^$|]/g, "\\$&")
          .replace(/\/\*(?=$|\/)/g, "(?:/[^]*)?");
      }
    }

    if (preparedUrl) {
      const rx = "^" + preparedUrl + "$";
      return rx;
    }

    else
      throw new Error("Invalid pattern");
  }

  show() {
    chrome.storage.local.get({ sitelist: [] }, (res) => {
      console.log(res.sitelist);
    });
  }
}

export default Sitelist;