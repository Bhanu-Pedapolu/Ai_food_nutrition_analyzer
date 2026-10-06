// NutriVision — Weather Service
// Uses Open-Meteo (free, no API key needed) with geocoding

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  description: string;
  weatherType: 'hot' | 'warm' | 'mild' | 'cold' | 'rainy' | 'snowy';
}

const WMO_CODE_MAP: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear Sky', icon: '☀️' },
  1: { condition: 'Mostly Clear', icon: '🌤️' },
  2: { condition: 'Partly Cloudy', icon: '⛅' },
  3: { condition: 'Overcast', icon: '☁️' },
  45: { condition: 'Fog', icon: '🌫️' },
  48: { condition: 'Freezing Fog', icon: '🌫️' },
  51: { condition: 'Light Drizzle', icon: '🌦️' },
  61: { condition: 'Light Rain', icon: '🌧️' },
  63: { condition: 'Moderate Rain', icon: '🌧️' },
  65: { condition: 'Heavy Rain', icon: '🌧️' },
  71: { condition: 'Light Snow', icon: '🌨️' },
  73: { condition: 'Moderate Snow', icon: '❄️' },
  80: { condition: 'Rain Showers', icon: '🌦️' },
  85: { condition: 'Snow Showers', icon: '🌨️' },
  95: { condition: 'Thunderstorm', icon: '⛈️' },
};

function getWeatherType(temp: number, wmoCode: number): WeatherData['weatherType'] {
  if (wmoCode >= 61 && wmoCode <= 95) return 'rainy';
  if (wmoCode >= 71 && wmoCode <= 85) return 'snowy';
  if (temp >= 32) return 'hot';
  if (temp >= 25) return 'warm';
  if (temp >= 15) return 'mild';
  return 'cold';
}

function getWeatherDescription(type: WeatherData['weatherType'], temp: number, humidity: number): string {
  const descs: Record<WeatherData['weatherType'], string> = {
    hot: `Hot day at ${temp}°C — stay well hydrated!`,
    warm: `Warm and pleasant at ${temp}°C — great day to be active.`,
    mild: `Mild ${temp}°C — a comfortable day for healthy eating.`,
    cold: `Cool day at ${temp}°C — warming foods will help.`,
    rainy: `Rainy conditions — perfect for a warm comforting meal.`,
    snowy: `Snowy conditions — nourishing hot foods recommended.`,
  };
  return descs[type];
}

export async function getWeatherByCoords(lat: number, lon: number, city: string = 'Your Location'): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&wind_speed_unit=kmh`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather API unavailable');

  const data = await response.json();
  const current = data.current;
  const wmoCode = current.weather_code;
  const wmo = WMO_CODE_MAP[wmoCode] || { condition: 'Unknown', icon: '🌡️' };
  const temp = Math.round(current.temperature_2m);
  const humidity = current.relative_humidity_2m;
  const weatherType = getWeatherType(temp, wmoCode);

  return {
    city,
    country: 'IN',
    temperature: temp,
    feelsLike: Math.round(current.apparent_temperature),
    humidity,
    windSpeed: Math.round(current.wind_speed_10m),
    condition: wmo.condition,
    icon: wmo.icon,
    description: getWeatherDescription(weatherType, temp, humidity),
    weatherType,
  };
}

export async function getWeatherByCity(cityName: string = 'Mumbai'): Promise<WeatherData> {
  // Geocode city first
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    // Default to Mumbai
    return getWeatherByCoords(19.076, 72.877, 'Mumbai');
  }

  const { latitude, longitude, name } = geoData.results[0];
  return getWeatherByCoords(latitude, longitude, name);
}

export const getCityWeather = getWeatherByCity;

export async function getWeatherFromGeolocation(): Promise<WeatherData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to Mumbai
      getWeatherByCoords(19.076, 72.877, 'Mumbai').then(resolve).catch(reject);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const weather = await getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
          resolve(weather);
        } catch (err) {
          reject(err);
        }
      },
      async () => {
        // Permission denied — use Mumbai as default
        try {
          const weather = await getWeatherByCoords(19.076, 72.877, 'Mumbai');
          resolve(weather);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

// Demo weather for when API is unavailable
export const DEMO_WEATHER: WeatherData = {
  city: 'Mumbai',
  country: 'IN',
  temperature: 32,
  feelsLike: 38,
  humidity: 78,
  windSpeed: 18,
  condition: 'Partly Cloudy',
  icon: '⛅',
  description: 'Warm and humid at 32°C — stay well hydrated today!',
  weatherType: 'hot',
};
