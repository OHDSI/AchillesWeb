define(function ()
{
	function mapGenderData(data)
	{
		var result;

		result = data.Members.map(function (d, i)
		{
			return {
				id: this.GenderConceptId[i],
				label: this.GenderName[i],
				value: d
			};
		}, data);

		result = result.sort(function (a, b)
		{
			return b.label < a.label ? 1 : -1;
		});
		return result;
	}

	function mapVisitData(data)
	{
		var result;
		result = data.Members.map(function (d, i)
		{
			var datum = {}
			datum.id = this.ConceptId[i];
			datum.label = this.ConceptName[i];
			datum.value = this.Members[i];
			return datum;
		}, data);

		result = result.sort(function (a, b)
		{
			return b.label < a.label ? 1 : -1;
		});
		return result;
	}

	function mapConceptData(data)
	{
		var result;

		if (data.Members instanceof Array) // multiple rows, each value of each column is in the indexed properties.
		{
			result = data.Members.map(function (d, i)
			{
				var datum = {}
				datum.id = this.ConceptId[i];
				datum.label = this.ConceptName[i];
				datum.value = this.Members[i];
				return datum;
			}, data);

			result = result.sort(function (a, b)
			{
				return b.label < a.label ? 1 : -1;
			});
		}
		else // the dataset is a single value result, so the properties are not arrays.
		{
			result = [{id : data.ConceptId, label: data.ConceptName, value: data.Members}];	
		}
		return result;
	}

	function mapHistogram(histogramData)
	{
		// result is an array of arrays, each element in the array is another array containing information about each bar of the histogram.
		var result = new Array();
		var minValue = histogramData.min;
		var intervalSize = histogramData.intervalSize;

		for (var i = 0; i <= histogramData.intervals; i++)
		{
			var target = new Object();
			target.x = minValue + 1.0 * i * intervalSize;
			target.dx = intervalSize;
			target.y = histogramData.data.counts[histogramData.data.intervals.indexOf(i)] || 0;
			result.push(target);
		};

		return result;
	}
	
	function mapBarToHistogram(barData, intervalSize)
	{
		// result is an array of arrays, each element in the array is another array containing information about each bar of the histogram.
		var result = new Array();
		for (var i = 0; i < barData.category.length; i++)
		{
			var target = new Object();
			target.x = barData.category[i];
			target.dx = intervalSize;
			target.y = barData.counts[i];
			result.push(target);
		};

		return result;
	}


	var module = {
		mapGenderData: mapGenderData,
		mapVisitData: mapVisitData,
		mapHistogram: mapHistogram,
		mapConceptData: mapConceptData,
		mapBarToHistogram: mapBarToHistogram
	};

	return module;
});