import { axios } from '@/lib/axios';
import propertiesData from '@/features/data/properties.json';

export const getProperties = async (num: number) => {
  try {
    const { data } = await axios.get('/properties/list', {
      params: {
        locationExternalIDs: '5002,6020',
        purpose: 'for-rent',
        hitsPerPage: num,
        page: '0',
        lang: 'en',
        sort: 'city-level-score',
        hasVideo: true,
        hasFloorPlan: true,
        hasPanorama: true,
      },
    });
    return data.hits;
  } catch (error) {
    // Fallback to local data if API fails (e.g., rate limit, no API key)
    console.warn('API request failed, using local data:', error);
    return propertiesData.hits.slice(0, num);
  }
};
