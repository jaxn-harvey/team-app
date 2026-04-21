import { ObjectId } from 'mongodb';
import { restaurantsCollection } from '../models/collections.mjs';

export async function fetchAllRestaurants() {
  return await restaurantsCollection().find({}).toArray();
}

export async function fetchRestaurantById(id) {
  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid restaurant ID');
  }

  const restaurant = await restaurantsCollection().findOne({
    _id: new ObjectId(id),
  });

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  return restaurant;
}

export async function createRestaurant(restaurantData) {
  const result = await restaurantsCollection().insertOne({
    ...restaurantData,
    createdAt: new Date(),
  });

  return result.insertedId;
}

export async function updateRestaurant(id, restaurantData) {
  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid restaurant ID');
  }

  const result = await restaurantsCollection().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...restaurantData,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    throw new Error('Restaurant not found');
  }

  return result;
}

export async function deleteRestaurant(id) {
  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid restaurant ID');
  }

  const result = await restaurantsCollection().deleteOne({
    _id: new ObjectId(id),
  });

  if (result.deletedCount === 0) {
    throw new Error('Restaurant not found');
  }

  return result;
}
