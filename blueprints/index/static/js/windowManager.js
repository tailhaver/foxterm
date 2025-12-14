class _WindowManager {
  static currentUser = null;
  static _windows = {};
  static forEach(fn) {
    Object.values(_WindowManager._windows).forEach(fn);
  }
  static updateUser(name) {
    $.ajax({
      url: 'current-user',
      type: 'GET',
      async: false,
      error: (request, status, error) => {
        console.error(`An error occurred trying to fetch the current user! Passing...`);
        return null
      },
      success: (data) => {
        this.forEach((e) => {e.updateUser?.(data.login)})
      }
    })
  }
}

const proxyHandler = {
  get(target, prop, receiver) {
    if (prop in target) { return target[prop] }
    if (prop in target._windows) { return target._windows[prop] }
  },
  set(target, prop, value, recv) {
    target._windows[prop] = value;
    target._windows[prop].window.setId(prop);
    return true;
  },
  deleteProperty(target, prop) {
    if (prop in target._windows) { 
      $(target._windows[prop].window.self).remove();
      delete target._windows[prop];
      return true;
    }
    if (prop in target) { delete target[prop]; return true }
  }
};

let WindowManager = new Proxy(_WindowManager, proxyHandler);

$(() => {
  var highestIndex = 5;
  $("body").on("mousedown", ".window.ui-draggable", (e) => {
    const $this = $(e.target).closest('.window.ui-draggable');
    if ($this.css("z-index") == highestIndex + 1) {
      return
    }
    $(".focused").removeClass("focused");
    $this.addClass("focused");
    $('.window[style*=z-index]').each((i, element) => {
      const index = $(element).css("z-index") - 1;
      if (index > highestIndex) {
        highestIndex = index;
      }
      if (index === 0) {
        $(element).css("z-index", "auto");
      } else {
        $(element).css("z-index", index);
      }
    })
    $this.css("z-index", highestIndex + 1);
  })
})

export default new Proxy(_WindowManager, proxyHandler)