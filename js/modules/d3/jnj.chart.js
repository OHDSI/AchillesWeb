(function () {
	var chart = {
		version: "0.0.1"
	};
	var $;
	var d3;

	chart.util = chart.util || {};
	chart.util.wrap = function (text, width) {
		text.each(function () {
			var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1, // ems
				y = text.attr("y"),
				dy = parseFloat(text.attr("dy")),
				tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
				}
			}
		});
	}

	chart.donut = function () {

		this.render = function (data, target, w, h, options) {

			var defaults = {
				colors: d3.scale.category10(),
				margin: {
					top: 5,
					right: 75,
					bottom: 5,
					left: 10
				}
			};

			var options = $.extend({}, defaults, options);

			var width = w - options.margin.left - options.margin.right,
				or = width / 2,
				ir = width / 6;

			var total = 0;
			data.forEach(function (d) {
				total += +d.value;
			});

			var chart = d3.select(target)
				.append("svg:svg")
				.data([data])
				.attr("width", w)
				.attr("height", h)
				.attr("viewBox", "0 0 " + w + " " + h);

			var vis = chart.append("g")
				.attr("transform", "translate(" + or + "," + or + ")");

			var legend = chart.append("g")
				.attr("transform", "translate(" + (w - options.margin.right) + ",0)")
				.attr("class", "legend");

			var arc = d3.svg.arc()
				.innerRadius(ir)
				.outerRadius(or);

			var pie = d3.layout.pie() //this will create arc data for us given a list of values
				.value(function (d) {
					return d.value > 0 ? Math.max(d.value, total * .015) : 0; // we want slices to appear if they have data, so we return a minimum of 1.5% of the overall total if the datapoint has a value > 0.
				}); //we must tell it out to access the value of each element in our data array

			var arcs = vis.selectAll("g.slice") //this selects all <g> elements with class slice (there aren't any yet)
				.data(pie) //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
				.enter() //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
				.append("svg:g") //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
				.attr("class", "slice"); //allow us to style things in the slices (like text)

			arcs.append("svg:path")
				.attr("fill", function (d) {
					return options.colors(d.data.id);
				}) //set the color for each slice to be chosen from the color function defined above
			.attr("stroke", "#fff")
				.attr("stroke-width", 2)
				.attr("title", function (d) {
					return d.label;
				})
				.attr("d", arc); //this creates the actual SVG path using the associated data (pie) with the arc drawing function

			legend.selectAll('rect')
				.data(function (d) {
					return d;
				})
				.enter()
				.append("rect")
				.attr("x", 0)
				.attr("y", function (d, i) {
					return i * 15;
				})
				.attr("width", 10)
				.attr("height", 10)
				.style("fill", function (d) {
					return options.colors(d.id);
				});

			legend.selectAll('text')
				.data(function (d) {
					return d;
				})
				.enter()
				.append("text")
				.attr("x", 12)
				.attr("y", function (d, i) {
					return (i * 15) + 9;
				})
				.text(function (d) {
					return d.label;
				});

			$(window).on("resize", {
					container: $(target),
					chart: $(target + " svg"),
					aspect: w / h
				},
				function (event) {
					var targetWidth = event.data.container.width();
					event.data.chart.attr("width", targetWidth);
					event.data.chart.attr("height", Math.round(targetWidth / event.data.aspect));
				}).trigger("resize");
		}
	}

	chart.histogram = function () {

		this.render = function (data, target, w, h, options) {
			var defaults = {
				xformat: ',.0f',
				yformat: 's'
			};

			var options = $.extend({}, defaults, options);


			var margin = {
					top: 20,
					right: 30,
					bottom: 20,
					left: 40
				},
				width = w - margin.left - margin.right,
				height = h - margin.top - margin.bottom;

			// this function asusmes data has been transfomred into a d3.layout.histogram structure
			var formatCount = d3.format(options.xformat);

			var x = d3.scale.linear()
				.domain([d3.min(data, function (d) {
					return d.x;
				}), d3.max(data, function (d) {
					return d.x + d.dx;
				})])
				.range([0, width]);

			var y = d3.scale.linear()
				.domain([0, d3.max(data, function (d) {
					return d.y;
				})])
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom")
				.ticks(10)
				.tickFormat(d3.format(options.xformat));

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.ticks(4)
				.tickFormat(d3.format(options.yformat));

			var chart;
			var isNew = false; // this is a flag to determine if chart has already been ploted on this target.
			if (!$(target + " svg")[0]) {
				chart = d3.select(target).append("svg")
					.attr("width", w)
					.attr("height", h)
					.attr("viewBox", "0 0 " + w + " " + h);
				isNew = true;
			} else {
				chart = d3.select(target + " svg");
			}

			var hist = chart.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var bar = hist.selectAll(".bar")
				.data(data)
				.enter().append("g")
				.attr("class", "bar")
				.attr("transform", function (d) {
					return "translate(" + x(d.x) + "," + y(d.y) + ")";
				});

			bar.append("rect")
				.attr("x", 1)
				.attr("width", function (d) {
					return x(d.x + d.dx) - x(d.x) - 1;
				})
				.attr("height", function (d) {
					return height - y(d.y);
				});

			if (isNew) {
				hist.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);

				hist.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(0," + 0 + ")")
					.call(yAxis);

				$(window).on("resize", {
						container: $(target),
						chart: $(target + " svg"),
						aspect: w / h
					},
					function (event) {
						var targetWidth = event.data.container.width();
						event.data.chart.attr("width", targetWidth);
						event.data.chart.attr("height", Math.round(targetWidth / event.data.aspect));
					}).trigger("resize");
			}
		}
	}

	chart.horizontalBoxplot = function () {
		this.render = function (data, target, w, h) {
			var margin = {
					top: 0,
					right: 30,
					bottom: 0,
					left: 40
				},
				width = w - margin.left - margin.right,
				height = h - margin.top - margin.bottom;

			var whiskerHeight = h / 2;
			var boxHeight = height;

			var x = d3.scale.linear()
				.domain([data.min, data.max])
				.range([0, width]);

			var chart;
			if (!$(target + " svg")[0]) {
				chart = d3.select(target).append("svg")
					.attr("class", "boxplot")
					.attr("width", w)
					.attr("height", h)
					.attr("viewBox", "0 0 " + w + " " + h);
			} else {
				chart = d3.select(target + " svg");
			}

			var boxplot = chart.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			if (data.LIF != data.q1) // draw whisker
			{
				boxplot.append("line")
					.attr("class", "bar")
					.attr("x1", x(data.LIF))
					.attr("y1", (height / 2) - (whiskerHeight / 2))
					.attr("x2", x(data.LIF))
					.attr("y2", (height / 2) + (whiskerHeight / 2))
				boxplot.append("line")
					.attr("class", "whisker")
					.attr("x1", x(data.LIF))
					.attr("y1", height / 2)
					.attr("x2", x(data.q1))
					.attr("y2", height / 2)
			}

			boxplot.append("rect")
				.attr("class", "box")
				.attr("x", x(data.q1))
				.attr("width", x(data.q3) - x(data.q1))
				.attr("height", height);

			boxplot.append("line")
				.attr("class", "median")
				.attr("x1", x(data.median))
				.attr("y1", 0)
				.attr("x2", x(data.median))
				.attr("y2", height);

			if (data.UIF != data.q3) // draw whisker
			{
				boxplot.append("line")
					.attr("class", "bar")
					.attr("x1", x(data.UIF))
					.attr("y1", (height / 2) - (whiskerHeight / 2))
					.attr("x2", x(data.UIF))
					.attr("y2", (height / 2) + (whiskerHeight / 2))
				boxplot.append("line")
					.attr("class", "whisker")
					.attr("x1", x(data.q3))
					.attr("y1", height / 2)
					.attr("x2", x(data.UIF))
					.attr("y2", height / 2)
			}

			$(window).on("resize", {
					container: $(target),
					chart: $(target + " svg"),
					aspect: w / h
				},
				function (event) {
					var targetWidth = event.data.container.width();
					event.data.chart.attr("width", targetWidth);
					event.data.chart.attr("height", Math.round(targetWidth / event.data.aspect));
				}).trigger("resize");

		}
	}

	chart.boxplot = function () {
		this.render = function (data, target, w, h, options) {
			var defaults = {
				rotate: 0,
				colors: d3.scale.category10(),
				textAnchor: 'middle',
				showLabels: false,
				margin: {
					top: 10,
					right: 10,
					bottom: 20,
					left: 20
				},
			};

			var options = $.extend({}, defaults, options);

			var width = w - options.margin.left - options.margin.right;
			var height = h - options.margin.top - options.margin.bottom;

			var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], (1.0 / data.length))
				.domain(data.map(function (d) {
					return d.Category;
				}));

			var y = d3.scale.linear()
				.range([height, 0])
				.domain([0, options.yMax || d3.max(data, function (d) {
					return d.max;
				})]);

			var whiskerWidth = x.rangeBand() / 2
			var whiskerOffset = whiskerWidth / 2;

			// draw main box and whisker plots
			var svg;
			if (!$(target + " svg")[0]) {
				svg = d3.select(target).append("svg")
					.attr("width", w)
					.attr("height", h)
					.attr("viewBox", "0 0 " + w + " " + h);
			} else {
				svg = d3.select(target + " svg");
			}

			var chart = svg.append("g")
				.attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

			var boxplots = chart.selectAll(".boxplot")
				.data(data)
				.enter().append("g")
				.attr("class", "boxplot")
				.attr("transform", function (d) {
					return "translate(" + x(d.Category) + ",0)";
				});

			// for each g element (containing the boxplot render surface), draw the whiskers, bars and rects
			boxplots.each(function (d, i) {
				var boxplot = d3.select(this);
				if (d.LIF != d.q1) // draw whisker
				{
					boxplot.append("line")
						.attr("class", "bar")
						.attr("x1", whiskerOffset)
						.attr("y1", y(d.LIF))
						.attr("x2", x.rangeBand() - whiskerOffset)
						.attr("y2", y(d.LIF))
					boxplot.append("line")
						.attr("class", "whisker")
						.attr("x1", x.rangeBand() / 2)
						.attr("y1", y(d.LIF))
						.attr("x2", x.rangeBand() / 2)
						.attr("y2", y(d.q1))
				}

				boxplot.append("rect")
					.attr("class", "box")
					.attr("x", 0)
					.attr("y", y(d.q3))
					.attr("width", x.rangeBand())
					.attr("height", y(d.q1) - y(d.q3));

				boxplot.append("line")
					.attr("class", "median")
					.attr("x1", 0)
					.attr("y1", y(d.median))
					.attr("x2", x.rangeBand())
					.attr("y2", y(d.median));

				if (d.UIF != d.q3) // draw whisker
				{
					boxplot.append("line")
						.attr("class", "bar")
						.attr("x1", whiskerOffset)
						.attr("y1", y(d.UIF))
						.attr("x2", x.rangeBand() - whiskerOffset)
						.attr("y2", y(d.UIF))
					boxplot.append("line")
						.attr("class", "whisker")
						.attr("x1", x.rangeBand() / 2)
						.attr("y1", y(d.UIF))
						.attr("x2", x.rangeBand() / 2)
						.attr("y2", y(d.q3))
				}
				// to do: add max/min indicators


			});

			// draw x and y axis
			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");

			chart.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

			chart.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(0," + 0 + ")")
				.call(yAxis);


			$(window).on("resize", {
					container: $(target),
					chart: $(target + " svg"),
					aspect: w / h
				},
				function (event) {
					var targetWidth = event.data.container.width();
					event.data.chart.attr("width", targetWidth);
					event.data.chart.attr("height", Math.round(targetWidth / event.data.aspect));
				}).trigger("resize");

		}
	}

	chart.barchart = function () {
		this.render = function (data, target, w, h, options) {
			var defaults = {
				label: 'label',
				value: 'value',
				rotate: 0,
				colors: d3.scale.category10(),
				textAnchor: 'middle',
				showLabels: false
			};

			var options = $.extend({}, defaults, options);

			var label = options.label;
			var value = options.value;


			var total = 0;
			for (d = 0; d < data.length; d++) {
				total = total + data[d][value];
			}

			var margin = {
					top: 20,
					right: 10,
					bottom: 25,
					left: 10
				},
				width = w - margin.left - margin.right,
				height = h - margin.top - margin.bottom;

			var commaseparated = d3.format(',');
			var formatpercent = d3.format('.1%');

			var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], (1.0 / data.length));

			var y = d3.scale.linear()
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.tickSize(2, 0)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");

			var svg = d3.select(target).append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("viewBox", "0 0 " + w + " " + h)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.attr("class", "barchart");

			x.domain(data.map(function (d) {
				return d[label];
			}));
			y.domain([0, options.yMax || d3.max(data, function (d) {
				return d[value];
			})]);

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + (height + 1) + ")")
				.call(xAxis)
				.selectAll(".tick text")
				.style("text-anchor", options.textAnchor)
				.attr("transform", function (d) {
					return "rotate(" + options.rotate + ")"
				});

			if (options.wrap) {
				svg.selectAll(".tick text")
					.call(chart.util.wrap, x.rangeBand());
			}

			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", function (d) {
					return x(d[label]);
				})
				.attr("width", x.rangeBand())
				.attr("y", function (d) {
					return y(d[value]);
				})
				.attr("height", function (d) {
					return height - y(d[value]);
				})
				.attr("title", function (d) {
					temp_title = d[label] + ": " + commaseparated(d[value], ",")
					if (total > 0) {
						temp_title = temp_title + ' (' + formatpercent(d[value] / total) + ')';
					} else {
						temp_title = temp_title + ' (' + formatpercent(0) + ')';
					}
					return temp_title;
				})
				.style("fill", function (d) {
					return options.colors(d[label]);
				});

			if (options.showLabels) {
				svg.selectAll(".barlabel")
					.data(data)
					.enter()
					.append("text")
					.attr("class", "barlabel")
					.text(function (d) {
						return formatpercent(d[value] / total);
					})
					.attr("x", function (d) {
						return x(d[label]) + x.rangeBand() / 2;
					})
					.attr("y", function (d) {
						return y(d[value]) - 3;
					})
					.attr("text-anchor", "middle");
			}

			$(window).on("resize", {
					container: $(target),
					chart: $(target + " svg"),
					aspect: w / h
				},
				function (event) {
					var targetWidth = event.data.container.width();
					event.data.chart.attr("width", targetWidth);
					event.data.chart.attr("height", Math.round(targetWidth / event.data.aspect));
				}).trigger("resize");
		}
	}

	chart.areachart = function () {
		this.render = function (data, target, w, h, options) {
			var defaults = {
				margin: {
					top: 20,
					right: 30,
					bottom: 20,
					left: 40
				},
				xformat: ',.0f',
				yformat: 's'
			};
			var options = $.extend({}, defaults, options);

			var width = w - options.margin.left - options.margin.right,
				height = h - options.margin.top - options.margin.bottom;

			var x = d3.scale.linear()
				.domain(d3.extent(data, function (d) {
					return d.x;
				}))
				.range([0, width]);

			var y = d3.scale.linear()
				.domain([0, d3.max(data, function (d) {
					return d.y;
				})])
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.tickFormat(d3.format(options.xformat))
				.ticks(10)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.tickFormat(d3.format(options.yformat))
				.ticks(4)
				.orient("left");

			var area = d3.svg.area()
				.x(function (d) {
					return x(d.x);
				})
				.y0(height)
				.y1(function (d) {
					return y(d.y);
				});

			var chart = d3.select(target)
				.append("svg:svg")
				.data(data)
				.attr("width", w)
				.attr("height", h)
				.attr("viewBox", "0 0 " + w + " " + h);

			var vis = chart.append("g")
				.attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

			vis.append("path")
				.datum(data)
				.attr("class", "area")
				.attr("d", area);

			vis.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

			vis.append("g")
				.attr("class", "y axis")
				.call(yAxis)

			$(window).on("resize", {
					container: $(target),
					chart: $(target + " svg"),
					aspect: w / h
				},
				function (event) {
					var targetWidth = event.data.container.width();
					event.data.chart.attr("width", targetWidth);
					event.data.chart.attr("height", Math.round(targetWidth / event.data.aspect));
				}).trigger("resize");
		}
	}

	chart.treemap = function () {
		var self = this;

		var root,
			node,
			nodes,
			treemap,
			svg,
			width,
			height,
			x,
			y,
			currentZoomNode;

		this.render = function (data, target, w, h, options) {
			root = data;

			width = w;
			height = h;
			x = d3.scale.linear().range([0, w]);
			y = d3.scale.linear().range([0, h]);

			treemap = d3.layout.treemap()
				.round(false)
				.size([w, h])
				.sticky(true)
				.value(function (d) {
					return d.size;
				});

			svg = d3.select(target)
				.append("svg:svg")
				.attr("width", w)
				.attr("height", h)
				.append("svg:g");

			nodes = treemap.nodes(data)
				.filter(function (d) {
					return !d.children;
				});

			this.assignColor(data, 0, 1);

			var tip = d3.tip()
				.attr('class', 'd3-tip')
				.offset([-10, 0])
				.html(function (d) {
					return options.gettitle(d);
				})
			svg.call(tip);

			var cell = svg.selectAll("g")
				.data(nodes)
				.enter().append("svg:g")
				.attr("class", "cell")
				.attr("transform", function (d) {
					return "translate(" + d.x + "," + d.y + ")";
				});

			cell.append("svg:rect")
				.attr("width", function (d) {
					return Math.max(0, d.dx - 1);
				})
				.attr("height", function (d) {
					return Math.max(0, d.dy - 1);
				})
				.attr("title", function (d) {
					return options.gettitle(d);
				})
				.attr("id", function (d) {
					return d.id;
				})
				.style("fill", function (d) {
					return self.hueToColor(d.hue, d.depth);
				})
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide)
				.on('click', function(d) { alert(d.id); });
		}

		this.zoom = function (d) {
			if (currentZoomNode == d) {
				d = root;
			}

			var kx = width / d.dx,
				ky = height / d.dy;
			x.domain([d.x, d.x + d.dx]);
			y.domain([d.y, d.y + d.dy]);

			var t = svg.selectAll("g.cell").transition()
				//.duration(d3.event.altKey ? 7500 : 750)
				.duration(3000)
				.attr("transform", function (d) {
					return "translate(" + x(d.x) + "," + y(d.y) + ")";
				});

			// patched to prevent negative value assignment to width and height
			t.select("rect")
				.attr("width", function (d) {
					return Math.max(0, kx * d.dx - 1);
				})
				.attr("height", function (d) {
					return Math.max(0, ky * d.dy - 1);
				})

			t.select("text")
				.attr("x", function (d) {
					return kx * d.dx / 2;
				})
				.attr("y", function (d) {
					return ky * d.dy / 2;
				})
				.style("opacity", function (d) {
					return kx * d.dx > d.w ? 1 : 0;
				});

			node = d;
			d3.event.stopPropagation();
			currentZoomNode = d;
		}

		this.assignColor = function (n, range_min, range_max) {
			if (n.children) {
				var range_step = (range_max - range_min) / n.children.length;

				for (var c = 0; c < n.children.length; c++) {
					var child_min = range_min + (range_step * c);
					var child_max = range_min + (range_step * (c + 1));

					n.children[c].colorRange = [child_min, child_max];
					this.assignColor(n.children[c], child_min, child_max);
				}
			} else {
				n.hue = n.colorRange[1];
			}
		}

		this.hueToColor = function (hue, depth) {
			return self.rgbToHex.apply(this, self.hslToRgb(hue, .7, .4))
		}

		this.componentToHex = function (c) {
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		}

		this.rgbToHex = function (r, g, b) {
			return "#" + self.componentToHex(r) + self.componentToHex(g) + self.componentToHex(b);
		}

		this.hslToRgb = function (h, s, l) {
			var r, g, b;

			if (s == 0) {
				r = g = b = l; // achromatic
			} else {
				function hue2rgb(p, q, t) {
					if (t < 0) t += 1;
					if (t > 1) t -= 1;
					if (t < 1 / 6) return p + (q - p) * 6 * t;
					if (t < 1 / 2) return q;
					if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
					return p;
				}

				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;
				r = hue2rgb(p, q, h + 1 / 3);
				g = hue2rgb(p, q, h);
				b = hue2rgb(p, q, h - 1 / 3);
			}

			return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
		}
	}

	if (typeof define === "function" && define.amd) {
		define(["jquery", "d3", "d3/tip"], function (j, d) {
			$ = j;
			$.version = "x";
			d3 = d;
			return chart
		});
	} else if (typeof module === "object" && module.exports) {
		module.exports = chart;
	} else {
		this.jnj_chart = chart;
		$ = this.$;
		d3 = this.d3;
	}
})();
