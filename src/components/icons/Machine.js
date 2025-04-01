import { Circle, Rect, Group, Textbox } from 'fabric';

const createMachine = (canvas, left, top) => {
  // Rettangolo principale
  const rect = new Rect({
    width: 120,
    height: 60,
    fill: '#deeaee',
    stroke: '#2b7a78',
    strokeWidth: 2,
    rx: 5,
    ry: 5,
    originX: 'center',
    originY: 'center'
  });

  // Icona ingranaggio
  const gear = new Circle({
    radius: 10,
    fill: '#2b7a78',
    left: -40,
    top: -15,
    originX: 'center',
    originY: 'center'
  });

  // Punti di connessione
  const inputPoint = new Circle({
    left: -60,
    top: 0,
    radius: 5,
    fill: '#17252a',
    stroke: '#3aafa9',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  const outputPoint = new Circle({
    left: 60,
    top: 0,
    radius: 5,
    fill: '#17252a',
    stroke: '#3aafa9',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  // Rettangolo per il testo (per evitare sovrapposizioni)
  const textBg = new Rect({
    width: 80,
    height: 20,
    fill: '#deeaee',
    stroke: 'transparent',
    originX: 'center',
    originY: 'center',
    top: 15
  });

  // Testo
  const textbox = new Textbox('Macchina', {
    width: 80,
    fontSize: 14,
    textAlign: 'center',
    fill: '#17252a',
    originX: 'center',
    originY: 'center',
    top: 15
  });

 // Crea gruppo
const group = new Group([rect, gear, inputPoint, outputPoint, textBg, textbox], {
  left: left,
  top: top,
  selectable: true,
  hasControls: true,
  hasBorders: true,
  // RIMUOVI QUESTA RIGA ↓
  type: 'machine',
  // MANTIENI SOLO QUESTA ↓
  objectType: 'machine',
  data: {
    name: 'Macchina',
    cycleTime: 0,
    piecesPerHour: 0,
    operators: 0,
    rejectRate: 0
  }
});

  canvas.add(group);
  canvas.renderAll();
  
  return group;
};

export default createMachine;