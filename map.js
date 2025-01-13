// Chargement du fichier CSV
d3.csv("barometre-representations-sociales-du-changement-climatique.csv").then(function (data) {
  // Cette fonction est appelée lorsque les données sont chargées
  // On prépare un objet pour stocker les données par département
  let DeptTransportMeans = {};

  // Remplir DeptTransportMeans avec les données pertinentes pour chaque département
  data.forEach(function (row) {
      const department = row["Département"]; // Récupérer le département
      const transport = row["s22. Mode de transport"]; // Récupérer le mode de transport

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
  });

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

  // Fonction d'initialisation du graphique
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

      var xScale = d3.scaleBand()
          .range([0, width])
          .domain(transportData.map(d => d.label))
          .padding(0.4);

      var yScale = d3.scaleLinear()
          .range([height, 0])
          .domain([0, 1]);

      var g = svg.append("g");

      // Ajouter les barres
      g.selectAll(".bar")
          .data(transportData)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", d => xScale(d.label))
          .attr("y", d => yScale(d.value))
          .attr("width", xScale.bandwidth())
          .attr("height", d => height - yScale(d.value))
          .attr("fill", "#56C9E8");

      // Ajouter les axes
      g.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(xScale));

      g.append("g")
          .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${Math.round(d * 100)}%`));
  }

  // Fonction pour afficher un graphique circulaire
  function renderPieChart(dep) {
      var svg = d3.select('.map__pie').select("svg");
      svg.selectAll("*").remove(); // Supprimer les anciens graphiques
      var width = svg.attr("width"),
          height = svg.attr("height"),
          radius = Math.min(width, height) / 2;

      var g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

      var color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c']);
      var pie = d3.pie();
      var arc = d3.arc().innerRadius(0).outerRadius(radius);

      // Utiliser les données du département
      var data = DeptTransportMeans[dep] ? [
          DeptTransportMeans[dep].voiture,
          DeptTransportMeans[dep].transports,
          DeptTransportMeans[dep].velo_pied,
          DeptTransportMeans[dep].train
      ] : [0.6, 0.3, 0.05, 0.05];

      var arcs = g.selectAll("arc")
          .data(pie(data))
          .enter()
          .append("g")
          .attr("class", "arc");

      arcs.append("path")
          .attr("fill", (d, i) => color(i))
          .attr("d", arc);

      arcs.append("text")
          .attr('dy', '20')
          .attr('dx', '-30')
          .text(dep);
  }

  var paths = document.querySelectorAll('#carte-france path');

  // Gestion des interactions pour survol
  paths.forEach(function (path) {
      path.addEventListener('mouseenter', function () {
          var dep = path.getAttribute("name");
          renderBarChart(dep); // Met à jour le graphique en barres avec les données du département
          renderPieChart(dep); // Met à jour le graphique circulaire avec les données du département
      });
  });
});
