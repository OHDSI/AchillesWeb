		(function () {
			define(["jquery", "datatables", "datatables-tabletools", "datatables-colvis"], function ($) {
				var achilles_performance = {};

				achilles_performance.render = function (datasource) {
					$('#reportAchillesPerformance svg').remove();
				
					$.ajax({
						type: "GET",
						url: getUrlFromData(datasource, "achillesperformance"),
						contentType: "application/json; charset=utf-8",
						success: function (data) {
							table_data = [];
							console.log(data);

							for (i = 0; i < data.MESSAGES.ANALYSISID.length; i++) {
								analysis_id = parseInt(data.MESSAGES.ANALYSISID[i]);
                                analysis_name = data.MESSAGES.ANALYSISNAME[i];
                                elapsed_seconds = data.MESSAGES.ELAPSEDSECONDS[i];

								table_data[i] = {
                                    'analysis_id': analysis_id,
									'analysis_name': analysis_name,
									'elapsed_seconds': elapsed_seconds
								};
							}

							datatable = $('#achillesperformance_table').DataTable({
								dom: 'lfrt<"row"<"col-sm-4" i ><"col-sm-4" T ><"col-sm-4" p >>',
								tableTools: {
            			         "sSwfPath": "js/swf/copy_csv_xls_pdf.swf"
        				        },
								data: table_data,
								columns: [
                                    {
										data: 'analysis_id',
										visible: true,
                                        width: 50
									},
									{
										data: 'analysis_name',
										visible: true,
										width:200
									},
                                    {
										data: 'elapsed_seconds',
										visible: true,
                                        width: 100
									}
								],
								pageLength: 10,
								lengthChange: true,
								deferRender: true,
								destroy: true
							});

							$('#reportAchillesPerformance').show();
						}
					});
				}

				return achilles_performance;
			});
		})();
