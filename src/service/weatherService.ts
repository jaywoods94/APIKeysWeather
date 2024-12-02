import dotenv from 'dotenv';
dotenv.config();

// Define interface for Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
  name: string;
}

// Define Weather class
class Weather {
  constructor(
    public date: string,
    public temp: number,
    public humidity: number,
    public windSpeed: number,
    public description: string,
    public icon: string
  ) {}
}

// Complete WeatherService class
class WeatherService {
  private readonly baseURL: string;
  private readonly apiKey: string;
  private readonly geoURL: string;

  constructor() {
    // Use the environment variable names from your .env file
    this.apiKey = process.env.API_KEY || '';
    this.baseURL = `${process.env.API_BASE_URL}/data/2.5`;
    this.geoURL = `${process.env.API_BASE_URL}/geo/1.0`;

    if (!this.apiKey) {
      console.error('Environment variables:', {
        apiKey: !!process.env.API_KEY,
        baseUrl: process.env.API_BASE_URL
      });
      throw new Error('Weather API key is not configured. Please check your .env file.');
    }
  }

  // Fetch location data from OpenWeather Geocoding API
  private async fetchLocationData(query: string): Promise<any> {
    const geocodeQuery = this.buildGeocodeQuery(query);
    const response = await fetch(geocodeQuery);
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();
    
    if (!data.length) {
      throw new Error('City not found');
    }

    return data[0];
  }

  // Destructure location data into Coordinates object
  private destructureLocationData(locationData: any): Coordinates {
    const { lat, lon, name } = locationData;
    return { lat, lon, name };
  }

  // Build geocoding API query URL
  private buildGeocodeQuery(query: string): string {
    const encodedCity = encodeURIComponent(query);
    return `${this.geoURL}/direct?q=${encodedCity}&limit=1&appid=${this.apiKey}`;
  }

  // Build weather API query URL
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    return `${this.baseURL}/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${this.apiKey}`;
  }

  // Build forecast API query URL
  private buildForecastQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    return `${this.baseURL}/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${this.apiKey}`;
  }

  // Fetch and process location data
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // Fetch weather data from OpenWeather API
  private async fetchWeatherData(coordinates: Coordinates): Promise<{current: any, forecast: any}> {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    const forecastQuery = this.buildForecastQuery(coordinates);

    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(weatherQuery),
      fetch(forecastQuery)
    ]);

    if (!weatherResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    return {
      current: weatherData,
      forecast: forecastData
    };
  }

  // Parse current weather data into Weather object
  private parseCurrentWeather(response: any): Weather {
    return new Weather(
      new Date(response.dt * 1000).toLocaleDateString(),
      Math.round(response.main.temp),
      response.main.humidity,
      Math.round(response.wind.speed),
      response.weather[0].description,
      response.weather[0].icon
    );
  }

  // Build forecast array from weather data
  private buildForecastArray(_currentWeather: Weather, forecastData: any): Weather[] {
    return forecastData.list
      .filter((_: any, index: number) => index % 8 === 0) // Get one reading per day
      .slice(0, 5) // Get 5 days
      .map((day: any) => new Weather(
        new Date(day.dt * 1000).toLocaleDateString(),
        Math.round(day.main.temp),
        day.main.humidity,
        Math.round(day.wind.speed),
        day.weather[0].description,
        day.weather[0].icon
      ));
  }

  // Public method to get weather for a city
  async getWeatherForCity(city: string): Promise<{
    current: Weather;
    forecast: Weather[];
    coordinates: Coordinates;
  }> {
    try {
      // Get coordinates for the city
      const coordinates = await this.fetchAndDestructureLocationData(city);

      // Fetch weather data using coordinates
      const { current, forecast } = await this.fetchWeatherData(coordinates);

      // Parse current weather
      const currentWeather = this.parseCurrentWeather(current);

      // Build forecast array
      const forecastArray = this.buildForecastArray(currentWeather, forecast);

      return {
        current: currentWeather,
        forecast: forecastArray,
        coordinates
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
}

export default new WeatherService();