import {
    answerCollection,
    db,
    questionCollection,
    voteCollection,
} from '@/models/name';
import { databases, users } from '@/models/server/config';
import { UserPrefs } from '@/store/Auth';
import { NextRequest, NextResponse } from 'next/server';
import { AppwriteException, ID, Query } from 'node-appwrite';

export async function POST(request: NextRequest) {
    try {
        //** grab data */
        const { voteById, voteStatus, type, typeId } = await request.json();

        //** list document */
        const response = await databases.listDocuments(db, voteCollection, [
            Query.equal('type', type),
            Query.equal('typeId', typeId),
            Query.equal('voteById', voteById),
        ]);

        //** if vote was already present */
        if (response.documents.length > 0) {
            await databases.deleteDocument(
                db,
                voteCollection,
                response.documents[0].$id,
            );

            //** decrease reputation */
            const questionOrAnswer = await databases.getDocument(
                db,
                type === 'question' ? questionCollection : answerCollection,
                typeId,
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(
                questionOrAnswer.authorId,
            );
            await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                reputation:
                    response.documents[0].voteStatus === 'upvoted'
                        ? Number(authorPrefs.reputation) - 1
                        : Number(authorPrefs.reputation) + 1,
            });
        }

        //** previous vote doest's exist or vote status changed */
        if (response.documents[0]?.voteStatus !== voteStatus) {
            const doc = await databases.createDocument(
                db,
                voteCollection,
                ID.unique(),
                {
                    type,
                    typeId,
                    voteStatus,
                    voteById,
                },
            );

            //** increase or decrease reputation */
            const questionOrAnswer = await databases.getDocument(
                db,
                type === 'question' ? questionCollection : answerCollection,
                typeId,
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(
                questionOrAnswer.authorId,
            );

            //** if vote was present */
            if (response.documents[0]) {
                await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                    reputation:
                        //** if the prev vote was "upvoted" and new value is "downvoted" => decrease the reputation */
                        response.documents[0].voteStatus === 'upvoted'
                            ? Number(authorPrefs.reputation) - 1
                            : Number(authorPrefs.reputation) + 1,
                });
            } else {
                //** if vote was not present */
                await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                    reputation:
                        //** if the prev vote was "upvoted" and new value is "downvoted" => decrease the reputation */
                        voteStatus === 'upvoted'
                            ? Number(authorPrefs.reputation) + 1
                            : Number(authorPrefs.reputation) - 1,
                });
            }

            const [upvotes, downvotes] = await Promise.all([
                databases.listDocuments(db, voteCollection, [
                    Query.equal('type', type),
                    Query.equal('typeId', typeId),
                    Query.equal('voteStatus', 'upvoted'),
                    Query.equal('voteById', voteById),
                    Query.limit(1), //** limit to 1 document. for optimization since only need total  */
                ]),
                databases.listDocuments(db, voteCollection, [
                    Query.equal('type', type),
                    Query.equal('typeId', typeId),
                    Query.equal('voteStatus', 'downvoted'),
                    Query.equal('voteById', voteById),
                    Query.limit(1), //** limit to 1 document. for optimization since only need total */
                ]),
            ]);

            return NextResponse.json(
                {
                    data: {
                        document: doc,
                        voteResult: upvotes.total - downvotes.total,
                    },
                    message: response.documents[0]
                        ? 'Vote status changed'
                        : 'Voted successfully',
                },
                { status: 201 },
            );
        }

        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(db, voteCollection, [
                Query.equal('type', type),
                Query.equal('typeId', typeId),
                Query.equal('voteStatus', 'upvoted'),
                Query.equal('voteById', voteById),
                Query.limit(1), //** limit to 1 document. for optimization since only need total  */
            ]),
            databases.listDocuments(db, voteCollection, [
                Query.equal('type', type),
                Query.equal('typeId', typeId),
                Query.equal('voteStatus', 'downvoted'),
                Query.equal('voteById', voteById),
                Query.limit(1), //** limit to 1 document. for optimization since only need total  */
            ]),
        ]);

        return NextResponse.json(
            {
                data: {
                    document: null,
                    voteResult: upvotes.total - downvotes.total,
                },
                message: 'Vote withdrawn',
            },
            { status: 200 },
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error voting';
        const statusCode =
            error instanceof AppwriteException ? error.code || 500 : 500;
        return NextResponse.json({ error: message }, { status: statusCode });
    }
}
