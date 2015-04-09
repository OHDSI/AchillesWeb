
	var page_vm =  {};
	var report = 'dashboard';

	function Achilles(datasourceURL, containerName , urlDom){
		this.datasource = datasourceURL;
		$.ajax(urlDom).done(function(data){
				$(containerName).append(data);
				curl( ["achilles"], function(callback){
					callback();
				});
			});	
		
		
	}

	function updateReport(value) {
		report = value;
		updateRoute();
	}

	function setDatasource(index) {
		page_vm.datasource(page_vm.datasources[index]);
		updateRoute();
	}

	function updateRoute() {
		$('.reportDrilldown').addClass('hidden');
		document.location = '#/' + page_vm.datasource().name + '/' + report;
	}

	
