import { Rect, Textbox, Group } from 'fabric';

export const createMachine = (canvas, position, data = {}) => {
  if (!canvas) return null;

  const width = 132;
  const height = 62;

  const box = new Rect({
    width,
    height,
    fill: '#d3e5ff',
    rx: 10,
    ry: 10,
    stroke: '#1976d2',
    strokeWidth: 1
  });

  const label = new Textbox(data.name || 'Macchina', {
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
    objectType: 'machine'
  });

  group.data = data;
  canvas.add(group);
  canvas.renderAll();

  return group;
};