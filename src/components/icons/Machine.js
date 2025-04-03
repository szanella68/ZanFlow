import { Rect, Textbox, Group, Circle, Line, Polygon } from 'fabric';

export const createMachine = (canvas, position, data = {}) => {
  if (!canvas) return null;

  const width = 132;
  const height = 62;

  // Rettangolo principale
  const box = new Rect({
    width,
    height,
    fill: '#d3e5ff',
    rx: 10,
    ry: 10,
    stroke: '#1976d2',
    strokeWidth: 1
  });

  // Testo centrato
  const label = new Textbox(data.name || 'Macchina', {
    fontSize: 14,
    fontWeight: 'bold',
    width: width - 10,
    textAlign: 'center',
    fill: '#000000',
    top: 5,
    editable: false
  });

  // Aggiunta di elementi grafici per rappresentare una macchina industriale
  const machineGraphic = new Group([
    // Corpo principale della macchina
    new Rect({
      width: 50,
      height: 24,
      left: 41,
      top: 30,
      fill: '#bbdefb',
      stroke: '#1976d2',
      strokeWidth: 1,
      rx: 2,
      ry: 2
    }),
    // Pannello di controllo
    new Rect({
      width: 10,
      height: 14,
      left: 91,
      top: 35,
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 0.5,
      rx: 1,
      ry: 1
    }),
    // Pulsanti sul pannello
    new Circle({
      radius: 2,
      left: 93,
      top: 38,
      fill: '#f44336',
      stroke: '#d32f2f',
      strokeWidth: 0.5
    }),
    new Circle({
      radius: 2,
      left: 99,
      top: 38,
      fill: '#4caf50',
      stroke: '#388e3c',
      strokeWidth: 0.5
    }),
    // Dettagli macchina
    new Line([46, 30, 46, 54], {
      stroke: '#1976d2',
      strokeWidth: 0.5
    }),
    new Line([56, 30, 56, 54], {
      stroke: '#1976d2',
      strokeWidth: 0.5
    }),
    new Line([66, 30, 66, 54], {
      stroke: '#1976d2',
      strokeWidth: 0.5
    }),
    new Line([76, 30, 76, 54], {
      stroke: '#1976d2',
      strokeWidth: 0.5
    }),
    // Indicatore processo
    new Circle({
      radius: 3,
      left: 96,
      top: 45,
      fill: '#ffeb3b',
      stroke: '#fbc02d',
      strokeWidth: 0.5
    }),
    // Base della macchina
    new Rect({
      width: 60,
      height: 3,
      left: 41,
      top: 54,
      fill: '#0d47a1',
      stroke: '#0d47a1',
      strokeWidth: 0
    })
  ]);

  // Punto di connessione input (lato sinistro)
  const inputPoint = new Circle({
    left: -5,
    top: height / 2 - 5,
    radius: 5,
    fill: '#64b5f6',
    stroke: '#1976d2',
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
    fill: '#64b5f6',
    stroke: '#1976d2',
    strokeWidth: 1,
    originX: 'center',
    originY: 'center',
    connectionPoint: 'output',
    hoverCursor: 'pointer'
  });

  // Indicatore di stato nella parte inferiore
  const statusBackground = new Rect({
    width: width - 20,
    height: 6,
    left: 10,
    top: height - 12,
    fill: '#e3f2fd',
    rx: 2,
    ry: 2,
    stroke: '#1976d2',
    strokeWidth: 0.5
  });
  
  // Livello di attività (simulato al 75%)
  const activityLevel = new Rect({
    width: (width - 20) * 0.75,
    height: 6,
    left: 10,
    top: height - 12,
    fill: '#2196f3',
    rx: 2,
    ry: 2
  });

  // Creazione del gruppo principale
  const group = new Group([box, label, machineGraphic, inputPoint, outputPoint, statusBackground, activityLevel], {
    left: position.left,
    top: position.top,
    hasControls: false,
    lockScalingX: true,
    lockScalingY: true,
    objectCaching: false,
    objectType: 'machine',
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
        fill: '#2196f3',
        radius: 7
      });
      canvas.renderAll();
    }
  });

  group.on('mouseout', () => {
    inputPoint.set({
      fill: '#64b5f6',
      radius: 5
    });
    outputPoint.set({
      fill: '#64b5f6',
      radius: 5
    });
    canvas.renderAll();
  });

  return group;
};