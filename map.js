// Chargement du fichier CSV
d3.csv("barometre-representations-sociales-du-changement-climatique.csv").then(function (data) {
  let DeptTransportMeans = {};
  let DeptImpactData = {};
  let DeptGESData = {};
  let nationalGESData = {};
  let DeptSympathyData = {};

  const responseMap = {
    'Assez': 0.75,
    'Beaucoup': 1,
    'Peu': 0.5,
    'Pas du tout': 0.25,
    'No rep.': 0
  };

  const color1 = '#56C9E8';
  const color2 = '#FCAB32';
  const color3 = '#E12436';
  const color4 = '#1D5564';
  const color5 = '#FFFFFF';


  const axes = [
    'q18_i1. Causes GES activités industrielles', 'q18_i2. Causes GES transports', 'q18_i3. Causes GES bâtiments', 'q18_i4. Causes GES agriculture', 'q18_i5. Causes GES centrales de production d\'électricité au gaz, charbon ou fuel',
    'q18_i6. Causes GES traitement des déchets', 'q18_i7. Causes GES destruction des forêts', 'q18_i8. Causes GES centrales nucléaires', 'q18_i9. Causes GES activité volcanique', 'q18_i10. Causes GES bombes aérosols'
  ];

  const sympathyMap = {
    '...pas de sympathie du tout ?': 0,
    '...peu de sympathie ?': 0.25,
    '...assez de sympathie ?': 0.5,
    '...beaucoup de sympathie ?': 1,
    'No rep.': 0
  };

  data.forEach(function (row) {
    const department = row["Département"]; // Récupérer le département
    const transport = row["s22. Mode de transport"]; // Récupérer le mode de transport
    const impact = row["q5. Certitude/hypothèse impact effet de serre"]; // Récupérer la certitude
    const sympathy = row["s25. Sympathie mouvements écologistes"]; // Récupérer la sympathie des mouvements écologistes

    if (!DeptGESData[department]) {
      DeptGESData[department] = {};
    }

    axes.forEach(function (axis) {
      const value = row[axis];
      DeptGESData[department][axis] = responseMap[value] || 0;
      console.log(`Département: ${department}, Axe: ${axis}, Valeur: ${DeptGESData[department][axis]}`);

    });

    if (!DeptTransportMeans[department]) {
      DeptTransportMeans[department] = {
        voiture: 0,
        transports: 0,
        velo_pied: 0,
        train: 0,
        norep: 0
      };
    }

    if (transport === "En voiture (même si vous n'êtes pas le conducteur)") {
      DeptTransportMeans[department].voiture += 1;
    } else if (transport === "En transports en commun urbains (dont métro)") {
      DeptTransportMeans[department].transports += 1;
    } else if (transport === "En vélo ou à pied") {
      DeptTransportMeans[department].velo_pied += 1;
    } else if (transport === "En train") {
      DeptTransportMeans[department].train += 1;
    } else {
      DeptTransportMeans[department].norep += 1;
    }

    if (!DeptImpactData[department]) {
      DeptImpactData[department] = { certitude: 0, hypothese: 0 };
    }

    if (impact === "...une hypothèse sur laquelle les scientifiques ne sont pas tous d'accord ?") {
      DeptImpactData[department].hypothese += 1;
    } else if (impact === "...ou bien une certitude pour la plupart des scientifiques ?") {
      DeptImpactData[department].certitude += 1;
    }

    if (!DeptSympathyData[department]) {
      DeptSympathyData[department] = {
        noSympathy: 0,
        littleSympathy: 0,
        enoughSympathy: 0,
        aLotOfSympathy: 0
      };
    }

    if (sympathy === "...pas de sympathie du tout ?") {
      DeptSympathyData[department].noSympathy += 1;
    } else if (sympathy === "...peu de sympathie ?") {
      DeptSympathyData[department].littleSympathy += 1;
    } else if (sympathy === "...assez de sympathie ?") {
      DeptSympathyData[department].enoughSympathy += 1;
    } else if (sympathy === "...beaucoup de sympathie ?") {
      DeptSympathyData[department].aLotOfSympathy += 1;
    }
  });

  const nationalSums = axes.reduce((acc, axis) => {
    acc[axis] = 0;
    data.forEach(function (row) {
      const value = row[axis];
      acc[axis] += responseMap[value] || 0;
    });
    acc[axis] /= data.length;
    return acc;
  }, {});

  Object.keys(DeptTransportMeans).forEach(function (dep) {
    const total = DeptTransportMeans[dep].voiture +
      DeptTransportMeans[dep].transports +
      DeptTransportMeans[dep].velo_pied +
      DeptTransportMeans[dep].train +
      DeptTransportMeans[dep].norep;

    DeptTransportMeans[dep].voiture /= total;
    DeptTransportMeans[dep].transports /= total;
    DeptTransportMeans[dep].velo_pied /= total;
    DeptTransportMeans[dep].train /= total;
    DeptTransportMeans[dep].norep /= total;
  });

  function renderRadarChart(dep) {
    const svg = d3.select('.map__spider svg');
    svg.selectAll("*").remove(); // Supprimer les anciens graphiques

    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const radius = Math.min(width, height) / 2;
    const angleSlice = Math.PI * 2 / axes.length;

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const radiusScale = d3.scaleLinear().range([0, radius]);

    const axesData = axes.map(axis => DeptGESData[dep][axis] || 0);
    const nationalData = axes.map(axis => nationalSums[axis] || 0);

    const arc = d3.arc().innerRadius(0).outerRadius(function (d) { return radiusScale(d); });

    const radarLine = d3.lineRadial()
      .radius(function (d) { return radiusScale(d); })
      .angle(function (d, i) { return i * angleSlice; });

    // Créer la ligne pour les données départementales
    g.append("path")
      .datum(axesData)
      .attr("class", "radar-line")
      .attr("d", radarLine)
      .style("fill", "white") 
      .style("stroke", "white")
      .style("stroke-width", 2);

    g.append("path")
      .datum(nationalData)
      .attr("class", "radar-line")
      .attr("d", radarLine)
      .style("fill", "rgba(86, 200, 232, 0.59)") // Couleur nationale
      .style("stroke", "white")
      .style("stroke-width", 2);

    g.selectAll(".axis")
      .data(axes)
      .enter()
      .append("line")
      .attr("class", "axis")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", function (d, i) {
        return radiusScale(1) * Math.cos(angleSlice * i - Math.PI / 2);
      })
      .attr("y2", function (d, i) {
        return radiusScale(1) * Math.sin(angleSlice * i - Math.PI / 2);
      })
      .style("stroke", "#ccc")
      .style("stroke-width", 1);

    g.selectAll(".axis-label")
      .data(axes)
      .enter()
      .append("text")
      .attr("class", "axis-label")
      .attr("x", function (d, i) {
        return radiusScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2);
      })
      .attr("y", function (d, i) {
        return radiusScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2);
      })
      .text(function (d, i) {
        return axes[i].replace('q18_', '').replace('_', ' ').toUpperCase();
      })
      .style("font-size", "12px")
      .attr("font-family", "'DS-Digital', sans-serif") // Appliquer la police
      .style("fill", "#fff");
  }
  function renderBarChart(dep) {
    var svg = d3.select('.map__transport').select("svg");
    svg.selectAll("*").remove(); // Supprimer les anciens graphiques

    var width = svg.attr("width");
    var height = svg.attr("height");
    var marginBottom = 20; 

    var data = DeptTransportMeans[dep] || {
      voiture: 0.6,
      transports: 0.3,
      velo_pied: 0.05,
      train: 0.05,
      norep: 0
    };

    var transportData = [
      { label: 'Voiture', value: data.voiture },
      { label: 'Transports urbains', value: data.transports },
      { label: 'Vélo / Pied', value: data.velo_pied },
      { label: 'Train', value: data.train },
      { label: 'No rep.', value: data.norep }
    ];

    var xScale = d3.scaleLinear()
      .domain([0, 1])  
      .range([0, width]);  

    var color = d3.scaleOrdinal()
      .domain(['Voiture', 'Transports urbains', 'Vélo / Pied', 'Train', 'No rep.'])
      .range([color1, color2, color3, color4, color5]);

    var g = svg.append("g");

    var xPosition = 0;

    transportData.forEach(function (d) {
      g.append("rect")
        .attr("x", xScale(xPosition)) // Position du segment sur l'axe horizontal
        .attr("y", 0) // La barre est sur l'axe horizontal, donc y = 0
        .attr("width", xScale(d.value) - xScale(0)) // Largeur du segment
        .attr("height", height - marginBottom) // Réduire la hauteur pour laisser de la place pour les pourcentages
        .attr("fill", color(d.label)); // Couleur du segment


      g.append("text")
        .attr("x", xScale(xPosition) + (xScale(d.value) / 2)) // Position horizontale centrée sur le segment
        .attr("y", height - marginBottom + 15) // Position verticale sous la barre
        .attr("fill", "white") // Couleur du texte
        .attr("text-anchor", "middle") // Centrer le texte
        .text(Math.round(d.value * 100) + "%") // Afficher le pourcentage
        .attr("font-family", "'DS-Digital', sans-serif"); // Appliquer la police

      xPosition += d.value; // Mettre à jour la position pour le prochain segment
    });

    svg.append("g")
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${Math.round(d * 100)}%`));
  }

  function renderPieChart(dep) {
    var svg = d3.select('.map__pie').select("svg");
    svg.selectAll("*").remove(); // Supprimer les anciens graphiques
    var width = svg.attr("width"),
      height = svg.attr("height"),
      radius = Math.min(width, height) / 2;

    var g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    var color = d3.scaleOrdinal([color4, "white"]); // Couleurs pour hypothese et certitude
    var pie = d3.pie();
    var arc = d3.arc().innerRadius(0).outerRadius(radius);

    const total = DeptImpactData[dep].hypothese + DeptImpactData[dep].certitude;
    const hypotheseProportion = DeptImpactData[dep].hypothese / total;
    const certitudeProportion = DeptImpactData[dep].certitude / total;

    var data = [hypotheseProportion, certitudeProportion];

    var arcs = g.selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("fill", (d, i) => color(i))
      .attr("d", arc);

    arcs.append("text")
      .attr("font-family", "'DS-Digital', sans-serif") // Appliquer la police
      .attr('dy', '20')
      .attr('dx', '-30')
      .text(function (d) {
        return Math.round(d.data * 100) + "%";
      });
  }

  function renderSympathyChart(dep) {
    var svg = d3.select('.map__sympathie svg');
    svg.selectAll("*").remove(); // Supprimer les anciens graphiques

    var width = svg.attr("width");
    var height = svg.attr("height");

    var data = DeptSympathyData[dep] || {
      noSympathy: 0,
      littleSympathy: 0,
      enoughSympathy: 0,
      aLotOfSympathy: 0
    };

    var sympathyData = [
      { label: 'Pas de sympathie', value: data.noSympathy },
      { label: 'Peu de sympathie', value: data.littleSympathy },
      { label: 'Assez de sympathie', value: data.enoughSympathy },
      { label: 'Beaucoup de sympathie', value: data.aLotOfSympathy }
    ];

    var total = sympathyData.reduce((sum, d) => sum + d.value, 0);

    if (total > 0) {
      sympathyData.forEach(d => {
        d.value = d.value / total;  // Calculer la proportion de chaque valeur
      });
    }

    var yScale = d3.scaleLinear()
      .domain([0, 1])  // Plage de valeurs de 0 à 1
      .range([height, 0]);  // Échelle verticale

    var xScale = d3.scaleBand()
      .domain(sympathyData.map(d => d.label))  // Les étiquettes des barres
      .range([0, width])  // Plage horizontale
      .padding(0.1);  // Espacement entre les barres

    var color = d3.scaleOrdinal()
      .domain(['Pas de sympathie', 'Peu de sympathie', 'Assez de sympathie', 'Beaucoup de sympathie'])
      .range([color1, color2, color3, color4]);

    var g = svg.append("g");

    g.selectAll(".bar")
      .data(sympathyData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.label))  // Position horizontale des barres
      .attr("y", d => yScale(d.value))  // Position verticale en fonction de la valeur
      .attr("width", xScale.bandwidth())  // Largeur des barres
      .attr("height", d => height - yScale(d.value))  // Hauteur de la barre, calculée en fonction de la valeur
      .attr("fill", d => color(d.label));  // Couleur des barres

    g.selectAll(".text")
      .data(sympathyData)
      .enter().append("text")
      .attr("x", d => xScale(d.label) + xScale.bandwidth() / 2)  // Centrer l'étiquette sur chaque barre
      .attr("y", d => yScale(d.value) - 5)  // Position verticale au-dessus de la barre
      .attr("dy", ".35em")  // Pour centrer verticalement le texte
      .attr("fill", "white")  // Couleur du texte
      .attr("font-family", "'DS-Digital', sans-serif") // Appliquer la police
      .attr("text-anchor", "middle")  // Centrer le texte
      .text(d => Math.round(d.value * 100) + "%");  // Afficher le pourcentage

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)  // Déplacer l'axe à la base du graphique
      .call(d3.axisBottom(xScale));  // Afficher les étiquettes sur l'axe horizontal

    svg.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${Math.round(d * 100)}%`));  // Afficher les pourcentages sur l'axe vertical
  }


  var paths = document.querySelectorAll('#carte-france path');

  const departement_name = document.getElementById("departement-name");
  const departementNameSpan = document.getElementById("departement-name-h2");

  const departments = document.querySelectorAll("#carte-france path");

  departments.forEach(department => {
    department.addEventListener("mouseover", (event) => {
      const departmentName = event.target.getAttribute("name"); // Récupère le nom du département
      departement_name.textContent = departmentName;
      departement_name.style.visibility = "visible";
      departementNameSpan.textContent = departmentName; // Met à jour le contenu du span
    });

    department.addEventListener("mousemove", (event) => {
      const xValue = event.pageX + 10;
      const yValue = event.pageY + 10;

      if (!isNaN(xValue) && !isNaN(yValue)) {
        departement_name.style.top = `${yValue}px`;
        departement_name.style.left = `${xValue}px`;
      }
    });

    department.addEventListener("mouseout", () => {
      departement_name.style.visibility = "hidden";
      departementNameSpan.textContent = ""; 
    });
  });

  paths.forEach(function (path) {
    path.addEventListener('mouseenter', function () {
      var dep = path.getAttribute("name");
      renderBarChart(dep);
      renderPieChart(dep);
      renderRadarChart(dep);
      renderSympathyChart(dep);
    });
  });
});

