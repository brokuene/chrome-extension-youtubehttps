var chromeextension = chromeextension || {};
chromeextension.youtubehttspreplacer = chromeextension.youtubehttspreplacer || {};
chromeextension.youtubehttspreplacer.popup = function(){

	var autorun = false;
	var showFrames = false;
	
	var _settings = { 
		autorunChbox : null,
		refreshBtn : null,
		framesChangedLink : null,
		framesAll : null,
		replacesDiv : null
	};
	
	var getFramesChangedDiv = function(){
		return document.getElementById(_settings.framesChangedLink);
	};
	
	var getFramesAllDiv = function(){
		return document.getElementById(_settings.framesAll);
	};
	
	var getReplacesContainer = function(){
		return document.getElementById(_settings.replacesDiv);
	};
	
	var getBackgroundLogic = function(){
		return chrome.extension.getBackgroundPage().chromeextension.youtubehttspreplacer.background;
	};
	
	var init = function(options){
		Object.keys(options).forEach(
			function(key){
				_settings[key] = options[key];
			}
		);
	
		loadStateFromBackground();

		if(!autorun){
			setUpListenersFromBackground();
		}
		setUpPageEventListeners();
		performReplaceOrUpdateAction();
	};
	
	var loadStateFromBackground = function() {
		var bg = getBackgroundLogic();
		autorun = bg.getAutorun();
		var chbx = document.getElementById(_settings.autorunChbox);
		chbx.checked = autorun;
		showFrames = bg.getPopupFramesShow();
		updateShowFramesDivVisibility();
	};
	
	var setUpPageEventListeners = function(){
		var chbx = document.getElementById(_settings.autorunChbox);
		chbx.addEventListener('click', onAutorunBtnClick);
		var refbtn = document.getElementById(_settings.refreshBtn);
		refbtn.addEventListener('click', performReplaceOrUpdateAction);
		var framesLink = getFramesChangedDiv();
		framesLink.addEventListener('click', showFramesAllClick);
	};
	
	var performReplaceOrUpdateAction = function(){
		if(!autorun){
			injectAndRunReplaceScript();
		}
		else {
			applyCurrentStateFromBackground();
		}
	};
	
	var setUpListenersFromBackground = function(){
		chrome.runtime.onMessage.addListener(
		  function(request, sender, sendResponse) {
				if (request.orgin == "background"){
					if(request.purpose == "onContentReplaced"){
						onNextContextReplaced(request.tabId, request.oldSrc, request.newSrc);
					}
					else if (request.purpose == "onIframesCounted"){
						onIframeCounted(request.tabId, request.count);
					}
					else if (request.purpose == "onAlreadyInjected"){
						applyStateFromBackground(request.tabId);
					}
				}
			}
		);
	};
	
	var onIframeCounted = function(tabId, count){
		getFramesAllDiv().innerHTML = count;
	};
	
	var onNextContextReplaced = function (tabId, oldSrc, newSrc){
		var framesChanged = getFramesChangedDiv();
		var current = framesChanged.innerHTML;
		var parsedCurrent = parseInt(current);
		if (isNaN(parsedCurrent)){
			framesChanged.innerHTML = "1";
		}
		else
		{
			framesChanged.innerHTML = ++parsedCurrent;
		}
		addNewFrameToContainer(oldSrc,newSrc);
	};
	
	var injectAndRunReplaceScript = function (){
		chrome.tabs.query(
			{ currentWindow: true, active: true },
			function (tabArray) { 
				if(tabArray && tabArray[0]){
					getBackgroundLogic().injectAndRunReplaceScript(tabArray[0].id);
				};
			}
		);
	};
	
	var onAutorunBtnClick = function(e){
		setAutorun(e.srcElement.checked);
	};
	
	var setAutorun = function(enabled){
		autorun = enabled;
		getBackgroundLogic().setAutorun(enabled);
	};
	
	var applyCurrentStateFromBackground = function(){
		chrome.tabs.query(
			{ currentWindow: true, active: true },
			function (tabArray) { 
				if(tabArray && tabArray[0]){
					applyStateFromBackground(tabArray[0].id);
				};
			}
		);
	};
	
	var applyStateFromBackground = function(tabId){
		var state = getBackgroundLogic().getTabState(tabId);
		if(state){
			setTabState(state);
		}
	};
	
	var setTabState = function(state){
		getFramesChangedDiv().innerHTML = state.replacedCount;
		getFramesAllDiv().innerHTML = state.framesCount;
		for(var i = 0; i < state.replacedLinks.length; i++){
			addNewFrameToContainer(state.replacedLinks[i].oldSrc, state.replacedLinks[i].newSrc);
		}
	};
	
	var showFramesAllClick = function(){
		setShowFrames(!getBackgroundLogic().getPopupFramesShow());
		updateShowFramesDivVisibility();
	};
	
	var setShowFrames = function(enabled){
		showFrames = enabled;
		getBackgroundLogic().setPopupFramesShow(enabled);
	};
	
	var updateShowFramesDivVisibility = function(){
		var div = getReplacesContainer();
		if (showFrames){
			div.style.display = 'block';
		}
		else {
			div.style.display = 'none';
		}
	};
	
	var addNewFrameToContainer = function(oldSrc, newSrc){
		var div = getReplacesContainer();
		var allFramesInContainer = div.childNodes.length;
		var newEl = document.createElement('div');
		var newElText = document.createTextNode(++allFramesInContainer + "# ");
		newEl.appendChild(newElText);
		newEl.appendChild(createLinkElement(oldSrc));
		newElText = document.createTextNode(' \u2192 ');
		newEl.appendChild(newElText);
		newEl.appendChild(createLinkElement(newSrc));
		div.appendChild(newEl);
	};
	
	var createLinkElement = function (src){
		var newEl = document.createElement('a');
		var newElText = document.createTextNode(src);
		newEl.appendChild(newElText);
		var srcAttr = document.createAttribute('href');
		srcAttr.nodeValue = src;
		newEl.setAttributeNode(srcAttr);
		return newEl;
	};

	return {
		init : init
	};
}();

document.addEventListener('DOMContentLoaded', function () {
	chromeextension.youtubehttspreplacer.popup.init({ 
		autorunChbox : 'autorunbtn',
		refreshBtn : 'refreshBtn',
		framesChangedLink : 'framesChanged',
		framesAll : 'framesAll',
		replacesDiv : 'replaces'
	});
});
