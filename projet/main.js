//Width and height
var svgWidth = 650;
var svgHeight = 450;

margin = { "top": 25, "right": 25, "bottom": 50, "left": 50}
w =  svgWidth - margin.left - margin.right
h = svgHeight - margin.top - margin.bottom 

//Define map projection
var projection = d3.geoMercator()
            .translate([0,0])
            .scale([1])
            .rotate([20,20])


//Define path generator
var path = d3.geo.path()
        .projection(projection);
        



//utiliser des promesses pour recuperer et lire nos fichiers JSON / GeoJson

var promise1 = new Promise ((resolve, reject) =>{ 
     d3.json('projet/usthbBrut2.geojson', usthbData => {
        if(usthbData != null){ resolve(usthbData) }else{ reject(usthbData) }
    })
});



// M1 IV 
var promiseIV1 = new Promise ((resolve, reject) =>{  
    d3.json('projet/specialities//M1.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    }); 
});


//M2 IV
var promiseIV2 = new Promise ((resolve, reject) =>{ 
    d3.json('projet/specialities//M2.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    })
});


//M1 SII
var promiseSII1 = new Promise ((resolve, reject) =>{  
    d3.json('projet/specialities/M1_SII.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    });   
});

//M2 SII
var promiseSII2 = new Promise ((resolve, reject) =>{ 
    d3.json('projet/specialities/M2_SII.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    })
});


//M1 Reseau
var promiseRSD1 = new Promise ((resolve, reject) =>{ 
    d3.json('projet/specialities/M1_RSD.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    })
});


//M2 Reseau
var promiseRSD2 = new Promise ((resolve, reject) =>{ 
    d3.json('projet/specialities/M2_RSD.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    })
});



//M1 BIG DATA
var promiseBDATA1 = new Promise ((resolve, reject) =>{ 
    d3.json('projet/specialities/M1_BIGDATA.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    })
});


//M2 BIG DATA
var promiseBDATA2 = new Promise ((resolve, reject) =>{ 
    d3.json('projet/specialities/M2_BIGDATA.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    })
});


var ScaleZ = 2;                                  // Scale du zoom qu'on utilisera plus tard
                              //Vecteur utilisé pour recuperer les positions des paths pour le zoom

//Declaration des vecteurs et variables
var positions = []                               // vecteur des localisations
var Clean_Vect_Loc = []                          // vecteur de localisations filtrés

var profs = []                                   // vecteur qui contiendra les profs 
var Clean_Vect_Prof =[]                          // vecteur qui contiendra les profs apres filtrage 
var profF = []                                   // vecteur des profs utilisé pour les test plus tard 

var Vect_Seances = []                            // vecteur qu'on utilisera pour recuperer les données des seances (propriétés)
var Clean_Vect_Seances = []                      //filtrer le Vect_Seances




//Declaration et gestion des bouttons 
var M1BTN
var M2BTN
DATA = []
SetBtn = new Set()          


//Recuperations des donnees a partir des promesses déclarées au dessus une par une 
Promise.all([promise1, promiseIV1, promiseIV2, promiseSII1, promiseSII2, 
            promiseRSD1, promiseRSD2, promiseBDATA1, promiseBDATA2])
.then(function(data){

    clickedList = []                
    json = data[0]


//------------------------------------Partie gestion des données et display--------------------------------\\



    function Reset(){
        //recolour all selected paths and reset them
        d3.selectAll(".selectedpaths").classed("selected-path", false)
        for(i of clickedList){
            ViewInfos(i, i, false)
        }

        if(M1BTN.className == 'btn-selected' || M2BTN.className == 'btn-selected'){
           
            for (const item of SetBtn) {
                LoadData(item, true) //Bool data of the 02 selected buttons
              }
            
            ColorierRegion(Clean_Vect_Loc)

            M1BTN.className = 'btn'
            M2BTN.className = 'btn'
            samediButton.className = 'btn'
            dimancheButton.className  = 'btn'
            lundiButton.className = 'btn'
            mardiButton.className  = 'btn'
            mercrediButton.className  = 'btn'
            jeudiButton.className  = 'btn'
        } 
    }

    function RemplirData(btn, DATA, dayName, Bool){
        for(var S in DATA){
                   
            J =  DATA[S].days[dayName]
            console.log(J);
            for(var cours in J){
                seance = J[cours]
    
                if(Bool == false){
                    btn.className = 'btn-selected'
                    console.log("group1",)
                    Vect_Seances.push([seance.cours.loc, seance.cours.prof, seance.cours.Subject, seance.cours.Time])

                    for(z of clickedList){

                        ViewInfos(z[0], z[1], false)
                    }

                }  else {
                    btn.className = 'btn'
                    Vect_Seances.splice(positions.indexOf([seance.cours.loc, seance.cours.prof, seance.cours.Subject, seance.cours.Time]), 1)
                    //TDOO: maintain previous m1, m2 data when the user unclick the J button
                  
                }
    
    
                for(var group in seance.groups){
                    var location = seance.groups[group].loc
                    var prof = seance.groups[group].prof
                    var Subject = seance.groups[group].Subject
                    var Time = seance.groups[group].Time
                    //check if we need to add positions, or remove them from the list when the user unclick the button
                    if(Bool == false){
                        Vect_Seances.push([location, prof, Subject, Time, J])
                    }  else {
                        //Vect_Seances.splice(Vect_Seances.indexOf(location), 1)
                        Vect_Seances.splice(positions.indexOf([location, prof, Subject, Time, J]), 1)

                    } 
                }
            }
        }
        Vect_Pos_Jour_Filter = Vect_Seances.filter(element => {
            if(element[0] != undefined) return element
          });
        ColorierRegion(Vect_Pos_Jour_Filter)

        
    }
    
    function GetDataByDay(btn, DATA, dayName, Bool){
    
        //this.className = 'btn-selected'
        //in order to get the data of 01 J, we nned to check of m1 button is pressed , or m2 or both.
        M1BTN = document.getElementById('m1');
        M2BTN = document.getElementById('m2');
    
        if(M1BTN.className == 'btn-selected' && M2BTN.className =='btn-selected'){
            //create an array with the positions in M1 and M2 in a specific J
          
            const iter =  SetBtn.values();

            for(var i of iter){
                console.log("positions of both m1 and m2 are:",i)
                RemplirData(btn,i, dayName, Bool)
            }
            
        }else{
            if(M1BTN.className == 'btn-selected' && M2BTN.className != 'btn-selected'){
                
                RemplirData(btn,DATA, dayName, Bool)
    
            }else{
                if(M1BTN.className != 'btn-selected' && M2BTN.className == 'btn-selected'){
                    RemplirData(btn,DATA, dayName, Bool)
                }else{
                    //do nothing, can't select J buttons
                    alert("veuillez sélectionner au moin un semestre.")
                }
            }
        }
    }

    function LoadData(DATA, Bool){

        for(var S in DATA){                  // S : variable qui va recuperer les semestres 
            
            for(var J in DATA[S].days){          //J : recuperer les jours de cours a partir de DATA[S]
                
                for(var cours in DATA[S].days[J]){
                    
                    seance = DATA[S].days[J][cours]
                    //gestion des intéractions avec les boutons Master1 et Master2 
                    if(Bool == false){
                        positions.push([seance.cours.loc, seance.cours.prof, seance.cours.Subject, seance.cours.Time, "toute la section", J])
                        profs.push([seance.cours.prof, seance.cours.loc])

                        //TODO: push profs in another array here with their positions
                    }  else {
                        positions.splice(positions.indexOf([seance.cours.loc, seance.cours.prof, seance.cours.Subject, seance.cours.Time, "toute la section", J]), 1)
                        profs.splice(profs.indexOf([seance.cours.prof, seance.cours.loc]), 1)
                    }
    
                    //the positions exists also in "groups"
                    for(var group in DATA[S].days[J][cours].groups){

                        var location = DATA[S].days[J][cours].groups[group].loc
                        var prof =  DATA[S].days[J][cours].groups[group].prof
                        var Subject = DATA[S].days[J][cours].groups[group].Subject
                        var Time =  DATA[S].days[J][cours].groups[group].Time
    
                        //check if we need to add positions, or remove them from the list when the user unclick the button
                        if(Bool == false){
                            positions.push([location, prof, Subject, Time, group, J])
                            profs.push([prof, location])

                        }  else {
                             positions.splice(positions.indexOf([location, prof, Subject, Time, group, J]), 1)
                             profs.splice(profs.indexOf([prof, location]), 1)
                        }
                        
                    }
                    
                }   
            }
        }
    
        //the set function considers "undefined" as a value, so we remove it.
          Clean_Vect_Loc = positions.filter(element => {
            return element[0] !== undefined;
          }); 

          Clean_Vect_Prof = profs.filter(element => {
            if(element[0] != undefined) return element
          });

        
        for(i=0; i< Clean_Vect_Loc.length; i++){
            if(!profF.includes(Clean_Vect_Loc[i][1])){

                profF.push(Clean_Vect_Loc[i][1])

                d3.select("#dropdown")
                .append("option")
                .attr("id", Clean_Vect_Loc[i][1])   
                .text(Clean_Vect_Loc[i][1])
            }
            
        }
          
    }

    function selectButton() {

        samediButton    = document.getElementById('Sam');
        dimancheButton  = document.getElementById('Dim');
        lundiButton     = document.getElementById('Lun');
        mardiButton     = document.getElementById('Mar');
        mercrediButton  = document.getElementById('Mer');
        jeudiButton     = document.getElementById('Jeu');
        
        if(this.id == 'm1' || this.id == 'm1_profs' || this.id == 'm2' || this.id == 'm2_profs'){

            m2_prof = document.getElementById('m2_profs');
            m1_prof = document.getElementById('m1_profs');
            DATA = window[this.id] 
            SetBtn.add(DATA)        
            
            //Si on clique sur les boutons Master1 ou Master2 des profs on désélectionne ceux des etudiants
            if(this.id == 'm1_profs' || this.id == 'm2_profs' ){
               Reset()
            }         
          
            //mettre les donnees des jours selon l'année Master choisie
            samedi   = DATA[0].days.Sam
            dimanche = DATA[0].days.Dim
            lundi    = DATA[0].days.Lun
            mardi    = DATA[0].days.Mar
            mercredi = DATA[0].days.Mer
            jeudi    = DATA[0].days.Jeu        
            

            if(this.className == 'btn'){
                this.className = 'btn-selected' 
                LoadData(DATA, false)
                if(this.id == "m1" || this.id == "m2"){
                    ColorierRegion(Clean_Vect_Loc)
                }
                
            }else {
                if(samediButton.className == "btn" && dimancheButton.className == "btn" 
                && lundiButton.className == "btn" && mardiButton.className == "btn" && mercrediButton.className == "btn"  && mercrediButton.className == "btn" ){
                this.className = 'btn'
                LoadData(DATA, true)
                ColorierRegion(Clean_Vect_Loc)
                }
            }
        }else{ //gerer les intéractions avec les clics avec les jours de semaines
            dayName = this.id               
            if(this.className == 'btn'){
                GetDataByDay(this, DATA, dayName, false)
            }  else {
                GetDataByDay(this , DATA, dayName, true); 

                //Si tous les boutons des jours de semaines sont désélectionnés, alors afficher les créneaux  Master1 et Master2
                if(samediButton.className == "btn"     && dimancheButton.className == "btn" 
                 && lundiButton.className == "btn"     && mardiButton.className == "btn"
                 && mercrediButton.className == "btn"  && mercrediButton.className == "btn" ){
                    ColorierRegion(Clean_Vect_Loc)
                }
            }
        }
    }
    
    M1BTN = document.getElementById('m1');
    M2BTN = document.getElementById('m2');

    function ColorierRegion(Clean_Vect_Loc){
    
        loc_paths = svg.selectAll("path")
        .data(json.features)  //usthb geojson DATA  
        .attr("d", path)
        .on("click", function(d, i) {
            selectedPath = d3.select(this)
            selectedPath.attr("class", "selectedpaths")
            d3.select("#shapeAnimation").classed("shapeAnimation", true)
            loc = (d['properties'].name).toString()
            if(d['properties'].name2 != undefined) loc2 = (d['properties'].name2).toString()
                

                if(clickedList.includes(loc) && clickedList.includes(loc2)  ){ //unselect a location
                    
                    console.log( loc, loc2)
                    console.log("clickedList before removing is : ", clickedList)
                    selectedPath.classed("selected-path", false)
                    ViewInfos(loc, loc2, false)
                    clickedList.splice(clickedList.indexOf(loc), 1);
                    clickedList.splice(clickedList.indexOf(loc2), 1);

                    console.log("clickedList is now:", clickedList)
                    NextInfo(-1)
                    
                }else{ //Select a location

                    if(loc != "ground") selectedPath.classed("selected-path", true).attr("id","_" + d["properties"].name)
                   
                    console.log(loc, loc2)
                    console.log("clickedList before adding: ", clickedList)

                    ViewInfos(loc, loc2, true)
                    clickedList.push(loc)
                    clickedList.push(loc2)
                    console.log("clickedList is now:", "first:",clickedList)
                    NextInfo(1)
                }
                
                setTimeout( ()=>{
                    d3.select("#shapeAnimation").classed("shapeAnimation", false)

                }, 300)
            })
            .attr("id", function(d,i){ return "_" + i; } )
            .attr("fill" , (d,i)=>{
                
                if(d['properties'].name == "ground"){
                    return "#085713 "                // au moment de selection des specs on garde la couleur du ground la meme
                }else
                {
                    loc = (d['properties'].name)
                    loc_floor2 = (d['properties'].name2)
                    
                    if(d['properties'].name != undefined) loc = (d['properties'].name).toString()
                    if(d['properties'].name2 != undefined) loc_floor2 = (d['properties'].name2).toString()
                        if( ((Clean_Vect_Loc.some( a => a.includes(loc)) && loc!= null) || (Clean_Vect_Loc.some( a => a.includes(loc_floor2))&& loc_floor2!= null) )  ){

                            //centroid of all paths, will be used later to zoom to specefic places
                            centroid = path.centroid(d.geometry); 
                            //console.log("centorid of located path: ", centroid)
                           

                            d3.select("#_" + i).attr("pointer-events","auto")
                            console.log(Clean_Vect_Loc)
                            return ("#0E7DE0")              // if pour mettre les salles de la specialité séléctionnée en vert
                        }else{
                            //console.log(loc, typeof(loc))
                            //console.log("the locations2", Clean_Vect_Loc)
                            return ("#9D6A16")            // sinon (pour les salles qui ne figurent pas sur les edt de la specialité/ année séléctionnée ) mettre en bleu ciel (differente de la couleur du ground)
                        }
                }
            })

    }

   
//------------------------------------Partie choix de specialites et profs (dropdown)----------------------------------\\

    /* this function loads the files based on what the user selects in the dropdown */
    d3.select("select").on("change", function(){
        selectedSpeciality = d3.select("#specialities").node().value;
        for(year of data){
            for(var S in year){
                if( (year[S]['specialty'] != undefined ) ){
                    if(year[0]['specialty'] == selectedSpeciality){
                        Reset()
                        if(year[S]['year'] == '1'){
                            m1 = year 
                            m1_profs = year
                        }
                        else
                        {
                            m2 = year
                            m2_profs = year
                        }
                        d3.selectAll("#m1, #m2, #m1_profs, #m2_profs, #Sam," 
                                        +"#Dim, #Lun, #Mar, #Mer, #Jeu").on("click", selectButton)
                    }
                }
            }
          }
    })

    //Choisir les profs
    d3.select("#dropdown")
    .on("change",function(d){
        prof_locs = []
        var selected = d3.select("#dropdown").node().value;             //recuperer le nom du prof séléctionné 
        console.log(selected);
        for(var prof of Clean_Vect_Loc){
            if(prof[1] == selected){
                console.log(prof[1],"enseigne dans : ", prof[0])
                prof_locs.push([prof[0], prof[1]])
            }
        }
        if(selected != "Aucun"){
            d3.select("#selected-dropdown").text(selected+" enseigne dans les salles: " + prof_locs);
            console.log(prof_locs);
            ColorierRegion(prof_locs)
            
        }
        else{
            d3.select("#selected-dropdown").text("veuillez sélectionner un enseignant.");
        } 
    })
  
//------------------------------------Partie Zoom----------------------------------\\

    const zoom = d3.zoom()
    .scaleExtent([1, 25]).translateExtent([[-100, -100], [1000, 900]]).on("zoom", zoomed);

    function zoomed() {
        svg.selectAll("path").attr("transform", d3.event.transform);
      }
    var svg = d3.select("#svg")
        .attr("width",  w)
        .attr("height",  h)
        .style('stroke-width', '0.2px')
        .attr("stroke", "black")
        .call(zoom)
        .append("g");        
    var b = path.bounds(json);
    s = .99 / Math.max( (b[1][0] - b[0][0]) / w , (b[1][1] - b[0][1]) / h ); 
    t = [ (w - s * (b[1][0] +b[0][0])) / 2 , (h - s * (b[1][1]+b[0][1])) / 2 ];
    projection.translate(t).scale(s);
    var z = d3.behavior.zoom() 
    MajSvg(svg)
});

//------------------------------------Partie affichage et gestion de créneaux--------------------------------\\
var slideIndex = 1;
GetInfo(slideIndex);

function NextInfo(n) {
  GetInfo(slideIndex += n);
}

function currentSlide(n) {
  GetInfo(slideIndex = n);
}

function GetInfo(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace("dot-active","");
    }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += "dot-active";
}

function ViewInfos (locationName1, locationName2, clickState){
    if(locationName1 != undefined) loc = locationName1
    if(locationName2 != undefined) loc_floor2 = locationName2

    var dot_div = d3.select(".dot-container")

    if(clickState == true){
        for(i of Clean_Vect_Loc){
            if(i.includes(loc) || i.includes(loc_floor2)){

                //this is to create a unique ID for the Div, so we can dynamically remove it
                var horaire = i[3]
                var location = i[0]
                var prof = i[1]
                console.log(horaire);
                horaire = horaire.replace(/\s+/g, '');
                console.log(horaire);
                horaire = horaire.replace(/:/g, '');
                location = location.replace(/./g, '')
                prof = prof.replace(/\s+/g, '');

                
                var divs = d3.select(".slideshow-container")
                .append("div")
                .attr("id", "_"+location+prof+horaire)
                .attr("class", "mySlides")
    
                console.log("_"+location+prof+horaire)
                divs.append("p").attr("id", "salle").text("Salle: "+ i[0])
    
                divs.append("p").attr("id", "enseignant").text("Enseignant: "+ i[1])
    
                divs.append("p").attr("id", "matiere").text("Matière: "+ i[2])
    
                divs.append("p").attr("id", "time").text("Horaire: "+ i[3])
                divs.append("p").attr("id", "groupe").text("Groupe: "+ i[4])
                d3.select("#today")
                .text("  "+i[5])
                //divs.append("p").attr("id", "dat").text("jour: "+ i[5]).attr("class","colored-text")
    
                dot_div.append("span").attr("class", "dot").on("click", currentSlide(1))
    
                d3.select("#indication").style("visibility", "hidden")

       
            }   
        }
    }else{
        //remove the informations when the user unselect a certain button
        for(i of Clean_Vect_Loc){
            if(i.includes(loc) || i.includes(loc_floor2)){
                var divs = d3.select(".slideshow-container")
                
                //this is to create a unique ID for the Div, so we can dynamically remove it
                var horaire = i[3]
                var location = i[0]
                var prof = i[1]
                horaire = horaire.replace(/\s+/g, '');
                horaire = horaire.replace(/:/g, '');
                location = location.replace(/./g, '')
                prof = prof.replace(/\s+/g, '');
                toRemove = divs.select("#_"+location+prof+ horaire)
                console.log("to remove:", location)
                dot_div.select("span").remove()
                toRemove.remove()

                selectedPath = d3.select("#_"+loc)
                selectedPath.classed("selected-path", false)
            }
        }
    }  
}


//------------------------------------Partie mise a jour du SVG--------------------------------\\
function MajSvg(svg){
    svg.selectAll("path")
    .data(json.features)  //usthb geojson DATA  
    .enter()
    .append("path")
    .attr("d", path)
    .style('stroke-width', '0.2px')
    .attr("stroke", "black")
    .attr('transform', 'translate(0,0)')
    .attr("fill" ,d =>{
    if(d.properties.name == "ground"){
            return "#085713 "
    }else{
            return "#9D6A16"
         }
    })

    .on("mouseover", function(d){
        var myScale = d3.scaleLinear()
                .domain([0, 71])
                .range([0, 2]);

        console.log(2 - myScale(ScaleZ))
        if(d['properties'].name != "ground"){ //skip the ground feature
            //console.log(d['properties'].name)
            d3.select(this)
            //.attr("fill", "#79BED9")
            .attr("stroke", "yellow")

            .style('stroke-width', "0.15px") //keep the stroke width proportional with the zoom level
            .style('cursor', "pointer")

            if(d['properties'].name != ""){
                d3.select("#name") //print the place name on the screen when hovering
                .text(d['properties'].name);
            }else{
                d3.select("#name") //print the place name on the screen when hovering
                .text(d['properties'].osm_way_id);
            }
        
        }  
    })

    .on("mouseout", function(d){

            if(d['properties'].name != "ground"){
            d3.select(this)
            //.attr("fill", "#B3E0F1")
            .style('stroke-width', '0.2px')
            .attr("stroke", "black")
            }
            
            d3.select(this).style('fill', d.color);
            d3.select('#tooltip')
              .style('display', 'none');
            
        
    })
    .append('title').text(d => d['properties'].name)   
}