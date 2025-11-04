// frontend/src/utils/dateUtils.js
import moment from 'moment-timezone';

export const parseBrDateToISO = (brDate) => {
  if (!brDate || typeof brDate !== 'string') return null;
  const [datePart, timePart] = brDate.split(' ');
  if (!datePart || !timePart) return null;
  const [day, month, year] = datePart.split('/');
  const [hour, minute] = timePart.split(':');
  if (!day || !month || !year || !hour || !minute) return null;
  return moment.tz(`${year}-${month}-${day} ${hour}:${minute}`, 'YYYY-MM-DD HH:mm', 'America/Sao_Paulo').utc().toISOString();
};

export const formatISOToBr = (isoDate) => {
  if (!isoDate) return '';
  return moment.utc(isoDate).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
};

export const alignTo30Min = (date) => {
  const d = moment.tz(date, 'America/Sao_Paulo');
  d.minutes(Math.floor(d.minutes() / 30) * 30).seconds(0).milliseconds(0);
  return d;
};