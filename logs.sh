#!/usr/bin/env bash
set -euo pipefail

echo "--- Iniciando script de logs (versión de depuración) ---"

# --- Carga de variables de entorno ---
ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error Crítico: El archivo .env no se encuentra en el directorio actual."
    exit 1
fi

echo "Leyendo variables desde $ENV_FILE..."

# Limpia y exporta las variables una por una para máxima compatibilidad
while IFS='=' read -r key value || [[ -n "$key" ]]; do
    # Ignorar líneas en blanco y comentarios
    if [[ "$key" =~ ^\s*# ]] || [[ -z "$key" ]]; then
        continue
    fi

    # Limpiar el nombre de la variable (eliminar espacios y caracteres extraños)
    clean_key=$(echo "$key" | tr -d '[:space:]\r')

    # Limpiar el valor (eliminar espacios, comillas y retornos de carro)
    clean_value=$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e "s/^'//" -e "s/'$//" -e 's/^"//' -e 's/"$//' | tr -d '\r')

    if [ -n "$clean_key" ]; then
        export "$clean_key"="$clean_value"
        echo "Variable exportada: '$clean_key'"
    fi
done < "$ENV_FILE"

echo "--- Verificación de variables ---"

# Verificar que las variables necesarias están definidas, con mensajes de error claros
: "${SUPABASE_PROJECT_REF:?ERROR: SUPABASE_PROJECT_REF no está definida. Revisa tu archivo .env}"
: "${SUPABASE_SERVICE_ROLE_KEY:?ERROR: SUPABASE_SERVICE_ROLE_KEY no está definida. Revisa tu archivo .env}"

echo "OK: Las variables SUPABASE_PROJECT_REF y SUPABASE_SERVICE_ROLE_KEY están cargadas."

# --- Parámetros del script ---
PROJECT_REF="$SUPABASE_PROJECT_REF"
TOKEN="$SUPABASE_SERVICE_ROLE_KEY"
FUNCTION_NAME="${1:-send-audio}"
LOG_DIR="logs"
OUTFILE="$LOG_DIR/${FUNCTION_NAME}.log"

# --- Ejecución ---
mkdir -p "$LOG_DIR"

echo "------------------------------------"
echo "Iniciando streaming de logs para la función: '$FUNCTION_NAME'"
echo "Proyecto: $PROJECT_REF"
echo "Guardando logs en: $OUTFILE"
echo "Presiona Ctrl+C para detener."
echo "------------------------------------"

# Ejecutar curl para hacer streaming de los logs
# URL actualizada según la investigación del usuario, apuntando al endpoint SSE del dashboard.
# tee duplicará la salida al archivo y a la consola
curl -N \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.supabase.com/projects/${PROJECT_REF}/logs/edge-functions-logs?function=${FUNCTION_NAME}" \
| tee "$OUTFILE"
