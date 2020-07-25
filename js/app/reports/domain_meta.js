		(function () {
			define(["jquery", "datatables", "datatables-tabletools", "datatables-colvis"], function ($) {
				var domain_meta = {};
            
				domain_meta.render = function (datasource) {				
				$('#reportDomainMeta svg').remove();
					
					$.ajax({
						type: "GET",
						url: getUrlFromData(datasource, "domainmeta"),
						contentType: "application/json; charset=utf-8",
                        fail: function() {
                            $('#reportDomainMeta').append("Domain Meta not available")
                        },
						success: function (data) {
							table_data = [];

							for (i = 0; i < data.MESSAGES.ATTRIBUTEVALUE.length; i++) {
								table_data[i] = {
									'type': data.MESSAGES.ATTRIBUTENAME[i],
									'content': data.MESSAGES.ATTRIBUTEVALUE[i]
								};
							}

							datatable = $('#domainmeta_table').DataTable({
								dom: 'lfrt<"row"<"col-sm-4" i ><"col-sm-4" T ><"col-sm-4" p >>',
								tableTools: {
						"sSwfPath": "js/swf/copy_csv_xls_pdf.swf"
        				},
								data: table_data,
								columns: [
									{
										data: 'type',
										visible: true,
										width:200
									},
									{
										data: 'content',
										visible: true
									}
								],
								pageLength: 15,
								lengthChange: true,
								deferRender: true,
								destroy: true
							});

							$('#reportDomainMeta').show();
						}
					});
				}

				return domain_meta;
			});
		})();
