class Sitelist {
  constructor(_root, __cssPrefix = "list") {
    if (typeof _root === "object") {
      this.root = _root;
      this.sites = [];
      this.currentId = 0;
      // for reutilisation purposes, in case it clashes with other CSS classes
      this.cssPrefix = __cssPrefix;

      this.root.classList.add(this.cssPrefix);
      this.root.addEventListener("click", (event) => {
        let id = event.target.dataset.id;
        if (id)
          this.remove(id);
      });
    }
    else
      throw new Error("Root element must be an object");
  }

  build = () => {
    chrome.storage.local.get({ sitelist: [] }, res => {
      if ((res.sitelist !== undefined) && (res.sitelist.length > 0)) {
        for (let site of res.sitelist)
          this.addElement(site.pattern, site.enabled, site.id);

        this.currentId = res.sitelist.at(-1).id + 1;
        this.show();
      }
    });
  }

  add = (_pattern, _enabled) => {
    let regexp = this.preparePattern(_pattern);

    chrome.storage.local.get({ sitelist: [] }, (res) => {
      res.sitelist.push({
        id: this.currentId,
        pattern: _pattern,
        regexp: regexp,
        enabled: _enabled
      });

      chrome.storage.local.set({ sitelist: res.sitelist }, () => {
        this.currentId++;
        this.addElement(_pattern, _enabled, this.currentId);
      });
    });

  }

  addElement = (_pattern, _enable, _id) => {
    let container = document.createElement("div");
    let removebutton = document.createElement("div");
    let patternElem = document.createElement("div");
    let enableElem = document.createElement("div");

    container.classList.add(`${this.cssPrefix}__item`);
    removebutton.classList.add(`${this.cssPrefix}__removebutton`);
    removebutton.dataset.id = _id;
    removebutton.appendChild(document.createTextNode("X"));
    patternElem.classList.add(`${this.cssPrefix}__patterninput`);
    patternElem.appendChild(document.createTextNode(_pattern));
    enableElem.classList.add(`${this.cssPrefix}__loopcheck`);
    enableElem.classList.add(`${this.cssPrefix}__loopcheck--${_enable ? "enable" : "disable"}`);
    enableElem.appendChild(document.createTextNode(_enable ? "Enabled" : "Disabled"));

    container.appendChild(removebutton);
    container.appendChild(patternElem);
    container.appendChild(enableElem);

    this.root.appendChild(container);
    this.sites.push(container);
  }

  remove = (_id) => {
    console.log(_id);
  }

  preparePattern = (_pattern) => {
    let rxUrlSplit = /((?:http|ftp)s?):\/\/([^\/]+)(\/.*)?/;
    let preparedUrl = "";
    let parts;
    if ((parts = _pattern.match(rxUrlSplit)) !== null) {
      preparedUrl =
        parts[1] +
        "://" +
        parts[2]
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
      let rx = "^" + preparedUrl + "$";
      return rx;
    }

    else
      throw new Error("Invalid pattern");
  }

  show = () => {
    chrome.storage.local.get({ sitelist: [] }, (res) => {
      console.log(res.sitelist);
    });
  }
}


export default Sitelist;