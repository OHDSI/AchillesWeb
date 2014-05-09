(function ()
{

	var jsonFile = "premier.json";

	curl(["jquery", "d3", "knockout", "bootstrap"], function ($, d3, ko)
	{
		function summaryViewModel()
		{
			var self = this;

			self.data = ko.observable();

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
		}

		function update(data)
		{
			var result = data;

			curl(["jnj/chart", "common"], function (jnj_chart, common)
			{
				d3.selectAll("#genderPie svg").remove();
				genderDonut = new jnj_chart.donut();
				genderDonut.render(common.mapGenderData(result.GenderData), "#genderPie", 260, 130,
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

				d3.selectAll("#visitTypePie svg").remove();
				visitDonut = new jnj_chart.donut();
				visitDonut.render(common.mapVisitData(result.VisitTypeBarchart), "#visitTypePie", 260, 130,
				{
					margin:
					{
						top: 5,
						bottom: 10,
						right: 150,
						left: 10
					}
				});

				d3.selectAll("#agehist svg").remove();
				var ageHistogram = new jnj_chart.histogram();
				ageHistogram.render(common.mapHistogram(result.AgeIndexHistogram), "#agehist", 400, 200);

				d3.selectAll("#ageboxplot svg").remove();
				var ageIndexBoxplot = new jnj_chart.horizontalBoxplot();
				ageIndexBoxplot.render(result.AgeIndexBoxplot, "#ageboxplot", 400, 10);

				d3.selectAll("#yearhist svg").remove();
				var yearHistogram = new jnj_chart.histogram();
				yearHistogram.render(common.mapHistogram(result.YearIndexHistogram), "#yearhist", 400, 200,
				{
					xformat: 'd'
				});

				d3.selectAll("#yearboxplot svg").remove();
				var yearIndexBoxplot = new jnj_chart.horizontalBoxplot();
				yearIndexBoxplot.render(result.YearIndexBoxplot, "#yearboxplot", 400, 10);
			});
		}


		var viewModel = new summaryViewModel();
		viewModel.data.subscribe(function (newData)
		{
			update(newData);
		});

		curl(["knockout-amd-helpers"], function ()
		{
			ko.amdTemplateEngine.defaultPath = "../templates";
			ko.applyBindings(viewModel);
		});

		curl(["sammy"], function (Sammy)
		{
			var app = Sammy(function ()
			{
				this.get('#/:filename', function (context)
				{
					viewModel.load(this.params['filename']);
				});
			});

			$(function ()
			{
				app.run('#/premier.json');
			});
		});
	});
})();