// Modifica alla funzione initializeCanvasWithNodes in IconFactory.js

initializeCanvasWithNodes: (canvas, nodes) => {
  console.log('DEBUG: Inizio initializeCanvasWithNodes');
  
  // Verifica più stringente del canvas
  if (!canvas) {
    console.error('DEBUG: Canvas non definito in initializeCanvasWithNodes');
    return;
  }
  
  // Verifica che il canvas sia un'istanza valida di fabric.Canvas
  if (!canvas.lowerCanvasEl || !canvas.contextContainer) {
    console.error('DEBUG: Canvas non completamente inizializzato. Manca il contesto.');
    return;
  }
  
  // Verifica che il metodo clear sia disponibile e sia una funzione
  if (typeof canvas.clear !== 'function') {
    console.error('DEBUG: Canvas senza metodo clear in initializeCanvasWithNodes');
    return;
  }
  
  // Verifica che il metodo renderAll sia disponibile e sia una funzione
  if (typeof canvas.renderAll !== 'function') {
    console.error('DEBUG: Canvas senza metodo renderAll in initializeCanvasWithNodes');
    return;
  }
  
  // Verifica che i nodi siano un array
  if (!Array.isArray(nodes)) {
    console.error('DEBUG: Nodi non validi in initializeCanvasWithNodes:', nodes);
    return;
  }
  
  console.log(`DEBUG: Inizializzazione canvas con ${nodes.length} nodi`);
  
  try {
    // Prima rimuovi tutti gli oggetti esistenti dal canvas in modo sicuro
    try {
      // Utilizziamo getObjects e remove invece di clear che può causare problemi
      const objects = canvas.getObjects();
      if (objects && objects.length > 0) {
        for (let i = objects.length - 1; i >= 0; i--) {
          canvas.remove(objects[i]);
        }
      }
      console.log('DEBUG: Canvas pulito con successo');
    } catch (clearError) {
      console.error('DEBUG: Errore durante pulizia canvas:', clearError);
      // Continuiamo comunque, potremmo ancora riuscire ad aggiungere nodi
    }
    
    // Poi ricrea tutti i nodi
    console.log('DEBUG: Inizio ricreazione nodi');
    
    // Usiamo un contatore per verificare quanti nodi sono stati ricreati con successo
    let successCount = 0;
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      console.log(`DEBUG: Elaborazione nodo ${i}`);
      
      try {
        // Creiamo l'oggetto in base al tipo
        let fabricObject = null;
        
        switch (node.node_type) {
          case 'machine':
            fabricObject = IconFactory.createMachine(canvas, node.position_x, node.position_y);
            break;
          case 'transport':
            fabricObject = IconFactory.createTransport(canvas, node.position_x, node.position_y);
            break;
          case 'storage':
            fabricObject = IconFactory.createStorage(canvas, node.position_x, node.position_y);
            break;
          default:
            console.error(`DEBUG: Tipo di nodo non supportato: ${node.node_type}`);
            continue;
        }
        
        // Se l'oggetto è stato creato con successo, aggiorna i suoi dati
        if (fabricObject) {
          // Aggiorna i dati dell'oggetto con quelli dal database
          fabricObject.set('data', node.data || {});
          
          // Aggiorna il testo dell'oggetto se presente
          if (fabricObject._objects) {
            fabricObject._objects.forEach(obj => {
              if (obj && obj.type === 'textbox') {
                const displayName = (node.data && node.data.name) ? node.data.name : node.node_type;
                obj.set('text', displayName);
              }
            });
          }
          
          // Associa l'ID del database all'oggetto
          fabricObject.set('dbId', node.id);
          
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