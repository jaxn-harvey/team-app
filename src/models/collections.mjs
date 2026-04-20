import { getDB } from '../config/database.mjs';

export function restaurantsCollection() {
  return getDB().collection('restaurants');
}

export function adminsCollection() {
  return getDB().collection('admins');
}

export function usersCollection() {
  return getDB().collection('users');
}

export function contactMessagesCollection() {
  return getDB().collection('contact_messages');
}
