import { getSdkError } from '@walletconnect/utils'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { NativeSyntheticEvent, StyleSheet } from 'react-native'
import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view'
import 'react-native-reanimated'
import { FadeIn, FadeOut } from 'react-native-reanimated'
import { useAppDispatch, useAppTheme } from 'src/app/hooks'
import { AnimatedTouchableArea, TouchableArea } from 'src/components/buttons/TouchableArea'
import { Box, Flex } from 'src/components/layout'
import { Text } from 'src/components/Text'
import { DappHeaderIcon } from 'src/components/WalletConnect/DappHeaderIcon'
import { NetworkLogos } from 'src/components/WalletConnect/NetworkLogos'
import { ElementName } from 'src/features/telemetry/constants'
import { wcWeb3Wallet } from 'src/features/walletConnect/saga'
import { removeSession, WalletConnectSession } from 'src/features/walletConnect/walletConnectSlice'
import { serializeError } from 'utilities/src/errors'
import { logger } from 'utilities/src/logger/logger'
import { ONE_SECOND_MS } from 'utilities/src/time/time'
import { pushNotification } from 'wallet/src/features/notifications/slice'
import { AppNotificationType } from 'wallet/src/features/notifications/types'
import { useActiveAccountAddressWithThrow } from 'wallet/src/features/wallet/hooks'
import { WalletConnectEvent } from 'wallet/src/features/walletConnect/types'

export function DappConnectionItem({
  session,
  isEditing,
  onPressChangeNetwork,
}: {
  session: WalletConnectSession
  isEditing: boolean
  onPressChangeNetwork: (session: WalletConnectSession) => void
}): JSX.Element {
  const theme = useAppTheme()
  const { t } = useTranslation()
  const { dapp } = session
  const dispatch = useAppDispatch()
  const address = useActiveAccountAddressWithThrow()

  const onDisconnect = async (): Promise<void> => {
    try {
      dispatch(removeSession({ account: address, sessionId: session.id }))
      await wcWeb3Wallet.disconnectSession({
        topic: session.id,
        reason: getSdkError('USER_DISCONNECTED'),
      })
      dispatch(
        pushNotification({
          type: AppNotificationType.WalletConnect,
          address,
          dappName: dapp.name,
          event: WalletConnectEvent.Disconnected,
          imageUrl: dapp.icon,
          hideDelay: 3 * ONE_SECOND_MS,
        })
      )
    } catch (error) {
      logger.error(error, {
        tags: {
          file: 'DappConnectionItem',
          function: 'onDisconnect',
          error: serializeError(error),
        },
      })
    }
  }

  const menuActions = [{ title: t('Disconnect'), systemIcon: 'trash', destructive: true }]

  const onPress = async (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>): Promise<void> => {
    if (e.nativeEvent.index === 0) {
      await onDisconnect()
    }
  }

  return (
    <ContextMenu actions={menuActions} style={styles.container} onPress={onPress}>
      <Flex
        grow
        bg="surface2"
        borderRadius="rounded16"
        gap="spacing12"
        justifyContent="space-between"
        mb="spacing12"
        pb="spacing12"
        pt="spacing24"
        px="spacing12">
        <Flex
          alignSelf="flex-end"
          position="absolute"
          right={theme.spacing.spacing12}
          top={theme.spacing.spacing12}
          zIndex="tooltip">
          {isEditing ? (
            <AnimatedTouchableArea
              hapticFeedback
              alignItems="center"
              backgroundColor="neutral3"
              borderRadius="roundedFull"
              entering={FadeIn}
              exiting={FadeOut}
              height={theme.iconSizes.icon28}
              justifyContent="center"
              width={theme.iconSizes.icon28}
              zIndex="tooltip"
              onPress={onDisconnect}>
              <Box backgroundColor="surface1" borderRadius="rounded12" height={2} width={14} />
            </AnimatedTouchableArea>
          ) : (
            <Box height={theme.iconSizes.icon28} width={theme.iconSizes.icon28} />
          )}
        </Flex>
        <Flex grow alignItems="center" gap="spacing8">
          <DappHeaderIcon dapp={dapp} />
          <Text numberOfLines={2} textAlign="center" variant="buttonLabelMedium">
            {dapp.name || dapp.url}
          </Text>
          <Text color="accent1" numberOfLines={1} textAlign="center" variant="buttonLabelMicro">
            {dapp.url}
          </Text>
        </Flex>

        <TouchableArea
          hapticFeedback
          hapticStyle={ImpactFeedbackStyle.Medium}
          testID={ElementName.WCDappNetworks}
          onPress={(): void => onPressChangeNetwork(session)}>
          <NetworkLogos
            showFirstChainLabel
            backgroundColor="surface2"
            borderRadius="roundedFull"
            chains={session.chains}
            p="spacing8"
          />
        </TouchableArea>
      </Flex>
    </ContextMenu>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
  },
})
