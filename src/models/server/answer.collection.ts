import { Permission } from 'node-appwrite';
import { db, answerCollection } from '@/models/name';
import { databases } from '@/models/server/config';

export default async function createAnswerCollection() {
    //** create collection */
    await databases.createCollection(db, answerCollection, answerCollection, [
        Permission.read('any'),
        Permission.read('users'),
        Permission.create('users'),
        Permission.update('users'),
        Permission.delete('users'),
    ]);
    console.log('Answer collection created');

    //** Create attributes and indexes */
    await Promise.all([
        databases.createStringAttribute(
            db,
            answerCollection,
            'content',
            10000,
            true,
        ),
        databases.createStringAttribute(
            db,
            answerCollection,
            'questionId',
            50,
            true,
        ),
        databases.createStringAttribute(
            db,
            answerCollection,
            'authorId',
            50,
            true,
        ),
    ]);
    console.log('Answer collection attributes created');
}
