import { NotificationByDeviceBuilder, OneSignalAppClient } from 'onesignal-api-client-core'

export interface NotificationProps {
    message: string
    user_ids: string[]
}

export const sendOneSignalNotification = async function ({ message, user_ids }: NotificationProps) {
    const client = new OneSignalAppClient('c0987828-70e8-4ffe-8715-09ce22706232', 'OWFkNjgyOWMtNTlkMi00MGE2LTk0ODktMTIxMGM1ZWVhNDI5')

    const input = new NotificationByDeviceBuilder()
        .setIncludePlayerIds(user_ids)
        .notification()
        .setContents(
            { "en": message }
        ).build()
    return client.createNotification(input).then(response => {
        console.log({ 'Response': response })
    }).catch(e => {
        console.log({ 'Error': e })
    })
};

// sendOneSignalNotification({ message: 'I love this', user_ids: ['d4177c41-b46a-4783-b55a-f0089ab63043'] })