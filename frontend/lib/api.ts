import { Plant, CreatePlantInput, CareLog, CreateCareLogInput, AIImageAnalysisRequest, AIImageAnalysisResponse, RoomConditions, RoomRecommendationResponse, PlantRecommendation } from '@/types';
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

// AI Image Analysis Function (Mock implementation)
export async function analyzePlantImage(request: AIImageAnalysisRequest): Promise<AIImageAnalysisResponse> {
  await delay(2000); // Simulate AI image processing time
  
  const plant = mockPlants.find(p => p.id === parseInt(request.plantId));
  if (!plant) {
    throw new Error('Plant not found');
  }

  // Mock AI image analysis responses
  // In production, this would send the image to a real AI service
  const mockAnalyses = [
    {
      status: 'healthy' as const,
      issues: [],
      careAdvice: [
        'Your plant appears to be in excellent health!',
        'Continue with your current care routine',
        'Maintain consistent watering schedule',
        'Ensure adequate indirect sunlight'
      ],
      confidence: 0.92,
      analysis: `Based on the image analysis of your ${plant.name} (${plant.species}), the plant shows strong, vibrant foliage with no visible signs of stress or disease. The leaf color is rich and uniform, indicating proper nutrition and light exposure. Keep up the great work!`
    },
    {
      status: 'warning' as const,
      issues: [
        'Slight yellowing detected on lower leaves',
        'Possible early signs of overwatering'
      ],
      careAdvice: [
        'Reduce watering frequency slightly',
        'Check soil drainage - ensure pot has drainage holes',
        'Allow top 2 inches of soil to dry between waterings',
        'Monitor for improvement over next 1-2 weeks',
        'Consider adding perlite to improve soil drainage'
      ],
      confidence: 0.85,
      analysis: `The image shows your ${plant.name} with some yellowing on the lower leaves, which is a common indicator of overwatering. The soil appears to retain moisture longer than ideal. This is not critical yet, but addressing it now will prevent more serious issues.`
    },
    {
      status: 'warning' as const,
      issues: [
        'Brown leaf tips detected',
        'Possible low humidity or inconsistent watering'
      ],
      careAdvice: [
        'Increase humidity around the plant (misting or humidifier)',
        'Ensure consistent watering schedule',
        'Avoid letting soil completely dry out',
        'Trim brown tips with clean scissors',
        'Consider grouping plants together to increase local humidity'
      ],
      confidence: 0.88,
      analysis: `Your ${plant.name} shows brown tips on several leaves, typically caused by low humidity or irregular watering. This is common in indoor environments, especially during winter months when heating systems reduce air moisture.`
    },
    {
      status: 'critical' as const,
      issues: [
        'Significant leaf discoloration detected',
        'Possible pest infestation or severe nutrient deficiency',
        'Wilting or drooping observed'
      ],
      careAdvice: [
        'Inspect plant carefully for pests (check undersides of leaves)',
        'If pests found, treat with neem oil or insecticidal soap',
        'Check root system for root rot',
        'Consider repotting with fresh soil',
        'Isolate from other plants to prevent spread',
        'Consult with a plant specialist if condition worsens'
      ],
      confidence: 0.79,
      analysis: `URGENT: Your ${plant.name} shows signs of significant stress. The discoloration and wilting suggest either a pest problem or severe environmental stress. Immediate action is recommended to save the plant. Check for common pests like spider mites, aphids, or scale insects.`
    }
  ];

  // Randomly select a mock response (weighted towards healthy/warning)
  const rand = Math.random();
  let selectedAnalysis;
  if (rand < 0.4) {
    selectedAnalysis = mockAnalyses[0]; // 40% healthy
  } else if (rand < 0.8) {
    selectedAnalysis = mockAnalyses[1 + Math.floor(Math.random() * 2)]; // 40% warning
  } else {
    selectedAnalysis = mockAnalyses[3]; // 20% critical
  }

  return {
    ...selectedAnalysis,
    timestamp: new Date().toISOString()
  };
}

