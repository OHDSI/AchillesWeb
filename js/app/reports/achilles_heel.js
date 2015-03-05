		(function () {
			define(["jquery", "datatables", "datatables-colvis"], function ($) {
				var achilles_heel = {};

				achilles_heel.render = function (datasource) {
					$('#reportAchillesHeel svg').remove();
				
					$.ajax({
						type: "GET",
						url: getUrlFromData(datasource, "achillesheel"),
						contentType: "application/json; charset=utf-8",
						success: function (data) {
							table_data = [];

							for (i = 0; i < data.MESSAGES.ATTRIBUTEVALUE.length; i++) {
								temp = data.MESSAGES.ATTRIBUTEVALUE[i];
								message_type = temp.substring(0, temp.indexOf(':'));
								message_content = temp.substring(temp.indexOf(':') + 1);

								table_data[i] = {
									'type': message_type,
									'content': message_content
								};
							}

							datatable = $('#achillesheel_table').DataTable({
								dom: 'Clfrtip',
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
								lengthChange: false,
								deferRender: true,
								destroy: true
							});

							$('#reportAchillesHeel').show();
						}
					});
				}

				return achilles_heel;
			});
		})();
