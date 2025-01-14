// Chargement du fichier CSV
d3.csv("barometre-representations-sociales-du-changement-climatique.csv").then(function (data) {
  // Cette fonction est appelée lorsque les données sont chargées
  // On prépare un objet pour stocker les données par département
  let DeptTransportMeans = {};
  let DeptGenderData = {};
  let DeptGESData = {};
  let nationalGESData = {};

  const responseMap = {
    'Assez': 0.75,
    'Beaucoup': 1,
    'Peu': 0.5,
    'Pas du tout': 0.25,
    'No rep.': 0
  };

  const axes = [
    'q18_i1', 'q18_i2', 'q18_i3', 'q18_i4', 'q18_i5',
    'q18_i6', 'q18_i7', 'q18_i8', 'q18_i9', 'q18_i10'
  ];

  // Remplir DeptTransportMeans et DeptGenderData avec les données pertinentes pour chaque département
  data.forEach(function (row) {
    const department = row["Département"]; // Récupérer le département
    const transport = row["s22. Mode de transport"]; // Récupérer le mode de transport
    const genre = row["S1. genre"]; // Récupérer le genre

    if (!DeptGESData[department]) {
      DeptGESData[department] = {};
    }

    axes.forEach(function (axis) {
      const value = row[axis];
      DeptGESData[department][axis] = responseMap[value] || 0;
    });

    // Calculer la proportion pour chaque mode de transport
    if (!DeptTransportMeans[department]) {
      DeptTransportMeans[department] = {
        voiture: 0,
        transports: 0,
        velo_pied: 0,
        train: 0,
        norep: 0
      };
    }

    // Incrémenter les valeurs en fonction du mode de transport
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

    // Calculer les données de genre par département
    if (!DeptGenderData[department]) {
      DeptGenderData[department] = { homme: 0, femme: 0 };
    }

    if (genre === "Un homme") {
      DeptGenderData[department].homme += 1;
    } else if (genre === "Une femme") {
      DeptGenderData[department].femme += 1;
    }
  });

  // Calculer la moyenne nationale
  const nationalSums = axes.reduce((acc, axis) => {
    acc[axis] = 0;
    data.forEach(function (row) {
        const value = row[axis];
        acc[axis] += responseMap[value] || 0;
    });
    acc[axis] /= data.length;
    return acc;
}, {});

  // Normaliser les données pour que chaque valeur soit entre 0 et 1 (proportions)
  Object.keys(DeptTransportMeans).forEach(function (dep) {
    const total = DeptTransportMeans[dep].voiture +
      DeptTransportMeans[dep].transports +
      DeptTransportMeans[dep].velo_pied +
      DeptTransportMeans[dep].train +
      DeptTransportMeans[dep].norep;

    // Normaliser les données
    DeptTransportMeans[dep].voiture /= total;
    DeptTransportMeans[dep].transports /= total;
    DeptTransportMeans[dep].velo_pied /= total;
    DeptTransportMeans[dep].train /= total;
    DeptTransportMeans[dep].norep /= total;
  });

   // Fonction pour dessiner le graphique en araignée
   function renderRadarChart(dep) {
    const svg = d3.select('.map__spider svg');
    svg.selectAll("*").remove(); // Supprimer les anciens graphiques

    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const radius = Math.min(width, height) / 2;
    const angleSlice = Math.PI * 2 / axes.length;

    // Créer un groupe central
    const g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Créer l'échelle pour les axes
    const radiusScale = d3.scaleLinear().range([0, radius]);

    // Ajouter les axes
    const axesData = axes.map(axis => DeptGESData[dep][axis] || 0);
    const nationalData = axes.map(axis => nationalSums[axis] || 0);

    // Créer les arcs pour chaque axe
    const arc = d3.arc().innerRadius(0).outerRadius(function(d) { return radiusScale(d); });

    const radarLine = d3.lineRadial()
        .radius(function(d) { return radiusScale(d); })
        .angle(function(d, i) { return i * angleSlice; });

    // Créer la ligne pour les données départementales
    g.append("path")
        .datum(axesData)
        .attr("class", "radar-line")
        .attr("d", radarLine)
        .style("fill", "rgba(0, 100, 255, 0.7)") // Couleur du département
        .style("stroke", "blue")
        .style("stroke-width", 2);

    // Créer la ligne pour les données nationales
    g.append("path")
        .datum(nationalData)
        .attr("class", "radar-line")
        .attr("d", radarLine)
        .style("fill", "rgba(255, 100, 0, 0.7)") // Couleur nationale
        .style("stroke", "orange")
        .style("stroke-width", 2);

    // Ajouter les axes (lignes des axes)
    g.selectAll(".axis")
        .data(axes)
        .enter()
        .append("line")
        .attr("class", "axis")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function(d, i) {
            return radiusScale(1) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr("y2", function(d, i) {
            return radiusScale(1) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .style("stroke", "#ccc")
        .style("stroke-width", 1);

    // Ajouter les étiquettes des axes
    g.selectAll(".axis-label")
        .data(axes)
        .enter()
        .append("text")
        .attr("class", "axis-label")
        .attr("x", function(d, i) {
            return radiusScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr("y", function(d, i) {
            return radiusScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .text(function(d, i) {
            return axes[i].replace('q18_', '').replace('_', ' ').toUpperCase();
        })
        .style("font-size", "12px")
        .style("fill", "#000");
}


  // Fonction pour afficher le graphique des modes de transport en barres horizontales
  function renderBarChart(dep) {
    var svg = d3.select('.map__transport').select("svg");
    svg.selectAll("*").remove(); // Supprimer les anciens graphiques

    var width = svg.attr("width");
    var height = svg.attr("height");

    // Utiliser les données du département
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

    // Échelle pour l'axe horizontal (proportions)
    var xScale = d3.scaleLinear()
      .domain([0, 1])  // Plage de valeurs de 0 à 1
      .range([0, width]);  // Échelle horizontale

    // Couleurs pour chaque mode de transport
    var color = d3.scaleOrdinal()
      .domain(['Voiture', 'Transports urbains', 'Vélo / Pied', 'Train', 'No rep.'])
      .range(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c']);

    // Créer le groupe pour contenir les segments
    var g = svg.append("g");

    // Ajouter les segments de la barre
    var xPosition = 0;  // Position de départ pour la barre

    transportData.forEach(function (d) {
      g.append("rect")
        .attr("x", xScale(xPosition))  // Position du segment sur l'axe horizontal
        .attr("y", 0)  // La barre est sur l'axe horizontal, donc y = 0
        .attr("width", xScale(d.value) - xScale(0))  // Largeur du segment (proportion du mode de transport)
        .attr("height", height)  // La hauteur de la barre est la même pour tous les segments
        .attr("fill", color(d.label));  // Couleur du segment
      xPosition += d.value;  // Mettre à jour la position pour le prochain segment

      // Ajouter les étiquettes de pourcentage sur chaque segment
      g.append("text")
        .attr("x", xScale(xPosition) - (xScale(d.value) / 2))  // Position horizontale centrée sur le segment
        .attr("y", height / 2)  // Position verticale centrée dans la barre
        .attr("dy", ".35em")  // Pour centrer verticalement le texte
        .attr("fill", "white")  // Couleur du texte
        .attr("text-anchor", "middle")  // Centrer le texte
        .text(Math.round(d.value * 100) + "%");  // Afficher le pourcentage
    });

    // Ajouter l'axe horizontal
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${Math.round(d * 100)}%`));  // Afficher les pourcentages sur l'axe
  }

  // Fonction pour afficher le graphique circulaire des genres (hommes/femmes)
  function renderPieChart(dep) {
    var svg = d3.select('.map__pie').select("svg");
    svg.selectAll("*").remove(); // Supprimer les anciens graphiques
    var width = svg.attr("width"),
      height = svg.attr("height"),
      radius = Math.min(width, height) / 2;

    var g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    var color = d3.scaleOrdinal(['#4daf4a', '#377eb8']); // Couleurs pour Homme et Femme
    var pie = d3.pie();
    var arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Calculer les proportions des genres pour le département
    const total = DeptGenderData[dep].homme + DeptGenderData[dep].femme;
    const hommeProportion = DeptGenderData[dep].homme / total;
    const femmeProportion = DeptGenderData[dep].femme / total;

    var data = [hommeProportion, femmeProportion];

    var arcs = g.selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("fill", (d, i) => color(i))
      .attr("d", arc);

    // Ajouter les étiquettes de pourcentage pour chaque segment
    arcs.append("text")
      .attr('dy', '20')
      .attr('dx', '-30')
      .text(function (d) {
        return Math.round(d.data * 100) + "%";
      });
  }

  var paths = document.querySelectorAll('#carte-france path');

  // Gestion des interactions pour survol
  paths.forEach(function (path) {
    path.addEventListener('mouseenter', function () {
      var dep = path.getAttribute("name");
      renderBarChart(dep); // Met à jour le graphique en barres avec les données du département
      renderPieChart(dep); // Met à jour le graphique circulaire avec les données du département
      renderRadarChart(dep);
    });
  });
});