// Room Plant Recommendation Function (Mock implementation)
export async function getPlantRecommendations(conditions: RoomConditions): Promise<RoomRecommendationResponse> {
  await delay(1800); // Simulate AI processing time

  const { lightLevel, temperature, pets, notes } = conditions;
  const hasPets = pets.length > 0 && !pets.includes('none');

  // Mock plant database with detailed information
  const plantDatabase: PlantRecommendation[] = [
    {
      id: 'snake-plant',
      name: 'Snake Plant',
      species: 'Sansevieria trifasciata',
      reason: 'Thrives in low to bright light and tolerates neglect. Perfect for beginners and busy lifestyles.',
      difficulty: 'easy',
      petSafe: false,
      petWarning: '⚠️ Toxic to cats and dogs if ingested',
      careHighlights: ['Water every 2-3 weeks', 'Tolerates low light', 'Air purifying'],
      imageUrl: '/plants/snake-plant.jpg'
    },
    {
      id: 'pothos',
      name: 'Golden Pothos',
      species: 'Epipremnum aureum',
      reason: 'Adaptable to various light conditions and very forgiving. Grows quickly and looks beautiful trailing.',
      difficulty: 'easy',
      petSafe: false,
      petWarning: '⚠️ Toxic to cats and dogs if ingested',
      careHighlights: ['Water when soil is dry', 'Low to bright indirect light', 'Fast growing'],
      imageUrl: '/plants/pothos.jpg'
    },
    {
      id: 'spider-plant',
      name: 'Spider Plant',
      species: 'Chlorophytum comosum',
      reason: 'Non-toxic to pets and extremely easy to care for. Produces baby plants that can be propagated.',
      difficulty: 'easy',
      petSafe: true,
      careHighlights: ['Pet-friendly', 'Moderate watering', 'Bright indirect light preferred'],
      imageUrl: '/plants/spider-plant.jpg'
    },
    {
      id: 'zz-plant',
      name: 'ZZ Plant',
      species: 'Zamioculcas zamiifolia',
      reason: 'Extremely drought-tolerant and thrives in low light. Perfect for offices and low-maintenance care.',
      difficulty: 'easy',
      petSafe: false,
      petWarning: '⚠️ Toxic to cats and dogs if ingested',
      careHighlights: ['Water monthly', 'Low light tolerant', 'Very low maintenance'],
      imageUrl: '/plants/zz-plant.jpg'
    },
    {
      id: 'peace-lily',
      name: 'Peace Lily',
      species: 'Spathiphyllum',
      reason: 'Thrives in low to medium light and tells you when it needs water by drooping slightly.',
      difficulty: 'easy',
      petSafe: false,
      petWarning: '⚠️ Toxic to cats and dogs if ingested',
      careHighlights: ['Low to medium light', 'Water when droopy', 'Beautiful white flowers'],
      imageUrl: '/plants/peace-lily.jpg'
    },
    {
      id: 'boston-fern',
      name: 'Boston Fern',
      species: 'Nephrolepis exaltata',
      reason: 'Pet-safe and loves humidity. Perfect for bathrooms or kitchens with moderate to bright light.',
      difficulty: 'medium',
      petSafe: true,
      careHighlights: ['Pet-friendly', 'Needs humidity', 'Regular watering required'],
      imageUrl: '/plants/boston-fern.jpg'
    },
    {
      id: 'rubber-plant',
      name: 'Rubber Plant',
      species: 'Ficus elastica',
      reason: 'Striking appearance with large glossy leaves. Prefers bright indirect light and moderate care.',
      difficulty: 'medium',
      petSafe: false,
      petWarning: '⚠️ Toxic to cats and dogs if ingested',
      careHighlights: ['Bright indirect light', 'Water when top soil is dry', 'Wipe leaves regularly'],
      imageUrl: '/plants/rubber-plant.jpg'
    },
    {
      id: 'parlor-palm',
      name: 'Parlor Palm',
      species: 'Chamaedorea elegans',
      reason: 'Pet-safe palm that adapts well to low light conditions. Adds tropical feel to any room.',
      difficulty: 'easy',
      petSafe: true,
      careHighlights: ['Pet-friendly', 'Low to medium light', 'Moderate watering'],
      imageUrl: '/plants/parlor-palm.jpg'
    },
    {
      id: 'monstera',
      name: 'Monstera Deliciosa',
      species: 'Monstera deliciosa',
      reason: 'Iconic split leaves create a stunning focal point. Thrives in bright indirect light.',
      difficulty: 'medium',
      petSafe: false,
      petWarning: '⚠️ Toxic to cats and dogs if ingested',
      careHighlights: ['Bright indirect light', 'Weekly watering', 'Needs space to grow'],
      imageUrl: '/plants/monstera.jpg'
    },
    {
      id: 'calathea',
      name: 'Calathea',
      species: 'Calathea ornata',
      reason: 'Pet-safe with stunning patterned leaves. Prefers medium light and consistent moisture.',
      difficulty: 'hard',
      petSafe: true,
      careHighlights: ['Pet-friendly', 'Medium light', 'Needs humidity', 'Consistent watering'],
      imageUrl: '/plants/calathea.jpg'
    },
    {
      id: 'aloe-vera',
      name: 'Aloe Vera',
      species: 'Aloe barbadensis',
      reason: 'Succulent that loves bright light and minimal watering. Has medicinal properties for skin care.',
      difficulty: 'easy',
      petSafe: false,
      petWarning: '⚠️ Toxic to cats and dogs if ingested',
      careHighlights: ['Bright light', 'Water sparingly', 'Medicinal uses'],
      imageUrl: '/plants/aloe-vera.jpg'
    },
    {
      id: 'bamboo-palm',
      name: 'Bamboo Palm',
      species: 'Chamaedorea seifrizii',
      reason: 'Pet-safe air purifier that thrives in medium to bright light. Great for larger spaces.',
      difficulty: 'medium',
      petSafe: true,
      careHighlights: ['Pet-friendly', 'Air purifying', 'Medium to bright light', 'Regular watering'],
      imageUrl: '/plants/bamboo-palm.jpg'
    }
  ];

  // Filter plants based on conditions
  let recommendations: PlantRecommendation[] = [];

  // Filter by pet safety first
  if (hasPets) {
    recommendations = plantDatabase.filter(plant => plant.petSafe);
  } else {
    recommendations = [...plantDatabase];
  }

  // Further filter/sort by light level
  if (lightLevel === 'low') {
    // Prioritize low-light tolerant plants
    const lowLightPlants = ['snake-plant', 'zz-plant', 'pothos', 'peace-lily', 'parlor-palm'];
    recommendations = recommendations.sort((a, b) => {
      const aScore = lowLightPlants.includes(a.id) ? 1 : 0;
      const bScore = lowLightPlants.includes(b.id) ? 1 : 0;
      return bScore - aScore;
    });
  } else if (lightLevel === 'bright') {
    // Prioritize bright-light loving plants
    const brightLightPlants = ['aloe-vera', 'monstera', 'rubber-plant', 'spider-plant'];
    recommendations = recommendations.sort((a, b) => {
      const aScore = brightLightPlants.includes(a.id) ? 1 : 0;
      const bScore = brightLightPlants.includes(b.id) ? 1 : 0;
      return bScore - aScore;
    });
  }

  // Filter by temperature preference
  if (temperature === 'warm') {
    // Prioritize tropical plants
    const warmPlants = ['monstera', 'calathea', 'boston-fern', 'bamboo-palm'];
    recommendations = recommendations.sort((a, b) => {
      const aScore = warmPlants.includes(a.id) ? 1 : 0;
      const bScore = warmPlants.includes(b.id) ? 1 : 0;
      return bScore - aScore;
    });
  } else if (temperature === 'cold') {
    // Prioritize hardy plants
    const coldTolerant = ['snake-plant', 'spider-plant', 'zz-plant', 'pothos'];
    recommendations = recommendations.sort((a, b) => {
      const aScore = coldTolerant.includes(a.id) ? 1 : 0;
      const bScore = coldTolerant.includes(b.id) ? 1 : 0;
      return bScore - aScore;
    });
  }

  // Return top 5-6 recommendations
  const finalRecommendations = recommendations.slice(0, 6);

  // Generate room summary
  const lightEmoji = lightLevel === 'low' ? '🌑' : lightLevel === 'medium' ? '☁️' : '☀️';
  const tempEmoji = temperature === 'cold' ? '❄️' : temperature === 'moderate' ? '🌡️' : '🔥';
  const petEmoji = hasPets ? (pets.includes('cats') ? '🐱' : '🐶') : '🚫';

  const roomSummary = `Based on your room conditions (${lightEmoji} ${lightLevel} light, ${tempEmoji} ${temperature} temperature${hasPets ? `, ${petEmoji} pet-friendly` : ''}), we've selected ${finalRecommendations.length} perfect plants for you${notes ? '. ' + notes : ''}`;

  return {
    recommendations: finalRecommendations,
    roomSummary,
    timestamp: new Date().toISOString()
  };
}

// Made with Bob
