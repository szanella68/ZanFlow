# ZanFlow

## Descrizione del Progetto
ZanFlow è un'applicazione web per la creazione e visualizzazione di diagrammi di flusso produttivi. Consente agli utenti di mappare processi industriali, con particolare attenzione ai cicli di produzione, tempi di lavorazione, e gestione delle risorse. L'app permette di documentare rapidamente i processi produttivi durante le visite in azienda, prendendo appunti strutturati sui macchinari, tempi ciclo, personale e flussi di lavorazione.

## Obiettivi
- Creare una piattaforma con canvas infinito per diagrammi di flusso produttivi
- Permettere la creazione di diversi tipi di nodi (macchine, trasporti, magazzini)
- Consentire la connessione tra nodi per rappresentare il flusso di produzione
- Memorizzare e visualizzare parametri chiave per ogni elemento del flusso
- Analizzare l'efficienza complessiva di un processo produttivo
- Offrire un'interfaccia intuitiva per utenti in mobilità

## Installazione e Setup

### Prerequisiti
- Node.js (versione LTS)
- npm
- Git
- MySQL/phpMyAdmin

### Passi per l'installazione

1. Creare un nuovo progetto React:
```
npx create-react-app zanflow
cd zanflow
```

2. Installare le dipendenze:
```
npm install react-router-dom fabric uuid react-icons bootstrap
npm install express mysql2 cors body-parser
npm install --save-dev nodemon
```

3. Creare la struttura delle cartelle:
```
mkdir -p src/components/canvas
mkdir -p src/components/icons
mkdir -p src/components/panels
mkdir -p src/components/menus
mkdir -p src/components/project
mkdir -p src/context
mkdir -p src/services
mkdir -p src/utils
mkdir -p server
```

4. Avviare l'applicazione (con porta personalizzata se necessario):
```
set PORT=3001 && npm start  # Windows Command Prompt
$env:PORT=3001; npm start   # Windows PowerShell
```

### Setup del Database

1. Creare un database MySQL usando phpMyAdmin con le seguenti tabelle:

**Tabella Projects**
```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Tabella Nodes**
```sql
CREATE TABLE nodes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  node_type ENUM('machine', 'transport', 'storage') NOT NULL,
  name VARCHAR(255) NOT NULL,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

**Tabella Connections**
```sql
CREATE TABLE connections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  start_node_id INT NOT NULL,
  end_node_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (start_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (end_node_id) REFERENCES nodes(id) ON DELETE CASCADE
);
```

## Struttura dei File

```
zanflow/
├── public/
│   └── index.html
├── src/
│   ├── App.js                         # Componente principale
│   ├── App.css                        # Stili principali
│   ├── index.js                       # Entry point
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── Canvas.js              # Canvas principale
│   │   │   └── Canvas.css             # Stili del canvas
│   │   ├── icons/
│   │   │   ├── IconFactory.js         # Factory per le icone
│   │   │   ├── Machine.js             # Componente macchina
│   │   │   ├── Transport.js           # Componente trasporto
│   │   │   └── Storage.js             # Componente magazzino
│   │   ├── panels/
│   │   │   ├── ToolsPanel.js          # Pannello strumenti
│   │   │   ├── PropertiesPanel.js     # Pannello proprietà
│   │   │   └── Panels.css             # Stili dei pannelli
│   │   ├── menus/
│   │   │   ├── TopMenu.js             # Menu superiore
│   │   │   └── TopMenu.css            # Stili del menu
│   │   └── project/
│   │       ├── ProjectManager.js      # Gestione progetti
│   │       └── ProjectManager.css     # Stili gestione progetti
│   ├── context/
│   │   └── ProjectContext.js          # Context API per gestione progetti
│   ├── services/                      # Servizi per API/DB
│   │   └── api.js                     # Funzioni per chiamate API
│   └── utils/                         # Utility functions
└── server/
    └── index.js                       # Backend (Node.js, Express)
```

## Funzionalità Implementate

1. **Interfaccia base**:
   - Menu in alto (File, Modifica, Visualizza)
   - Pannello strumenti a sinistra
   - Canvas centrale
   - Pannello proprietà a destra

2. **Componenti di flusso**:
   - Macchine: rappresentano stazioni di lavoro
   - Trasporti: rappresentano spostamenti di materiali
   - Magazzini: rappresentano aree di stoccaggio

