export default class Notifer {
  constructor(timeout) {
    this.notifTimeout = timeout;
  }

  purgeExisting() {
    let notif = document.getElementById("notify");
    if (notif) notif.remove();
  }

  notify(htmlTypeClass, title, text) {
    this.purgeExisting();
    document
      .getElementsByTagName("body")[0]
      .insertAdjacentHTML(
        "beforeBegin",
        `<div class="notify ${htmlTypeClass} notify--appear" id="notify"><span class="notify__title">${title}</span><p class="notify__content">${text}</p></div>`
      );
    let notif = document.getElementById("notify");

    setTimeout(() => this.purgeExisting(), this.notifTimeout);
  }

  success(title, text) {
    this.notify("notify--success", title, text)
  }

  warn(title, text) {
    this.notify("notify--warn", title, text)
  }

  error(title, text) {
    this.notify("notify--error", title, text)
  }
}
