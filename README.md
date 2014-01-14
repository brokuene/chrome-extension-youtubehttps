chrome-extension-youtubehttps
=============================

Extension for Chrome browser. Changes all embeded youtube videos to go via https protocol.
Can also work as invisible proxy.

Features
------------------

* After installation the extension shows page action in chrome browser at every **http** page.
<div align="center">
  <img src="https://github.com/brokuene/chrome-extension-youtubehttps/raw/master/readme_images/pageAction.png" alt="Page action screenshoot"/>
</div>
Clicking it will trigger replacement of all youtube embeded videos at current page to go via https protocol. Also a popup with summary will be displayed.
<div align="center">
  <img src="https://github.com/brokuene/chrome-extension-youtubehttps/raw/master/readme_images/pageConverted.png" alt="Page with popup"/>
</div>
It is possible to see what was changed by clicking on changed frames counter.
<div align="center">
  <img src="https://github.com/brokuene/chrome-extension-youtubehttps/raw/master/readme_images/expandedPopup.png" alt="Popup expanded"/>
</div>

* With option "Auto run on every page" at popup, you don't have to click page action on every single page. Process will start automatically always after any **http** page is loaded.

* To completely forget about extension and always have youtube videos trough secured https protocol you can run extension as proxy. The page action in address bar will be not displayed but every request to `http://www.youtube.com/embed*` will be redirected to `https://www.youtube.com/embed*` at a very low level. Adress `http://www.youtube.com` will be also redirected to `https://www.youtube.com`.
Running as proxy can be set in extension options in Chrome: Main menu -> Tools -> Extensions and the Options link near this extension.

Installation
------------------

Build extension, ready to install is under extension folder. 
Direct download, click [here](https://github.com/brokuene/chrome-extension-youtubehttps/raw/master/extension/youtubehttps.crx).

When download is complete, in Chrome select Main menu -> Tools -> Extensions. In page that apears you can just drag & drop "youtubehttps.crx" file.

