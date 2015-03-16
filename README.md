AchillesWeb
===========

Interactive web site for reviewing the results of the [Achilles R package](https://github.com/OHDSI/Achilles).

Getting Started
===============

There are a few configuration steps required to setup AchillesWeb. These steps assume that you have already run the Achilles R package to populate the statistics on your CDM instance.

1. Download AchillesWeb (e.g by clicking "[Download ZIP](https://github.com/OHDSI/AchillesWeb/archive/master.zip)" on the right side of this page), and extract to a folder accessible through a web server.

2. Create a 'data' directory in the root of your AchillesWeb folder and run the Achilles R package exportToJSON method specifying the output path to a subdirectory for the data source that you want to view through AchillesWeb. For example:

	```r
	exportToJson(connectionDetails,"CDM_SCHEMA", "RESULTS_SCHEMA", "C:/AchillesWeb/data/SAMPLE")
	```

3. Create a file in the AchillesWeb 'data' directory named 'datasources.json' with the following structure where the name is a caption for the data source and the folder is the name of the subdirectory under data. You will have to update the datasources.json file whenever you add a new data source subfolder to the data directory.

	```
	 { "datasources":[ { "name":"My Sample Database", "folder":"SAMPLE" } ] } 
	```

3: Access the AchillesWeb 'index.html' as a web page (i.e., via http:// rather than file://) and your data should load.

For more information see the [Achilles wiki](http://www.ohdsi.org/web/wiki/doku.php?id=documentation:software:achilles)

Datasource Structure
====================

In order to improve usability with other applications and file structures, `var datasourcepath` can be changed in `index.html` to the location of the file. Default is `data/datasource.json` but it can be changed to anything (including REST service) as long as it returns a json with a valid structure.

Datasource file structure also allows configurations with different parameters like `url` and `map`.

####Example
```JSON
{ 	"datasources":	[ 
    { "name":"My Sample Folder", "folder":"SAMPLE" },
    { "name":"My Sample URL", "url":"http://my-sample-server.com/SAMPLE" },
    { "name":"My Sample Parent URL","parentUrl":"http://my-sample-server.com", "url":"SAMPLE" },
    { "name":"My Sample Map", "parentUrl":"http://my-sample-server.com/rest",
	    "map": {
		    "achillesheel" : {
			    "type"	: "service",
				"url"	: "achillesheel/"
					},
			"condition_treemap" : {
				"type"	: "service",
				"url"	: "condition_treemap/"
			},
			"conditionera_treemap" : {
				"type"	: "service",
				"url"	: "conditionera_treemap/"
			},
			"drug_treemap" : {
				"type"	: "service",
	    		"url"	: "drug_treemap/"
			},
			"drugera_treemap" : {
				"type"	: "service",
				"url"	: "drugera_treemap/"
			},
			"observation_treemap" : {
				"type"	: "service",
				"url"	: "observation_treemap/"
			},
			"visit_treemap" : {
				"type"	: "service",
	    		"url"	: "visit_treemap/"
			},
			"procedure_treemap" : {
				"type"	: "service",
	    		"url"	: "procedure_treemap/"
			},
			"dashboard" : {
				"type"	: "service",
				"url"	: "dashboard/"
			},
	    	"datadensity" : {
				"type"	: "service",
				"url"	: "datadensity/"
			},
			"death" : {
				"type"	: "service",
				"url"	: "death/"
			},
			"person" : {
				"type"	: "service",
	    		"url"	: "person/"
			},
			"observationperiod" : {
				"type"	: "service",
				"url"	: "observationperiod/"
			},
    		"conditioneras" : {
				"type"	: "collection",
				"url"	: "conditioneras/{id}/"
			},
			"conditions" 	: {
				"type"	: "collection",
				"url"	: "conditions/{id}/"
			},
			"drugeras"		: {
	    		"type"	: "collection",
    			"url"	: "drugeras/{id}/"
			},
			"drugs"			: {
				"type"	: "collection",
				"url"	: "drugs/{id}/"
			},
			"observations" 	: {
				"type"	: "collection",
				"url"	: "observations/{id}/"
			},
			"procedures"	: {
				"type"	: "collection",
				"url"	: "procedures/{id}/"
			},
			"visits"		: {
				"type"	: "collection",
				"url"	: "visits/{id}/"
			}
		}
	}
]} 
	```


License
=======
Achilles is licensed under Apache License 2.0

