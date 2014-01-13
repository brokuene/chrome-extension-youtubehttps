var chromeextension = chromeextension || {};
chromeextension.youtubehttspreplacer = chromeextension.youtubehttspreplacer || {};
chromeextension.youtubehttspreplacer.youtubereplacer = function (){
	
	var youtubeVideoRegex = /^(http)?(:\/\/)?(www.)?(youtube.com\/embed.*)$/igm;
	
	var isUrlToEmbededYoutubeVideo = function(urlString){
		var r = youtubeVideoRegex;
		var result = r.test(urlString);
		return result;
	};
	
	var getReplacedUrl = function(urlString){
		return urlString.replace(youtubeVideoRegex,"https://$3$4");
	};
	
	var fastReplaceProtocol = function(urlString){
		return urlString.replace("http","https");
	};
	
	return {
		getReplacedUrl : getReplacedUrl,
		isUrlToEmbededYoutubeVideo : isUrlToEmbededYoutubeVideo,
		fastReplaceProtocol : fastReplaceProtocol
	}
}();