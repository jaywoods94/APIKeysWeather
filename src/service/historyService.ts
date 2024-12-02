import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define City class with name and id properties
class City {
  constructor(
    public id: string,
    public name: string
  ) {}
}

class HistoryService {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, '../../db/searchHistory.json');
    this.initializeFile();
  }

  private async initializeFile(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      // If file doesn't exist, create it with empty array
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await this.write([]);
    }
  }

  // Private method to read from searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const cities = JSON.parse(data);
      // Map the raw data to City objects
      return cities.map((city: { id: string; name: string }) => 
        new City(city.id, city.name)
      );
    } catch (error) {
      console.error('Error reading from file:', error);
      return [];
    }
  }

  // Private method to write the updated cities array to searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      // Convert City objects to plain objects and write to file
      await fs.writeFile(
        this.filePath,
        JSON.stringify(cities, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Error writing to file:', error);
      throw new Error('Failed to write to search history file');
    }
  }

  // Method to get all cities from searchHistory.json file
  async getCities(): Promise<City[]> {
    try {
      return await this.read();
    } catch (error) {
      console.error('Error getting cities:', error);
      throw new Error('Failed to get cities from search history');
    }
  }

  // Method to add a city to searchHistory.json file
  async addCity(cityName: string): Promise<City> {
    try {
      const cities = await this.read();
      
      // Check if city already exists (case-insensitive)
      const existingCity = cities.find(
        city => city.name.toLowerCase() === cityName.toLowerCase()
      );
      
      if (existingCity) {
        return existingCity;
      }

      // Create new City instance
      const newCity = new City(uuidv4(), cityName);
      
      // Add to cities array and write to file
      cities.push(newCity);
      await this.write(cities);
      
      return newCity;
    } catch (error) {
      console.error('Error adding city:', error);
      throw new Error('Failed to add city to search history');
    }
  }

  // BONUS: Method to remove a city from searchHistory.json file
  async removeCity(id: string): Promise<boolean> {
    try {
      const cities = await this.read();
      
      // Find the index of the city to remove
      const cityIndex = cities.findIndex(city => city.id === id);
      
      if (cityIndex === -1) {
        return false;
      }

      // Remove the city and write updated array to file
      cities.splice(cityIndex, 1);
      await this.write(cities);
      
      return true;
    } catch (error) {
      console.error('Error removing city:', error);
      throw new Error('Failed to remove city from search history');
    }
  }
}

export default new HistoryService();