import { Circle, Rect, Group, Textbox } from 'fabric';

export const createStorage = (canvas, position, data = {}) => {
  if (!canvas) return null;

  const width = 132;
  const height = 62;

  const box = new Rect({
    width,
    height,
    fill: '#c8e6c9',
    rx: 10,
    ry: 10,
    stroke: '#388e3c',
    strokeWidth: 1
  });

  const label = new Textbox(data.name || 'Magazzino', {
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
    objectType: 'storage'
  });

  group.data = data;
  canvas.add(group);
  canvas.renderAll();

  return group;
};
