import { Circle, Rect, Group, Textbox } from 'fabric';

export const createTransport = (canvas, position, data = {}) => {
  if (!canvas) return null;

  const width = 132;
  const height = 62;

  const box = new Rect({
    width,
    height,
    fill: '#ffe0b2',
    rx: 10,
    ry: 10,
    stroke: '#fb8c00',
    strokeWidth: 1
  });

  const label = new Textbox(data.name || 'Trasporto', {
    fontSize: 14,
    width: width - 10,
    textAlign: 'center',
    fill: '#000000',
    top: 20,
    editable: false
  });

  const group = new Group([box, label], {
    left: position.left,
    top: position.top,
    hasControls: false,
    lockScalingX: true,
    lockScalingY: true,
    objectCaching: false,
    objectType: 'transport'
  });

  group.data = data;
  canvas.add(group);
  canvas.renderAll();

  return group;
};