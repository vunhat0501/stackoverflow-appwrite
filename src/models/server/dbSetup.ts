import { db } from '@/models/name';
import createAnswerCollection from '@/models/server/answer.collection';
import createQuestionCollection from '@/models/server/question.collection';
import createCommentCollection from '@/models/server/comment.collection';
import createVoteCollection from '@/models/server/vote.collection';
import { databases } from '@/models/server/config';

export default async function getOrCreateDB() {
    try {
        await databases.get(db);
        console.log('Database connected');
    } catch (error) {
        try {
            await databases.create(db, db);
            console.log('Database created');

            //** create collections */
            await Promise.all([
                createQuestionCollection(),
                createAnswerCollection(),
                createCommentCollection(),
                createVoteCollection(),
            ]);
            console.log('Collections created');
            console.log('Database connected');
        } catch (error) {
            console.error('Error creating database or collections:', error);
        }
        console.error('Error connecting to database:', error);
    }
    return databases;
}
