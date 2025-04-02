import { Circle, Rect, Triangle, Group, Textbox } from 'fabric';

export const createTransport = (canvas, left, top) => {
  // Existing createTransport implementation...
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

  // ... rest of the existing implementation ...

  const group = new Group([rect, arrowShaft, arrowHead, inputPoint, outputPoint, textBg, textbox], {
    left: left,
    top: top,
    selectable: true,
    hasControls: true,
    hasBorders: true,
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

export const initializeCanvasWithTransports = (canvas, transports) => {
  transports.forEach(transport => {
    createTransport(canvas, transport.left, transport.top);
  });
};