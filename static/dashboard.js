
var otu_desc;

d3.json("/otu",function(error,response){
    //console.log("ress="+response[0]['description']);
    console.log("ress="+response.length);
    otu_desc = response;
});

function getDescription(otu_id){
    for(var i = 0; i < otu_desc.length; i++)
    {
      if(otu_desc[i].otu_id == otu_id)
      {
        return otu_desc[i].description;
      }
    }
}

function waitForDesc(){
    if(typeof otu_desc !== "undefined"){
        console.log("des="+getDescription(7));
    }
    else{
        console.log("loading..");
        setTimeout(waitForDesc, 250);
    }
}
waitForDesc();

d3.json("/names", function(error,response) {
    
    var result=response
    // console.log(result); 

    d3.select("#selectData")
    .selectAll("option")
    .data(result)
    .enter()
    .append("option")
    .attr("class","sampleValue")
    .property('value',function(data,index){return result[index];})
    .text(function(data,index){return result[index];})

});



function getData(dataset){
     
    var plotId = document.getElementById("plot");
    plotId.innerHTML = "";
    var bubbleId = document.getElementById("bubble");
    //bubbleId.innerHTML = ""          
    d3.json("/samples/"+dataset,function(error,response){
        
        if(error)
            console.log("error = "+error);
        var otu_id = response[0]['otu_id'].slice(0,10);
        var sample_id = response[1]['Sample_id'].slice(0,10);
        
        var text = sample_id.map((v, i) => `
        ${getDescription(otu_id[i])}`)


        // console.log(text)
        var data = [{
            
                values:sample_id,
                labels:otu_id,
                type:"pie",
                text:text,
                hoverinfo:'label+text+percent',
                textinfo:'percent',
                textposition: 'inside'
            }];
        var layoutPlot={title:"<b>Top 10 sample for selected OTU ID </b>"}
        Plotly.newPlot("plot", data,layoutPlot);
        
        // bubble
        
        var bubbleData=[{
            x:otu_id,
            y:sample_id,
            type: 'scatter',
            mode: 'markers',
            text:text,
            hoverinfo:'text',
            marker:{
                size:sample_id
            }
        }];

        var layout = {showlegend: false};
    
    
        Plotly.plot(bubbleId,bubbleData,layout)
     
    });

    metadata(dataset);
    washFreq(dataset)


};


function metadata(argument){

    d3.json("/metadata/"+argument,function(error,response){
        
                var tbl=document.querySelector("#meta");
                // var tbody=document.createElement("tbody");
                while (tbl.firstChild) {
                    tbl.removeChild(tbl.firstChild);
                }
        
                var metaresult=response[0]
        
                var keys = Object.keys(metaresult);
                
                for(var i = 0; i < keys.length;i++){
        
                    key=keys[i];
                    // console.log(key, metaresult[key]);
        
                    var text=document.createElement("p")
                    text.innerHTML=key +" : "+metaresult[key]
                    tbl.appendChild(text)
        
                }
         
            });
}

function washFreq(sample){

 d3.json("/wfreq/"+sample,function(error,response){

        console.log(response);

var gaugeId = document.getElementById("gauge");
gaugeId.innerHTML = "";

//Enter a speed between 0 and 180
var level = parseInt(response);

// Trig to calc meter point
var degrees = 180-level,
    radius = .5;
var radians = degrees * Math.PI / 180;
var x = radius * Math.cos(radians);
var y = radius * Math.sin(radians);

// Path: may have to change to create a better triangle
var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
     pathX = String(x),
     space = ' ',
     pathY = String(y),
     pathEnd = ' Z';
var path = mainPath.concat(pathX,space,pathY,pathEnd);

var data = [{ type: 'scatter',
   x: [0], y:[0],
    marker: {size: 14, color:'850000'},
    showlegend: false,
    name: 'speed',
    text: level,
    hoverinfo: 'text+name'},
  {values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9,50/9,50/9,50],
  rotation: 90,
  text: ['8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1',''],
  textinfo: 'text',
  textposition:'inside',
  marker: {colors:['rgba(117, 163, 71, .5)','rgba(135, 192, 98, .5)','rgba(147, 224, 132, .5)', 'rgba(182, 224, 15, .5)',
                         'rgba(214, 244, 97, .7)', 'rgba(214, 244, 97, .5)',
                         'rgba(199, 221, 58, .3)', 'rgba(199, 221, 58, .2)','rgba(199, 221, 58, .1)','rgba(232, 226, 202,0)']},
  labels: ['8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1',""],
  hoverinfo: 'label',
  hole: .5,
  type: 'pie',
  showlegend: false
}];

var layout = {
  shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
 title: '<b>Belly Button Washing Frequency</b><br>Scrubs per week',
 Speed:0-100,
//  height:600,
 width:500,
  xaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
  yaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]}
};
Plotly.newPlot('gauge', data, layout);

});

}

getData("BB_940",false);
washFreq("BB_940");






