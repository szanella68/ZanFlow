import { Circle, Rect, Group, Textbox } from 'fabric';

const createMachine = (canvas, left, top) => {
  if (!canvas) {
    console.error('Canvas is not initialized. Cannot create machine.');
    return null;
  }

  // Rettangolo principale
  const rect = new Rect({
    width: 120,
    height: 60,
    fill: '#deeaee',
    stroke: '#2b7a78',
    strokeWidth: 2,
    rx: 5,
    ry: 5,
    originX: 'center',
    originY: 'center'
  });

  // Icona ingranaggio
  const gear = new Circle({
    radius: 10,
    fill: '#2b7a78',
    left: -40,
    top: -15,
    originX: 'center',
    originY: 'center'
  });

  // Punti di connessione
  const inputPoint = new Circle({
    left: -60,
    top: 0,
    radius: 5,
    fill: '#17252a',
    stroke: '#3aafa9',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  const outputPoint = new Circle({
    left: 60,
    top: 0,
    radius: 5,
    fill: '#17252a',
    stroke: '#3aafa9',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  // Rettangolo per il testo (per evitare sovrapposizioni)
  const textBg = new Rect({
    width: 80,
    height: 20,
    fill: '#deeaee',
    stroke: 'transparent',
    originX: 'center',
    originY: 'center',
    top: 15
  });

  // Testo
  const textbox = new Textbox('Macchina', {
    width: 80,
    fontSize: 14,
    textAlign: 'center',
    fill: '#17252a',
    originX: 'center',
    originY: 'center',
    top: 15
  });

 // Crea gruppo
const group = new Group([rect, gear, inputPoint, outputPoint, textBg, textbox], {
  left: left,
  top: top,
  selectable: true,
  hasControls: true,
  hasBorders: true,
  objectType: 'machine',
  data: {
    name: 'Macchina',
    cycleTime: 0,
    piecesPerHour: 0,
    operators: 0,
    rejectRate: 0
  }
});

  canvas.add(group);
  canvas.renderAll();

  // Enhanced Debugging: Log detailed information about the group and its objects
  console.log('--- Debugging Machine Group Creation ---');
  console.log('Group Details:', {
    left: group.left,
    top: group.top,
    width: group.width,
    height: group.height,
    objectType: group.objectType,
    data: group.data
  });

  group._objects.forEach((obj, index) => {
    console.log(`Object ${index} (${obj.type}):`, {
      left: obj.left,
      top: obj.top,
      width: obj.width,
      height: obj.height,
      fill: obj.fill,
      stroke: obj.stroke
    });
  });

  if (!canvas.getObjects().includes(group)) {
    console.error('Failed to add the group to the canvas. Group:', group);
  } else {
    console.log('Machine group successfully added to the canvas:', group);
    console.log(`Group coordinates: left=${group.left}, top=${group.top}, width=${group.width}, height=${group.height}`);
    
    // Verifica visibilità
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    if (
      group.left + group.width / 2 < 0 ||
      group.left - group.width / 2 > canvasWidth ||
      group.top + group.height / 2 < 0 ||
      group.top - group.height / 2 > canvasHeight
    ) {
      console.warn('Group is outside the visible canvas area.');
    } else {
      console.log('Group is within the visible canvas area.');
    }
  }
  console.log('--- End of Debugging ---');

  return group;
};

const initializeCanvasWithMachines = (canvas, machines) => {
  machines.forEach(machine => {
    createMachine(canvas, machine.left, machine.top);
  });
};

export const createMachineFromData = (canvas, node) => {
  if (!node || typeof node.position_x !== 'number' || typeof node.position_y !== 'number') {
    console.error('Invalid node data:', node);
    return null;
  }

  const machine = createMachine(canvas, node.position_x, node.position_y);
  if (machine) {
    machine.set('dbId', node.id);
    const data = node.data || machine.data;
    machine.set('data', data);
    if (machine._objects) {
      machine._objects.forEach(obj => {
        if (obj.type === 'textbox') {
          obj.set('text', data.name || 'Macchina');
        }
      });
    }
    console.log('Machine created from data:', machine);
    canvas.renderAll();
  } else {
    console.error('Failed to create machine from data:', node);
  }

  return machine;
};

// Example usage: Call this function when a project is opened
// initializeCanvasWithMachines(canvas, [
//   { left: 100, top: 100 },
//   { left: 300, top: 200 },
//   { left: 500, top: 300 }
// ]);

export { createMachine, initializeCanvasWithMachines };