import { createMachine, createMachineFromData } from './Machine';
import createTransport, { createTransportFromData } from './Transport';
import { createStorage, createStorageFromData } from './Storage';

// Funzione unificata per creare nodi dal database
export const createNodeFromData = (canvas, node) => {
  if (!canvas || !node) {
    console.error('Canvas or node is invalid:', { canvas, node });
    return null;
  }
  
  try {
    console.log(`Creating node of type "${node.node_type}" from database configuration`, node);
    
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
        console.log('Creating a machine node...');
        fabricObject = createMachineFromData(canvas, node);
        break;
      case 'transport':
        console.log('Creating a transport node...');
        fabricObject = createTransportFromData(canvas, node);
        break;
      case 'storage':
        console.log('Creating a storage node...');
        fabricObject = createStorageFromData(canvas, node);
        break;
      default:
        console.error('Unsupported node type:', node_type);
        return null;
    }
    
    // Se l'oggetto è stato creato con successo, aggiorna i suoi dati
    if (fabricObject) {
      console.log('Node successfully created:', fabricObject);
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

      // Verifica se l'oggetto ha un'icona associata
      if (!fabricObject.icon) {
        console.warn(`Icon missing for node type "${node_type}". Setting a default icon.`);
        fabricObject.icon = 'default-icon.png'; // Imposta un'icona predefinita
      }
    } else {
      console.warn('Node creation failed for:', node);
    }
    
    return fabricObject;
  } catch (error) {
    console.error('Error during node creation from database:', error);
    return null;
  }
};

// Funzione per inizializzare il canvas con i nodi
export const initializeCanvasWithNodes = (canvas, nodes) => {
  if (!canvas || !Array.isArray(nodes)) {
    console.error('Invalid canvas or nodes for initialization:', { canvas, nodes });
    return;
  }
  
  try {
    console.log(`Initializing canvas with ${nodes.length} nodes`, nodes);
    
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
    
    console.log(`Successfully created ${successCount}/${nodes.length} nodes`);
    
    // Renderizza il canvas
    canvas.renderAll();
  } catch (error) {
    console.error('Error during canvas initialization with nodes:', error);
  }
};

// Funzione per aggiornare un nodo esistente
export const updateNodeObject = (fabricObject, updatedData) => {
  if (!fabricObject) {
    console.error('Invalid fabric object for update:', fabricObject);
    return;
  }
  
  try {
    console.log('Updating node object with new data:', updatedData);
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
    console.log('Node object successfully updated:', fabricObject);
  } catch (error) {
    console.error('Error during node update:', error);
  }
};

const NodeFactory = {
  createNodeFromData,
  updateNodeObject,
  initializeCanvasWithNodes
};

export default NodeFactory;