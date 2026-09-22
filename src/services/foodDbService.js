import { db } from '../db/arcDatabase';

/**
 * Searches the reference food database in Dexie IndexedDB.
 * Searches across name and category, with support for custom user foods.
 *
 * @param {string} query - Search term (e.g. 'egg', 'paneer')
 * @param {string} [category] - Optional category filter (e.g. 'dairy', 'oils', 'all')
 * @param {number} [limit=50] - Maximum records to return
 * @returns {Promise<Array>}
 */
export async function searchFoods(query = '', category = 'all', limit = 50) {
  try {
    const trimmed = query.trim().toLowerCase();

    let collection = db.foods;

    if (category && category !== 'all') {
      collection = collection.where('category').equals(category);
    }

    if (!trimmed) {
      return await collection.limit(limit).toArray();
    }

    return await collection
      .filter(item => {
        const matchesName = item.name && item.name.toLowerCase().includes(trimmed);
        const matchesCategory =
          category === 'all' || item.category === category;
        return matchesName && matchesCategory;
      })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Error searching food database in Dexie:', error);
    return [];
  }
}

/**
 * Retrieves a single food item by ID.
 * @param {string} id
 * @returns {Promise<Object|undefined>}
 */
export async function getFoodById(id) {
  return await db.foods.get(id);
}

/**
 * Adds a new custom food item created by the user with macros and optional micros.
 * @param {Object} food
 * @returns {Promise<string>}
 */
export async function addCustomFood(food) {
  const newFood = {
    ...food,
    id: food.id || `custom_food_${Date.now()}`,
    isCustom: true,
  };
  await db.foods.put(newFood);
  return newFood.id;
}

/**
 * Deletes a custom food item.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteCustomFood(id) {
  const item = await db.foods.get(id);
  if (item && item.isCustom) {
    await db.foods.delete(id);
  }
}
