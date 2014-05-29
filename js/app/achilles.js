(function () {
	curl([
		"jquery",
		"d3",
		"knockout",
		"app/reports/condition_occurrence",
		"app/reports/drug_exposure",
		"bootstrap",
		"d3/tip"
	], function ($, d3, ko, reportConditionOccurrence, reportDrugExposure) {
		function summaryViewModel() {
			var self = this;

			self.summaryData = ko.observable();
			self.conditionsData = ko.observable();
			self.personData = ko.observable();
			self.observationPeriodsData = ko.observable();
			self.datasource = ko.observable({
				name: 'loading...'
			});
			self.datasources = [];

			self.formatSI = function (d, p) {
				if (d < 1) {
					return d3.round(d, p);
				}
				var prefix = d3.formatPrefix(d);
				return d3.round(prefix.scale(d), p) + prefix.symbol;
			}

			self.loadDashboard = function () {
				$.ajax({
					type: "GET",
					url: "data/" + self.datasource().folder + "/dashboard.json",
					contentType: "application/json; charset=utf-8",
				}).done(function (result) {
					self.summaryData(result);
				});
			}

			self.loadObservationPeriods = function () {
				$.ajax({
					type: "GET",
					url: "data/" + self.datasource().folder + '/observationperiod.json',
					contentType: "application/json; charset=utf-8",
				}).done(function (result) {
					self.observationPeriodsData(result);
				});
			}

			self.loadPerson = function () {
				$.ajax({
					type: "GET",
					url: "data/" + self.datasource().folder + '/person.json',
					contentType: "application/json; charset=utf-8",
				}).done(function (result) {
					self.personData(result);
				});
			}

			self.loadConditions = function (folder) {
				$.ajax({
					type: "GET",
					url: 'data/' + folder + '/treemap_path.json',
					contentType: "application/json; charset=utf-8",
					success: function (data) {
						self.conditionsData(data);
					}
				});
			}

		}

		var viewModel = new summaryViewModel();
		page_vm = viewModel;

		viewModel.summaryData.subscribe(function (newData) {
			updateSummary(newData);
		});
		viewModel.conditionsData.subscribe(function (newData) {
			updateConditions(newData);
		});
		viewModel.personData.subscribe(function (newData) {
			updatePerson(newData);
		});
		viewModel.observationPeriodsData.subscribe(function (newData) {
			updateObservationPeriods(newData);
		});

		function updateSummary(data) {
			var result = data;

			curl(["jnj/chart", "common"], function (jnj_chart, common) {
				d3.selectAll("#reportDashboard #genderPie svg").remove();
				genderDonut = new jnj_chart.donut();
				genderDonut.render(common.mapConceptData(result.GenderData), "#reportDashboard #genderPie", 260, 100, {
					colors: d3.scale.ordinal()
						.domain([8532, 8551, 8507])
						.range(['#884444', '#ccc', '#444488']),
					margin: {
						top: 5,
						bottom: 10,
						right: 150,
						left: 10
					}

				});

				d3.selectAll("#reportDashboard #visitTypePie svg").remove();
				visitDonut = new jnj_chart.donut();
				visitDonut.render(common.mapConceptData(result.VisitTypeBarchart), "#reportDashboard #visitTypePie", 260, 100, {
					margin: {
						top: 5,
						bottom: 10,
						right: 150,
						left: 10
					}
				});

				d3.selectAll("#reportDashboard #agehist svg").remove();
				var ageHistogram = new jnj_chart.histogram();
				ageHistogram.render(common.mapHistogram(result.AgeIndexHistogram), "#reportDashboard #agehist", 400, 200, {
					xLabel: "Age",
					yLabel: "People",
					boxplot: result.AgeIndexBoxplot
				});

				d3.selectAll("#reportDashboard #yearhist svg").remove();
				var yearHistogram = new jnj_chart.histogram();
				yearHistogram.render(common.mapHistogram(result.YearIndexHistogram), "#reportDashboard #yearhist", 400, 200, {
					xFormat: 'd',
					xLabel: "Year",
					yLabel: "People",
					boxplot: result.YearIndexBoxplot
				});

			});
		}

		function updateObservationPeriods(data) {
			var result = data;

			curl(["jnj/chart", "common"], function (jnj_chart, common) {
				d3.selectAll("#reportObservationPeriods #agebygender svg").remove();
				var agegenderboxplot = new jnj_chart.boxplot();
				var agData = result.AGE_BY_GENDER.CATEGORY
					.map(function (d, i) {
						var item = {
							Category: this.CATEGORY[i],
							min: this.MIN_VALUE[i],
							LIF: this.P10_VALUE[i],
							q1: this.P25_VALUE[i],
							median: this.MEDIAN_VALUE[i],
							q3: this.P75_VALUE[i],
							UIF: this.P90_VALUE[i],
							max: this.MAX_VALUE[i]
						};
						return item;
					}, result.AGE_BY_GENDER);
				agegenderboxplot.render(agData, "#reportObservationPeriods #agebygender", 220, 210, {
					xLabel: "Gender",
					yLabel: "Age"
				});

				d3.selectAll("#reportObservationPeriods #ageatfirstobservation svg").remove();
				var ageAtFirstObservationData = common.mapHistogram(result.AGE_AT_FIRST_OBSERVATION_HISTOGRAM)
				var ageAtFirstObservationHistogram = new jnj_chart.histogram();
				ageAtFirstObservationHistogram.render(ageAtFirstObservationData, "#ageatfirstobservation", 460, 195, {
					xFormat: d3.format('d'),
					xLabel: 'Age',
					yLabel: 'People'
				});

				d3.selectAll("#reportObservationPeriods #observationlength svg").remove();
				var observationLengthData = common.mapHistogram(result.OBSERVATION_LENGTH_HISTOGRAM)
				var observationLengthXLabel = 'Days';
				if (observationLengthData[observationLengthData.length - 1].x - observationLengthData[0].x > 1000) {
					observationLengthData.forEach(function (d) {
						d.x = d.x / 365.25;
						d.dx = d.dx / 365.25;
					});
					observationLengthXLabel = 'Years';
				}
				var observationLengthHistogram = new jnj_chart.histogram();
				observationLengthHistogram.render(observationLengthData, "#observationlength", 460, 195, {
					xLabel: observationLengthXLabel,
					yLabel: 'People'
				});

				d3.selectAll("#reportObservationPeriods #cumulativeobservation svg").remove();
				var cumulativeObservationLine = new jnj_chart.line();
				var cumulativeData = result.CUMULATIVE_DURATION.X_LENGTH_OF_OBSERVATION
					.map(function (d, i) {
						var item = {
							xValue: this.X_LENGTH_OF_OBSERVATION[i],
							yValue: this.Y_PERCENT_PERSONS[i]
						};
						return item;
					}, result.CUMULATIVE_DURATION);

				var cumulativeObservationXLabel = 'Days';
				if (cumulativeData.slice(-1)[0].xValue - cumulativeData[0].xValue > 1000) {
					// convert x data to years
					cumulativeData.forEach(function (d) {
						d.xValue = d.xValue / 365.25;
					});
					cumulativeObservationXLabel = 'Years';
				}

				cumulativeObservationLine.render(cumulativeData, "#reportObservationPeriods #cumulativeobservation", 360, 200, {
					xFormat: d3.format('s'),
					yFormat: d3.format('0%'),
					interpolate: "step-before",
					xLabel: cumulativeObservationXLabel,
					yLabel: 'Percent of Population',
					margin: {
						top: 10,
						left: 40,
						right: 40,
						bottom: 10
					}
				});

				d3.selectAll("#reportObservationPeriods #opbygender svg").remove();
				var opbygenderboxplot = new jnj_chart.boxplot();
				var opgData = result.OBSERVATION_PERIOD_LENGTH_BY_GENDER.CATEGORY
					.map(function (d, i) {
						var item = {
							Category: this.CATEGORY[i],
							min: this.MIN_VALUE[i],
							LIF: this.P10_VALUE[i],
							q1: this.P25_VALUE[i],
							median: this.MEDIAN_VALUE[i],
							q3: this.P75_VALUE[i],
							UIF: this.P90_VALUE[i],
							max: this.MAX_VALUE[i]
						};
						return item;
					}, result.OBSERVATION_PERIOD_LENGTH_BY_GENDER);

				var opgDataYlabel = 'Days';
				var opgDataMinY = d3.min(opgData, function (d) {
					return d.min;
				});
				var opgDataMaxY = d3.max(opgData, function (d) {
					return d.max;
				});
				if ((opgDataMaxY - opgDataMinY) > 1000) {
					opgData.forEach(function (d) {
						d.min = d.min / 365.25;
						d.LIF = d.LIF / 365.25;
						d.q1 = d.q1 / 365.25;
						d.median = d.median / 365.25;
						d.q3 = d.q3 / 365.25;
						d.UIF = d.UIF / 365.25;
						d.max = d.max / 365.25;
					});
					opgDataYlabel = 'Years';
				}

				opbygenderboxplot.render(opgData, "#reportObservationPeriods #opbygender", 220, 210, {
					xLabel: 'Gender',
					yLabel: opgDataYlabel
				});

				d3.selectAll("#reportObservationPeriods #opbyage svg").remove();
				var opbyageboxplot = new jnj_chart.boxplot();
				var opaData = result.OBSERVATION_PERIOD_LENGTH_BY_AGE.CATEGORY
					.map(function (d, i) {
						var item = {
							Category: this.CATEGORY[i],
							min: this.MIN_VALUE[i],
							LIF: this.P10_VALUE[i],
							q1: this.P25_VALUE[i],
							median: this.MEDIAN_VALUE[i],
							q3: this.P75_VALUE[i],
							UIF: this.P90_VALUE[i],
							max: this.MAX_VALUE[i]
						};
						return item;
					}, result.OBSERVATION_PERIOD_LENGTH_BY_AGE);

				var opaDataYlabel = 'Days';
				var opaDataMinY = d3.min(opaData, function (d) {
					return d.min;
				});
				var opaDataMaxY = d3.max(opaData, function (d) {
					return d.max;
				});
				if ((opaDataMaxY - opaDataMinY) > 1000) {
					opaData.forEach(function (d) {
						d.min = d.min / 365.25;
						d.LIF = d.LIF / 365.25;
						d.q1 = d.q1 / 365.25;
						d.median = d.median / 365.25;
						d.q3 = d.q3 / 365.25;
						d.UIF = d.UIF / 365.25;
						d.max = d.max / 365.25;
					});
					opaDataYlabel = 'Years';
				}

				opbyageboxplot.render(opaData, "#reportObservationPeriods #opbyage", 360, 200, {
					xLabel: 'Age Decile',
					yLabel: opaDataYlabel
				});

				d3.selectAll("#reportObservationPeriods #oppeoplebyyear svg").remove();
				var observationLengthHistogram = new jnj_chart.histogram();
				observationLengthHistogram.render(common.mapHistogram(result.OBSERVED_BY_YEAR_HISTOGRAM), "#reportObservationPeriods #oppeoplebyyear", 460, 195, {
					xFormat: d3.format('d'),
					xLabel: 'Year',
					yLabel: 'People'
				});

				var byMonthSeries = common.mapMonthYearDataToSeries(result.OBSERVED_BY_MONTH, {
					dateField: 'MONTH_YEAR',
					yValue: 'COUNT_VALUE',
					yPercent: 'PERCENT_VALUE'
				});

				d3.selectAll("#reportObservationPeriods #oppeoplebymonthsingle svg").remove();
				var observationByMonthSingle = new jnj_chart.line();
				observationByMonthSingle.render(byMonthSeries, "#reportObservationPeriods #oppeoplebymonthsingle", 900, 250, {
					xScale: d3.time.scale().domain(d3.extent(byMonthSeries[0].values, function (d) {
						return d.xValue;
					})),
					tickFormat: d3.time.format("%Y"),
					tickPadding: 10,
					margin: {
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
				raceDonut.render(common.mapConceptData(result.PERSON_PERIODS_DATA), "#reportObservationPeriods #opperperson", 285, 235, {
					margin: {
						top: 5,
						bottom: 10,
						right: 50,
						left: 10
					}
				});
			});
		}

		function updateConditions(data) {
			var result = data;
			curl(["jnj/chart", "common"], function (jnj_chart, common) {
				d3.selectAll("#reportConditionOccurrences svg").remove();

				tree = buildHierarchyFromJSON(data);
				var treemap = new jnj_chart.treemap();
				treemap.render(tree, '#reportConditionOccurrences .treemap', 1000, 500, {
					gettitle: function (node) {
						current = node;
						title = '';
						while (current.parent) {
							if (current.parent.name != 'root') {
								if (title == '') {
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

		function updatePerson(data) {
			var result = data;

			data.SUMMARY.ATTRIBUTE_VALUE.forEach(function (d, i, a) {
				if (!isNaN(d))
					data.SUMMARY.ATTRIBUTE_VALUE[i] = viewModel.formatSI(d, 2);
			});

			curl(["jnj/chart", "common"], function (jnj_chart, common) {
				d3.selectAll("#reportPerson #genderPie svg").remove();
				genderDonut = new jnj_chart.donut();
				genderDonut.render(common.mapConceptData(result.GENDER_DATA), "#reportPerson #genderPie", 260, 130, {
					colors: d3.scale.ordinal()
						.domain([8532, 8507])
						.range(['#884444', '#444488']),
					margin: {
						top: 5,
						bottom: 10,
						right: 150,
						left: 10
					}

				});

				d3.selectAll("#reportPerson #raceTypePie svg").remove();
				raceDonut = new jnj_chart.donut();
				raceDonut.render(common.mapConceptData(result.RACE_DATA), "#reportPerson #raceTypePie", 260, 130, {
					margin: {
						top: 5,
						bottom: 10,
						right: 150,
						left: 10
					}
				});

				d3.selectAll("#reportPerson #ethnicityTypePie svg").remove();
				raceDonut = new jnj_chart.donut();
				raceDonut.render(common.mapConceptData(result.ETHNICITY_DATA), "#reportPerson #ethnicityTypePie", 260, 130, {
					margin: {
						top: 5,
						bottom: 10,
						right: 150,
						left: 10
					}
				});

				d3.selectAll("#reportPerson #birthyearhist svg").remove();
				var yearHistogram = new jnj_chart.histogram();
				yearHistogram.render(common.mapHistogram(result.BIRTH_YEAR_HISTOGRAM), "#reportPerson #birthyearhist", 460, 195, {
					xFormat: d3.format('d'),
					xLabel: 'Year',
					yLabel: 'People'
				});
			});
		}

		curl(["knockout-amd-helpers"], function () {
			ko.amdTemplateEngine.defaultPath = "../templates";
			ko.applyBindings(viewModel);
		});

		curl(["sammy"], function (Sammy) {
			var app = Sammy(function () {
				this.get('#/:folder/dashboard', function (context) {
					$('.report').hide();
					viewModel.datasource(viewModel.datasources.filter(function (d) {
						return d.folder == this.params['folder'];
					}, this)[0]);
					viewModel.loadDashboard();
					$('#reportDashboard').show();
					report = 'dashboard';
				});

				this.get('#/:folder/person', function (context) {
					$('.report').hide();
					viewModel.datasource(viewModel.datasources.filter(function (d) {
						return d.folder == this.params['folder'];
					}, this)[0]);
					viewModel.loadPerson();
					$('#reportPerson').show();
					report = 'person';
				});

				this.get('#/:folder/conditions', function (context) {
					$('.report').hide();
					viewModel.datasource(viewModel.datasources.filter(function (d) {
						return d.folder == this.params['folder'];
					}, this)[0]);

					reportConditionOccurrence.render(this.params['folder']);
					$('#reportConditionOccurrences').show();
					report = 'conditions';
				});

				this.get('#/:folder/drugs', function (context) {
					$('.report').hide();
					viewModel.datasource(viewModel.datasources.filter(function (d) {
						return d.folder == this.params['folder'];
					}, this)[0]);

					reportDrugExposure.render(this.params['folder']);
					$('#reportDrugExposures').show();
					report = 'conditions';
				});

				this.get('#/:folder/observationperiods', function (context) {
					$('.report').hide();
					viewModel.datasource(viewModel.datasources.filter(function (d) {
						return d.folder == this.params['folder'];
					}, this)[0]);
					viewModel.loadObservationPeriods();
					$('#reportObservationPeriods').show();
					report = 'observationperiods';
				});

			});

			$(function () {
				$.ajax({
					type: "GET",
					url: 'data/datasources.json',
					contentType: "application/json; charset=utf-8"
				}).done(function (root) {
					viewModel.datasources = root.datasources;

					for (i = 0; i < root.datasources.length; i++) {
						$('#dropdown-datasources').append('<li onclick="setDatasource(' + i + ');">' + root.datasources[i].name + '</li>');
					}
					viewModel.datasource(viewModel.datasources[0]);
					app.run('#/' + viewModel.datasource().folder + '/dashboard');
				});

			});
		});
	});
})();
