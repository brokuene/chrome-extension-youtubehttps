chrome-extension-youtubehttps
=============================

Extension for Chrome browser. Changes all embedded youtube videos to go via https protocol instead of unsecured http.
Can also work as invisible proxy.

Features
------------------

* After installation the extension shows page action in chrome browser at every **http** page.
<div align="center">
  <img src="https://github.com/brokuene/chrome-extension-youtubehttps/raw/master/readme_images/pageAction.png" alt="Page action screenshoot"/>
</div>
Clicking it will trigger replacement of all youtube embedded videos at current page to go via https protocol. Also a popup with summary will be displayed. It is possible to see what was changed by clicking on changed frames counter.
See example below, it was run at network where administrator blocked connections to `http://www.youtube.com*` but not to `https://www.youtube.com*`.
<div align="center">
  <img src="https://github.com/brokuene/chrome-extension-youtubehttps/raw/master/readme_images/youtubereplacer_example.gif" alt="Extension work presented on animated image"/>
</div>

* With option "Auto run on every page" at popup, you don't have to click page action on every single page. Process will start automatically always after any **http** page is loaded.

* To completely forget about extension and always have youtube videos trough secured **https** protocol you can run extension as proxy. The page action in address bar will be not displayed but every request to `http://www.youtube.com/embed*` will be redirected to `https://www.youtube.com/embed*` at a very low level. Address `http://www.youtube.com` will be also redirected to `https://www.youtube.com`.
Running as proxy can be set in extension options in Chrome: Main menu -> Tools -> Extensions and the Options link near this extension.

Installation
------------------

Build extension, ready to install is under extension folder. 
Direct download, click [here](https://github.com/brokuene/chrome-extension-youtubehttps/raw/master/extension/youtubehttps.crx).

When download is complete, in Chrome select Main menu -> Tools -> Extensions. In page that apears you can just drag & drop "youtubehttps.crx" file.

Developer info
------------------
Extension uses content scripts injected to every **http** page. Content script finds all iframes on page and changes with reqular expression a source link. Content script also subscribes `DOMNodeInserted` event to support functionality on dynamically changing pages.
Content scripts are injected by background page. The background page listens for replaced iframes and collect this information. A communication is done with `chrome.runtime.onMessage` and `chrome.runtime.sendMessage` API.
The proxy option is done without content scripts and without knowing about any html or DOM. The `chrome.webRequest.onBeforeRequest` event allows to deal with request before it is sent.

License
------------------
Copyright 2014 brokuene (brokuene at gmail dot com) under the [Apache License, Version 2.0](https://raw2.github.com/brokuene/chrome-extension-youtubehttps/master/LICENSE.txt)
