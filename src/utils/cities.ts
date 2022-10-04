import cities from '../../data/cities.json';

interface Cities {
  id: string;
  city_ar: string;
  city_en: string;
}

export const getCityFromId = (id: string) => {
  const location = (cities as Cities[]).find((c) => id === c.id);
  return location;
};
