import { fabric } from 'fabric';

export const createMachine = (canvas, left, top) => {
  // Rettangolo principale
  const rect = new fabric.Rect({
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
  const gear = new fabric.Circle({
    radius: 10,
    fill: '#2b7a78',
    left: -40,
    top: -15,
    originX: 'center',
    originY: 'center'
  });

  // Punti di connessione
  const inputPoint = new fabric.Circle({
    left: -60,
    top: 0,
    radius: 5,
    fill: '#17252a',
    stroke: '#3aafa9',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  const outputPoint = new fabric.Circle({
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
  const textBg = new fabric.Rect({
    width: 80,
    height: 20,
    fill: '#deeaee',
    stroke: 'transparent',
    originX: 'center',
    originY: 'center',
    top: 15
  });

  // Testo
  const textbox = new fabric.Textbox('Macchina', {
    width: 80,
    fontSize: 14,
    textAlign: 'center',
    fill: '#17252a',
    originX: 'center',
    originY: 'center',
    top: 15
  });

  // Crea gruppo
  const group = new fabric.Group([rect, gear, inputPoint, outputPoint, textBg, textbox], {
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
      rejectRate: 0,
      throughputTime: 0,
      supplier: 'interno',
      hourlyCost: 0,
      availability: 100
    }
  });

  canvas.add(group);
  canvas.renderAll();
  
  return group;
};

// Funzione di utilità per creare icone da dati del database
export const createMachineFromData = (canvas, node) => {
  if (!canvas || !node) return null;
  
  try {
    const machine = createMachine(canvas, node.position_x, node.position_y);
    
    if (machine) {
      // Collega l'ID del database
      machine.set('dbId', node.id);
      
      // Imposta i dati salvati o utilizza i valori predefiniti
      const data = node.data || {
        name: 'Macchina',
        cycleTime: 0,
        piecesPerHour: 0,
        operators: 0,
        rejectRate: 0,
        throughputTime: 0,
        supplier: 'interno',
        hourlyCost: 0,
        availability: 100
      };
      
      machine.set('data', data);
      
      // Aggiorna il nome visualizzato
      if (machine._objects) {
        machine._objects.forEach(obj => {
          if (obj.type === 'textbox') {
            obj.set('text', data.name || 'Macchina');
          }
        });
      }
      
      // Aggiorna il canvas
      canvas.renderAll();
    }
    
    return machine;
  } catch (error) {
    console.error('Errore durante la creazione della macchina:', error);
    return null;
  }
};

// Funzione per aggiornare una macchina esistente
export const updateMachine = (fabricObject, updatedData) => {
  if (!fabricObject) return;
  
  try {
    // Aggiorna i dati dell'oggetto
    fabricObject.set('data', updatedData);
    
    // Aggiorna il testo se presente
    if (fabricObject._objects) {
      fabricObject._objects.forEach(obj => {
        if (obj.type === 'textbox') {
          obj.set('text', updatedData.name || 'Macchina');
        }
      });
    }
    
    // Renderizza il canvas se disponibile
    if (fabricObject.canvas) {
      fabricObject.canvas.renderAll();
    }
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della macchina:', error);
  }
};