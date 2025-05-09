import { Permission } from 'node-appwrite';
import { questionAttachmentBucket } from '@/models/name';
import { storage } from '@/models/server/config';

export default async function getOrCreateStorage() {
    try {
        await storage.getBucket(questionAttachmentBucket);
    } catch (error) {
        try {
            await storage.createBucket(
                questionAttachmentBucket,
                questionAttachmentBucket,
                [
                    Permission.read('any'),
                    Permission.read('users'),
                    Permission.create('users'),
                    Permission.update('users'),
                    Permission.delete('users'),
                ],
                false,
                undefined,
                undefined,
                ['jpg', 'png', 'gif', 'webp', 'heic'],
            );

            console.log('Storage bucket created');
            console.log('Storage connected');
        } catch (error) {
            console.error('Error creating storage bucket:', error);
        }
        console.error('Error getting storage bucket:', error);
    }
}
