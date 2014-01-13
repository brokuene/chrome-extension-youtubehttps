var debug = true;

var chromeextension = chromeextension || {};
chromeextension.youtubehttspreplacer = chromeextension.youtubehttspreplacer || {};
chromeextension.youtubehttspreplacer.background = function () {

	var _consts = { 
		proxyPatterns: ["http://www.youtube.com/embed*", "http://www.youtube.com/"],
		contentScripts : { youtubeReplacer : "youtubereplacer.js", youtubeReplacerContent : "youtubereplacecontent.js" }
	};
	
	var _tabsState = {};
	var _replacer = null;
	var RunningModesEnum = { Extension : "Extension" , Proxy : "Proxy" };
	var _runningState = null;
	
	var init = function (replacer){
		_replacer = replacer
	};
	
	var startExtension = function(){
		if(getRunAsProxy()){
			setUpAsProxy();
		}
		else {
			setUpRunAsExtension();
		}
	};
	
	var restartExtension = function(){
		var onTidedUp = startExtension;
	
		if (_runningState === RunningModesEnum.Extension){
			tidyUpExtensionBeforeRestart(onTidedUp);
		}
		else if (_runningState === RunningModesEnum.Proxy){
			tidyUpProxyBeforeRestart(onTidedUp);
		}
		else {
			chrome.runtime.reload();
		}
	};
	
	var setUpAsProxy = function(){
		_runningState = RunningModesEnum.Proxy;
	
		var filter = { urls: _consts.proxyPatterns };
		var callback = proxyOnBeforeRequest;
		var opt_extraInfoSpec = ["blocking"];
		
		chrome.webRequest.onBeforeRequest.addListener(proxyOnBeforeRequest, filter, opt_extraInfoSpec);
	};
	
	var tidyUpProxyBeforeRestart = function(onTidedUp){
		if(chrome.webRequest.onBeforeRequest.hasListener(proxyOnBeforeRequest)){
			chrome.webRequest.onBeforeRequest.removeListener(proxyOnBeforeRequest);
		}
		onTidedUp();
	};
	
	var proxyOnBeforeRequest = function(details){
		if(details.url){
			var newUrl = _replacer.fastReplaceProtocol(details.url);
			return { redirectUrl: newUrl };
		};
	};
	
	var setUpRunAsExtension = function(){
		_runningState = RunningModesEnum.Extension;
		
		chrome.tabs.onUpdated.addListener(tabsOnUpdatedEventListener);
		chrome.tabs.onReplaced.addListener(tabsOnRelacedEventListener);
		setUpListenersAtContentScripts();
	};
	
	var tabsOnUpdatedEventListener = function(tabId, changeInfo,tab) {
		putPageActionInTabIfNeeded(tabId, tab.url);
		
		if(debug){
			console.debug('onUpdated:' + tabId);
			console.log(changeInfo);
		}
		if(changeInfo.status === 'complete' && getAutorun()){
			injectAndRunReplaceScript(tabId);
		}
	};
	
	var tabsOnRelacedEventListener = function(addedTabId, removedTabId) {
		if(getAutorun()){
			injectAndRunReplaceScript(addedTabId);
		}
		putPageActionInTabIfNeeded(addedTabId);
	};
	
	var tidyUpExtensionBeforeRestart = function(onTidedUp){
		_tabsState = {};
	
		if(chrome.tabs.onUpdated.hasListener(tabsOnUpdatedEventListener)){
			chrome.tabs.onUpdated.removeListener(tabsOnUpdatedEventListener);
		}
		if (chrome.tabs.onReplaced.hasListener(tabsOnRelacedEventListener)){
			chrome.tabs.onReplaced.removeListener(tabsOnRelacedEventListener);
		}
		if(chrome.runtime.onMessage.hasListener(onMesageEventListener)){
			chrome.runtime.onMessage.removeListener(onMesageEventListener);
		}
		removePageActionFromAllTabs(onTidedUp);
	};
	
	var removePageActionFromAllTabs = function(onTidedUp){
		var originsToQueryClean = 0;
		var tabsInOriginsCounterToClean = 0;
	
		var hidePageActionOnPermitedTabs = function (permissions) {  
			if(permissions && permissions.origins && permissions.origins.length){
				originsToQueryClean = permissions.origins.length;
				permissions.origins.forEach(hidePageActionOnTabsMachedByUrlPattern); 
			}
			else
				runOnTidedUpWhenCleanedAll();
		};
	
		var hidePageActionOnTabsMachedByUrlPattern = function(urlPattern) { 
				chrome.tabs.query({url : urlPattern}, hidePageActionOnTabs);
		};
		var hidePageActionOnTabs = function (tabs) {
			originsToQueryClean--;
			tabsInOriginsCounterToClean += tabs.length;
			
			if(tabs.length) {
				tabs.forEach(hidePageActionOnTab); 
			}
			else {
				runOnTidedUpWhenCleanedAll();
			}
		};
		var hidePageActionOnTab = function(tab) { 
			chrome.pageAction.hide(tab.id); 
			tabsInOriginsCounterToClean--;
			runOnTidedUpWhenCleanedAll();
		};
		
		var runOnTidedUpWhenCleanedAll = function(){
			if(originsToQueryClean == 0 && tabsInOriginsCounterToClean == 0){
				onTidedUp();
			}
		};
	
		chrome.permissions.getAll(hidePageActionOnPermitedTabs);
	};
	
	var putPageActionInTabIfNeeded = function(tabId, tabUrl){
		var showPageActionIcon = function() {
			chrome.pageAction.show(tabId);
		};
	
		if(!tabUrl)
			doIfCanInjectToTabId(tabId, showPageActionIcon);
		else
			doIfCanInjectToUrl(tabUrl,showPageActionIcon);
	};
	

	var setUpListenersAtContentScripts = function(){
		chrome.runtime.onMessage.addListener(onMesageEventListener);
	};
	
	var onMesageEventListener = function(request, sender, sendResponse) {
		if (request.orgin == "youtubereplace"){
			if(request.purpose == "informAboutReplace"){
				chromeextension.youtubehttspreplacer.background.onContentReplaced(sender.tab.id, request.oldSrc, request.newSrc);
			}
			else if (request.purpose == "informAboutIframes"){
				chromeextension.youtubehttspreplacer.background.onIframesCounted(sender.tab.id, request.count);
			}
		}
	};
	
	var injectAndRunReplaceScript = function (tabId){		
		doIfCanInjectToTabId(tabId, function(){
			checkIfTabHasInjected(tabId, function(isInjectedAlready){ 
				if (!isInjectedAlready){
					onInjecting(tabId);
				}
				else {
					onAlreadyInjected(tabId);
				}
			});
		});
	};
	
	var checkIfTabHasInjected = function(tabId, callback){
		chrome.tabs.sendMessage(tabId, {orgin: "youtubereplace", purpose : "checkIfTabHasInjected" }, function(response) {
			if (response) {
				if(debug){
					console.log("Already there");
				}
				callback(true);
			}
			else {
				if (debug){
					console.log("Not there, inject contentscript");
				}
				callback(false);
			}
		});
	};
	
	var setAutorun = function (enabled){
		localStorage["autorun"] = enabled;
	};
	
	var getAutorun = function(){
		return localStorage["autorun"] == Boolean(true).toString();
	};
	
	var getPopupFramesShow = function(){
		return localStorage["showFrames"] == Boolean(true).toString();
	};
	
	var setPopupFramesShow = function(value){
		localStorage["showFrames"] = value;
	};
	
	var setRunAsProxy = function(enabled){
		localStorage["runAsProxy"]  = enabled;
	};
	
	var getRunAsProxy = function(){
		return localStorage["runAsProxy"] == Boolean(true).toString();
	};
	
	var onInjecting = function(tabId){
		if(debug){
			console.debug('injected to: ' + tabId);
		}
		_tabsState[tabId] = { framesCount : 0, replacedCount : 0, replacedLinks : [] };
		
		injectFileScript(tabId, _consts.contentScripts.youtubeReplacer , function() { 
			injectFileScript(tabId, _consts.contentScripts.youtubeReplacerContent, null);
		});
	};
	
	var injectFileScript = function(tabId, scriptName, successCallback){
		chrome.tabs.executeScript(tabId, {file: scriptName},
			function() {
				if (debug && chrome.runtime.lastError) {
					 console.log("ERROR: " + chrome.runtime.lastError.message);
				}
				if (successCallback)
					successCallback();
			}
		);
	};
	
	var onContentReplaced = function(tabId, oldSrc, newSrc){
		if(debug){
			console.debug("Tab id: " + tabId + " , oldSrc: " + oldSrc + " , newSrc: " + newSrc);
		}
		_tabsState[tabId].replacedLinks.push({oldSrc : oldSrc,newSrc : newSrc });
		_tabsState[tabId].replacedCount++;
		chrome.runtime.sendMessage({orgin: "background", purpose : "onContentReplaced", oldSrc: oldSrc, newSrc : newSrc, tabId : tabId});
	};
	
	var onIframesCounted = function(tabId, count){
		if(debug){
			console.debug("Tab id: " + tabId + " , count: " + count);
		}
		_tabsState[tabId].framesCount = count;
		chrome.runtime.sendMessage({orgin: "background", purpose : "onIframesCounted", count : count, tabId : tabId});
	};
	
	var onAlreadyInjected = function(tabId){
		chrome.runtime.sendMessage({orgin: "background", purpose : "onAlreadyInjected", tabId : tabId});
	};
	
	var getTabState = function(tabId){
		return _tabsState[tabId];
	};
	
	
	var doIfCanInjectToTabId = function(tabId, callback){
		chrome.tabs.get(tabId, 
			function (t) { 
				if(t){
					doIfCanInjectToUrl(t.url, callback);
				}
			}
		);
	};
	
	var doIfCanInjectToUrl = function(url, callback){
		chrome.permissions.contains({
		  origins: [url]
		}, function(result) {
			if (result) {
				callback();
			}
		});
	};
	
	return {
		init : init,
		injectAndRunReplaceScript : injectAndRunReplaceScript,
		setAutorun : setAutorun,
		getAutorun : getAutorun,
		onContentReplaced: onContentReplaced,
		onIframesCounted : onIframesCounted,
		getTabState : getTabState,
		getPopupFramesShow : getPopupFramesShow,
		setPopupFramesShow : setPopupFramesShow,
		setRunAsProxy : setRunAsProxy,
		getRunAsProxy : getRunAsProxy,
		startExtension : startExtension,
		restartExtension : restartExtension
	};
}();
chromeextension.youtubehttspreplacer.background.init(chromeextension.youtubehttspreplacer.youtubereplacer);
chromeextension.youtubehttspreplacer.background.startExtension();