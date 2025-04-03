import { Rect, Textbox, Group, Circle, Line } from 'fabric';

export const createStorage = (canvas, position, data = {}) => {
  if (!canvas) return null;

  const width = 132;
  const height = 62;

  // Rettangolo principale
  const box = new Rect({
    width,
    height,
    fill: '#c8e6c9',
    rx: 10,
    ry: 10,
    stroke: '#388e3c',
    strokeWidth: 1
  });

  // Testo centrato
  const label = new Textbox(data.name || 'Magazzino', {
    fontSize: 14,
    fontWeight: 'bold',
    width: width - 10,
    textAlign: 'center',
    fill: '#000000',
    top: 5,
    editable: false
  });

  // Aggiunta di elementi grafici per rappresentare un magazzino (scaffalature)
  const storageGraphic = new Group([
    // Scaffale superiore
    new Rect({
      width: 60,
      height: 8,
      left: 36,
      top: 28,
      fill: '#a5d6a7',
      stroke: '#388e3c',
      strokeWidth: 1
    }),
    // Scaffale inferiore
    new Rect({
      width: 60,
      height: 8,
      left: 36,
      top: 42,
      fill: '#a5d6a7',
      stroke: '#388e3c',
      strokeWidth: 1
    }),
    // Supporti verticali
    new Rect({
      width: 4,
      height: 22,
      left: 36,
      top: 28,
      fill: '#388e3c',
      stroke: '#2e7d32',
      strokeWidth: 0.5
    }),
    new Rect({
      width: 4,
      height: 22,
      left: 64,
      top: 28,
      fill: '#388e3c',
      stroke: '#2e7d32',
      strokeWidth: 0.5
    }),
    new Rect({
      width: 4,
      height: 22,
      left: 92,
      top: 28,
      fill: '#388e3c',
      stroke: '#2e7d32',
      strokeWidth: 0.5
    }),
    // Piccole scatole sugli scaffali
    new Rect({
      width: 8,
      height: 6,
      left: 45,
      top: 30,
      fill: '#81c784',
      stroke: '#388e3c',
      strokeWidth: 0.5
    }),
    new Rect({
      width: 8,
      height: 6,
      left: 72,
      top: 30,
      fill: '#81c784',
      stroke: '#388e3c',
      strokeWidth: 0.5
    }),
    new Rect({
      width: 8,
      height: 6,
      left: 56,
      top: 44,
      fill: '#81c784',
      stroke: '#388e3c',
      strokeWidth: 0.5
    }),
    new Rect({
      width: 8,
      height: 6,
      left: 80,
      top: 44,
      fill: '#81c784',
      stroke: '#388e3c',
      strokeWidth: 0.5
    })
  ]);

  // Punto di connessione input (lato sinistro)
  const inputPoint = new Circle({
    left: -5,
    top: height / 2 - 5,
    radius: 5,
    fill: '#81c784',
    stroke: '#388e3c',
    strokeWidth: 1,
    originX: 'center',
    originY: 'center',
    connectionPoint: 'input',
    hoverCursor: 'pointer'
  });

  // Punto di connessione output (lato destro)
  const outputPoint = new Circle({
    left: width + 5,
    top: height / 2 - 5,
    radius: 5,
    fill: '#81c784',
    stroke: '#388e3c',
    strokeWidth: 1,
    originX: 'center',
    originY: 'center',
    connectionPoint: 'output',
    hoverCursor: 'pointer'
  });

  // Indicatore di stato nella parte inferiore (livello di riempimento del magazzino)
  const statusBackground = new Rect({
    width: width - 20,
    height: 6,
    left: 10,
    top: height - 15,
    fill: '#e8f5e9',
    rx: 2,
    ry: 2,
    stroke: '#388e3c',
    strokeWidth: 0.5
  });
  
  // Livello di riempimento (simulato al 60%)
  const fillLevel = new Rect({
    width: (width - 20) * 0.6,
    height: 6,
    left: 10,
    top: height - 15,
    fill: '#4caf50',
    rx: 2,
    ry: 2
  });

  // Creazione del gruppo principale
  const group = new Group([box, label, storageGraphic, inputPoint, outputPoint, statusBackground, fillLevel], {
    left: position.left,
    top: position.top,
    hasControls: false,
    lockScalingX: true,
    lockScalingY: true,
    objectCaching: false,
    objectType: 'storage',
    subTargetCheck: true, // Permette di selezionare i sottoelementi
    selectable: true
  });

  // Aggiungi dati personalizzati
  group.data = data;
  
  // Aggiungi informazione sui punti di connessione
  group.connectionPoints = {
    input: inputPoint,
    output: outputPoint
  };
  
  // Aggiungi il gruppo al canvas
  canvas.add(group);
  canvas.renderAll();

  // Configura evento per evidenziare i punti di connessione al passaggio del mouse
  group.on('mousedown', (opt) => {
    const subTarget = opt.subTargets?.[0];
    if (subTarget && (subTarget.connectionPoint === 'input' || subTarget.connectionPoint === 'output')) {
      subTarget.set({
        fill: '#4caf50',
        radius: 7
      });
      canvas.renderAll();
    }
  });

  group.on('mouseout', () => {
    inputPoint.set({
      fill: '#81c784',
      radius: 5
    });
    outputPoint.set({
      fill: '#81c784',
      radius: 5
    });
    canvas.renderAll();
  });

  return group;
};