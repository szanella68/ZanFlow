import { Circle, Rect, Group, Textbox } from 'fabric';

const createStorage = (canvas, left, top) => {
  // Rettangolo principale
  const rect = new Rect({
    width: 100,
    height: 80,
    fill: '#fff8e1',
    stroke: '#ff8f00',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  // Scaffali (rettangoli sottili)
  const shelf1 = new Rect({
    width: 80,
    height: 2,
    fill: '#ff8f00',
    left: 0,
    top: -20,
    originX: 'center',
    originY: 'center'
  });

  const shelf2 = new Rect({
    width: 80,
    height: 2,
    fill: '#ff8f00',
    left: 0,
    top: 0,
    originX: 'center',
    originY: 'center'
  });

  const shelf3 = new Rect({
    width: 80,
    height: 2,
    fill: '#ff8f00',
    left: 0,
    top: 20,
    originX: 'center',
    originY: 'center'
  });

  // Punti di connessione
  const inputPoint = new Circle({
    left: -50,
    top: 0,
    radius: 5,
    fill: '#e65100',
    stroke: '#ff8f00',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  const outputPoint = new Circle({
    left: 50,
    top: 0,
    radius: 5,
    fill: '#e65100',
    stroke: '#ff8f00',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  // Rettangolo per il testo (per evitare sovrapposizioni)
  const textBg = new Rect({
    width: 80,
    height: 20,
    fill: '#fff8e1',
    stroke: 'transparent',
    originX: 'center',
    originY: 'center',
    top: -5
  });

  // Testo
  const textbox = new Textbox('Magazzino', {
    width: 80,
    fontSize: 14,
    textAlign: 'center',
    fill: '#e65100',
    originX: 'center',
    originY: 'center',
    top: -5
  });

  // Crea gruppo
  const group = new Group([rect, shelf1, shelf2, shelf3, inputPoint, outputPoint, textBg, textbox], {
    left: left,
    top: top,
    selectable: true,
    hasControls: true,
    hasBorders: true,
    // Utilizziamo objectType invece di type per evitare conflitti con Fabric.js
    objectType: 'storage',
    data: {
      name: 'Magazzino',
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

export default createStorage;