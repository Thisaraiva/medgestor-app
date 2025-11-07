// frontend/src/utils/dateUtils.js
import moment from 'moment-timezone';

// CONSTANTE para timezone
export const APP_TIMEZONE = 'America/Sao_Paulo';

// Converte data BR para ISO UTC
export const parseBrDateToISO = (brDate) => {
  if (!brDate || typeof brDate !== 'string') return null;
  
  try {
    // Formato: "DD/MM/YYYY HH:mm"
    const [datePart, timePart] = brDate.split(' ');
    if (!datePart || !timePart) return null;
    
    const [day, month, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    
    if (!day || !month || !year || !hour || !minute) return null;
    
    // Cria no timezone local e converte para UTC
    return moment.tz(`${year}-${month}-${day} ${hour}:${minute}`, 'YYYY-MM-DD HH:mm', APP_TIMEZONE)
      .utc()
      .toISOString();
  } catch (error) {
    console.error('Erro ao parsear data BR:', error);
    return null;
  }
};

// Converte ISO UTC para data BR
export const formatISOToBr = (isoDate) => {
  if (!isoDate) return '';
  try {
    return moment.utc(isoDate).tz(APP_TIMEZONE).format('DD/MM/YYYY HH:mm');
  } catch (error) {
    console.error('Erro ao formatar data ISO:', error);
    return 'Data inválida';
  }
};

// Alinha para slot de 30 minutos
export const alignTo30Min = (date) => {
  try {
    const d = moment.tz(date, APP_TIMEZONE);
    d.minutes(Math.floor(d.minutes() / 30) * 30)
     .seconds(0)
     .milliseconds(0);
    return d;
  } catch (error) {
    console.error('Erro ao alinhar data:', error);
    return moment().tz(APP_TIMEZONE);
  }
};

// Formata apenas hora para tooltips
export const formatTimeOnly = (isoDate) => {
  if (!isoDate) return '';
  try {
    return moment.utc(isoDate).tz(APP_TIMEZONE).format('HH:mm');
  } catch (error) {
    console.error('Erro ao formatar hora:', error);
    return '';
  }
};

// Valida se data é futura
export const isFutureDate = (date) => {
  try {
    return moment.tz(date, APP_TIMEZONE).isAfter(moment().tz(APP_TIMEZONE));
  } catch (error) {
    return false;
  }
};