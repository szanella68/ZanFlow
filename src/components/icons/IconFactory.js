import { createMachine } from './Machine';
import createTransport from './Transport';
import createStorage from './Storage';

const IconFactory = {
  // Funzioni per creare nuovi nodi
  createMachine,
  createTransport,
  createStorage,
  
  // Nuova funzione per ricreare nodi esistenti dal database
  recreateNodeFromDatabase: (canvas, node) => {
    // Estrai posizione e tipo dal nodo del database
    const { position_x, position_y, node_type, data, id } = node;
    
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
      // Aggiorna i dati dell'oggetto con quelli dal database
      fabricObject.set('data', data);
      
      // Aggiorna il testo dell'oggetto se presente
      if (fabricObject._objects) {
        fabricObject._objects.forEach(obj => {
          if (obj.type === 'textbox') {
            obj.set('text', data.name || node_type);
          }
        });
      }
      
      // Associa l'ID del database all'oggetto
      fabricObject.set('dbId', id);
      
      // Richiedi il render del canvas
      canvas.renderAll();
    }
    
    return fabricObject;
  },
  
  // Nuova funzione per inizializzare il canvas con i nodi recuperati
  initializeCanvasWithNodes: (canvas, nodes) => {
    // Verifica che il canvas sia valido
    if (!canvas || typeof canvas.clear !== 'function') {
      console.error('Canvas non valido in initializeCanvasWithNodes');
      return;
    }
    
    // Verifica che i nodi siano un array
    if (!Array.isArray(nodes)) {
      console.error('Nodi non validi in initializeCanvasWithNodes:', nodes);
      return;
    }
    
    console.log(`Inizializzazione canvas con ${nodes.length} nodi`);
    
    // Prima rimuovi tutti gli oggetti esistenti dal canvas
    canvas.clear();
    
    // Poi ricrea tutti i nodi
    nodes.forEach(node => {
      try {
        IconFactory.recreateNodeFromDatabase(canvas, node);
      } catch (error) {
        console.error('Errore nella ricreazione del nodo:', error, node);
      }
    });
    
    // Richiedi il render del canvas
    canvas.renderAll();
  }
};

export default IconFactory;