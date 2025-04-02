// Gestisce il drop sul canvas
const handleDrop = async (e) => {
  e.preventDefault();
  
  console.log('DEBUG: Drop avvenuto');
  
  // Se non c'è un progetto selezionato o il canvas non è inizializzato, mostra un messaggio di errore
  if (!currentProject) {
    console.log('DEBUG: Progetto corrente non disponibile durante drop');
    alert('Seleziona o crea un progetto prima di aggiungere elementi');
    return;
  }
  
  // Verifica che il canvas sia inizializzato
  if (!fabricCanvasRef.current) {
    console.log('DEBUG: Canvas non inizializzato durante drop');
    alert('Il canvas non è ancora pronto. Attendi qualche istante e riprova.');
    return;
  }
  
  console.log('DEBUG: Drop con progetto corrente:', currentProject.name);
  
  // Recupera il tipo di strumento trascinato
  const toolType = e.dataTransfer.getData('toolType');
  if (!toolType) {
    console.error('DEBUG: Nessun tipo di strumento disponibile nel drop');
    return;
  }
  
  console.log('DEBUG: Tipo di strumento trascinato:', toolType);
  
  // Calcola la posizione del drop in modo sicuro
  try {
    const canvas = fabricCanvasRef.current;
    
    // Verifica che il canvas sia valido
    if (!canvas || typeof canvas.add !== 'function') {
      console.error('DEBUG: Canvas non valido durante drop');
      return;
    }
    
    let x, y;
    
    // Calcola la posizione in modo sicuro
    try {
      // Prova a ottenere l'elemento DOM del canvas
      const canvasEl = canvas.getElement();
      
      if (!canvasEl) {
        console.error('DEBUG: Elemento canvas non disponibile durante drop');
        // Utilizziamo una posizione predefinita
        x = 100;
        y = 100;
      } else {
        // Calcola la posizione in base all'offset del canvas
        const rect = canvasEl.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
    } catch (posError) {
      console.error('DEBUG: Errore nel calcolo della posizione:', posError);
      // Utilizziamo una posizione predefinita
      x = 100;
      y = 100;
    }
    
    console.log('DEBUG: Posizione drop calcolata:', { x, y });
    
    // Dati di base per ogni tipo di nodo
    const baseNodeData = {
      name: toolType.charAt(0).toUpperCase() + toolType.slice(1),
      cycleTime: 0,
      piecesPerHour: 0,
      operators: 0,
      rejectRate: 0
    };
    
    // Crea l'oggetto appropriato in base al tipo di strumento
    let fabricObject = null;
    let nodeData = { ...baseNodeData };
    
    console.log('DEBUG: Creazione oggetto per tipo:', toolType);
    
    try {
      switch (toolType) {
        case 'machine':
          nodeData = {
            ...nodeData,
            throughputTime: 0,
            supplier: 'interno',
            hourlyCost: 0,
            availability: 100
          };
          fabricObject = IconFactory.createMachine(canvas, x, y);
          break;
          
        case 'transport':
          nodeData = {
            ...nodeData,
            transportType: 'manuale',
            throughputTime: 0,
            distance: 0,
            minBatch: 1
          };
          fabricObject = IconFactory.createTransport(canvas, x, y);
          break;
          
        case 'storage':
          nodeData = {
            ...nodeData,
            capacity: 0,
            averageStayTime: 0,
            managementMethod: 'FIFO',
            storageCost: 0
          };
          fabricObject = IconFactory.createStorage(canvas, x, y);
          break;
          
        case 'connection':
          // La connessione verrà implementata successivamente
          console.log('DEBUG: Connessione selezionata, da implementare');
          return;
          
        default:
          console.log('DEBUG: Tipo di strumento non riconosciuto');
          return;
      }
    } catch (createError) {
      console.error('DEBUG: Errore durante la creazione dell\'oggetto:', createError);
      alert('Errore durante la creazione dell\'elemento. Riprova.');
      return;
    }
    
    if (!fabricObject) {
      console.error('DEBUG: Creazione oggetto fallita');
      return;
    }
    
    console.log('DEBUG: Oggetto creato con successo');
    
    // Prepara i dati per il salvataggio nel database
    const nodeForDb = {
      project_id: currentProject.id,
      node_type: toolType,
      name: nodeData.name,
      position_x: x,
      position_y: y,
      data: nodeData
    };
    
    console.log('DEBUG: Tentativo di salvataggio nel database');
    
    // Salva il nodo nel database
    try {
      const savedNode = await addNode(nodeForDb);
      
      // Se il salvataggio ha successo, associa l'ID del database all'oggetto fabric
      if (savedNode && fabricObject) {
        console.log('DEBUG: Nodo salvato nel DB, ID:', savedNode.id);
        fabricObject.set('dbId', savedNode.id);
        
        // Renderizziamo il canvas solo se il metodo è disponibile
        if (canvas.renderAll && typeof canvas.renderAll === 'function') {
          canvas.renderAll();
        }
        
        // Seleziona l'oggetto appena creato se possibile
        try {
          if (canvas.setActiveObject && typeof canvas.setActiveObject === 'function') {
            canvas.setActiveObject(fabricObject);
            onSelectObject(fabricObject);
          }
        } catch (selectError) {
          console.error('DEBUG: Errore durante la selezione dell\'oggetto:', selectError);
          // Non è un errore critico, continuiamo
        }
      }
    } catch (saveError) {
      console.error('DEBUG: Errore durante il salvataggio nel database:', saveError);
      alert('Errore nel salvataggio dell\'elemento. Riprova.');
      
      // Se possibile, rimuovi l'oggetto dal canvas poiché non è stato salvato
      try {
        if (fabricObject && canvas.remove && typeof canvas.remove === 'function') {
          canvas.remove(fabricObject);
          canvas.renderAll();
        }
      } catch (removeError) {
        console.error('DEBUG: Errore durante la rimozione dell\'oggetto:', removeError);
      }
    }
  } catch (error) {
    console.error('DEBUG: Errore globale durante il processo di drop:', error);
    alert('Si è verificato un errore. Riprova.');
  }
};