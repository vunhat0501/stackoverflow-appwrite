import React from 'react';
import { db, questionCollection } from '@/models/name';
import { databases } from '@/models/server/config';
import EditQues from '@/app/questions/[questionId]/[questionName]/edit/EditQues';

export default async function Page({
    params,
}: {
    params: { quesId: string; quesName: string };
}) {
    const question = await databases.getDocument(
        db,
        questionCollection,
        params.quesId,
    );

    return <EditQues question={question} />;
}
