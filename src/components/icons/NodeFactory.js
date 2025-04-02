import { createMachine, createMachineFromData } from './Machine';
import { createTransport, createTransportFromData } from './Transport';
import { createStorage, createStorageFromData } from './Storage';

// Funzione unificata per creare nodi dal database
export const createNodeFromData = (canvas, node) => {
  console.group('🏭 Creating Node from Database');
  console.log('Input Node Data:', node);

  if (!canvas || !node) {
    console.error('❌ Invalid input:', { canvas, node });
    console.groupEnd();
    return null;
  }
  
  try {
    // Estrai posizione e tipo dal nodo del database
    const { position_x, position_y, node_type, data, id } = node;
    
    // Validazione input
    if (position_x === undefined || position_y === undefined) {
      console.error('❌ Missing node position:', { position_x, position_y });
      console.groupEnd();
      return null;
    }
    
    if (!node_type) {
      console.error('❌ Missing node type:', node_type);
      console.groupEnd();
      return null;
    }

    console.log('Node Creation Details:', {
      type: node_type,
      position: { x: position_x, y: position_y },
      data: data
    });
    
    // Crea l'oggetto appropriato in base al tipo
    let fabricObject = null;
    
    switch (node_type) {
      case 'machine':
        console.log('🖥️ Creating Machine Node');
        fabricObject = createMachineFromData(canvas, node);
        break;
      case 'transport':
        console.log('🚚 Creating Transport Node');
        fabricObject = createTransportFromData(canvas, node);
        break;
      case 'storage':
        console.log('📦 Creating Storage Node');
        fabricObject = createStorageFromData(canvas, node);
        break;
      default:
        console.error('❌ Unsupported node type:', node_type);
        console.groupEnd();
        return null;
    }
    
    // Se l'oggetto è stato creato con successo, aggiorna i suoi dati
    if (fabricObject) {
      console.log('✅ Node Successfully Created', {
        id: id,
        type: node_type,
        position: { x: position_x, y: position_y }
      });

      // Collega l'ID del database all'oggetto
      fabricObject.set('dbId', id);
      
      // Aggiorna i dati dell'oggetto con quelli dal database
      fabricObject.set('data', data || {});
      
      // Aggiorna il testo dell'oggetto se presente
      if (fabricObject._objects) {
        let textUpdated = false;
        fabricObject._objects.forEach(obj => {
          if (obj && obj.type === 'textbox') {
            const displayName = (data && data.name) ? data.name : node_type;
            obj.set('text', displayName);
            textUpdated = true;
          }
        });
        
        console.log('Textbox Update:', {
          updated: textUpdated,
          displayName: (data && data.name) ? data.name : node_type
        });
      } else {
        console.warn('❗ No sub-objects found in the fabric object');
      }
    } else {
      console.error('❌ Node Creation Failed', { node_type, node });
    }
    
    console.groupEnd();
    return fabricObject;
  } catch (error) {
    console.error('❌ Fatal Error during node creation:', error);
    console.groupEnd();
    return null;
  }
};

// Funzione per inizializzare il canvas con i nodi
export const initializeCanvasWithNodes = (canvas, nodes) => {
  console.group('🌐 Initialize Canvas with Nodes');
  
  if (!canvas || !Array.isArray(nodes)) {
    console.error('❌ Invalid input:', { canvas, nodes });
    console.groupEnd();
    return;
  }
  
  console.log(`📦 Initializing with ${nodes.length} nodes`);

  try {
    // Pulisci il canvas in modo sicuro
    canvas.clear();
    
    // Crea tutti i nodi
    let successCount = 0;
    let failureCount = 0;

    nodes.forEach((node, index) => {
      try {
        const fabricObject = createNodeFromData(canvas, node);
        
        if (fabricObject) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (nodeError) {
        console.error(`❌ Error creating node ${index}:`, nodeError);
        failureCount++;
      }
    });
    
    console.log('Node Initialization Summary:', {
      total: nodes.length,
      successful: successCount,
      failed: failureCount
    });

    // Renderizza il canvas
    canvas.renderAll();
  } catch (error) {
    console.error('❌ Critical error during canvas initialization:', error);
  } finally {
    console.groupEnd();
  }
};

const NodeFactory = {
  createNodeFromData,
  initializeCanvasWithNodes
};

export default NodeFactory;