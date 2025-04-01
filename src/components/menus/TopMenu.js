import React from 'react';
import './TopMenu.css';

const TopMenu = () => {
  return (
    <div className="top-menu">
      <div className="menu-item">
        <span>File</span>
        <div className="dropdown-content">
          <button>Nuovo</button>
          <button>Apri</button>
          <button>Salva</button>
          <button>Salva con nome</button>
        </div>
      </div>
      <div className="menu-item">
        <span>Modifica</span>
        <div className="dropdown-content">
          <button>Taglia</button>
          <button>Copia</button>
          <button>Incolla</button>
          <button>Elimina</button>
        </div>
      </div>
      <div className="menu-item">
        <span>Visualizza</span>
        <div className="dropdown-content">
          <button>Zoom In</button>
          <button>Zoom Out</button>
          <button>Adatta alla finestra</button>
        </div>
      </div>
      <div className="app-title">ZanFlow</div>
    </div>
  );
};

export default TopMenu;