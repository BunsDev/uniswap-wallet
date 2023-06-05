import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import { useAppDispatch } from 'src/app/hooks'
import { navigate } from 'src/app/navigation/rootNavigation'
import { BackButton } from 'src/components/buttons/BackButton'
import { TouchableArea } from 'src/components/buttons/TouchableArea'
import { Box } from 'src/components/layout/Box'
import { SheetScreen } from 'src/components/layout/SheetScreen'
import { Text } from 'src/components/Text'
import { setChainActiveStatus } from 'src/features/chains/chainsSlice'
import { useActiveChainIds } from 'src/features/chains/utils'
import { pushNotification } from 'src/features/notifications/notificationSlice'
import { AppNotificationType } from 'src/features/notifications/types'
import { resetDismissedWarnings } from 'src/features/tokens/tokensSlice'
import { createAccountActions } from 'src/features/wallet/createAccountSaga'
import { useActiveAccount } from 'src/features/wallet/hooks'
import { resetWallet } from 'src/features/wallet/walletSlice'
import { Screens } from 'src/screens/Screens'
import { ChainId } from 'wallet/src/constants/chains'
import { logger } from 'wallet/src/features/logger/logger'

export function DevScreen(): JSX.Element {
  const dispatch = useAppDispatch()
  const activeAccount = useActiveAccount()
  const [currentChain] = useState(ChainId.Goerli)

  const onPressResetTokenWarnings = (): void => {
    dispatch(resetDismissedWarnings())
  }

  const onPressCreate = (): void => {
    dispatch(createAccountActions.trigger())
  }

  const activateWormhole = (s: Screens): void => {
    navigate(s)
  }

  const activeChains = useActiveChainIds()
  const onPressToggleTestnets = (): void => {
    // always rely on the state of goerli
    const isGoerliActive = activeChains.includes(ChainId.Goerli)
    dispatch(setChainActiveStatus({ chainId: ChainId.Goerli, isActive: !isGoerliActive }))
  }

  const onPressShowError = (): void => {
    const address = activeAccount?.address
    if (!address) {
      logger.error(
        'DevScreen',
        'onPressShowError',
        'Cannot show error if activeAccount is undefined'
      )
      return
    }

    dispatch(
      pushNotification({
        type: AppNotificationType.Error,
        address,
        errorMessage: 'A scary new error has happened. Be afraid!!',
      })
    )
  }

  const onPressResetOnboarding = (): void => {
    if (!activeAccount) return

    dispatch(resetWallet())
  }

  return (
    <SheetScreen>
      <Box
        flexDirection="row"
        justifyContent="flex-end"
        pb="spacing12"
        pt="spacing36"
        px="spacing16">
        <BackButton />
      </Box>
      <ScrollView>
        <Box alignItems="center">
          <Text color="textPrimary" textAlign="center" variant="headlineSmall">
            {`Your Account: ${activeAccount?.address || 'none'}`}
          </Text>
          <Text mt="spacing16" textAlign="center" variant="headlineSmall">
            🌀🌀Screen Stargate🌀🌀
          </Text>
          <Box alignItems="center" flexDirection="row" flexWrap="wrap" justifyContent="center">
            {Object.values(Screens).map((s) => (
              <TouchableArea
                key={s}
                m="spacing8"
                testID={`dev_screen/${s}`}
                onPress={(): void => activateWormhole(s)}>
                <Text color="textPrimary">{s}</Text>
              </TouchableArea>
            ))}
          </Box>
          <Text mt="spacing12" textAlign="center" variant="bodyLarge">
            🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
          </Text>
          <TouchableArea mt="spacing16" onPress={onPressCreate}>
            <Text color="textPrimary">Create account</Text>
          </TouchableArea>
          <TouchableArea mt="spacing12" onPress={onPressToggleTestnets}>
            <Text color="textPrimary">Toggle testnets</Text>
          </TouchableArea>
          <TouchableArea mt="spacing12" onPress={onPressResetTokenWarnings}>
            <Text color="textPrimary">Reset token warnings</Text>
          </TouchableArea>
          <TouchableArea mt="spacing12" onPress={onPressShowError}>
            <Text color="textPrimary">Show global error</Text>
          </TouchableArea>
          <TouchableArea mt="spacing12" onPress={onPressResetOnboarding}>
            <Text color="textPrimary">Reset onboarding</Text>
          </TouchableArea>
          <Text color="textPrimary" mt="spacing36" textAlign="center">
            {`Active Chains: ${activeChains}`}
          </Text>
          <Text color="textPrimary" mt="spacing12" textAlign="center">
            {`Current Chain: ${currentChain}`}
          </Text>
        </Box>
      </ScrollView>
    </SheetScreen>
  )
}
