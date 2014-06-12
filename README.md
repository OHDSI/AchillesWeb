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

For more information see the [AchillesWeb wiki](https://github.com/OHDSI/AchillesWeb/wiki)

License
=======
Achilles is licensed under Apache License 2.0

