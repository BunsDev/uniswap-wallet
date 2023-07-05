import { Linking } from 'react-native'
import OneSignal, { NotificationReceivedEvent, OpenedEvent } from 'react-native-onesignal'
import { GQLQueries } from 'src/data/queries'
import { apolloClient } from 'src/data/usePersistedApolloClient'
import { config } from 'wallet/src/config'
import { logger } from 'wallet/src/features/logger/logger'
import { ONE_SECOND_MS } from 'wallet/src/utils/time'

export const initOneSignal = (): void => {
  OneSignal.setLogLevel(6, 0)
  OneSignal.setAppId(config.onesignalAppId)

  OneSignal.setNotificationWillShowInForegroundHandler((event: NotificationReceivedEvent) => {
    // Complete with undefined means don't show OS notifications while app is in foreground
    event.complete()
  })

  OneSignal.setNotificationOpenedHandler((event: OpenedEvent) => {
    logger.debug(
      'Onesignal',
      'setNotificationOpenedHandler',
      `Notification opened: ${event.notification}`
    )

    setTimeout(
      () =>
        apolloClient?.refetchQueries({
          include: [GQLQueries.PortfolioBalances, GQLQueries.TransactionList],
        }),
      ONE_SECOND_MS // Delay by 1s to give a buffer for data sources to synchronize
    )

    // This emits a url event when coldStart = false. Don't call openURI because that will
    // send the user to Safari to open the universal link. When coldStart = true, OneSignal
    // handles the url event and navigates correctly.
    if (event.notification.launchURL) {
      Linking.emit('url', { url: event.notification.launchURL })
    }
  })
}

export const promptPushPermission = (
  successCallback?: () => void,
  failureCallback?: () => void
): void => {
  OneSignal.promptForPushNotificationsWithUserResponse((response) => {
    logger.debug(
      'Onesignal',
      'promptForPushNotificationsWithUserResponse',
      `Prompt response: ${response}`
    )
    if (response) {
      successCallback?.()
    } else {
      failureCallback?.()
    }
  })
}

export const getOneSignalUserIdOrError = async (): Promise<string> => {
  const onesignalUserId = (await OneSignal.getDeviceState())?.userId
  if (!onesignalUserId) throw new Error('Onesignal user ID is not defined')
  return onesignalUserId
}

export const getOnesignalPushTokenOrError = async (): Promise<string> => {
  const onesignalPushToken = (await OneSignal.getDeviceState())?.pushToken
  if (!onesignalPushToken) throw new Error('Onesignal push token is not defined')
  return onesignalPushToken
}
