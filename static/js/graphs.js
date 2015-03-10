queue()
    .defer(d3.json, "/database/request")
    .await(makeGraphs);

function makeGraphs(error, projectsJson) {

	var applicants = projectsJson;
	//var depts = ['A A', 'BIO E', 'CE', 'CEE', 'CHEM E', 'CS', 'E E', 'HCDE', 'I E', 'M E', 'MS E', 'PSE'];
	//var dateFormat = d3.time.format("%Y");

	//Create a Crossfilter instance
	var coe = crossfilter(applicants);

	//Define Dimensions
	//var dateDim = ndx.dimension(function(d) { return d["year"]; });
	var gpaDim = coe.dimension(function(d) { return Math.round(d["tot_gpa"]*10)/10; });
	var deptDim = coe.dimension(function(d) { return d["dept"]; });
	var genderDim = coe.dimension(function(d) {
		if (d["gender"] == "F") return "Female";
		else return "Male";
	});
	//var typeDim = coe.dimension(function(d) {
	//	if (d["type"] == "E") return "Early";
	//	else return "Upper-Division";
	//});
	var admissionDim = coe.dimension(function(d) {
		if (d["decision"] <= 3 ) return "Admitted";
		else return "Denied";
	});
	var enrollmentDim = coe.dimension(function(d) {
		if (d["enrolled"] == 1)  return "Enrolled";
		else return "Not Enrolled";
	});
	//Calculate metrics
	//var gpaGroup = gpaDim.group();
	var deptGroup = deptDim.group();
	var genderGroup = genderDim.group();
	//var typeGroup = typeDim.group();
	var admissionGroup = admissionDim.group();
	var enrollmentGroup = enrollmentDim.group();
	var aaGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="A A"){return 1;} else {return 0;}});
	var bioeGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="BIO E"){return 1;} else {return 0;}});
	var ceGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="CE"){return 1;} else {return 0;}});
	var ceeGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="CEE"){return 1;} else {return 0;}});
	var chemeGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="CHEM E"){return 1;} else {return 0;}});
	var csGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="CS"){return 1;} else {return 0;}});
	var eeGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="E E"){return 1;} else {return 0;}});
	var hcdeGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="HCDE"){return 1;} else {return 0;}});
	var ieGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="I E"){return 1;} else {return 0;}});
	var meGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="M E"){return 1;} else {return 0;}});
	var mseGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="MS E"){return 1;} else {return 0;}});
	var pseGroup = gpaDim.group().reduceSum(function(d) {if(d["dept"]=="PSE"){return 1;} else {return 0;}});

	var all = coe.groupAll();

	////Define values (to be used in charts)
	//var minGpa = gpaDim.bottom(1)[0]["tot_gpa"];
	//var maxGpa = gpaDim.top(1)[0]["tot_gpa"];

    //Charts
	distChart = dc.barChart("#dist-chart");
	genderChart = dc.pieChart("#gender-chart");
	deptChart = dc.rowChart("#dept-chart");
	//var typeChart = dc.pieChart("#type-chart");
	admissionChart = dc.pieChart("#adm-chart");
	enrollmentChart = dc.pieChart("#enroll-chart");

	var genderColorScale = d3.scale.ordinal().range(["#ff69b4", "#4099ff"]);
	var YesOrNoColorScale = d3.scale.ordinal().range(["#6dc066", "#ff4040"]);

	distChart
		.width(600)
		.height(300)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(gpaDim)
		.group(aaGroup, "A A")
		.stack(bioeGroup, "BIO E")
		.stack(ceGroup, "CE")
		.stack(ceeGroup, "CEE")
		.stack(chemeGroup, "CHEM E")
		.stack(csGroup, "CS")
		.stack(eeGroup, "E E")
		.stack(hcdeGroup, "HCDE")
		.stack(ieGroup, "I E")
		.stack(meGroup, "M E")
		.stack(mseGroup, "MS E")
		.stack(pseGroup, "PSE")
		.transitionDuration(500)
		.centerBar(true)
		.gap(40)
		.x(d3.scale.linear().domain([1.5, 4.1]))
		.elasticY(true)
		.xAxisLabel("GPA")
		.yAxisLabel("Number of Applicants")
		.xUnits(function() {return 10;})
		.xAxis().tickFormat();

	genderChart
		.width(250)
		.height(220)
		.radius(100)
		.innerRadius(30)
		.dimension(genderDim)
		.group(genderGroup)
		.colors(genderColorScale)
		.legend(dc.legend())
		.label(function (d) {
            if (admissionChart.hasFilter() && !admissionChart.hasFilter(d.key)) {
                return '0%';
            }
            if (all.value()) {
                var label = Math.floor(d.value / all.value() * 100) + '%';
            }
            return label;
        })
		.title(function(d) {return d.value});

	deptChart
		.width(600)
		.height(300)
		.margins({top: 20, left: 10, right: 10, bottom: 20})
		.dimension(deptDim)
		.group(deptGroup)
		.transitionDuration(500)
		.colors(d3.scale.category10())
		//.centerBar(false)
		//.ordinalColors(["#d95f02","#1b9e77","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d"])
		//.x(d3.scale.ordinal().domain(depts))
		.elasticX(true)
		//.xAxisLabel("Number of Applicants")
		//.yAxisLabel("Department")
		.xAxis().tickFormat();

	//typeChart
	//	.width(250)
	//	.height(220)
	//	.radius(100)
	//	.dimension(typeDim)
	//	.group(typeGroup)
	//	.title(function(d) {return d.value});

	admissionChart
		.width(250)
		.height(220)
		.radius(100)
		.innerRadius(30)
		.dimension(admissionDim)
		.group(admissionGroup)
		.colors(YesOrNoColorScale)
		.legend(dc.legend().gap(5))
		.label(function (d) {
            if (admissionChart.hasFilter() && !admissionChart.hasFilter(d.key)) {
                return '0%';
            }
            if (all.value()) {
                var label = Math.floor(d.value / all.value() * 100) + '%';
            }
            return label;
        })
		.title(function(d) {return d.value});

	enrollmentChart
		.width(250)
		.height(220)
		.radius(100)
		.innerRadius(30)
		.dimension(enrollmentDim)
		.group(enrollmentGroup)
		.colors(YesOrNoColorScale)
		.legend(dc.legend().gap(5))
		.label(function (d) {
            if (enrollmentChart.hasFilter() && !enrollmentChart.hasFilter(d.key)) {
                return '0%';
            }
            if (all.value()) {
                var label = Math.floor(d.value / all.value() * 100) + '%';
            }
            return label;
        })
		.title(function(d) {return d.value});

    dc.renderAll();
};