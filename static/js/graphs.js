queue()
    .defer(d3.json, "/database/request")
    .await(makeGraphs);

function makeGraphs(error, projectsJson) {
	
	//Clean projectsJson data
	var applicants = projectsJson;
	var depts = ['A A', 'BIO E', 'CE', 'CEE', 'CHEM E', 'CS', 'E E', 'HCDE', 'I E', 'M E', 'MS E', 'PSE'];
	var stats = {};
	depts.forEach(function (d) {
		stats[d] = {dept: d, gpa: 0.0, count: 0 };
	});
	var dateFormat = d3.time.format("%Y");
	applicants.forEach(function(d) {
		//d["year"] = dateFormat.parse(d["year"]);
		var dept = stats[d["dept"]];
		dept["count"]++;
		dept["gpa"]+=d["tot_gpa"];
		//d["year"].setDate(1);
		//d["total_donations"] = +d["total_donations"];
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(applicants);

	//Define Dimensions
	//var dateDim = ndx.dimension(function(d) { return d["year"]; });
	var gpaDim = ndx.dimension(function(d) { return Math.round(d["tot_gpa"]*10)/10; });
	var deptDim = ndx.dimension(function(d) { return d["dept"]; });
	var genderDim = ndx.dimension(function(d) {
		if (d["gender"] == "F") return "Female";
		else return "Male";
	});
	var typeDim = ndx.dimension(function(d) {
		if (d["type"] == "E") return "Early";
		else return "Upper-Division";
	});
	var admissionDim = ndx.dimension(function(d) {
		if (d["decision"] <= 3 ) return "Admitted";
		else return "Denied";
	});
	var enrollmentDim = ndx.dimension(function(d) {
		if (d["enrolled"] == 1 ) return "Enrolled";
		else return "Not enrolled";
	});
	//var avgGpaDim = ndx.dimension(function(d) { return stats[d["dept"]]["gpa"]/stats[d["dept"]]["count"]; });
	//var prereqGpa  = ndx.dimension(function(d) { return d["prereq_gpa"]; });


	//Calculate metrics
	var gpaGroup = gpaDim.group();
	var deptGroup = deptDim.group();
	var genderGroup = genderDim.group();
	var typeGroup = typeDim.group();
	var admissionGroup = admissionDim.group();
	var enrollmentGroup = enrollmentDim.group();
	//var avgGpaByDept = avgGpaDim.group();
	//var prereqGpaByDept = prereqGpa.group();

	var all = ndx.groupAll();
	//var totalDonations = ndx.groupAll().reduceSum(function(d) {return d["total_donations"];});

	//var max_state = totalDonationsByState.top(1)[0].value;

	////Define values (to be used in charts)
	var minGpa = gpaDim.bottom(1)[0]["tot_gpa"];
	var maxGpa = gpaDim.top(1)[0]["tot_gpa"];

    //Charts
	var distChart = dc.barChart("#dist-chart");
	var genderChart = dc.pieChart("#gender-chart");
	var deptChart = dc.barChart("#dept-chart");
	var typeChart = dc.pieChart("#type-chart");
	var admissionChart = dc.pieChart("#adm-chart");
	var enrollmentChart = dc.pieChart("#enroll-chart");
	//var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
	//var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
	//var numberProjectsND = dc.numberDisplay("#number-projects-nd");
	//var totalDonationsND = dc.numberDisplay("#total-donations-nd");
    //
	//numberProjectsND
	//	.formatNumber(d3.format("d"))
	//	.valueAccessor(function(d){return d; })
	//	.group(all);
    //
	//totalDonationsND
	//	.formatNumber(d3.format("d"))
	//	.valueAccessor(function(d){return d; })
	//	.group(totalDonations)
	//	.formatNumber(d3.format(".3s"));

	distChart
		.width(600)
		.height(300)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(gpaDim)
		.group(gpaGroup)
		.transitionDuration(500)
		.centerBar(true)
		.gap(40)
		.x(d3.scale.linear().domain([1.5, 4.1]))
		.elasticY(true)
		.xAxisLabel("GPA")
		.yAxisLabel("Number of Applicants")
		.xUnits(function() {return 10;})
		.xAxis().tickFormat();
	var genderColorScale = d3.scale.ordinal().range(["#f6546a", "#003366"]);
	var YesOrNoColorScale = d3.scale.ordinal().range(["#006400", "#cc0000"]);

	genderChart
		.width(250)
		.height(220)
		.radius(100)
		.dimension(genderDim)
		.group(genderGroup)
		.colors(genderColorScale)
		.label(function (d) {
            if (genderChart.hasFilter() && !genderChart.hasFilter(d.key)) {
                return d.key + '(0%)';
            }
            var label = d.key;
            if (all.value()) {
                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
            }
            return label;
        })
		.title(function(d) {return d.value});

	deptChart
		.width(600)
		.height(300)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(deptDim)
		.group(deptGroup)
		.transitionDuration(500)
		.centerBar(false)
		.x(d3.scale.ordinal().domain(depts))
		.elasticY(true)
		.xAxisLabel("Department")
		.yAxisLabel("Number of Applicants")
		.xUnits(dc.units.ordinal)
		.xAxis().tickFormat();

	typeChart
		.width(250)
		.height(220)
		.radius(100)
		.dimension(typeDim)
		.group(typeGroup)
		.title(function(d) {return d.value});

	admissionChart
		.width(250)
		.height(220)
		.radius(100)
		.dimension(admissionDim)
		.group(admissionGroup)
		.colors(YesOrNoColorScale)
		.label(function (d) {
            if (admissionChart.hasFilter() && !admissionChart.hasFilter(d.key)) {
                return d.key + '(0%)';
            }
            var label = d.key;
            if (all.value()) {
                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
            }
            return label;
        })
		.title(function(d) {return d.value});

	enrollmentChart
		.width(250)
		.height(220)
		.radius(100)
		.dimension(enrollmentDim)
		.group(enrollmentGroup)
		.colors(YesOrNoColorScale)
		.label(function (d) {
            if (enrollmentChart.hasFilter() && !enrollmentChart.hasFilter(d.key)) {
                return d.key + '(0%)';
            }
            var label = d.key;
            if (all.value()) {
                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
            }
            return label;
        })
		.title(function(d) {return d.value});
	//resourceTypeChart
     //   .width(300)
     //   .height(250)
     //   .dimension(resourceTypeDim)
     //   .group(numProjectsByResourceType)
     //   .xAxis().ticks(4);
    //
	//povertyLevelChart
	//	.width(300)
	//	.height(250)
     //   .dimension(povertyLevelDim)
     //   .group(numProjectsByPovertyLevel)
     //   .xAxis().ticks(4);
    //
    //
	//usChart.width(1000)
	//	.height(330)
	//	.dimension(stateDim)
	//	.group(totalDonationsByState)
	//	.colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
	//	.colorDomain([0, max_state])
	//	.overlayGeoJson(statesJson["features"], "state", function (d) {
	//		return d.properties.name;
	//	})
	//	.projection(d3.geo.albersUsa()
    	//			.scale(600)
    	//			.translate([340, 150]))
	//	.title(function (p) {
	//		return "State: " + p["key"]
	//				+ "\n"
	//				+ "Total Donations: " + Math.round(p["value"]) + " $";
	//	})

    dc.renderAll();

};