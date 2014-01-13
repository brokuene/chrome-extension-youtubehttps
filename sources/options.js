var chromeextension = chromeextension || {};
chromeextension.youtubehttspreplacer = chromeextension.youtubehttspreplacer || {};
chromeextension.youtubehttspreplacer.options = function(){
	var _settings = {
		runAsProxyChbxId : null,
		saveBtnId : null,
		runAsDivId : null,
		optionsSavedStateId : null,
		unsavedCssName : null
	};
	
	var _formState = {
		isUnsaved : false
	};
	
	var _consts = {
		descrForRunningAsProxy : "Extension runs in background (recommended) and behaves as proxy. For some crappy pages it works better. There is no pop-ups, etc. Save memory and resources.",
		descrForRunningAsExtension : "Runs as regular extension. You have more control, can decide where to run replace and see what was already done.",
		unsaved : "Unsaved",
		saved : "Saved"
	};
	
	var init = function (options){
		Object.keys(options).forEach(
			function(key){
				_settings[key] = options[key];
			}
		);
		setUpFormEventListeners();
		loadStateFromBackground();
	};
	
	var setUpFormEventListeners = function (){
		document.getElementById(_settings.runAsProxyChbxId).addEventListener('click', onRunAsProxyClick);
		document.getElementById(_settings.saveBtnId).addEventListener('click', onSaveClick);
	};
	
	var onRunAsProxyClick = function(e){
		_formState.isUnsaved = true;
		updateFormSaveStateInfo();
		updateFormRunAsStateDescription(e.srcElement.checked);
	};
	
	var onSaveClick = function(){
		if (_formState.isUnsaved){
			var runAsProxy = document.getElementById(_settings.runAsProxyChbxId).checked;
			setRunAsProxy(runAsProxy);
			_formState.isUnsaved = false;
			updateFormSaveStateInfo();
			getBackgroundLogic().restartExtension();
		}
	};
	
	var setRunAsProxy = function(enabled){
		getBackgroundLogic().setRunAsProxy(enabled);
	};
	var getBackgroundLogic = function(){
		return chrome.extension.getBackgroundPage().chromeextension.youtubehttspreplacer.background;
	};
	
	var loadStateFromBackground = function(){
		var bg = getBackgroundLogic();
		var runAsProxy = bg.getRunAsProxy();
		document.getElementById(_settings.runAsProxyChbxId).checked = runAsProxy;
		updateFormRunAsStateDescription(runAsProxy);
	};
	
	var updateFormSaveStateInfo = function(){
		var el = document.getElementById(_settings.optionsSavedStateId);
		if(_formState.isUnsaved){
			el.className = _settings.unsavedCssName;
			el.innerHTML = _consts.unsaved;
		}
		else {
			el.className = '';
			el.innerHTML = _consts.saved;
		}
	};
	
	var updateFormRunAsStateDescription = function(runAsProxy){
		var descr = document.getElementById(_settings.runAsDivId);
		if(runAsProxy){
			descr.innerHTML = _consts.descrForRunningAsProxy;
		}
		else {
			descr.innerHTML = _consts.descrForRunningAsExtension;
		}
	};
	
	return {
		init: init
	}
}();

document.addEventListener('DOMContentLoaded', function () {
  chromeextension.youtubehttspreplacer.options.init( 
	{ runAsProxyChbxId : 'runAsProxyChbx', saveBtnId : 'saveBtn', runAsDivId : 'runAsDiv' , optionsSavedStateId : 'optionsSavedState', unsavedCssName : 'unsaved'}
  );
});