import { Permission } from 'node-appwrite';
import { db, commentCollection } from '@/models/name';
import { databases } from '@/models/server/config';

export default async function createCommentCollection() {
    //** create collection */
    await databases.createCollection(db, commentCollection, commentCollection, [
        Permission.read('any'),
        Permission.read('users'),
        Permission.create('users'),
        Permission.update('users'),
        Permission.delete('users'),
    ]);
    console.log('Comment collection created');

    //** Create attributes and indexes */
    await Promise.all([
        databases.createStringAttribute(
            db,
            commentCollection,
            'content',
            10000,
            true,
        ),
        databases.createEnumAttribute(
            db,
            commentCollection,
            'type',
            ['question', 'answer'],
            true,
        ),
        databases.createStringAttribute(
            db,
            commentCollection,
            'typeId',
            50,
            true,
        ),
        databases.createStringAttribute(
            db,
            commentCollection,
            'authorId',
            50,
            true,
        ),
    ]);
    console.log('Comment collection attributes created');
}
