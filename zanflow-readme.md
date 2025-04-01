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
mkdir -p src/services
mkdir -p src/utils
mkdir -p server
```

4. Avviare l'applicazione (con porta personalizzata se necessario):
```
set PORT=3001 && npm start  # Windows Command Prompt
$env:PORT=3001; npm start   # Windows PowerShell
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
│   │   └── menus/
│   │       ├── TopMenu.js             # Menu superiore
│   │       └── TopMenu.css            # Stili del menu
│   ├── services/                      # Servizi per API/DB
│   └── utils/                         # Utility functions
└── server/                            # Backend (Node.js, Express)
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

## Prossimi Passi di Sviluppo

### 1. Implementazione delle Connessioni
- Aggiungere la funzionalità per collegare nodi tra loro
- Creare linee di connessione con frecce direzionali
- Permettere l'aggiornamento automatico delle connessioni quando i nodi vengono spostati

### 2. Setup del Database
- Creare un database MySQL usando phpMyAdmin
- Database implementato con le seguenti tabelle:

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

### 3. Integrazione delle Proprietà dei Nodi

**Proprietà Macchine**
- Nome: identificativo della macchina
- Tempo ciclo (s): tempo necessario per produrre un pezzo
- Pezzi/ora: output produttivo orario
- Operatori: numero di persone necessarie
- Scarto (%): percentuale di pezzi scartati
- Tempo attraversamento: tempo di permanenza del prodotto nella macchina
- Fornitore: interno o esterno
- Costo orario: costo operativo della macchina
- Disponibilità (%): percentuale di tempo in cui la macchina è funzionante

**Proprietà Trasporti**
- Nome: identificativo del trasporto
- Tipo trasporto: manuale, automatico, veicolo
- Tempo attraversamento: tempo necessario per il trasporto
- Distanza: lunghezza del percorso
- Operatori: personale necessario per il trasporto
- Batch minimo: quantità minima trasportata

**Proprietà Magazzini**
- Nome: identificativo del magazzino
- Capacità: quantità massima di prodotti stoccabili
- Tempo medio di permanenza: tempo medio di giacenza
- FIFO/LIFO: metodologia di gestione magazzino
- Costo di stoccaggio: costo per unità di tempo

### 4. Implementazione del Backend
- Backend Node.js/Express implementato con le seguenti API:
  - `/api/projects` - GET, POST per gestire i progetti
  - `/api/projects/:projectId/nodes` - GET per ottenere i nodi di un progetto
  - `/api/nodes` - POST per creare un nuovo nodo
  - `/api/projects/:projectId/connections` - GET per ottenere le connessioni di un progetto
  - `/api/connections` - POST per creare una nuova connessione

### 5. Avvio Automatico dell'Ambiente di Sviluppo
- Script batch `start_zanflow.bat` per automatizzare l'avvio dell'ambiente di sviluppo:
  - Avvia XAMPP (MySQL e Apache)
  - Avvia il server backend Node.js (porta 3002)
  - Avvia il frontend React (porta 3001)

### 6. Funzionalità di Salvataggio/Caricamento
- Salvataggio automatico del lavoro
- Esportazione in formati standard (PDF, PNG)
- Condivisione dei progetti

### 7. Integrazione Frontend-Backend
- Implementare le chiamate API nel frontend React per:
  - Salvare i nodi nel database quando vengono creati/modificati
  - Caricare i progetti esistenti
  - Gestire le connessioni tra nodi

## Stato Attuale
Il progetto ha un'interfaccia base funzionante con la possibilità di creare nodi di tipo macchina, trasporto e magazzino nel canvas. Il database e il backend sono stati configurati con le API necessarie per gestire progetti, nodi e connessioni. Il prossimo passo è integrare il frontend con il backend per permettere il salvataggio e il caricamento dei progetti.
