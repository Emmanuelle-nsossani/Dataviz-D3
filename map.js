// "init" est appelée dès que la fenêtre est chargée
window.addEventListener("DOMContentLoaded", init, false);

// Variables globales
var map = document.querySelector('#map');
var paths = document.querySelectorAll('.map__image path');

// Tableaux pour les données
var CSVData = [];
var peopleByDept = [];
var womenByDept = [];
var DeptAgesTranspGESPeu = [];
var DeptAgesTranspGESAssez = [];
var DeptAgesTranspGESBeaucoup = [];
var DeptAgesTranspGESPasdutout = [];

// Fonction d'initialisation
function init() {
  d3.csv("barometre-representations-sociales-du-changement-climatique.csv", function (csv) {
    csv.forEach(function (d) {
      var dep = d['Département'];
      var transpGES = d['q18_i2. Causes GES transports'];
      var age = d['S2. âge'];
      var sex = d['S1. genre'];

      // Initialiser les données pour chaque département
      if (!peopleByDept[dep]) peopleByDept[dep] = 0;
      if (!womenByDept[dep]) womenByDept[dep] = 0;
      if (!DeptAgesTranspGESPeu[dep]) DeptAgesTranspGESPeu[dep] = {};
      if (!DeptAgesTranspGESAssez[dep]) DeptAgesTranspGESAssez[dep] = {};
      if (!DeptAgesTranspGESBeaucoup[dep]) DeptAgesTranspGESBeaucoup[dep] = {};
      if (!DeptAgesTranspGESPasdutout[dep]) DeptAgesTranspGESPasdutout[dep] = {};

      // Compter les données pour chaque département
      peopleByDept[dep]++;
      if (sex === 'Une femme') womenByDept[dep]++;

      // Comptabiliser les réponses par catégorie GES et âge
      if (transpGES === 'Peu') {
        if (!DeptAgesTranspGESPeu[dep][age]) DeptAgesTranspGESPeu[dep][age] = 0;
        DeptAgesTranspGESPeu[dep][age]++;
      }
      // Répéter la logique pour "Assez", "Beaucoup", "Pas du tout"
      if (transpGES === 'Assez') {
        if (!DeptAgesTranspGESAssez[dep][age]) DeptAgesTranspGESAssez[dep][age] = 0;
        DeptAgesTranspGESAssez[dep][age]++;
      }
      if (transpGES === 'Beaucoup') {
        if (!DeptAgesTranspGESBeaucoup[dep][age]) DeptAgesTranspGESBeaucoup[dep][age] = 0;
        DeptAgesTranspGESBeaucoup[dep][age]++;
      }
      if (transpGES === 'Pas du tout') {
        if (!DeptAgesTranspGESPasdutout[dep][age]) DeptAgesTranspGESPasdutout[dep][age] = 0;
        DeptAgesTranspGESPasdutout[dep][age]++;
      }
    });
  });
}

// Fonction de rendu pour un département
function render(dep) {
  console.log(`Affichage des données pour le département : ${dep}`);

  var data = [];
  if (DeptAgesTranspGESPeu[dep]) {
    data.push(DeptAgesTranspGESPeu[dep]["65 ans et +"] || 0);
    data.push(DeptAgesTranspGESPeu[dep]["50-64 ans"] || 0);
    data.push(DeptAgesTranspGESPeu[dep]["35-49 ans"] || 0);
    data.push(DeptAgesTranspGESPeu[dep]["25-34 ans"] || 0);
    data.push(DeptAgesTranspGESPeu[dep]["15-17 ans"] || 0);
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

// Gestion des interactions
paths.forEach(function (path) {
  path.addEventListener('mouseenter', function () {
    render(path.getAttribute("name"));
  });

  path.addEventListener('mouseleave', function () {
    d3.select(".map__pie").select("svg").select("g").remove();
  });
});

// NOMS DES DEPARTEMENTS

const departement_name = document.getElementById("departement-name");

// Sélectionne tous les départements
const departments = document.querySelectorAll("#carte-france path");

// Ajoute les événements pour chaque département
departments.forEach(department => {
    department.addEventListener("mouseover", (event) => {
        const departmentName = event.target.getAttribute("name"); // Récupère le nom du département
        departement_name.textContent = departmentName;
        departement_name.style.visibility = "visible";
    });

    department.addEventListener("mousemove", (event) => {
        // Met à jour la position du departement_name
        departement_name.style.top = event.pageY + 10 + "px";
        departement_name.style.left = event.pageX + 10 + "px";
    });

    department.addEventListener("mouseout", () => {
        // Cache le departement_name
        tooltip.style.visibility = "hidden";
    });
});