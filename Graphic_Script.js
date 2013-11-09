	//=================Constants================================
	var tableName = 'expenses';
	//make it wide so that next graph will be below.
	var svg_width = 1200;
	var LOCATION = "location";
	var TOTAL_VALUE="total_value";
	var YEAR = "year";
	var MONTH = "month";
	var WEEK = "week";
	//==========================Global variable==================
	var dataStore;
	//======================================GUI==================
	function addType(){
		var sampleDiv = document.getElementById("samplePane").cloneNode(true);
		document.getElementById("expendablePane").appendChild(sampleDiv);
	}
	
	function removeType(button){
		if(button!=undefined){
		var divElement = button.parentNode;
		divElement.parentNode.removeChild(divElement);
		}
	}
	
	/*Collect user input data.*/
	function collectData(){
		var expense = {};
		//Get the transaction date and location.
		var transactionDate = document.getElementById("transactionDate");
		var date = transactionDate.getElementsByTagName("input")[0].value;
		var transactionLocation = document.getElementById("transactionLocation");
		var location = transactionLocation.getElementsByTagName("input")[0].value;
		var total = document.getElementById("total");
		var totalAmount = parseInt(total.getElementsByTagName("input")[0].value);
		//expense["date"] = date;
		expense[LOCATION] = location;
		expense[TOTAL_VALUE] = totalAmount;
		
		//parse year, month and week data for query.
		var dateObject = parseDate(date);
		expense[YEAR] = dateObject[YEAR];
		expense[MONTH] = dateObject[MONTH];
		expense[WEEK] = dateObject[WEEK];
		
		//Get amount of each item.
		var expendablePane = document.getElementById("expendablePane");
		var expenseList = expendablePane.getElementsByTagName("div");
		var expenseListLength = expenseList.length;
		for(var i=0;i<expenseListLength;i++){
			var expenseDiv = expenseList.item(i);
			var expenseName = expenseDiv.getElementsByTagName("select")[0].value;
			var expenseAmount = parseInt(expenseDiv.getElementsByTagName("input")[0].value);
			//if(expenseAmount.length != 0 && expenseAmount > 0){
				expense[expenseName] = expenseAmount;
			//}
		}
		return expense;
	}
	//=================DataStore===============
	function init(){
		//alert("page loaded");
		function dataStoreCallBack(error, newDatastore){
			if (error) {
				alert('Error opening default datastore: ' + error);
			}
			dataStore = newDatastore;
		}
		var client = authenticate()();
		var datastoreManager = client.getDatastoreManager();
		datastoreManager.openDefaultDatastore(dataStoreCallBack);
	}
	function authenticate(){
		var client = new Dropbox.Client({key: 'wy9s1uvip6qnswr'});
		if (!client.isAuthenticated()) {
			//alert('the client is authenticated.');
			client.authenticate({interactive: false}, 
			function (error) {
				if (error) {
					alert('Authentication error: ' + error);
				}
			});
		}
		function getClient(){return client;}
		return getClient;
	} 
	
	function execute(callBack){		
		function dataStoreCallBack(error, newDatastore){
			if (error) {
				alert('Error opening default datastore: ' + error);
			}
			callBack(newDatastore);
		}
		var client = authenticate()();
		var datastoreManager = client.getDatastoreManager();
		datastoreManager.openDefaultDatastore(dataStoreCallBack);
	} 
	//==========================Actions===============
	function deleteTestDataAction(){
		execute(deleteTestData);
	}
	
	function storeData(){
		var expenseData = collectData();
		insertData(expenseData);
	}
	//==============================data persistance==============
	function insertData(expenseData){
		var queryParam = {};
		queryParam[LOCATION] = expenseData[LOCATION];
		queryParam[YEAR] = expenseData[YEAR];
		queryParam[MONTH] = expenseData[MONTH];
		queryParam[WEEK] = expenseData[WEEK];
		function queryAndSave(dataStore){
			var expenseTable = dataStore.getTable(tableName);
			var result = expenseTable.query(queryParam);
			if(result.length>1)
				throw "there should be only one record given a date and a location. Check the data.";
			if(result.length==1)
			{
				//combine and delete the old data;
				var currentRecord = result[0];
				combineRecord(currentRecord, expenseData);
			}
			else
				saveData(expenseData);
		}
		execute(queryAndSave);
	}
	
	function saveData(dataToSave){
		function save(dataStore){
			var expenseTable = dataStore.getTable(tableName);
			expenseTable.insert(dataToSave); 
		}
		execute(save);
	}
	
	function deleteData(dataToDelete){
		return function(dataStore){
		}
	}
	
	function search(dataStore, queryStandard){
		var expenseTable = dataStore.getTable(tableName);
		return expenseTable.query(queryStandard);
	}
	//===================================business logics================
	function getPeriodTotalExpense(year,/*MONTH or WEEK*/period, /*number: 12 or 53*/num){
		var query = {};
		query[YEAR] = year;
		var queryResult;
		var result = new Array();
		var total = 0;
		if(dataStore!= undefined){
			for(var i=1;i<=num;i++){
				query[period] = i;
				queryResult = search(dataStore,query);
				for(var j=0;j<queryResult.length;j++){
					total+=queryResult[j].get(TOTAL_VALUE);
				}
				result[i-1] = total;
				total=0;
			}
		}
		//alert(result);
		return result;
	}
	
	//=====================================D3 code======================
	function drawBarGraph(dataset){
		//var dataset=[0,1,2,3,4,5,6,7,8,9];
		var width = svg_width;
		var height = 300;
		var barPadding = 1;
		var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height);
		
		svg.selectAll("rect").data(dataset).enter()
		.append("rect")
		.attr("x", 
			  function(d, i) {
				return i * (width/ dataset.length); 
				})
		.attr("y", 
		      function(d) {
				return (height - 20*d);
				})
		.attr("width", width / dataset.length - barPadding)
		.attr("height", 
			  function(d) {
				return 20*d;
				})
		.attr("fill", "teal");
	}
	
	function drawPieGraph(dataset){
		//var dataset = [ 5, 10, 20, 45, 6, 25 ];
		var pie = d3.layout.pie();
		var w = svg_width;
		var h = 400;
		var outerRadius = h / 2;
		var innerRadius = 0;
		var arc = d3.svg.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);
			
		//Create SVG element
		var svg = d3.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h);
		
		//Set up groups
		var arcs = svg.selectAll("g.arc")
			.data(pie(dataset))
			.enter()
			.append("g")
			.attr("class", "arc")
			.attr("transform", "translate(" + outerRadius + ", " + outerRadius + ")");
			
			//Draw arc paths
		var color = d3.scale.category10();
		arcs.append("path")
			.attr("fill", function(d, i) {
				return color(i);
				})
			.attr("d", arc);
			
		arcs.append("text")
			.attr("transform", 
			function(d) {
				return "translate(" + arc.centroid(d) + ")";
			})
			.attr("text-anchor", "middle")
			.text(function(d) {
					return d.value;
				 });
	}
	//==================================utils=============================
	function combineRecord(dbRecord, newData){
		for(p in newData){
			if(newData.hasOwnProperty(p) && notDateValue(p)){
				//the record instance can set data without re-connect
				if(dbRecord.has(p) && typeof newData[p] == 'number')
					dbRecord.set(p,dbRecord.get(p)+newData[p]);
				else
					dbRecord.set(p,newData[p]);
			}
		}
		return dbRecord;
	}
	
	function notDateValue(value){
		return YEAR!==value && MONTH!==value && WEEK!==value;
	}
	
	function parseDate(date){
		var year = parseInt(date.substr(0,4));
		var month = parseInt(date.substr(5,2));
		var day = date.substr(8,2);
		var dateObj={};
		dateObj[YEAR]=year;
		dateObj[MONTH]=month;
		dateObj[WEEK]= new Date(date).getWeekNum();
		return dateObj;
	}
	/** 
	 * Get the ISO week date week number. code copied from 
	 * http://techblog.procurios.nl/k/news/view/33796/14863/calculate-iso-8601-week-and-year-in-javascript.html?pageNr=last#thread_441 
	 */  
	Date.prototype.getWeekNum = function () {  
		// Create a copy of this date object  
		var target  = new Date(this.valueOf());  
	  
		// ISO 8601 states that week 1 is the week with the first thursday of that year.  
		// Set the target date to the thursday in the target week
		var dayNr   = (this.getDay() + 6) % 7; 		
		target.setDate(target.getDate() - dayNr + 3);  
	  
		// Store the millisecond value of the target date  
		var firstThursday = target.valueOf();  
	  
		// Set the target to the first thursday of the year 
		target.setMonth(0, 1);  
		// Not a thursday? Correct the date to the next thursday  
		if (target.getDay() != 4) {  
			target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);  
		}  
		// The weeknumber is the number of weeks between the   
		// first thursday of the year and the thursday in the target week
		// 604800000 = 7 * 24 * 3600 * 1000
		return 1 + Math.ceil((firstThursday - target) / 604800000); 
	}  
	//======================================Test===================
	function getTestData(){
		var result = searchData({year:"2013", month:"09"});
		//var result = execute(f);
		alert(result.length);
		alert(result[0]);
	}
	
	/*Delete test Data. This is only used during development.*/
 	function deleteTestData(dataStore){
		var tables = dataStore.listTableIds();
		for (var i = 0; i < tables.length; i++) {
			var table = dataStore.getTable(tables[i]);
			var records = table.query();
			for (var j = 0; j < records.length; j++) {
				records[j].deleteRecord();
			}
		}
	}
	
	function drawTestData(){
		drawBarGraph(getPeriodTotalExpense(2013,'month',12));
		drawPieGraph(getPeriodTotalExpense(2013,'month',12));
	}
