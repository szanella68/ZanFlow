// src/components/icons/IconFactory.js
import { createMachine } from './Machine';
import createTransport from './Transport';
import createStorage from './Storage';

const IconFactory = {
  // Funzioni per creare nuovi nodi
  createMachine,
  createTransport,
  createStorage,
  
  // Funzione per ricreare nodi esistenti dal database
  recreateNodeFromDatabase: (canvas, node) => {
    console.log('DEBUG: Inizio recreateNodeFromDatabase');
    
    // Verifiche preliminari
    if (!canvas) {
      console.error('DEBUG: Canvas non definito in recreateNodeFromDatabase');
      return null;
    }
    
    if (typeof canvas.add !== 'function') {
      console.error('DEBUG: Canvas senza metodo add in recreateNodeFromDatabase');
      return null;
    }
    
    // Verifica input node
    if (!node || typeof node !== 'object') {
      console.error('DEBUG: Nodo non valido:', node);
      return null;
    }
    
    // Estrai posizione e tipo dal nodo del database
    const { position_x, position_y, node_type, data, id } = node;
    
    if (position_x === undefined || position_y === undefined) {
      console.error('DEBUG: Posizione nodo mancante:', node);
      return null;
    }
    
    if (!node_type) {
      console.error('DEBUG: Tipo nodo mancante:', node);
      return null;
    }
    
    console.log(`DEBUG: Ricreazione nodo tipo ${node_type} in posizione (${position_x}, ${position_y})`);
    
    // Crea l'oggetto appropriato in base al tipo
    let fabricObject = null;
    
    try {
      switch (node_type) {
        case 'machine':
          console.log('DEBUG: Creazione oggetto macchina');
          fabricObject = createMachine(canvas, position_x, position_y);
          break;
        case 'transport':
          console.log('DEBUG: Creazione oggetto trasporto');
          fabricObject = createTransport(canvas, position_x, position_y);
          break;
        case 'storage':
          console.log('DEBUG: Creazione oggetto magazzino');
          fabricObject = createStorage(canvas, position_x, position_y);
          break;
        default:
          console.error('DEBUG: Tipo di nodo non supportato:', node_type);
          return null;
      }
      
      // Se l'oggetto è stato creato con successo, aggiorna i suoi dati
      if (fabricObject) {
        console.log('DEBUG: Oggetto creato, aggiornamento dati');
        
        // Aggiorna i dati dell'oggetto con quelli dal database
        fabricObject.set('data', data || {});
        
        // Aggiorna il testo dell'oggetto se presente
        if (fabricObject._objects) {
          let textboxFound = false;
          fabricObject._objects.forEach(obj => {
            if (obj && obj.type === 'textbox') {
              textboxFound = true;
              const displayName = (data && data.name) ? data.name : node_type;
              obj.set('text', displayName);
            }
          });
          
          if (!textboxFound) {
            console.log('DEBUG: Nessun textbox trovato nell\'oggetto');
          }
        } else {
          console.log('DEBUG: Oggetto senza sotto-oggetti');
        }
        
        // Associa l'ID del database all'oggetto
        fabricObject.set('dbId', id);
        
        // Non facciamo render qui per evitare problemi di performance
        // Il render verrà fatto alla fine dopo aver aggiunto tutti gli oggetti
      } else {
        console.error('DEBUG: Creazione oggetto fallita');
      }
    } catch (error) {
      console.error('DEBUG: Errore nella creazione del nodo:', error);
      return null;
    }
    
    console.log('DEBUG: Ricreazione nodo completata con successo');
    return fabricObject;
  },
  
  // Funzione per inizializzare il canvas con i nodi recuperati
  initializeCanvasWithNodes: (canvas, nodes) => {
    console.log('DEBUG: Inizio initializeCanvasWithNodes');
    
    // Verifica che il canvas sia valido
    if (!canvas) {
      console.error('DEBUG: Canvas non definito in initializeCanvasWithNodes');
      return;
    }
    
    // Verifica che il canvas abbia i metodi necessari
    if (typeof canvas.clear !== 'function' || typeof canvas.renderAll !== 'function') {
      console.error('DEBUG: Canvas senza metodi richiesti in initializeCanvasWithNodes');
      return;
    }
    
    // Verifica che i nodi siano un array
    if (!Array.isArray(nodes)) {
      console.error('DEBUG: Nodi non validi in initializeCanvasWithNodes:', nodes);
      return;
    }
    
    console.log(`DEBUG: Inizializzazione canvas con ${nodes.length} nodi`);
    
    try {
      // Prima rimuovi tutti gli oggetti esistenti dal canvas
      canvas.clear();
      console.log('DEBUG: Canvas pulito con successo');
      
      // Poi ricrea tutti i nodi
      console.log('DEBUG: Inizio ricreazione nodi');
      
      // Usiamo un contatore per verificare quanti nodi sono stati ricreati con successo
      let successCount = 0;
      
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        console.log(`DEBUG: Elaborazione nodo ${i}`);
        
        try {
          const fabricObject = IconFactory.recreateNodeFromDatabase(canvas, node);
          if (fabricObject) {
            successCount++;
          }
        } catch (nodeError) {
          console.error(`DEBUG: Errore durante ricreazione nodo ${i}:`, nodeError);
        }
      }
      
      console.log(`DEBUG: Ricreati con successo ${successCount}/${nodes.length} nodi`);
      
      // Richiedi il render del canvas alla fine se c'è almeno un nodo che è stato creato con successo
      if (successCount > 0) {
        console.log('DEBUG: Richiesta renderizzazione canvas');
        try {
          canvas.renderAll();
          console.log('DEBUG: Canvas renderizzato con successo');
        } catch (renderError) {
          console.error('DEBUG: Errore durante renderAll:', renderError);
        }
      }
    } catch (error) {
      console.error('DEBUG: Errore globale in initializeCanvasWithNodes:', error);
    }
  }
};

export default IconFactory;