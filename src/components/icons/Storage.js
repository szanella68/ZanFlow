import { Circle, Rect, Group, Textbox } from 'fabric';

export const createStorage = (canvas, left, top) => {
  const rect = new Rect({ width: 100, height: 60, fill: '#fff9c4', stroke: '#fbc02d', strokeWidth: 2, rx: 8, ry: 8, originX: 'center', originY: 'center' });
  const box = new Rect({ width: 40, height: 40, fill: '#fdd835', left: -20, top: -10, originX: 'center', originY: 'center' });
  const inputPoint = new Circle({ left: -50, top: 0, radius: 5, fill: '#f9a825', stroke: '#fbc02d', strokeWidth: 2, originX: 'center', originY: 'center' });
  const outputPoint = new Circle({ left: 50, top: 0, radius: 5, fill: '#f9a825', stroke: '#fbc02d', strokeWidth: 2, originX: 'center', originY: 'center' });
  const textBg = new Rect({ width: 80, height: 20, fill: '#fff9c4', stroke: 'transparent', originX: 'center', originY: 'center', top: 15 });
  const textbox = new Textbox('Magazzino', { width: 80, fontSize: 14, textAlign: 'center', fill: '#f57f17', originX: 'center', originY: 'center', top: 15 });

  const group = new Group([rect, box, inputPoint, outputPoint, textBg, textbox], {
    left, top, selectable: true, hasControls: true, hasBorders: true,
    objectType: 'storage',
    data: {
      name: 'Magazzino', cycleTime: 0, piecesPerHour: 0, operators: 0,
      rejectRate: 0, capacity: 0, averageStayTime: 0,
      managementMethod: 'FIFO', storageCost: 0
    }
  });

  canvas.add(group);
  canvas.renderAll();
  return group;
};

export const createStorageFromData = (canvas, node) => {
  if (!canvas || !node) return null;
  try {
    const storage = createStorage(canvas, node.position_x, node.position_y);
    if (storage) {
      storage.set('dbId', node.id);
      const data = node.data || storage.data;
      storage.set('data', data);
      if (storage._objects) {
        storage._objects.forEach(obj => {
          if (obj.type === 'textbox') {
            obj.set('text', data.name || 'Magazzino');
          }
        });
      }
      canvas.renderAll();
    }
    return storage;
  } catch (error) {
    console.error('Errore durante la creazione del magazzino:', error);
    return null;
  }
};

export const updateStorage = (fabricObject, updatedData) => {
  if (!fabricObject) return;
  try {
    fabricObject.set('data', updatedData);
    if (fabricObject._objects) {
      fabricObject._objects.forEach(obj => {
        if (obj.type === 'textbox') {
          obj.set('text', updatedData.name || 'Magazzino');
        }
      });
    }
    if (fabricObject.canvas) fabricObject.canvas.renderAll();
  } catch (error) {
    console.error("Errore durante l'aggiornamento del magazzino:", error);
  }
};
