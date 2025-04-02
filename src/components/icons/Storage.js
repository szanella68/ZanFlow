import { fabric } from 'fabric';

export const createStorage = (canvas, left, top) => {
  // Rettangolo principale
  const rect = new fabric.Rect({
    width: 100,
    height: 80,
    fill: '#fff8e1',
    stroke: '#ff8f00',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  // Scaffali (rettangoli sottili)
  const shelf1 = new fabric.Rect({
    width: 80,
    height: 2,
    fill: '#ff8f00',
    left: 0,
    top: -20,
    originX: 'center',
    originY: 'center'
  });

  const shelf2 = new fabric.Rect({
    width: 80,
    height: 2,
    fill: '#ff8f00',
    left: 0,
    top: 0,
    originX: 'center',
    originY: 'center'
  });

  const shelf3 = new fabric.Rect({
    width: 80,
    height: 2,
    fill: '#ff8f00',
    left: 0,
    top: 20,
    originX: 'center',
    originY: 'center'
  });

  // Punti di connessione
  const inputPoint = new fabric.Circle({
    left: -50,
    top: 0,
    radius: 5,
    fill: '#e65100',
    stroke: '#ff8f00',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  const outputPoint = new fabric.Circle({
    left: 50,
    top: 0,
    radius: 5,
    fill: '#e65100',
    stroke: '#ff8f00',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  // Rettangolo per il testo (per evitare sovrapposizioni)
  const textBg = new fabric.Rect({
    width: 80,
    height: 20,
    fill: '#fff8e1',
    stroke: 'transparent',
    originX: 'center',
    originY: 'center',
    top: -5
  });

  // Testo
  const textbox = new fabric.Textbox('Magazzino', {
    width: 80,
    fontSize: 14,
    textAlign: 'center',
    fill: '#e65100',
    originX: 'center',
    originY: 'center',
    top: -5
  });

  // Crea gruppo
  const group = new fabric.Group([rect, shelf1, shelf2, shelf3, inputPoint, outputPoint, textBg, textbox], {
    left: left,
    top: top,
    selectable: true,
    hasControls: true,
    hasBorders: true,
    objectType: 'storage',
    data: {
      name: 'Magazzino',
      cycleTime: 0,
      piecesPerHour: 0,
      operators: 0,
      rejectRate: 0,
      capacity: 0,
      averageStayTime: 0,
      managementMethod: 'FIFO',
      storageCost: 0
    }
  });

  canvas.add(group);
  canvas.renderAll();
  
  return group;
};

// Funzione di utilità per creare magazzini da dati del database
export const createStorageFromData = (canvas, node) => {
  if (!canvas || !node) return null;
  
  try {
    const storage = createStorage(canvas, node.position_x, node.position_y);
    
    if (storage) {
      // Collega l'ID del database
      storage.set('dbId', node.id);
      
      // Imposta i dati salvati o utilizza i valori predefiniti
      const data = node.data || {
        name: 'Magazzino',
        cycleTime: 0,
        piecesPerHour: 0,
        operators: 0,
        rejectRate: 0,
        capacity: 0,
        averageStayTime: 0,
        managementMethod: 'FIFO',
        storageCost: 0
      };
      
      storage.set('data', data);
      
      // Aggiorna il nome visualizzato
      if (storage._objects) {
        storage._objects.forEach(obj => {
          if (obj.type === 'textbox') {
            obj.set('text', data.name || 'Magazzino');
          }
        });
      }
      
      // Aggiorna il canvas
      canvas.renderAll();
    }
    
    return storage;
  } catch (error) {
    console.error('Errore durante la creazione del magazzino:', error);
    return null;
  }
};

// Funzione per aggiornare un magazzino esistente
export const updateStorage = (fabricObject, updatedData) => {
  if (!fabricObject) return;
  
  try {
    // Aggiorna i dati dell'oggetto
    fabricObject.set('data', updatedData);
    
    // Aggiorna il testo se presente
    if (fabricObject._objects) {
      fabricObject._objects.forEach(obj => {
        if (obj.type === 'textbox') {
          obj.set('text', updatedData.name || 'Magazzino');
        }
      });
    }
    
    // Renderizza il canvas se disponibile
    if (fabricObject.canvas) {
      fabricObject.canvas.renderAll();
    }
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del magazzino:', error);
  }
};

export default createStorage;