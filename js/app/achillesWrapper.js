	

	define(["jquery"], function($){
		
		var wrap = {};
		wrap.render = function (datasourceURL, containerName , urlDom, callback){
			this.datasource = datasourceURL;
			$.ajax(urlDom).done(function(data){
					$(containerName).append(data);
					if(callback !== undefined) callback();
				}
			);	
		}
		return wrap;
	}
);
	
	
	
