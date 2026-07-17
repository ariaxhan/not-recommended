"use strict";

const DEFAULTS = {
  enabled: true,
  hideSidebar: true,
  hideShorts: true,
  hideComments: true,
  intentPrompt: true,
};

chrome.storage.local.get(DEFAULTS).then(values => {
  Object.keys(DEFAULTS).forEach(key => {
    const input = document.getElementById(key);
    input.checked = Boolean(values[key]);
    input.addEventListener("change", () => chrome.storage.local.set({[key]: input.checked}));
  });
});

document.getElementById("openHome").addEventListener("click", () => {
  chrome.tabs.create({url: "https://www.youtube.com/"});
});
