export const usePropertyFormat = (property) => {
  // Check if this is a database property (has property_type) or API property (has category)
  const isDatabaseProperty = property.property_type !== undefined;

  // Address handling
  let address = '';
  if (isDatabaseProperty) {
    // Database format: address, city, state are separate fields
    const addressParts = [
      property.address,
      property.city,
      property.state,
    ].filter(Boolean);
    address = addressParts.join(', ');
  } else {
    // API format: location array
    address = property.location?.map((item) => item.name).join(', ') || '';
  }

  // Cover photo handling
  let coverPhoto = '';
  if (isDatabaseProperty) {
    // Database format: images is an array of strings
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      // Get the first image URL
      let firstImage = property.images[0];
      
      // Fix broken placeholder URLs
      if (typeof firstImage === 'string') {
        // Replace old via.placeholder.com with working placehold.co
        if (firstImage.includes('via.placeholder.com')) {
          firstImage = 'https://placehold.co/800x800/e2e8f0/64748b?text=Property+Image';
        }
        
        // Ensure it's a valid URL
        if (firstImage.trim() !== '' && (firstImage.startsWith('http://') || firstImage.startsWith('https://'))) {
          coverPhoto = firstImage;
        } else {
          coverPhoto = 'https://placehold.co/800x800/e2e8f0/64748b?text=No+Image';
        }
      } else {
        coverPhoto = 'https://placehold.co/800x800/e2e8f0/64748b?text=No+Image';
      }
    } else {
      coverPhoto = 'https://placehold.co/800x800/e2e8f0/64748b?text=No+Image';
    }
  } else {
    // API format: coverPhoto object with url
    coverPhoto = property.coverPhoto?.url || '';
  }

  // Property type handling
  let propertyType = '';
  if (isDatabaseProperty) {
    propertyType = property.property_type || '';
  } else {
    propertyType = property.category?.length >= 2
      ? `${property.category[0].name} ${property.category[1].name}`
      : '';
  }

  // Price formatting
  const price = property.price
    ? `₹ ${property.price.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
      })}`
    : '';

  const title = property.title || '';
  
  // Property types that don't show bedrooms/bathrooms
  const landPropertyTypes = ['plot', 'land', 'commercial land'];
  const propertyTypeLower = propertyType.toLowerCase();
  const isLandType = landPropertyTypes.includes(propertyTypeLower);
  
  // Rooms/BHK handling - only for non-land types
  const rooms = isLandType ? null : (isDatabaseProperty ? (property.bhk || 0) : (property.rooms || 0));
  const baths = isLandType ? null : (property.baths || (isDatabaseProperty ? null : (property.bhk || 0)));
  
  // Purpose/Selling type
  const purpose = isDatabaseProperty 
    ? (property.selling_type || 'Sale') 
    : (property.purpose || '');
  
  // Area size
  const sqSize = property.area_size || property.area 
    ? (property.area_size || property.area).toFixed(2) 
    : '0.00';
  
  // Area unit - use from database, default to 'sq ft' for database properties, 'm²' for API properties
  const areaUnit = isDatabaseProperty
    ? (property.area_unit || 'sq ft')
    : 'm²';
  
  // External ID
  const externalID = isDatabaseProperty 
    ? (property.id || '') 
    : (property.externalID || '');

  // Photos handling
  let photos = [];
  if (isDatabaseProperty) {
    // Database format: images is an array of strings
    if (property.images && Array.isArray(property.images)) {
      // Filter and fix broken placeholder URLs
      photos = property.images
        .filter((img) => typeof img === 'string' && img.trim() !== '')
        .map((img) => {
          // Fix broken placeholder URLs
          if (img.includes('via.placeholder.com')) {
            return 'https://placehold.co/800x800/e2e8f0/64748b?text=Property+Image';
          }
          return img;
        });
    }
    // If no valid images, use placeholder
    if (photos.length === 0) {
      photos = ['https://placehold.co/800x800/e2e8f0/64748b?text=No+Image'];
    }
  } else {
    // API format: photos is an array of objects with url
    photos = property.photos?.map((photo) => photo.url) || [];
  }

  const description = property.content || property.description || '';
  
  // Cover video (not in database schema yet, so keep API format)
  const coverVideoUrl = property.coverVideo?.url || '';
  const coverVideo = coverVideoUrl ? coverVideoUrl.slice(coverVideoUrl.length - 11) : '';
  
  // Panorama (not in database schema yet, so keep API format)
  const panorama = property.panoramas?.length ? property.panoramas[0].url : '';

  // Amenities handling
  let amenities = [];
  if (isDatabaseProperty) {
    // Database format: amenities is an array of strings
    amenities = property.amenities || [];
  } else {
    // API format: nested structure
    amenities = property.amenities?.flatMap(({ amenities }) =>
      amenities?.map((item) => item.text)
    ) || [];
  }

  const furshied = property.furnishingStatus;

  return {
    address,
    coverPhoto,
    propertyType,
    price,
    title,
    rooms,
    baths,
    purpose,
    sqSize,
    areaUnit,
    externalID,
    photos,
    description,
    coverVideo,
    panorama,
    amenities,
    furshied,
  };
};
