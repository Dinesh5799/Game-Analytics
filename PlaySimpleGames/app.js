window.onload = GraphRender;
function GraphRender (graphData,valueFormatString,xTitle) {
    console.log("**********GraphRender**********");
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: "Game-Analytics"
        },
        axisX:{
            title:xTitle,
            valueFormatString: valueFormatString,//"DD-MMM",
            crosshair: {
                enabled: true,
                snapToDataPoint: true
            }
        },
        axisY: {
            title: "Revenue",
            crosshair: {
                enabled: true
            }
        },
        toolTip:{
            shared:true
        },  
        legend:{
            cursor:"pointer",
            verticalAlign: "bottom",
            horizontalAlign: "left",
            dockInsidePlotArea: true,
            itemclick: toogleDataSeries
        },
        data: graphData
    });
    chart.render();
    function toogleDataSeries(e){
        console.log("Triggered!!!");
        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else{
            e.dataSeries.visible = true;
        }
        chart.render();
    }
    
}
var csvDataObj = [];
var csvData = [];
function ReadCsvFile(e){
    try{        
        if (e.target.files != undefined) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var csvval=e.target.result.split("\n");                
                var csvvalue=csvval[0].trim().split(",");                                
                for(let i=0;i<csvvalue.length;i++){
                    csvDataObj.push(csvvalue[i]);
                }
                // console.log("csvDataObj: "+JSON.stringify(csvDataObj));  
                for(let i=1;i<csvval.length;i++){
                    let cur_line = csvval[i].trim().split(",");
                    let temp = {};
                    // console.log("cur_line: "+cur_line);                                
                    for(let j=0;j<cur_line.length;j++){
                        temp[csvDataObj[j]] = cur_line[j];
                    }
                    if(temp.Country)                    
                    csvData.push(temp);
                }  
                // console.log("csvData: "+JSON.stringify(csvData));
                DataFormatterForGraph("Country","DD-MMM");                          
            };
            reader.readAsText(e.target.files.item(0));            
        }
        
    }
    catch(e){
        console.log("Exception in reading csv: "+e);
    }
}
function DataFormatterForGraph(par){  
    console.log("**********DataFormatterForGraph**********");  
    try{
        if(csvData.length > 1){
            let FinalGraphData = [];
            let tempObj = {
                type: "line",
                showInLegend: true,
                name: "",
                markerType: "square",
                xValueFormatString: "",
                color: "#F08080",
                dataPoints: []
            };
            if(par === "Country"){
                let te_countryObj = {};
                for(let i=0;i<csvData.length;i++){
                    let temp = {};                                                          
                    temp.x = new Date(csvData[i].Date);
                    temp.y = parseInt(csvData[i]["rev(Revenue)"]);
                    (te_countryObj[csvData[i].Country])?(te_countryObj[csvData[i].Country].push(temp)):(te_countryObj[csvData[i].Country] = []);                                        
                }
                // console.log("te_countryObj: "+JSON.stringify(te_countryObj));
                for(let i in te_countryObj){
                    let te_countData = JSON.parse(JSON.stringify(tempObj))
                    te_countData.name = i;        
                    te_countData.color = getRandomColor();            
                    te_countData.dataPoints = te_countryObj[i];
                    FinalGraphData.push(te_countData);
                }
                console.log("Country FinalGraphData: "+JSON.stringify(FinalGraphData));
                GraphRender(FinalGraphData,'','Date');
            }
            else if(par === "Game"){            
                let Gameobj = {};
                for(let i=0;i<csvData.length;i++){
                    console.log("csvData[i].Date: "+csvData[i].Date);
                    if(!(Gameobj[csvData[i].Date])){
                        Gameobj[csvData[i].Date] = [];
                    }                    
                    Gameobj[csvData[i].Date].push(parseInt(csvData[i]["rev(Revenue)"]));
                    console.log("Gameobj: "+JSON.stringify(Gameobj));
                }         
                let DataPoints = [];
                for(var i in Gameobj){
                    let temp = {};
                    console.log("i: "+i+" Gameobj[i]: "+Gameobj[i]);
                    Gameobj[i] = Gameobj[i].reduce(getSum);                    
                    temp.x = new Date(i);
                    temp.y = Gameobj[i];
                    DataPoints.push(temp);
                }      
                tempObj.name = "Total Game Revenue Per Day";
                tempObj.dataPoints = DataPoints;
                FinalGraphData.push(tempObj);
                GraphRender(FinalGraphData,'','Date');
            }
            else{                
                let BothObj = {};
                for(let i=0;i<csvData.length;i++){
                    let temp = {};
                    temp.x = parseInt(csvData[i].Dau);
                    temp.y = parseInt(csvData[i]["rev(Revenue)"]);  
                    (BothObj[csvData[i].Country])?(BothObj[csvData[i].Country].push(temp)):(BothObj[csvData[i].Country] = []);                                                          
                }
                for(let i in BothObj){
                    let te_countData = JSON.parse(JSON.stringify(tempObj))
                    te_countData.name = i;        
                    te_countData.color = getRandomColor();            
                    te_countData.dataPoints = BothObj[i];
                    FinalGraphData.push(te_countData);
                }
                console.log("Game FinalGraphData: "+JSON.stringify(FinalGraphData));
                GraphRender(FinalGraphData,"#,##0.##",'Daily Active Users');
            }
        }
        else{
            window.alert("Csv Data Upload Error.");
        }
    }
    catch(e){
        console.log("Exception In DataFormatterForGraph: "+e);
    }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function getSum(total, num) {
    return total + num;
}
function Reset(){
    document.getElementById('filename').value = '';
    csvDataObj = [];
    csvData = [];
    GraphRender();
}
