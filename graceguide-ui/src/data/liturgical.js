// Lightweight, dependency-free liturgical calendar helper.
// Provides "Today in the Church": a fixed-date celebration when there is one,
// otherwise the current liturgical season (always shows something relevant).
// Movable celebrations are derived from Easter (Computus); fixed solemnities,
// feasts, and popular memorials come from the curated map below.

// --- Easter (Anonymous Gregorian algorithm / Computus) -------------------
export function getEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const DAY = 86400000;
const addDays = (date, n) => new Date(date.getTime() + n * DAY);
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// First Sunday of Advent: the 4th Sunday before Christmas.
function firstSundayOfAdvent(year) {
  const christmas = new Date(year, 11, 25);
  const sundayOnOrBefore = addDays(christmas, -christmas.getDay()); // back up to Sunday
  return addDays(sundayOnOrBefore, -21);
}

// --- Liturgical season ---------------------------------------------------
export function getLiturgicalSeason(date) {
  const d = startOfDay(date);
  const year = d.getFullYear();
  const easter = startOfDay(getEaster(year));
  const ashWednesday = addDays(easter, -46);
  const pentecost = addDays(easter, 49);
  const advent = startOfDay(firstSundayOfAdvent(year));
  const christmasDay = new Date(year, 11, 25);
  // Christmas season ends roughly at the Baptism of the Lord (Sunday after Jan 6).
  const epiphany = new Date(year, 0, 6);
  const baptism = addDays(epiphany, 7 - (epiphany.getDay() === 0 ? 7 : epiphany.getDay()));

  if (d >= advent && d <= new Date(year, 11, 24)) {
    return { name: 'Advent', color: 'purple' };
  }
  if (d >= christmasDay || d <= baptism) {
    return { name: 'Christmas', color: 'white' };
  }
  if (d >= ashWednesday && d < easter) {
    return { name: 'Lent', color: 'purple' };
  }
  if (d >= easter && d <= pentecost) {
    return { name: 'Easter', color: 'white' };
  }
  return { name: 'Ordinary Time', color: 'green' };
}

// --- Fixed-date celebrations (General Roman Calendar, key = "MM-DD") ------
const FEASTS = {
  '01-01': { name: 'Mary, the Holy Mother of God', rank: 'Solemnity' },
  '01-02': { name: 'Sts. Basil the Great & Gregory Nazianzen', rank: 'Memorial' },
  '01-06': { name: 'The Epiphany of the Lord', rank: 'Solemnity' },
  '01-25': { name: 'The Conversion of St. Paul the Apostle', rank: 'Feast' },
  '01-28': { name: 'St. Thomas Aquinas', rank: 'Memorial' },
  '02-02': { name: 'The Presentation of the Lord', rank: 'Feast' },
  '02-22': { name: 'The Chair of St. Peter the Apostle', rank: 'Feast' },
  '03-17': { name: 'St. Patrick', rank: 'Memorial' },
  '03-19': { name: 'St. Joseph, Spouse of the Blessed Virgin Mary', rank: 'Solemnity' },
  '03-25': { name: 'The Annunciation of the Lord', rank: 'Solemnity' },
  '04-25': { name: 'St. Mark the Evangelist', rank: 'Feast' },
  '04-29': { name: 'St. Catherine of Siena', rank: 'Memorial' },
  '05-03': { name: 'Sts. Philip & James, Apostles', rank: 'Feast' },
  '05-31': { name: 'The Visitation of the Blessed Virgin Mary', rank: 'Feast' },
  '06-13': { name: 'St. Anthony of Padua', rank: 'Memorial' },
  '06-21': { name: 'St. Aloysius Gonzaga', rank: 'Memorial' },
  '06-24': { name: 'The Nativity of St. John the Baptist', rank: 'Solemnity' },
  '06-29': { name: 'Sts. Peter & Paul, Apostles', rank: 'Solemnity' },
  '07-03': { name: 'St. Thomas the Apostle', rank: 'Feast' },
  '07-11': { name: 'St. Benedict', rank: 'Memorial' },
  '07-22': { name: 'St. Mary Magdalene', rank: 'Feast' },
  '07-25': { name: 'St. James the Apostle', rank: 'Feast' },
  '07-31': { name: 'St. Ignatius of Loyola', rank: 'Memorial' },
  '08-06': { name: 'The Transfiguration of the Lord', rank: 'Feast' },
  '08-08': { name: 'St. Dominic', rank: 'Memorial' },
  '08-10': { name: 'St. Lawrence', rank: 'Feast' },
  '08-15': { name: 'The Assumption of the Blessed Virgin Mary', rank: 'Solemnity' },
  '08-24': { name: 'St. Bartholomew the Apostle', rank: 'Feast' },
  '08-28': { name: 'St. Augustine', rank: 'Memorial' },
  '09-08': { name: 'The Nativity of the Blessed Virgin Mary', rank: 'Feast' },
  '09-14': { name: 'The Exaltation of the Holy Cross', rank: 'Feast' },
  '09-21': { name: 'St. Matthew, Apostle & Evangelist', rank: 'Feast' },
  '09-23': { name: 'St. Pius of Pietrelcina (Padre Pio)', rank: 'Memorial' },
  '09-29': { name: 'Sts. Michael, Gabriel & Raphael, Archangels', rank: 'Feast' },
  '10-01': { name: 'St. Thérèse of the Child Jesus', rank: 'Memorial' },
  '10-02': { name: 'The Holy Guardian Angels', rank: 'Memorial' },
  '10-04': { name: 'St. Francis of Assisi', rank: 'Memorial' },
  '10-07': { name: 'Our Lady of the Rosary', rank: 'Memorial' },
  '10-18': { name: 'St. Luke the Evangelist', rank: 'Feast' },
  '10-28': { name: 'Sts. Simon & Jude, Apostles', rank: 'Feast' },
  '11-01': { name: 'All Saints', rank: 'Solemnity' },
  '11-02': { name: 'The Commemoration of All the Faithful Departed', rank: 'Memorial' },
  '11-09': { name: 'The Dedication of the Lateran Basilica', rank: 'Feast' },
  '11-22': { name: 'St. Cecilia', rank: 'Memorial' },
  '11-30': { name: 'St. Andrew the Apostle', rank: 'Feast' },
  '12-06': { name: 'St. Nicholas', rank: 'Memorial' },
  '12-08': { name: 'The Immaculate Conception of the Blessed Virgin Mary', rank: 'Solemnity' },
  '12-12': { name: 'Our Lady of Guadalupe', rank: 'Feast' },
  '12-25': { name: 'The Nativity of the Lord (Christmas)', rank: 'Solemnity' },
  '12-26': { name: 'St. Stephen, the First Martyr', rank: 'Feast' },
  '12-27': { name: 'St. John, Apostle & Evangelist', rank: 'Feast' },
  '12-28': { name: 'The Holy Innocents, Martyrs', rank: 'Feast' },
};

const pad = (n) => String(n).padStart(2, '0');

// Returns { title, rank, season } for the given date (defaults to today).
export function getTodayCelebration(date = new Date()) {
  const season = getLiturgicalSeason(date);
  const key = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const feast = FEASTS[key];
  if (feast) {
    return { title: feast.name, rank: feast.rank, season: season.name, color: season.color };
  }
  // No fixed celebration today → surface the season itself.
  return { title: season.name, rank: 'Season', season: season.name, color: season.color };
}
