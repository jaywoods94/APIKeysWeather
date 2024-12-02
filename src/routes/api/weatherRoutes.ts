import { Router, Request, Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Received weather request for:', req.body);
    const city = req.body.cityName || req.body.city; // Handle both cityName and city
    
    if (!city) {
      console.log('No city provided in request');
      return res.status(400).json({ error: 'City name is required' });
    }

    console.log('Fetching weather data for city:', city);
    // Get weather data for the city
    const weatherData = await WeatherService.getWeatherForCity(city);
    console.log('Weather data received:', weatherData);
    
    // Save city to search history
    await HistoryService.addCity(city);
    console.log('City added to history:', city);
    
    return res.json(weatherData);
  } catch (error) {
    console.error('Detailed error in weather route:', error);
    if (error instanceof Error) {
      if (error.message === 'City not found') {
        return res.status(404).json({ error: 'City not found' });
      } else if (error.message.includes('API key')) {
        return res.status(500).json({ error: 'Weather service configuration error' });
      } else {
        return res.status(500).json({ 
          error: 'Failed to fetch weather data',
          message: error.message 
        });
      }
    }
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    console.log('Fetching search history');
    const cities = await HistoryService.getCities();
    console.log('Search history retrieved:', cities);
    return res.json(cities);
  } catch (error) {
    console.error('Error fetching search history:', error);
    return res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete city with ID:', id);
    const success = await HistoryService.removeCity(id);
    
    if (!success) {
      console.log('City not found for deletion:', id);
      return res.status(404).json({ error: 'City not found in history' });
    }
    
    console.log('Successfully deleted city:', id);
    return res.json({ message: 'City deleted successfully' });
  } catch (error) {
    console.error('Error deleting city:', error);
    return res.status(500).json({ error: 'Failed to delete city from history' });
  }
});

export default router;