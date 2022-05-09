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
          this.addElement(site.pattern, site.loop, site.id);

        this.currentId = res.sitelist.at(-1).id + 1;
      }
    });
  }

  add = (_pattern, _loop) => {
    let regexp = this.preparePattern(_pattern);

    chrome.storage.local.get({ sitelist: [] }, (res) => {
      res.sitelist.push({
        id: this.currentId,
        pattern: _pattern,
        regexp: regexp,
        loop: _loop
      });

      chrome.storage.local.set({ sitelist: res.sitelist }, () => {
        this.currentId++;
        this.addElement(_pattern, _loop, this.currentId);
      });
    });

  }

  addElement = (_pattern, _loop, _id) => {
    let container = document.createElement("div");
    let removebutton = document.createElement("div");
    let patternElem = document.createElement("div");
    let loopElem = document.createElement("div");

    container.classList.add(`${this.cssPrefix}__item`);
    removebutton.classList.add(`${this.cssPrefix}__removebutton`);
    removebutton.dataset.id = _id;
    removebutton.appendChild(document.createTextNode("X"));
    patternElem.classList.add(`${this.cssPrefix}__patterninput`);
    patternElem.appendChild(document.createTextNode(_pattern));
    loopElem.classList.add(`${this.cssPrefix}__loopcheck`);
    loopElem.classList.add(`${this.cssPrefix}__loopcheck--${_loop ? "enable" : "disable"}`);
    loopElem.appendChild(document.createTextNode(_loop ? "Enabled" : "Disabled"));

    container.appendChild(removebutton);
    container.appendChild(patternElem);
    container.appendChild(loopElem);

    this.root.appendChild(container);
    this.sites.push(container);
  }

  remove = (_id) => {
    chrome.storage.local.get({ sitelist: [] }, (res) => {
      let index = res.sitelist.findIndex(site => site.id == _id);
      console.log("got: " + _id, "found" + index);
      this.sites[index].remove();
      this.sites.splice(index, 1);
      res.sitelist.splice(index, 1);

      chrome.storage.local.set({ sitelist: res.sitelist });
    });
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