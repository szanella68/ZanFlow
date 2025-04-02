import { Circle, Rect, Group, Textbox } from 'fabric';

export const createTransport = (canvas, left, top) => {
  // Rettangolo principale
  const rect = new fabric.Rect({
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
  const arrowShaft = new fabric.Rect({
    width: 30,
    height: 2,
    fill: '#1976d2',
    left: -20,
    top: -10,
    originX: 'center',
    originY: 'center'
  });

  // Freccia (punta)
  const arrowHead = new fabric.Triangle({
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
  const inputPoint = new fabric.Circle({
    left: -60,
    top: 0,
    radius: 5,
    fill: '#0d47a1',
    stroke: '#1976d2',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  const outputPoint = new fabric.Circle({
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
  const textBg = new fabric.Rect({
    width: 80,
    height: 20,
    fill: '#e3f2fd',
    stroke: 'transparent',
    originX: 'center',
    originY: 'center',
    top: 5
  });

  // Testo
  const textbox = new fabric.Textbox('Trasporto', {
    width: 80,
    fontSize: 14,
    textAlign: 'center',
    fill: '#0d47a1',
    originX: 'center',
    originY: 'center',
    top: 5
  });

  // Crea gruppo
  const group = new fabric.Group([rect, arrowShaft, arrowHead, inputPoint, outputPoint, textBg, textbox], {
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
      rejectRate: 0,
      transportType: 'manuale',
      throughputTime: 0,
      distance: 0,
      minBatch: 1
    }
  });

  canvas.add(group);
  canvas.renderAll();
  
  return group;
};

// Funzione di utilità per creare trasporti da dati del database
export const createTransportFromData = (canvas, node) => {
  if (!canvas || !node) return null;
  
  try {
    const transport = createTransport(canvas, node.position_x, node.position_y);
    
    if (transport) {
      // Collega l'ID del database
      transport.set('dbId', node.id);
      
      // Imposta i dati salvati o utilizza i valori predefiniti
      const data = node.data || {
        name: 'Trasporto',
        cycleTime: 0,
        piecesPerHour: 0,
        operators: 0,
        rejectRate: 0,
        transportType: 'manuale',
        throughputTime: 0,
        distance: 0,
        minBatch: 1
      };
      
      transport.set('data', data);
      
      // Aggiorna il nome visualizzato
      if (transport._objects) {
        transport._objects.forEach(obj => {
          if (obj.type === 'textbox') {
            obj.set('text', data.name || 'Trasporto');
          }
        });
      }
      
      // Aggiorna il canvas
      canvas.renderAll();
    }
    
    return transport;
  } catch (error) {
    console.error('Errore durante la creazione del trasporto:', error);
    return null;
  }
};

// Funzione per aggiornare un trasporto esistente
export const updateTransport = (fabricObject, updatedData) => {
  if (!fabricObject) return;
  
  try {
    // Aggiorna i dati dell'oggetto
    fabricObject.set('data', updatedData);
    
    // Aggiorna il testo se presente
    if (fabricObject._objects) {
      fabricObject._objects.forEach(obj => {
        if (obj.type === 'textbox') {
          obj.set('text', updatedData.name || 'Trasporto');
        }
      });
    }
    
    // Renderizza il canvas se disponibile
    if (fabricObject.canvas) {
      fabricObject.canvas.renderAll();
    }
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del trasporto:', error);
  }
};

export default createTransport;