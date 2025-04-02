import { createMachine } from './Machine';
import createTransport from './Transport';
import createStorage from './Storage';

// Funzione unificata per creare nodi dal database
export const createNodeFromData = (canvas, node) => {
  if (!canvas || !node) return null;
  
  try {
    console.log(`Creazione nodo di tipo ${node.node_type} dalla configurazione DB`);
    
    // Estrai posizione e tipo dal nodo del database
    const { position_x, position_y, node_type, data, id } = node;
    
    if (position_x === undefined || position_y === undefined) {
      console.error('Posizione nodo mancante:', node);
      return null;
    }
    
    if (!node_type) {
      console.error('Tipo nodo mancante:', node);
      return null;
    }
    
    // Crea l'oggetto appropriato in base al tipo
    let fabricObject = null;
    
    switch (node_type) {
      case 'machine':
        fabricObject = createMachine(canvas, position_x, position_y);
        break;
      case 'transport':
        fabricObject = createTransport(canvas, position_x, position_y);
        break;
      case 'storage':
        fabricObject = createStorage(canvas, position_x, position_y);
        break;
      default:
        console.error('Tipo di nodo non supportato:', node_type);
        return null;
    }
    
    // Se l'oggetto è stato creato con successo, aggiorna i suoi dati
    if (fabricObject) {
      // Collega l'ID del database all'oggetto
      fabricObject.set('dbId', id);
      
      // Aggiorna i dati dell'oggetto con quelli dal database
      fabricObject.set('data', data || {});
      
      // Aggiorna il testo dell'oggetto se presente
      if (fabricObject._objects) {
        fabricObject._objects.forEach(obj => {
          if (obj && obj.type === 'textbox') {
            const displayName = (data && data.name) ? data.name : node_type;
            obj.set('text', displayName);
          }
        });
      }
    }
    
    return fabricObject;
  } catch (error) {
    console.error('Errore durante la creazione del nodo dal database:', error);
    return null;
  }
};

// Funzione per inizializzare il canvas con i nodi
export const initializeCanvasWithNodes = (canvas, nodes) => {
  if (!canvas || !Array.isArray(nodes)) {
    console.error('Canvas o nodi non validi per l\'inizializzazione');
    return;
  }
  
  try {
    console.log(`Inizializzazione canvas con ${nodes.length} nodi`);
    
    // Pulisci il canvas in modo sicuro
    canvas.clear();
    
    // Crea tutti i nodi
    let successCount = 0;
    
    for (const node of nodes) {
      const fabricObject = createNodeFromData(canvas, node);
      if (fabricObject) {
        successCount++;
      }
    }
    
    console.log(`Creati con successo ${successCount}/${nodes.length} nodi`);
    
    // Renderizza il canvas
    canvas.renderAll();
  } catch (error) {
    console.error('Errore durante l\'inizializzazione del canvas con i nodi:', error);
  }
};

// Funzione per aggiornare un nodo esistente
export const updateNodeObject = (fabricObject, updatedData) => {
  if (!fabricObject) return;
  
  try {
    // Aggiorna i dati dell'oggetto
    fabricObject.set('data', updatedData);
    
    // Aggiorna il testo se presente
    if (fabricObject._objects) {
      fabricObject._objects.forEach(obj => {
        if (obj.type === 'textbox') {
          obj.set('text', updatedData.name || fabricObject.objectType);
        }
      });
    }
    
    // Renderizza il canvas se disponibile
    if (fabricObject.canvas) {
      fabricObject.canvas.renderAll();
    }
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del nodo:', error);
  }
};

const NodeFactory = {
  createNodeFromData,
  updateNodeObject,
  initializeCanvasWithNodes
};

export default NodeFactory;