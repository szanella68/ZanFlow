@echo off
echo ===== CARICAMENTO MODIFICHE SU GITHUB =====
echo.

cd /d C:\filepubblici\zanflow\zanflow

echo Verifico lo stato delle modifiche...
git status

echo.
echo Aggiungo tutte le modifiche...
git add .

echo.
set /p commit_msg="Inserisci un messaggio per il commit: "

echo.
echo Creo il commit con il messaggio: "%commit_msg%"
git commit -m "%commit_msg%"

echo.
echo Carico su GitHub...
git push origin main

echo.
echo ===== CARICAMENTO COMPLETATO =====
pause