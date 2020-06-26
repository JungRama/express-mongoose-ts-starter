import { Storage } from '@google-cloud/storage'
import path from 'path'

// CONFIG
const serviceKey = path.join(__dirname, '../../../credential/gcp-storage-config.json')
const storage = new Storage({
    keyFilename: serviceKey,
    projectId: process.env.GCP_PROJECT_ID,
})

export default class ManageFile {
    static async uploadFile(file: any, fileName: string, bucketName: string) {
        return new Promise((resolve, reject) => {
            const bucket = storage.bucket(bucketName)
            const { data } = file

            // REPLACE SPACE NAME
            const blob = bucket.file(fileName.replace(/ /g, "_"))
            const blobStream = blob.createWriteStream({
                resumable: false
            })

            // UPLOAD TO STORAGE
            blobStream.on('finish', () => {
                const publicUrl = `${blob.name}`
                resolve(publicUrl)
            })
            .on('error', (error) => {
                reject('Error Uploading, Message : ' + error)
            })
            .end(data)
        })
    }

    static async deleteFile(fileName: string, bucketName: string) {
        try {
            console.log(fileName, bucketName);
            await storage.bucket(bucketName).file(fileName).delete();
        } catch (error) {
            throw new Error(error);
        }
    }
}