3. **Drag-and-drop**:
   - Possibilità di trascinare componenti dal pannello strumenti al canvas

4. **Gestione progetti**:
   - Creazione di progetti con nome e descrizione
   - Selezione di progetti esistenti
   - Visualizzazione dei dettagli del progetto corrente

5. **Gestione parametri**:
   - Ogni componente possiede parametri specifici per il suo tipo
   - I parametri vengono visualizzati e modificati nel pannello di proprietà
   - Aggiornamento automatico dei componenti sul canvas

6. **Integrazione con database**:
   - Salvataggio automatico dei progetti
   - Salvataggio automatico dei nodi (macchine, trasporti, magazzini)
   - Aggiornamento dei parametri dei nodi

## Parametri Specifici per Tipo di Nodo

### Parametri comuni a tutti i nodi
- Nome: identificativo del nodo
- Tempo ciclo (s): tempo necessario per processare un pezzo
- Pezzi/ora: output produttivo orario
- Operatori: numero di persone necessarie
- Scarto (%): percentuale di pezzi scartati

### Parametri specifici per Macchine
- Tempo attraversamento (s): tempo di permanenza del prodotto nella macchina
- Fornitore: interno o esterno
- Costo orario (€): costo operativo della macchina
- Disponibilità (%): percentuale di tempo in cui la macchina è funzionante

### Parametri specifici per Trasporti
- Tipo trasporto: manuale, automatico, veicolo
- Tempo attraversamento (s): tempo necessario per il trasporto
- Distanza (m): lunghezza del percorso
- Batch minimo: quantità minima trasportata

### Parametri specifici per Magazzini
- Capacità: quantità massima di prodotti stoccabili
- Tempo medio di permanenza (h): tempo medio di giacenza
- Metodo gestione: FIFO/LIFO
- Costo di stoccaggio (€/h): costo per unità di tempo

## Architettura del Backend

Il backend utilizza Node.js con Express e un database MySQL. Principali endpoint API:

- **GET /api/projects**: Ottiene tutti i progetti
- **POST /api/projects**: Crea un nuovo progetto
- **GET /api/projects/:projectId/nodes**: Ottiene tutti i nodi di un progetto
- **POST /api/nodes**: Crea un nuovo nodo
- **PUT /api/nodes/:nodeId**: Aggiorna un nodo esistente
- **GET /api/projects/:projectId/connections**: Ottiene le connessioni di un progetto
- **POST /api/connections**: Crea una nuova connessione

## Prossimi Passi di Sviluppo

### 1. Implementazione delle Connessioni
- Aggiungere la funzionalità per collegare nodi tra loro
- Creare linee di connessione con frecce direzionali
- Permettere l'aggiornamento automatico delle connessioni quando i nodi vengono spostati

### 2. Caricamento di Progetti Esistenti
- Implementare la funzionalità per caricare tutti i nodi di un progetto quando viene selezionato
- Mantenere lo stato di selezione dei progetti tra le sessioni

### 3. Analisi dei Flussi
- Calcolo automatico di metriche di efficienza
- Identificazione di colli di bottiglia
- Generazione di report dettagliati sul processo produttivo

### 4. Funzionalità Avanzate
- Possibilità di aggiungere immagini e note ai componenti
- Modalità presentazione per visualizzare il flusso in modo più chiaro
- Importazione/esportazione di dati da/verso altri formati

### 5. Miglioramento dell'Interfaccia Utente
- Aggiungere funzionalità di zoom e pan avanzate
- Implementare modalità di visualizzazione alternative
- Migliorare l'esperienza utente su dispositivi mobili

## Avvio Automatico dell'Ambiente di Sviluppo

È disponibile uno script batch `start_zanflow.bat` che automatizza l'avvio dell'ambiente di sviluppo:
- Avvia XAMPP (MySQL e Apache)
- Avvia il server backend Node.js (porta 3002)
- Avvia il frontend React (porta 3001)

## Stato Attuale

Il progetto ha un'interfaccia base funzionante con la possibilità di creare progetti, aggiungere nodi (macchine, trasporti, magazzini) e modificarne i parametri. I dati vengono salvati nel database MySQL e sono disponibili per eventuali analisi future. L'integrazione tra frontend e backend è operativa, permettendo il salvataggio e il caricamento di dati.

Il prossimo obiettivo principale è implementare la funzionalità di connessione tra i nodi per completare la rappresentazione del flusso produttivo.