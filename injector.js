const scriptList = {
  calculation: {
    file: "src/averageCalculator.js",
    enabled: true,
  },
  loadMarkbook: {
    file: "src/loadMarkbook.js",
    enabled: true,
  },
  selectors: {
    file: "src/selectors.js",
    enabled: true,
  },
  liveModification: {
    file: "src/liveMarkbookCalculator.js",
    enabled: true,
  },
  betterTableLayout: {
    file: "src/betterTableLayout.js",
    enabled: true,
  },
  percentages: {
    file: "src/percentages.js",
    enabled: true,
  },
  fixBgColor: {
    file: "src/fixBgColor.js",
    enabled: true,
  },
};

const injectScript = (name, cb) => {
  let script = document.createElement("script"); // Create a script element
  script.src = chrome.extension.getURL(name); // Grab the absolute path to the script via the Chrome API
  (document.head || document.documentElement).appendChild(script); // Append the script to the <head> if it exists
  script.onload = () => {
    script.parentNode.removeChild(script); // Script removes itself off the page once loaded
    if (cb) cb();
  };
};

const injectSettings = (settings) => {
  let script = document.createElement("script"); // Create a script element
  script.innerHTML = `window.settings = ${JSON.stringify(settings)}`; // Set the value of the settings
  (document.head || document.documentElement).appendChild(script); // Append the script to the document
  script.onload = () => {
    script.parentNode.removeChild(script); // Script removes itself off the page once loaded
  };
};

const injectScriptList = (scriptList) => {
  chrome.storage.sync.get(null, (settings) => {
    injectSettings(settings); // Give the DOM access to settings

    // Disable scripts from loading if they are not needed
    if (!settings.calculation && !settings.quickview)
      scriptList.calculation.enabled = false;

    scriptList.liveModification.enabled = settings.liveModification;
    scriptList.percentages.enabled = settings.percentages;
    scriptList.betterTableLayout.enabled = settings.betterTableLayout;

    if (!settings.percentages && !settings.liveModification)
      scriptList.selectors.enabled = false;

    Object.keys(scriptList).forEach((script) => {
      if (scriptList[script].enabled) injectScript(scriptList[script].file);
    });
  });
};

injectScriptList(scriptList);
