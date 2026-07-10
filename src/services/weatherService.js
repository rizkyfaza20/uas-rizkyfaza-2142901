import axios from 'axios';
import { weatherAPIConfig } from '../config/firebase';

class WeatherService {
  constructor() {
    this.apiKey = weatherAPIConfig.apiKey;
    this.baseURL = weatherAPIConfig.baseURL;
  }

  // Get weather by city name
  async getWeatherByCity(cityName) {
    try {
      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          q: cityName,
          appid: this.apiKey,
          units: 'metric', // Celsius
          lang: 'id' // Indonesian language
        }
      });
      
      return { 
        success: true, 
        data: this.formatWeatherData(response.data) 
      };
    } catch (error) {
      return { 
        success: false, 
        error: this.handleError(error) 
      };
    }
  }

  // Get weather by coordinates (GPS)
  async getWeatherByCoords(latitude, longitude) {
    try {
      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey,
          units: 'metric',
          lang: 'id'
        }
      });
      
      return { 
        success: true, 
        data: this.formatWeatherData(response.data) 
      };
    } catch (error) {
      return { 
        success: false, 
        error: this.handleError(error) 
      };
    }
  }

  getWindDirection(deg) {
    const directions = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
    return directions[Math.round(deg / 45) % 8];
  }

  // Format weather data for display
  formatWeatherData(data) {
    return {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      seaLevel: data.main.sea_level,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      main: data.weather[0].main,
      windSpeed: data.wind.speed,
      windDeg: data.wind.deg,
      windDir: data.wind.deg ? this.getWindDirection(data.wind.deg) : '-',
      clouds: data.clouds?.all,
      visibility: data.visibility,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Get weather icon URL
  getIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return 'Kota tidak ditemukan';
        case 401:
          return 'API Key tidak valid';
        case 429:
          return 'Batas request tercapai. Coba lagi nanti';
        default:
          return 'Terjadi kesalahan saat mengambil data cuaca';
      }
    }
    return 'Koneksi gagal. Periksa internet Anda';
  }
}

export default new WeatherService();