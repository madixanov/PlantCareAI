export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Set public permissions for Plant and CareLog APIs
    await setPublicPermissions(strapi);
    
    // Seed demo data
    await seedDemoData(strapi);
  },
};

async function setPublicPermissions(strapi) {
  // Find the public role
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({
      where: { type: 'public' },
    });

  if (!publicRole) {
    console.log('Public role not found');
    return;
  }

  // Set permissions for Plant API
  await strapi.query('plugin::users-permissions.permission').createMany({
    data: [
      {
        action: 'api::plant.plant.find',
        role: publicRole.id,
      },
      {
        action: 'api::plant.plant.findOne',
        role: publicRole.id,
      },
      {
        action: 'api::plant.plant.create',
        role: publicRole.id,
      },
      {
        action: 'api::plant.plant.update',
        role: publicRole.id,
      },
      {
        action: 'api::plant.plant.delete',
        role: publicRole.id,
      },
      // Care Log permissions
      {
        action: 'api::care-log.care-log.find',
        role: publicRole.id,
      },
      {
        action: 'api::care-log.care-log.findOne',
        role: publicRole.id,
      },
      {
        action: 'api::care-log.care-log.create',
        role: publicRole.id,
      },
      {
        action: 'api::care-log.care-log.update',
        role: publicRole.id,
      },
      {
        action: 'api::care-log.care-log.delete',
        role: publicRole.id,
      },
    ],
  });

  console.log('✅ Public permissions configured');
}

async function seedDemoData(strapi) {
  // Check if data already exists
  const existingPlants = await strapi.entityService.findMany('api::plant.plant', {
    limit: 1,
  });

  if (existingPlants && existingPlants.length > 0) {
    console.log('✅ Demo data already exists, skipping seed');
    return;
  }

  console.log('🌱 Seeding demo data...');

  // Create 5 demo plants
  const plants = [
    {
      name: 'Monstera Deliciosa',
      species: 'Monstera deliciosa',
      location: 'Living Room',
      notes: 'Beautiful split leaves, growing well near the window',
      acquiredDate: '2024-01-15',
      lightLevel: 'medium',
      humidity: 'medium',
      temperaturePreference: 'warm',
      isToxicToPets: true,
    },
    {
      name: 'Snake Plant',
      species: 'Sansevieria trifasciata',
      location: 'Bedroom',
      notes: 'Very low maintenance, perfect for beginners',
      acquiredDate: '2024-03-20',
      lightLevel: 'low',
      humidity: 'low',
      temperaturePreference: 'moderate',
      isToxicToPets: true,
    },
    {
      name: 'Pothos',
      species: 'Epipremnum aureum',
      location: 'Kitchen',
      notes: 'Trailing beautifully from the shelf',
      acquiredDate: '2024-02-10',
      lightLevel: 'medium',
      humidity: 'medium',
      temperaturePreference: 'moderate',
      isToxicToPets: true,
    },
    {
      name: 'Spider Plant',
      species: 'Chlorophytum comosum',
      location: 'Bathroom',
      notes: 'Pet-safe and loves humidity',
      acquiredDate: '2024-04-05',
      lightLevel: 'medium',
      humidity: 'high',
      temperaturePreference: 'moderate',
      isToxicToPets: false,
    },
    {
      name: 'Peace Lily',
      species: 'Spathiphyllum',
      location: 'Office',
      notes: 'Beautiful white flowers, tells me when it needs water',
      acquiredDate: '2024-05-01',
      lightLevel: 'low',
      humidity: 'medium',
      temperaturePreference: 'warm',
      isToxicToPets: true,
    },
  ];

  const createdPlants = [];
  for (const plantData of plants) {
    const plant = await strapi.entityService.create('api::plant.plant', {
      data: plantData,
    });
    createdPlants.push(plant);
  }

  console.log(`✅ Created ${createdPlants.length} plants`);

  // Create 10 care logs distributed across plants
  const careLogs = [
    {
      careType: 'watering',
      notes: 'Regular watering, soil was dry',
      date: new Date('2024-05-28T10:00:00Z'),
      plant: createdPlants[0].id,
    },
    {
      careType: 'fertilizing',
      notes: 'Applied liquid fertilizer (half strength)',
      date: new Date('2024-05-25T14:30:00Z'),
      plant: createdPlants[0].id,
    },
    {
      careType: 'watering',
      notes: 'Light watering',
      date: new Date('2024-05-27T09:00:00Z'),
      plant: createdPlants[1].id,
    },
    {
      careType: 'pruning',
      notes: 'Removed yellow leaves',
      date: new Date('2024-05-26T16:00:00Z'),
      plant: createdPlants[2].id,
    },
    {
      careType: 'watering',
      notes: 'Watered thoroughly',
      date: new Date('2024-05-29T11:00:00Z'),
      plant: createdPlants[2].id,
    },
    {
      careType: 'watering',
      notes: 'Misted leaves and watered soil',
      date: new Date('2024-05-28T15:00:00Z'),
      plant: createdPlants[3].id,
    },
    {
      careType: 'repotting',
      notes: 'Repotted into larger container with fresh soil',
      date: new Date('2024-05-20T10:00:00Z'),
      plant: createdPlants[3].id,
    },
    {
      careType: 'watering',
      notes: 'Plant was drooping, watered immediately',
      date: new Date('2024-05-29T08:00:00Z'),
      plant: createdPlants[4].id,
    },
    {
      careType: 'other',
      notes: 'Wiped leaves to remove dust',
      date: new Date('2024-05-27T13:00:00Z'),
      plant: createdPlants[4].id,
    },
    {
      careType: 'fertilizing',
      notes: 'First feeding since acquisition',
      date: new Date('2024-05-24T12:00:00Z'),
      plant: createdPlants[1].id,
    },
  ];

  for (const careLogData of careLogs) {
    await strapi.entityService.create('api::care-log.care-log', {
      data: careLogData,
    });
  }

  console.log(`✅ Created ${careLogs.length} care logs`);
  console.log('🎉 Demo data seeding complete!');
}

// Made with Bob
