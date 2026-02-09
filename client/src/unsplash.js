const UNSPLASH_ACCESS_KEY = '6ynKd7abZtn8VqE_FqOPuJZ5BcAnhFZv0qjbUl4vRQY';

export async function fetchRandomPhoto() {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_ACCESS_KEY}&orientation=squarish&content_filter=high`,
      { headers: { 'Accept-Version': 'v1' } }
    );
    if (!response.ok) throw new Error('Unsplash API error');
    const data = await response.json();
    return {
      thumb: data.urls.thumb,
      small: data.urls.small,
      regular: data.urls.regular,
      alt: data.alt_description || 'Note image',
      color: data.color || '#6c5ce7',
      authorName: data.user?.name || '',
      authorUrl: data.user?.links?.html || ''
    };
  } catch (err) {
    console.error('Failed to fetch Unsplash photo:', err);
    return null;
  }
}
