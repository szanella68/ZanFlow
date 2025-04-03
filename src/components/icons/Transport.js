import { Rect, Textbox, Group, Circle, Line } from 'fabric';

export const createTransport = (canvas, position, data = {}) => {
  if (!canvas) return null;

  const width = 132;
  const height = 62;

  // Rettangolo principale
  const box = new Rect({
    width,
    height,
    fill: '#ffe0b2',
    rx: 10,
    ry: 10,
    stroke: '#fb8c00',
    strokeWidth: 1
  });

  // Testo centrato
  const label = new Textbox(data.name || 'Trasporto', {
    fontSize: 14,
    fontWeight: 'bold',
    width: width - 10,
    textAlign: 'center',
    fill: '#000000',
    top: 5,
    editable: false
  });

  // Aggiunta di elementi grafici per rappresentare un trasporto (nastro trasportatore)
  // Utilizziamo elementi più semplici per garantire compatibilità
  const transportBase = new Rect({
    width: 60,
    height: 12,
    left: 36,
    top: 35,
    fill: '#f5f5f5',
    stroke: '#fb8c00',
    strokeWidth: 1
  });
  
  const leftRoller = new Circle({
    radius: 6,
    left: 36,
    top: 41,
    fill: '#eeeeee',
    stroke: '#fb8c00',
    strokeWidth: 1
  });
  
  const rightRoller = new Circle({
    radius: 6,
    left: 96,
    top: 41,
    fill: '#eeeeee',
    stroke: '#fb8c00',
    strokeWidth: 1
  });
  
  // Frecce per indicare la direzione invece di un poligono
  const arrow1 = new Line([56, 35, 76, 35], {
    stroke: '#fb8c00',
    strokeWidth: 2
  });
  
  const arrow2 = new Line([76, 35, 66, 28], {
    stroke: '#fb8c00',
    strokeWidth: 2
  });
  
  const arrow3 = new Line([76, 35, 66, 42], {
    stroke: '#fb8c00',
    strokeWidth: 2
  });

  // Punto di connessione input (lato sinistro)
  const inputPoint = new Circle({
    left: -5,
    top: height / 2 - 5,
    radius: 5,
    fill: '#ffcc80',
    stroke: '#fb8c00',
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
    fill: '#ffcc80',
    stroke: '#fb8c00',
    strokeWidth: 1,
    originX: 'center',
    originY: 'center',
    connectionPoint: 'output',
    hoverCursor: 'pointer'
  });

  // Indicatore di stato nella parte inferiore
  const statusIndicator = new Rect({
    width: width - 20,
    height: 6,
    left: 10,
    top: height - 15,
    fill: '#ffe0b2',
    rx: 2,
    ry: 2,
    stroke: '#fb8c00',
    strokeWidth: 0.5
  });

  // Creazione del gruppo principale
  const group = new Group([
    box, 
    label, 
    transportBase, 
    leftRoller, 
    rightRoller, 
    arrow1,
    arrow2,
    arrow3,
    inputPoint, 
    outputPoint, 
    statusIndicator
  ], {
    left: position.left,
    top: position.top,
    hasControls: false,
    lockScalingX: true,
    lockScalingY: true,
    objectCaching: false,
    objectType: 'transport',
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
        fill: '#ff9800',
        radius: 7
      });
      canvas.renderAll();
    }
  });

  group.on('mouseout', () => {
    inputPoint.set({
      fill: '#ffcc80',
      radius: 5
    });
    outputPoint.set({
      fill: '#ffcc80',
      radius: 5
    });
    canvas.renderAll();
  });

  return group;
};