// Variabili condivise
let data;
let maxRating = 0;
let maxSugars = 0;
let totalCalories = 0;
let manufacturers = [];   // produttori senza duplicati (per la legenda)

let margin = 20;
let gutter = 3;
let headerHeight = 190;

let colorScale = {
  'K': '#ED6666', // Kelloggs
  'G': '#66A9ED', // General Mills
  'P': '#EDA966', // Post
  'Q': '#66ED66', // Quaker Oats
  'R': '#ED66ED', // Ralston Purina
  'N': '#EDE066', // Nabisco
  'A': '#66EDD9', // American Home Food Products
};

let mfrNames = {   //mfr=manufacturers
  'K': 'Kelloggs',
  'G': 'General Mills',
  'P': 'Post',
  'Q': 'Quaker Oats',
  'R': 'Ralston Purina',
  'N': 'Nabisco',
  'A': 'American Home',
};

async function setup() {
  createCanvas(windowWidth, windowHeight);

  data = await loadTable("assets/cereals.csv", ",", "header");

  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let rating = data.getNum(rowNumber, "rating");
    let sugars = data.getNum(rowNumber, "sugars");
    let calories = data.getNum(rowNumber, "calories");

    // Valori massimi per le scale
    if (rating > maxRating) {
      maxRating = rating;
    }
    if (sugars > maxSugars) {
      maxSugars = sugars;
    }

    // Totale delle calorie =larghezza
    totalCalories += calories;

    // Raccoglie i produttori senza duplicati 
    let mfr = data.getString(rowNumber, "mfr");
    if (!manufacturers.includes(mfr)) {
      manufacturers.push(mfr);
    }
  }
}

function draw() {
  background(245);
  noStroke();

  // TITOLO 
  fill(0);
  textSize(24);
  text("Cereali: qualità, calorie e zuccheri", margin, margin + 20);
  textSize(13);
  text("Cosa mangi a colazione?", margin, margin + 42);

  //  LEGENDA: colori 
  let legendX = margin;
  let legendY = margin + 70;
  for (let i = 0; i < manufacturers.length; i++) {
    let code = manufacturers[i];
    fill(colorScale[code]);
    rect(legendX, legendY, 14, 14);
    fill(0);
    textSize(12);
    text(mfrNames[code], legendX + 20, legendY + 12);
    legendX += 140;
  }

  // LEGENDA: forma 
  fill(0);
  textSize(12);
  text("Colore = produttore   |   Altezza = rating   |   Larghezza = calorie", margin, legendY + 42);

  fill(200);
  rect(margin, legendY + 55, 18, 30);
  fill(60);
  rect(margin, legendY + 75, 18, 10);
  fill(0);
  text("Blocco grigio alla base = zuccheri (più alto = più zuccheri)", margin + 28, legendY + 75);

  // GRAFICO 
  let baseY = height - margin;
  let chartHeight = baseY - headerHeight - margin;
  let numberOfGutters = data.getRowCount() - 1;
  let barsWidth = width - 2 * margin - numberOfGutters * gutter;

  let xPos = margin;
  let hoveredRow = -1;   // -1 = nessun cereale sotto il mouse

  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let calories = data.getNum(rowNumber, "calories");
    let rating = data.getNum(rowNumber, "rating");
    let sugars = data.getNum(rowNumber, "sugars");
    let mfr = data.getString(rowNumber, "mfr");

    let w = map(calories, 0, totalCalories, 0, barsWidth);    //larghezza
    let h = map(rating, 0, maxRating, 0, chartHeight);    //altezza    
    let sugarH = map(sugars, 0, maxSugars, 0, chartHeight * 0.2);   //altezza blocco scuro 
    let yPos = baseY - h;

    // Rollover
    let isOver =
      mouseX >= xPos &&
      mouseX <= xPos + w &&
      mouseY >= yPos &&
      mouseY <= baseY;

    // Contorno nero dietro il glifo se il mouse è sopra
    if (isOver) {
      fill(0);
      rect(xPos - 2, yPos - 2, w + 4, h + 4);
      hoveredRow = rowNumber;
    }

    // Corpo del glifo (un colore x produttore)
    fill(colorScale[mfr]);
    rect(xPos, yPos, w, h);

    // Blocco grigio zuccheri
    fill(60);
    rect(xPos, baseY - sugarH, w, sugarH);

    xPos += w + gutter;
  }

  // SCHEDA AL ROLLOVER
  if (hoveredRow != -1) {
    let boxW = 230;
    let boxH = 92;
    let boxX = mouseX + 12;
    let boxY = mouseY - boxH - 8;

    // Evita che la scheda esca dal canvas
    if (boxX + boxW > width) {
      boxX = mouseX - boxW - 12;
    }
    if (boxY < 0) {
      boxY = mouseY + 16;
    }

    fill(255);
    rect(boxX, boxY, boxW, boxH);
    fill(0);
    textSize(13);
    text(data.getString(hoveredRow, "name"), boxX + 8, boxY + 20);
    textSize(12);
    text(
      mfrNames[data.getString(hoveredRow, "mfr")] +
      "\nRating: " + data.getNum(hoveredRow, "rating") +
      "\nCalorie: " + data.getNum(hoveredRow, "calories") +
      "\nZuccheri: " + data.getNum(hoveredRow, "sugars") + " g",
      boxX + 8, boxY + 38
    );
  }
}