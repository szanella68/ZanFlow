import { Circle, Rect, Triangle, Group, Textbox } from 'fabric';

const createTransport = (canvas, left, top) => {
  // Rettangolo principale
  const rect = new Rect({
    width: 120,
    height: 40,
    fill: '#e3f2fd',
    stroke: '#1976d2',
    strokeWidth: 2,
    rx: 15,
    ry: 15,
    originX: 'center',
    originY: 'center'
  });

  // Freccia (corpo)
  const arrowShaft = new Rect({
    width: 30,
    height: 2,
    fill: '#1976d2',
    left: -20,
    top: -10,
    originX: 'center',
    originY: 'center'
  });

  // Freccia (punta)
  const arrowHead = new Triangle({
    width: 10,
    height: 10,
    fill: '#1976d2',
    left: 0,
    top: -10,
    angle: 90,
    originX: 'center',
    originY: 'center'
  });

  // Punti di connessione
  const inputPoint = new Circle({
    left: -60,
    top: 0,
    radius: 5,
    fill: '#0d47a1',
    stroke: '#1976d2',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  const outputPoint = new Circle({
    left: 60,
    top: 0,
    radius: 5,
    fill: '#0d47a1',
    stroke: '#1976d2',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  // Rettangolo per il testo (per evitare sovrapposizioni)
  const textBg = new Rect({
    width: 80,
    height: 20,
    fill: '#e3f2fd',
    stroke: 'transparent',
    originX: 'center',
    originY: 'center',
    top: 5
  });

  // Testo
  const textbox = new Textbox('Trasporto', {
    width: 80,
    fontSize: 14,
    textAlign: 'center',
    fill: '#0d47a1',
    originX: 'center',
    originY: 'center',
    top: 5
  });

  // Crea gruppo
  const group = new Group([rect, arrowShaft, arrowHead, inputPoint, outputPoint, textBg, textbox], {
    left: left,
    top: top,
    selectable: true,
    hasControls: true,
    hasBorders: true,
    // Utilizziamo objectType invece di type per evitare conflitti con Fabric.js
    objectType: 'transport',
    data: {
      name: 'Trasporto',
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

export const createTransportFromData = (canvas, node) => {
  const transport = createTransport(canvas, node.position_x, node.position_y);
  if (transport) {
    transport.set('dbId', node.id);
    const data = node.data || transport.data;
    transport.set('data', data);
    if (transport._objects) {
      transport._objects.forEach(obj => {
        if (obj.type === 'textbox') {
          obj.set('text', data.name || 'Trasporto');
        }
      });
    }
    canvas.renderAll();
  }
  return transport;
};

export default createTransport;
