import { Plant, CreatePlantInput, CareLog, CreateCareLogInput } from '@/types';
import { mockPlants, mockCareLogs } from './mock-data';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Plant API Functions
export async function getPlants(): Promise<Plant[]> {
  await delay(300); // Simulate network delay
  return mockPlants;
}

export async function getPlantById(id: string): Promise<Plant | null> {
  await delay(200);
  const plant = mockPlants.find(p => p.id === parseInt(id));
  return plant || null;
}

export async function createPlant(input: CreatePlantInput): Promise<Plant> {
  await delay(400);
  const newPlant: Plant = {
    id: Math.max(...mockPlants.map(p => p.id)) + 1,
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockPlants.push(newPlant);
  return newPlant;
}

export async function updatePlant(id: string, input: Partial<CreatePlantInput>): Promise<Plant | null> {
  await delay(400);
  const index = mockPlants.findIndex(p => p.id === parseInt(id));
  if (index === -1) return null;
  
  mockPlants[index] = {
    ...mockPlants[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  return mockPlants[index];
}

export async function deletePlant(id: string): Promise<boolean> {
  await delay(300);
  const index = mockPlants.findIndex(p => p.id === parseInt(id));
  if (index === -1) return false;
  
  mockPlants.splice(index, 1);
  return true;
}

// Care Log API Functions
export async function getCareLogs(plantId: string): Promise<CareLog[]> {
  await delay(200);
  return mockCareLogs[parseInt(plantId)] || [];
}

export async function createCareLog(input: CreateCareLogInput): Promise<CareLog> {
  await delay(300);
  const plant = mockPlants.find(p => p.id === input.plant);
  if (!plant) throw new Error('Plant not found');

  const newCareLog: CareLog = {
    id: Math.max(...Object.values(mockCareLogs).flat().map(c => c.id), 0) + 1,
    careType: input.careType,
    notes: input.notes,
    date: input.date,
    plant: {
      id: plant.id,
      name: plant.name,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!mockCareLogs[input.plant]) {
    mockCareLogs[input.plant] = [];
  }
  mockCareLogs[input.plant].unshift(newCareLog);
  
  return newCareLog;
}

// AI API Function (UI only - returns mock response)
export async function askAI(plantId: string, question: string): Promise<string> {
  await delay(1500); // Simulate AI processing time
  
  const plant = mockPlants.find(p => p.id === parseInt(plantId));
  if (!plant) return 'Plant not found.';

  // Mock AI responses based on keywords
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('yellow') || lowerQuestion.includes('yellowing')) {
    return `Yellow leaves on your ${plant.name} can indicate several issues:\n\n1. **Overwatering**: Check if the soil is consistently wet. Let the top 2 inches dry between waterings.\n2. **Nutrient deficiency**: Consider fertilizing with a balanced houseplant fertilizer.\n3. **Natural aging**: Lower leaves naturally yellow and drop as the plant grows.\n\nBased on your care history, monitor your watering schedule and ensure proper drainage.`;
  }
  
  if (lowerQuestion.includes('water') || lowerQuestion.includes('watering')) {
    return `For your ${plant.name} (${plant.species}):\n\n**Watering Schedule:**\n- Check soil moisture before watering\n- Water when top 2 inches of soil are dry\n- Ensure water drains completely\n- Reduce watering in winter months\n\n**Signs of proper watering:**\n- Firm, vibrant leaves\n- Steady growth\n- No wilting or drooping\n\nAdjust based on your home's humidity and temperature.`;
  }
  
  if (lowerQuestion.includes('light') || lowerQuestion.includes('sun')) {
    return `Light requirements for ${plant.name}:\n\n**Ideal conditions:**\n- Bright, indirect light\n- Avoid direct afternoon sun\n- Can tolerate some morning sun\n- Rotate plant weekly for even growth\n\n**Signs of light issues:**\n- Too much: Scorched, brown leaves\n- Too little: Leggy growth, small leaves\n\nYour current location (${plant.location || 'not specified'}) should be evaluated for light intensity.`;
  }
  
  if (lowerQuestion.includes('fertiliz')) {
    return `Fertilizing guide for ${plant.name}:\n\n**Schedule:**\n- Feed every 4-6 weeks during growing season (spring/summer)\n- Reduce to every 8-10 weeks in fall/winter\n- Use balanced liquid fertilizer (10-10-10 or 20-20-20)\n- Dilute to half strength to avoid burning\n\n**Application tips:**\n- Water before fertilizing\n- Apply to moist soil\n- Flush soil occasionally to prevent salt buildup`;
  }
  
  // Default response
  return `Thank you for your question about ${plant.name}!\n\nBased on your plant's profile:\n- Species: ${plant.species}\n- Location: ${plant.location || 'Not specified'}\n- Acquired: ${plant.acquiredDate || 'Unknown'}\n\nFor specific care advice, please provide more details about:\n- Current symptoms or concerns\n- Recent care activities\n- Environmental conditions\n\nI'm here to help you keep your ${plant.name} healthy and thriving!`;
}

// Made with Bob
