export async function getUserCity(): Promise<string> {
  try {
    
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Next.js)',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.error('Geolocation API error:', response.status);
      return 'UNKNOWN';
    }
    
    const data = await response.json();
    console.log('Geolocation data:', data); // Debug log
    
    return data.city ? data.city.toUpperCase() : 'UNKNOWN';
  } catch (error) {
    console.error('Failed to get user location:', error);
    return 'UNKNOWN';
  }
}