// Simple utility to store and retrieve angles from both video components

// Store for angles from both components
let angleStore = {
  live: {} as Record<string, number | null>,
  recorded: {} as Record<string, number | null>,
  lastUpdated: {
    live: 0,
    recorded: 0
  }
};

// Function to update angles from a specific source
export const updateAngles = (angles: Record<string, number | null>, source: 'live' | 'recorded') => {
  angleStore[source] = angles;
  angleStore.lastUpdated[source] = Date.now();
  
  // Log for debugging
  console.log(`Angles updated from ${source}:`, angles);
};

// Function to get the latest angles from a specific source
export const getAngles = (source: 'live' | 'recorded') => {
  return angleStore[source];
};

// Function to get the latest angles from both sources
export const getAllAngles = () => {
  return {
    live: angleStore.live,
    recorded: angleStore.recorded,
    lastUpdated: angleStore.lastUpdated
  };
};

// Function to clear the angle store
export const clearAngles = () => {
  angleStore = {
    live: {},
    recorded: {},
    lastUpdated: {
      live: 0,
      recorded: 0
    }
  };
}; 