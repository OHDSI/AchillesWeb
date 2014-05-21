		(function () {
			define(["jquery", "d3", "jnj/chart", "datatables"], function ($, d3, jnj_chart) {
				var condition_occurrence = {};
				var t = 0;
				var threshold;

				// bind to all matching elements upon creation
				$(document).on('click', '#tableBody tr', function () {
					id = $(this).children(':first').text();
					condition_occurrence.drilldown(id);
				});

				$('#myTab a').click(function (e) {
					e.preventDefault()
					$(this).tab('show')
				})

				condition_occurrence.drilldown = function (concept_id) {
					$('.drilldown svg').remove();
					$.ajax({
						type: "GET",
						url: 'data/sample/conditions/condition_' + concept_id + '.json',
						success: function (data) {

							// age at first diagnosis visualization
							var boxplot = new jnj_chart.boxplot();
							bpseries = [];
							bpdata = data.AgeAtFirstDiagnosis;
							for (i = 0; i < bpdata.Category.length; i++) {
								bpseries.push({
									Category: bpdata.Category[i],
									max: bpdata.MaxValue[i],
									median: bpdata.MedianValue[i],
									LIF: bpdata.P10Value[i],
									q1: bpdata.P25Value[i],
									q3: bpdata.P75Value[i],
									UIF: bpdata.P90Value[i]
								});
							}
							boxplot.render(bpseries, "#ageAtFirstDiagnosis", 300, 300);

							// condition type visualization
							var donut = new jnj_chart.donut();
							slices = [];
							for (i = 0; i < data.ConditionsByType.ConceptName.length; i++) {
								slices.push({
									id: data.ConditionsByType.ConceptName[i],
									label: data.ConditionsByType.ConceptName[i],
									value: data.ConditionsByType.CountValue[i]
								})
							}
							donut.render(slices, "#conditionsByType", 400, 400, {
								margin: {
									top: 5,
									left: 5,
									right: 200,
									bottom: 5
								}
							});
						}
					});
				}

				condition_occurrence.render = function (folder) {
					$('#reportConditionOccurrences svg').remove();

					width = 1000;
					height = 250;
					minimum_area = 50;
					threshold = minimum_area / (width * height);

					$.ajax({
						type: "GET",
						url: 'data/' + folder + '/treemap_path.json',
						contentType: "application/json; charset=utf-8",
						success: function (data) {

							loadTable(data);
							$('#example').dataTable({
								'pageLength':5,
								'lengthChange': false,
								'deferRender': true,
								'destroy': true
							});
							$('#reportConditionOccurrences').show();

							tree = buildHierarchyFromJSON(data, threshold);
							var treemap = new jnj_chart.treemap();
							treemap.render(tree, '#treemap_container', width, height, {
								onclick: function (concept_id) {
									condition_occurrence.drilldown(concept_id)
								},
								gettitle: function (node) {
									title = '';
									steps = node.path.split('-');
									for (i = steps.length - 1; i >= 0; i--) {
										if (i == steps.length - 1) {
											title += '<div class="pathleaf">' + steps[i] + '</div>';
										} else {
											title += '<div class="pathstep">' + steps[i] + '</div>';
										}
									}
									return title;
								}
							});
						}

					});
				}

				function loadTable(data) {
					for (var i = 0; i < data.ConceptPath.length; i++) {
						t += data.num_persons[i];
						conceptDetails = data.ConceptPath[i].split('-');
						$('#tableBody').append('<tr><td>' + data.concept_id[i] + '</td><td>' + conceptDetails[0] + '</td><td>' + conceptDetails[1] + '</td><td>' + conceptDetails[2] + '</td><td>' + conceptDetails[3] + '</td><td>' + conceptDetails[4] + '</td><td>' + data.num_persons[i] + '</td><td>' + data.pct[i] + '</td></tr>');
					}
				}

				function buildHierarchyFromJSON(data, threshold) {
					var root = {
						"name": "root",
						"children": []
					};
					for (var i = 0; i < data.ConceptPath.length; i++) {
						var path = data.ConceptPath[i];
						var size = data.num_persons[i]; // change from num_persons
						var id = data.concept_id[i];
						var pct = data.pct[i];
						if (isNaN(size)) { // e.g. if this is a header row
							continue;
						}
						var parts = path.split("-");
						var currentNode = root;
						for (var j = 0; j < parts.length; j++) {
							var children = currentNode["children"];
							var nodeName = parts[j];
							var childNode;
							if (j + 1 < parts.length) {
								// Not yet at the end of the path; move down the tree.
								var foundChild = false;
								for (var k = 0; k < children.length; k++) {
									if (children[k]["name"] == nodeName) {
										childNode = children[k];
										foundChild = true;
										break;
									}
								}
								// If we don't already have a child node for this branch, create it.
								if (!foundChild) {
									childNode = {
										"name": nodeName,
										"children": []
									};
									children.push(childNode);
								}
								currentNode = childNode;
							} else {
								// Reached the end of the path; create a leaf node.
								childNode = {
									"name": nodeName,
									"size": size,
									"id": id,
									"path": path,
									"pct": pct
								};
								if ((size / t) > threshold) {
									children.push(childNode);
								}
							}
						}
					}
					return root;
				};
				return condition_occurrence;
			});
		})();
