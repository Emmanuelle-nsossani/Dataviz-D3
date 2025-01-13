// "init" est appelée dès que la fenêtre est chargée
window.addEventListener("DOMContentLoaded", init, false);

// Variables globales
var map = document.querySelector('#map');
var paths = document.querySelectorAll('.map__image path');

// Tableaux pour les données
var DeptTransportMeans = [];

// Fonction d'initialisation
function init() {
    renderBarChart(); // Affiche le graphique en barres par défaut
    renderPieChart(); // Affiche le graphique circulaire par défaut
}

// Fonction pour afficher un graphique en barres
function renderBarChart() {
    var svg = d3.select('.map__transport').select("svg");
    svg.selectAll("*").remove(); // Supprimer les anciens graphiques

    var width = svg.attr("width");
    var height = svg.attr("height");

    var data = [
        { label: 'Voiture', value: 0.6 },
        { label: 'Transports urbains', value: 0.3 },
        { label: 'Vélo / Pied', value: 0.05 },
        { label: 'Train', value: 0.05 },
        { label: 'No rep.', value: 0 }
    ];

    var xScale = d3.scaleBand()
        .range([0, width])
        .domain(data.map(d => d.label))
        .padding(0.4);

    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 1]);

    var g = svg.append("g");

    // Ajouter les barres
    g.selectAll(".bar")
        .data(data)
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
function renderPieChart() {
    var svg = d3.select('.map__pie').select("svg");
    svg.selectAll("*").remove(); // Supprimer les anciens graphiques
    var width = svg.attr("width"),
        height = svg.attr("height"),
        radius = Math.min(width, height) / 2;

    var g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    var color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c']);
    var pie = d3.pie();
    var arc = d3.arc().innerRadius(0).outerRadius(radius);

    var data = [0.6, 0.3, 0.05, 0.05]; // Données de test (en pourcentage)
    
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
        .text(d => `${Math.round(d.data * 100)}%`);
}

// Gestion des interactions
paths.forEach(function (path) {
    path.addEventListener('mouseenter', function () {
        var dep = path.getAttribute("name");
        render(dep); // Affiche les graphiques en fonction du département
        renderBarChart(); // Graphique en barre
    });

    path.addEventListener('mouseleave', function () {
        d3.select(".map__pie").select("svg").select("g").remove();
    });
});

// Fonction de rendu pour un département (utilisée pour afficher des graphiques personnalisés en fonction des données)
function render(dep) {
    console.log(`Affichage des données pour le département : ${dep}`);

    var data = [];
    if (DeptTransportMeans[dep]) {
        data.push(DeptTransportMeans[dep].voiture || 0);
        data.push(DeptTransportMeans[dep].transports || 0);
        data.push(DeptTransportMeans[dep].velo_pied || 0);
        data.push(DeptTransportMeans[dep].train || 0);
        data.push(DeptTransportMeans[dep].norep || 0);
    }

    var svg = d3.select('.map__pie').select("svg");
    svg.selectAll("*").remove(); // Supprimer les anciens graphiques
    var width = svg.attr("width"),
        height = svg.attr("height"),
        radius = Math.min(width, height) / 2;

    var g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    var color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c']);
    var pie = d3.pie();
    var arc = d3.arc().innerRadius(0).outerRadius(radius);

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
