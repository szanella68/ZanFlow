@echo off
echo ===== AVVIO AMBIENTE DI SVILUPPO ZANFLOW =====

:: Verifica che Node.js sia installato
node --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js non trovato! Installa Node.js prima di procedere.
    pause
    exit /B
)

:: Percorso di XAMPP (modifica se necessario)
set XAMPP_PATH=C:\xampp\xampp_start.exe

:: Avvia XAMPP (MySQL e Apache)
echo Avvio di MySQL e Apache...
start "" "%XAMPP_PATH%"

:: Attendi alcuni secondi per l'avvio dei servizi
echo Attendi l'avvio dei servizi...
ping -n 6 127.0.0.1 >nul

:: Vai alla directory del progetto backend
cd "C:\filepubblici\ZanFlow"

:: Avvia il server backend Node.js in una finestra separata
echo Avvio del server backend (porta 3002)...
start cmd /k "npm run server"

:: Attendi qualche secondo per l'avvio del backend
ping -n 4 127.0.0.1 >nul

:: Avvia il frontend React in una finestra separata
echo Avvio del frontend React...
start cmd /k "set PORT=3001 && npm start"

echo ===== AMBIENTE DI SVILUPPO ZANFLOW AVVIATO =====
echo - Server MySQL: in esecuzione tramite XAMPP
echo - Backend Node.js: http://localhost:3002/api
echo - Frontend React: http://localhost:3001
echo.
echo Premi un tasto per chiudere questa finestra...
pause