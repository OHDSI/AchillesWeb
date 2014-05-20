(function ()
{
	var datasource_folder = 'sample';

	curl(["jquery", "d3", "knockout", "app/reports/condition_occurrence", "bootstrap", "d3/tip"], function ($, d3, ko, reportConditionOccurrence)
	{
		function summaryViewModel()
		{
			var self = this;

			self.summaryData = ko.observable();
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
					self.summaryData(result);
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
		viewModel.summaryData.subscribe(function (newData)
		{
			updateSummary(newData);
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

		function updateSummary(data)
		{
			var result = data;

			curl(["jnj/chart", "common"], function (jnj_chart, common)
			{
				d3.selectAll("#reportDashboard #genderPie svg").remove();
				genderDonut = new jnj_chart.donut();
				genderDonut.render(common.mapConceptData(result.GenderData), "#reportDashboard #genderPie", 260, 100,
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
				visitDonut.render(common.mapConceptData(result.VisitTypeBarchart), "#reportDashboard #visitTypePie", 260, 100,
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
				ageHistogram.render(common.mapHistogram(result.AgeIndexHistogram), "#reportDashboard #agehist", 400, 200,
				{
					xLabel: "Age",
					yLabel: "People",
					boxplot: result.AgeIndexBoxplot
				});

				d3.selectAll("#reportDashboard #yearhist svg").remove();
				var yearHistogram = new jnj_chart.histogram();
				yearHistogram.render(common.mapHistogram(result.YearIndexHistogram), "#reportDashboard #yearhist", 400, 200,
				{
					xFormat: 'd',
					xLabel: "Year",
					yLabel: "People",
					boxplot: result.YearIndexBoxplot
				});

			});
		}

		function updateObservationPeriods(data)
		{
			var result = data;

			curl(["jnj/chart", "common"], function (jnj_chart, common)
			{
				d3.selectAll("#reportObservationPeriods #agebygender svg").remove();
				var agegenderboxplot = new jnj_chart.boxplot();
				var agData = result.AgeByGender.Category
					.map(function (d, i)
					{
						var item = {
							Category: this.Category[i],
							min: this.MinValue[i],
							LIF: this.P10Value[i],
							q1: this.P25Value[i],
							median: this.MedianValue[i],
							q3: this.P75Value[i],
							UIF: this.P90Value[i],
							max: this.MaxValue[i]
						};
						return item;
					}, result.AgeByGender);
				agegenderboxplot.render(agData, "#reportObservationPeriods #agebygender", 220, 210,
				{
					xLabel: "Gender",
					yLabel: "Age"
				});

				d3.selectAll("#reportObservationPeriods #ageatfirstobservation svg").remove();
				var ageAtFirstObservationHistogram = new jnj_chart.histogram();
				ageAtFirstObservationHistogram.render(common.mapHistogram(result.AgeAtFirstObservationHistogram), "#ageatfirstobservation", 460, 195,
				{
					xFormat: 'd',
					xLabel: 'Age',
					yLabel: 'People'
				});

				d3.selectAll("#reportObservationPeriods #observationlength svg").remove();
				var observationLengthHistogram = new jnj_chart.histogram();
				observationLengthHistogram.render(common.mapHistogram(result.ObservationLengthHistogram), "#observationlength", 460, 195,
				{
					xFormat: 's',
					xLabel: 'Days',
					yLabel: 'People'
				});

				d3.selectAll("#reportObservationPeriods #cumulativeobservation svg").remove();
				var cumulativeObservationLine = new jnj_chart.line();
				var cumulativeData = result.CumulativeDuration.XLengthOfObservation
					.map(function (d, i)
					{
						var item = {
							xValue: this.XLengthOfObservation[i],
							yValue: this.YPercentPersons[i]
						};
						return item;
					}, result.CumulativeDuration);

				cumulativeObservationLine.render(cumulativeData, "#reportObservationPeriods #cumulativeobservation", 360, 200,
				{
					xFormat: "s",
					yFormat: "0%",
					interpolate: "step-before",
					xLabel: 'Days',
					yLabel: 'Percent of Population',
					margin:
					{
						top: 10,
						left: 40,
						right: 40,
						bottom: 10
					}
				});

				d3.selectAll("#reportObservationPeriods #opbygender svg").remove();
				var opbygenderboxplot = new jnj_chart.boxplot();
				var opgData = result.ObservationPeriodLengthByGender.Category
					.map(function (d, i)
					{
						var item = {
							Category: this.Category[i],
							min: this.MinValue[i],
							LIF: this.P10Value[i],
							q1: this.P25Value[i],
							median: this.MedianValue[i],
							q3: this.P75Value[i],
							UIF: this.P90Value[i],
							max: this.MaxValue[i]
						};
						return item;
					}, result.ObservationPeriodLengthByGender);
				opbygenderboxplot.render(opgData, "#reportObservationPeriods #opbygender", 220, 210,
				{
					xLabel: 'Gender',
					yLabel: 'Days'
				});

				d3.selectAll("#reportObservationPeriods #opbyage svg").remove();
				var opbyageboxplot = new jnj_chart.boxplot();
				var opaData = result.ObservationPeriodLengthByAge.Category
					.map(function (d, i)
					{
						var item = {
							Category: this.Category[i],
							min: this.MinValue[i],
							LIF: this.P10Value[i],
							q1: this.P25Value[i],
							median: this.MedianValue[i],
							q3: this.P75Value[i],
							UIF: this.P90Value[i],
							max: this.MaxValue[i]
						};
						return item;
					}, result.ObservationPeriodLengthByAge);
				opbyageboxplot.render(opaData, "#reportObservationPeriods #opbyage", 360, 200,
				{
					xLabel: 'Age Decile',
					yLabel: 'Days'
				});

				d3.selectAll("#reportObservationPeriods #oppeoplebyyear svg").remove();
				var observationLengthHistogram = new jnj_chart.histogram();
				observationLengthHistogram.render(common.mapHistogram(result.ObservedByYearHistogram), "#reportObservationPeriods #oppeoplebyyear", 460, 195,
				{
					xFormat: 'd',
					xLabel: 'Year',
					yLabel: 'People'
				});

				/*
				d3.selectAll("#reportObservationPeriods #oppeoplebymonth svg").remove();
				var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
				var observationByMonth = new jnj_chart.line();
				observationByMonth.render(common.mapMonthYearDataToSeriesByYear(result.ObservedByMonth,
				{
					dateField: 'MonthYear',
					yValue: 'CountValue',
					yPercent: 'PercentValue'
				}), "#reportObservationPeriods #oppeoplebymonth", 460, 195,
				{
					xScale: d3.scale.ordinal().domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
					tickPadding: 10,
					tickFormat: function (d)
					{
						return monthNames[d - 1];
					},
					margin:
					{
						top: 5,
						right: 25,
						bottom: 5,
						left: 40
					},
					showSeriesLabel: true,
					colorScale: d3.scale.category10(),
					xLabel: "Month",
					yLabel: "People"
				});
				*/

				var byMonthSeries = common.mapMonthYearDataToSeries(result.ObservedByMonth,
				{
					dateField: 'MonthYear',
					yValue: 'CountValue',
					yPercent: 'PercentValue'
				});
				
				d3.selectAll("#reportObservationPeriods #oppeoplebymonthsingle svg").remove();
				var observationByMonthSingle = new jnj_chart.line();
				observationByMonthSingle.render(byMonthSeries, "#reportObservationPeriods #oppeoplebymonthsingle", 660, 195,
				{
					xScale: d3.time.scale().domain(d3.extent(byMonthSeries[0].values, function(d) { return d.xValue;})),
					tickFormat: d3.time.format("%m/%Y"),
					tickPadding: 10,
					margin:
					{
						top: 5,
						right: 25,
						bottom: 5,
						left: 40
					},
					xLabel: "Date",
					yLabel: "People"
				});
				

				d3.selectAll("#reportObservationPeriods #opperperson svg").remove();
				raceDonut = new jnj_chart.donut();
				raceDonut.render(common.mapConceptData(result.PersonPeriodsData), "#reportObservationPeriods #opperperson", 285, 235,
				{
					margin:
					{
						top: 5,
						bottom: 10,
						right: 50,
						left: 10
					}
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
				genderDonut.render(common.mapConceptData(result.GenderData), "#reportPerson #genderPie", 260, 130,
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
				yearHistogram.render(common.mapHistogram(result.BirthYearHistogram), "#reportPerson #birthyearhist", 460, 195,
				{
					xFormat: 'd',
					xLabel: 'Year',
					yLabel: 'People'
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

					reportConditionOccurrence.render(this.params['folder']);

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
