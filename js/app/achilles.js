(function ()
{
	var datasource_folder = 'sample';

	curl(["jquery", "d3", "knockout", "bootstrap"], function ($, d3, ko)
	{
		function summaryViewModel()
		{
			var self = this;

			self.data = ko.observable();
			self.conditionsData = ko.observable();
			self.personData = ko.observable();
			self.observationPeriodsData = ko.observable();

			self.formatSI = function (d, p)
			{
				if (d < 1)
				{
					return d3.round(d, p);
				}
				var prefix = d3.formatPrefix(d);
				return d3.round(prefix.scale(d), p) + prefix.symbol;
			}

			self.load = function (filename)
			{
				$.ajax(
				{
					type: "GET",
					url: "data/" + filename,
					contentType: "application/json; charset=utf-8",
				}).done(function (result)
				{
					self.data(result);
				});
			}

			self.loadObservationPeriods = function (folder)
			{
				$.ajax(
				{
					type: "GET",
					url: "data/" + folder + '/observationperiod.json',
					contentType: "application/json; charset=utf-8",
				}).done(function (result)
				{
					self.observationPeriodsData(result);
				});
			}

			self.loadPerson = function (folder)
			{
				$.ajax(
				{
					type: "GET",
					url: "data/" + folder + '/person.json',
					contentType: "application/json; charset=utf-8",
				}).done(function (result)
				{
					self.personData(result);
				});
			}

			self.loadConditions = function (folder)
			{
				$.ajax(
				{
					type: "GET",
					url: 'data/' + folder + '/treemap_path.json',
					contentType: "application/json; charset=utf-8",
					success: function (data)
					{
						self.conditionsData(data);
					}
				});
			}

		}

		var viewModel = new summaryViewModel();
		viewModel.data.subscribe(function (newData)
		{
			update(newData);
		});
		viewModel.conditionsData.subscribe(function (newData)
		{
			updateConditions(newData);
		});
		viewModel.personData.subscribe(function (newData)
		{
			updatePerson(newData);
		});
		viewModel.observationPeriodsData.subscribe(function (newData)
		{
			updateObservationPeriods(newData);
		});

		function buildHierarchyFromJSON(data)
		{
			var root = {
				"name": "root",
				"children": []
			};
			for (var i = 0; i < data.ConceptPath.length; i++)
			{
				var sequence = data.ConceptPath[i];
				var size = data.num_persons[i]; // change from num_persons
				if (isNaN(size))
				{ // e.g. if this is a header row
					continue;
				}
				var parts = sequence.split("-");
				var currentNode = root;
				for (var j = 0; j < parts.length; j++)
				{
					var children = currentNode["children"];
					var nodeName = parts[j];
					var childNode;
					if (j + 1 < parts.length)
					{
						// Not yet at the end of the sequence; move down the tree.
						var foundChild = false;
						for (var k = 0; k < children.length; k++)
						{
							if (children[k]["name"] == nodeName)
							{
								childNode = children[k];
								foundChild = true;
								break;
							}
						}
						// If we don't already have a child node for this branch, create it.
						if (!foundChild)
						{
							childNode = {
								"name": nodeName,
								"children": []
							};
							children.push(childNode);
						}
						currentNode = childNode;
					}
					else
					{
						// Reached the end of the sequence; create a leaf node.
						childNode = {
							"name": nodeName,
							"size": size
						};
						children.push(childNode);
					}
				}
			}
			return root;
		};

		function update(data)
		{
			var result = data;

			curl(["jnj/chart", "common"], function (jnj_chart, common)
			{
				d3.selectAll("#reportDashboard #genderPie svg").remove();
				genderDonut = new jnj_chart.donut();
				genderDonut.render(common.mapGenderData(result.GenderData), "#reportDashboard #genderPie", 260, 100,
				{
					colors: d3.scale.ordinal()
						.domain([8532, 8551, 8507])
						.range(['#884444', '#ccc', '#444488']),
					margin:
					{
						top: 5,
						bottom: 10,
						right: 150,
						left: 10
					}

				});

				d3.selectAll("#reportDashboard #visitTypePie svg").remove();
				visitDonut = new jnj_chart.donut();
				visitDonut.render(common.mapVisitData(result.VisitTypeBarchart), "#reportDashboard #visitTypePie", 260, 100,
				{
					margin:
					{
						top: 5,
						bottom: 10,
						right: 150,
						left: 10
					}
				});

				d3.selectAll("#reportDashboard #agehist svg").remove();
				var ageHistogram = new jnj_chart.histogram();
				ageHistogram.render(common.mapHistogram(result.AgeIndexHistogram), "#reportDashboard #agehist", 400, 200);

				d3.selectAll("#reportDashboard #ageboxplot svg").remove();
				var ageIndexBoxplot = new jnj_chart.horizontalBoxplot();
				ageIndexBoxplot.render(result.AgeIndexBoxplot, "#reportDashboard #ageboxplot", 400, 10);

				d3.selectAll("#reportDashboard #yearhist svg").remove();
				var yearHistogram = new jnj_chart.histogram();
				yearHistogram.render(common.mapHistogram(result.YearIndexHistogram), "#reportDashboard #yearhist", 400, 200,
				{
					xformat: 'd'
				});

				d3.selectAll("#reportDashboard #yearboxplot svg").remove();
				var yearIndexBoxplot = new jnj_chart.horizontalBoxplot();
				yearIndexBoxplot.render(result.YearIndexBoxplot, "#reportDashboard #yearboxplot", 400, 10);
			});
		}

		function updateObservationPeriods(data)
		{
			var result = data;

			curl(["jnj/chart", "common"], function (jnj_chart, common)
			{
				d3.selectAll("#reportObservationPeriods #agebygender svg").remove();
				agegenderboxplot = new jnj_chart.boxplot();
				var agData = result.AgeByGender.Category
					.map(function (d, i)
					{
						var item = {
							Category: this.Category[i],
							min: this.min[i],
							LIF: this.LIF[i],
							q1: this.q1[i],
							median: this.median[i],
							q3: this.q3[i],
							UIF: this.UIF[i],
							max: this.max[i]
						};
						return item;
					}, result.AgeByGender);
				agegenderboxplot.render(agData, "#reportObservationPeriods #agebygender", 180, 135);

				d3.selectAll("#reportObservationPeriods #ageatfirstobservation svg").remove();
				var ageAtFirstObservationHistogram = new jnj_chart.histogram();
				ageAtFirstObservationHistogram.render(common.mapBarToHistogram(result.AgeAtFirstObservation, 1), "#reportObservationPeriods #ageatfirstobservation", 425, 150,
				{
					xformat: 'd'
				});

				d3.selectAll("#reportObservationPeriods #cumulativeobservation svg").remove();
				var cumulativeObservationHistogram = new jnj_chart.areachart();
				cumulativeObservationHistogram.render(common.mapBarToHistogram(result.CumulativeDuration, 30), "#reportObservationPeriods #cumulativeobservation", 300, 100,
				{
					xformat: 'd'
				});

				d3.selectAll("#reportObservationPeriods #cumulativeobservationBar svg").remove();
				var cumulativeObservationHistogram = new jnj_chart.histogram();
				cumulativeObservationHistogram.render(common.mapBarToHistogram(result.CumulativeDuration, 30), "#reportObservationPeriods #cumulativeobservationBar", 300, 100,
				{
					xformat: 'd'
				});
			});
		}

		function updateConditions(data)
		{
			var result = data;
			curl(["jnj/chart", "common"], function (jnj_chart, common)
			{
				d3.selectAll("#reportConditions svg").remove();

				tree = buildHierarchyFromJSON(data);
				var treemap = new jnj_chart.treemap();
				treemap.render(tree, '#reportConditions .treemap', 1000, 500,
				{
					gettitle: function (node)
					{
						current = node;
						title = '';
						while (current.parent)
						{
							if (current.parent.name != 'root')
							{
								if (title == '')
								{
									title = '<b>' + current.parent.name + '</b>';
								}
								title = current.parent.name + ' <br> ' + title;
							}
							current = current.parent;
						}
						return title;
					}
				});

			});
		}

		function updatePerson(data)
		{
			var result = data;

			curl(["jnj/chart", "common"], function (jnj_chart, common)
			{
				d3.selectAll("#reportPerson #genderPie svg").remove();
				genderDonut = new jnj_chart.donut();
				genderDonut.render(common.mapGenderData(result.GenderData), "#reportPerson #genderPie", 260, 130,
				{
					colors: d3.scale.ordinal()
						.domain([8532, 8551, 8507])
						.range(['#884444', '#ccc', '#444488']),
					margin:
					{
						top: 5,
						bottom: 10,
						right: 150,
						left: 10
					}

				});

				d3.selectAll("#reportPerson #raceTypePie svg").remove();
				raceDonut = new jnj_chart.donut();
				raceDonut.render(common.mapConceptData(result.RaceData), "#reportPerson #raceTypePie", 260, 130,
				{
					margin:
					{
						top: 5,
						bottom: 10,
						right: 150,
						left: 10
					}
				});

				d3.selectAll("#reportPerson #ethnicityTypePie svg").remove();
				raceDonut = new jnj_chart.donut();
				raceDonut.render(common.mapConceptData(result.EthnicityData), "#reportPerson #ethnicityTypePie", 260, 130,
				{
					margin:
					{
						top: 5,
						bottom: 10,
						right: 150,
						left: 10
					}
				});

				d3.selectAll("#reportPerson #birthyearhist svg").remove();
				var yearHistogram = new jnj_chart.histogram();
				yearHistogram.render(common.mapBarToHistogram(result.BirthYearData, 1), "#reportPerson #birthyearhist", 800, 200,
				{
					xformat: 'd'
				});
			});
		}

		curl(["knockout-amd-helpers"], function ()
		{
			ko.amdTemplateEngine.defaultPath = "../templates";
			ko.applyBindings(viewModel);
		});

		curl(["sammy"], function (Sammy)
		{
			var app = Sammy(function ()
			{
				this.get('#/:folder/dashboard', function (context)
				{
					$('.report').hide();
					// change this json file to dashboard.json
					viewModel.load(this.params['folder'] + '/cdm4_sim.json');
					$('#reportDashboard').show();
				});

				this.get('#/:folder/person', function (context)
				{
					$('.report').hide();
					viewModel.loadPerson(this.params['folder']);
					$('#reportPerson').show();
				});

				this.get('#/:folder/conditions', function (context)
				{
					$('.report').hide();

					viewModel.loadConditions(this.params['folder']);

					$('#reportConditions').show();
				});

				this.get('#/:folder/observationperiods', function (context)
				{
					$('.report').hide();

					viewModel.loadObservationPeriods(this.params['folder']);

					$('#reportObservationPeriods').show();
				});

			});

			$(function ()
			{
				app.run('#/' + datasource_folder + '/dashboard');
			});
		});
	});
})();
