var chromeextension = chromeextension || {};
chromeextension.youtubehttspreplacer = chromeextension.youtubehttspreplacer || {};
chromeextension.youtubehttspreplacer.inlinescripts = function(){

	var debug = true;
	//var youtubeVideoRegex = /^(http)?(:\/\/)?(www.)?(youtube.com\/embed.*)$/igm;
	var _replacer = null;
	var iframesLength = 0;
	
	var starReplacer = function(replacer){
		_replacer = replacer;
		document.addEventListener('DOMNodeInserted', function(e) { 
			if(e.target && e.target.tagName == 'IFRAME'){
				iframesLength = document.getElementsByTagName('iframe').length;
				informAboutIframes(iframesLength);
				changeIframeSrcIfNeeded(e.target);
			}
		});
		changeYoutubeLinks();
	};
	
	var changeYoutubeLinks = function(){
		var iframes = document.getElementsByTagName('iframe');
		iframesLength = iframes.length;
		informAboutIframes(iframesLength);
		for(var i = 0; i < iframesLength; i++){ 
			changeIframeSrcIfNeeded(iframes[i]);
		};
	};
	
	var changeIframeSrcIfNeeded = function(iframe){
		if(_replacer.isUrlToEmbededYoutubeVideo(iframe.src) && iframe.src){
			var oldSrc = iframe.src;
			var newSrc = _replacer.getReplacedUrl(iframe.src);
			if(debug){
				console.debug('Replaced iframe src: ' +  oldSrc + ' to: ' + newSrc);
			}
			iframe.src = newSrc;
			informAboutReplace(oldSrc, newSrc);
		}
	};
	
	var informAboutReplace = function(oldSrc, newSrc){
		chrome.runtime.sendMessage({orgin: "youtubereplace", purpose : "informAboutReplace", oldSrc : oldSrc, newSrc: newSrc});
	};
	
	var informAboutIframes = function(count){
		chrome.runtime.sendMessage({orgin: "youtubereplace", purpose : "informAboutIframes", count : count});
	};
	
	return {
		starReplacer : starReplacer
	}
}();
chromeextension.youtubehttspreplacer.inlinescripts.starReplacer(chromeextension.youtubehttspreplacer.youtubereplacer);
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.orgin == "youtubereplace" && request.purpose == "checkIfTabHasInjected")
            sendResponse({message: "script injected"});
 });