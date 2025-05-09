import { Permission } from 'node-appwrite';
import { db, voteCollection } from '@/models/name';
import { databases } from '@/models/server/config';

export default async function createVoteCollection() {
    //** create collection */
    await databases.createCollection(db, voteCollection, voteCollection, [
        Permission.read('any'),
        Permission.read('users'),
        Permission.create('users'),
        Permission.update('users'),
        Permission.delete('users'),
    ]);
    console.log('Vote collection created');

    //** Create attributes and indexes */
    await Promise.all([
        databases.createEnumAttribute(
            db,
            voteCollection,
            'type',
            ['question', 'answer'],
            true,
        ),
        databases.createStringAttribute(db, voteCollection, 'typeId', 50, true),
        databases.createEnumAttribute(
            db,
            voteCollection,
            'voteStatus',
            ['upvote', 'downvote'],
            true,
        ),
        databases.createStringAttribute(
            db,
            voteCollection,
            'voteById',
            50,
            true,
        ),
    ]);
    console.log('Vote collection attributes created');
}
