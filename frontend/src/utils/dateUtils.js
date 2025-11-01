// frontend/src/utils/dateUtils.js

/**
 * Converte "DD/MM/YYYY HH:mm" → ISO 8601 UTC
 * Ex: "01/11/2025 10:30" → "2025-11-01T13:30:00.000Z"
 */
export const parseBrDateToISO = (brDate) => {
  if (!brDate || typeof brDate !== 'string') return null;
  
  const [datePart, timePart] = brDate.split(' ');
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split('/');
  const [hour, minute] = timePart.split(':');

  if (!day || !month || !year || !hour || !minute) return null;

  // Monta no fuso de São Paulo e converte para UTC
  const localDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
  return localDate.toISOString();
};

/**
 * Converte ISO 8601 → "DD/MM/YYYY HH:mm"
 */
export const formatISOToBr = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${minute}`;
};