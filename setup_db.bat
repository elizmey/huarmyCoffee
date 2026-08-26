@echo off
echo ===================================================
echo   Levantando Base de Datos PostgreSQL en Docker
echo ===================================================
echo Iniciando contenedor...
docker compose up -d

echo.
echo Esperando 5 segundos a que PostgreSQL inicie...
timeout /t 5 /nobreak > NUL

echo.
echo ===================================================
echo   Ejecutando Migraciones y Semilla de Datos
echo ===================================================
node server/seed.js

echo.
echo Proceso finalizado. Ya puedes ejecutar el backend con:
echo   npm run api
echo.
pause
