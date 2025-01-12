
//"init" est appelée dès que la fenêtre active
window.addEventListener("DOMContentLoaded",init,false);

//variables globales
var map = document.querySelector('#map') 

var paths = document.querySelectorAll('.map__image path') 

//var links = document.querySelectorAll('.map__list a') 

var vizTopic = "transport";

var regions = ['Alsace', 'Aquitaine', 'Auvergne', 'Bourgogne', 'Bretagne', 'Centre', 'ChampagneArdenne', 'Corse', 'FrancheComté',  'IledeFrance',  'LanguedocRoussillon', 'Limousin', 'Lorraine', 'MidiPyrénées', 'NordPasdeCalais',  'BasseNormandie',  'HauteNormandie',  'PaysdelaLoire', 'Picardie', 
'PoitouCharentes', 'ProvenceAlpesCôted\'Azur',   'RhôneAlpes' ];


// Mettre ici le code pour extraire les informations départementales
//===============================
var CSVData = [];
var womenByDept = [];
var peopleByDept = [];
var womenByReg = [];
var peopleByReg = [];
var DeptAgesTranspGESPeu = [];
var DeptAgesTranspGESAssez = [];
var DeptAgesTranspGESBeaucoup = [];
var DeptAgesTranspGESPasdutout = [];

//Cette fonction charge le fichier csv, fait les extractions utiles et remplit les tableaux
function init() {
  //console.log( "findRegion =" + findRegion("Ile-de-France") );
  d3.csv("barometre-representations-sociales-du-changement-climatique.csv", function(csv) { 
      csv.map(function(d){ 
            var CSVLine = {};
            for(var key in d) {
                   CSVLine[key]=d[key];
            }
           CSVData.push( CSVLine );
           
           var dep = CSVLine['Département'];
           var regLine = CSVLine['Région'];
           var transpGES = CSVLine['q18_i2. Causes GES transports'];
           var age = CSVLine['S2. âge'];
           //console.log("transpGES = " +  transpGES);
           //console.log("Ages = " +  age);    
           var reg = findRegion(regLine);   
           //console.log("reg = " +  reg);    
           var sex = CSVLine['S1. genre'];
           //console.log("Sex = " +  sex); 
           if(womenByDept[dep] == null ) 
                   womenByDept[dep]  = 0;
           if(peopleByDept[dep] == null ) 
                   peopleByDept[dep] = 1;
           else
                   peopleByDept[dep] = peopleByDept[dep]  +1;
            if(reg.length != 0)      
            {        
             for(let k=0; k< reg.length; k++)
             {
               if( transpGES == 'Peu') {
           	  if(DeptAgesTranspGESPeu[reg[k]] == null ) 
                   DeptAgesTranspGESPeu[reg[k]] = [];
           	  else if(DeptAgesTranspGESPeu[reg[k]][age] == null ) 
                   DeptAgesTranspGESPeu[reg[k]][age] = 0;
           	  else         
           	 {
                   DeptAgesTranspGESPeu[reg[k]][age] = DeptAgesTranspGESPeu[reg[k]][age] + 1;  
                   console.log("DeptAgesTranspGESPeu reg=" + reg[k] + ", ages=" + age +", val="  + DeptAgesTranspGESPeu[reg[k]][age] );
           	 }
              }
             }
           }
           
           if(reg.length != 0)      
           {
              for(let k=0; k< reg.length; k++)
              {
                if( womenByReg[reg[k]] == null ) 
                   womenByReg[reg[k]]  = 0;
                if( peopleByReg[reg[k]] == null ) 
                   peopleByReg[reg[k]] = 1;
                else     
                   peopleByReg[reg[k]] = peopleByReg[reg[k]] + 1 ;
              }
           }
           
           if(sex == 'Une femme' ) { 
                   womenByDept[dep] = womenByDept[dep] + 1 ;   
                   if(reg.length != 0 ) {
                        for(let k=0; k< reg.length; k++) {
                          womenByReg[reg[k]] = womenByReg[reg[k]] + 1 ;
                        }
                   }
           }  
           //console.log("Departement=" + dep +", People = " +  peopleByDept[dep]);    
           // mettre ici 
       })
  });     
}

 
function findRegion(composedName) {
   var nospace = composedName.replace(/\s/g, '');
   nospace = nospace.replace(/\t/g, '');
   nospace = nospace.replace(/-/g, '');
   //console.log("nospace= "+nospace );
   if(nospace == 'ÎledeFrance')
      nospace = 'IledeFrance';
   var names = [];
   var k=0;
   for(let i=0; i< regions.length; i++ ) {
     if( nospace.includes(regions[i]) )
       names[k++] = regions[i];
   }
   return names;
}
//===============================
 
//Cette fonction est appelée depuis "paths.forEach( function (path) ... )" plus bas
//Elle visualise les informations concernant un département
function render(region) {
     //affichage dans le console pour le debugage
    console.log("entering into render !");
     
    //==================================
    var data = [];
    //Enlever des espaces
    var nospace = region.replace(/\s/g, '');
    //Enlever des tab
    nospace = nospace.replace(/\t/g, '');
    //Enlever des tirets
    nospace = nospace.replace(/-/g, '');
     if(nospace == 'ÎledeFrance')
        nospace = 'IledeFrance';
    data.push(DeptAgesTranspGESPeu[nospace]["65 ans et +"]);
    data.push(DeptAgesTranspGESPeu[nospace]["50-64 ans"]);
    data.push(DeptAgesTranspGESPeu[nospace]["35-49 ans"]);
    data.push(DeptAgesTranspGESPeu[nospace]["15-17 ans"]);
    data.push(DeptAgesTranspGESPeu[nospace]["35-49 ans"]);
    data.push(DeptAgesTranspGESPeu[nospace]["25-34 ans"]);
    //console.log("data=" + data);
     
    //===================================
    
    //console.log(data);
    //"map__pie" défini dans css
    var svg = d3.select('.map__pie').select("svg"),
			width = svg.attr("width"),
			height = svg.attr("height"),
			radius = Math.min(width, height) / 2,
			g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
			
    var color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);
		// Generer "the pie"
    var pie = d3.pie();
		// Generer "the arcs"
    var arc = d3.arc()
					.innerRadius(0)
					.outerRadius(radius);
		//Generer "groups"
    var arcs = g.selectAll("arc")
					.data(pie(data))
					.enter()
					.append("g")
					.attr("class", "arc")

		//Dessiner "arc paths"
		arcs.append("path")
			.attr("fill", function(d, i) {
				return color(i);
			})
			.attr("d", arc);
	       arcs.append("text").attr('dy','20').attr('dx','-30').text(region);	
    //}); 		
}

//Cette fonction est appelée automatiquement quand le curseur de souris entre ou quitte une région
//"path" correspond à la balise "path" dans SVG
paths.forEach( function (path) { 
     //path.addEventListener('mouseenter', render);
     path.addEventListener('mouseenter', function (e)  { 
        //console.log(path.getAttribute("title") );  
        render(path.getAttribute("title"));
         
     });   
     path.addEventListener('mouseleave', function (e)   {
     console.log("Leave")
     d3.select(".map__pie").select("svg").select("g").remove();
    } )
})



