// FILE: NodeFactory.js
import { createMachine } from './Machine';
import { createTransport } from './Transport';
import { createStorage } from './Storage';


const NodeFactory = {
  createNodeFromData: (canvas, nodeData) => {
    if (!canvas || !nodeData) {
      console.warn('⚠️ Dati canvas o nodo non validi:', { canvas: !!canvas, nodeData });
      return null;
    }

    if (!nodeData.node_type) {
      console.warn('⚠️ Tipo di nodo mancante:', nodeData);
      return null;
    }

    const position = {
      left: nodeData.position_x || 100,
      top: nodeData.position_y || 100
    };

    // Gestione dei dati che potrebbero essere in formato stringa JSON
    let data;
    try {
      data = typeof nodeData.data === 'string'
        ? JSON.parse(nodeData.data)
        : (nodeData.data || {});
    } catch (err) {
      console.error('❌ Errore parsing dati nodo:', err);
      data = {};
    }

    // Assicuriamoci che data.name contenga almeno un valore predefinito
    if (!data.name) {
      data.name = nodeData.name || 
                  (nodeData.node_type === 'machine' ? 'Macchina' : 
                   nodeData.node_type === 'transport' ? 'Trasporto' : 
                   nodeData.node_type === 'storage' ? 'Magazzino' : 'Nodo');
    }

    let fabricObject = null;

    console.log(`🏭 Creazione nodo di tipo: ${nodeData.node_type}`, { position, data });

    try {
      switch (nodeData.node_type) {
        case 'machine':
          fabricObject = createMachine(canvas, position, data);
          break;
        case 'transport':
          fabricObject = createTransport(canvas, position, data);
          break;
        case 'storage':
          fabricObject = createStorage(canvas, position, data);
          break;
        default:
          console.error(`❌ Tipo di nodo sconosciuto: ${nodeData.node_type}`);
          return null;
      }

      if (fabricObject) {
        fabricObject.set({
          id: nodeData.id,
          objectType: nodeData.node_type,
          selectable: true,
          hasControls: true,
          hasBorders: true
        });
        
        // Eventuali aggiustamenti specifici per il tipo di nodo
        if (nodeData.node_type === 'machine') {
          // Configurazione specifica per machine...
          fabricObject.hoverCursor = 'move';
        }
        
        console.log(`✅ Nodo creato con successo:`, fabricObject);
        canvas.renderAll();
      } else {
        console.error('❌ Errore: funzione di creazione ha restituito null');
      }
    } catch (err) {
      console.error(`❌ Errore durante la creazione del nodo:`, err);
      return null;
    }

    return fabricObject;
  },
  
  // Metodo per creare una connessione tra due nodi
  createConnection: (canvas, startNode, endNode) => {
    if (!canvas || !startNode || !endNode) return null;
    
    // Implementazione per creare la connessione...
    // Sarà sviluppata in futuro
    
    console.log('Richiesta connessione tra:', startNode.id, 'e', endNode.id);
    return null;
  }
};

export default NodeFactory;