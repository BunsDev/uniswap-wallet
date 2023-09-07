import { useResponsiveProp } from '@shopify/restyle'
import { addScreenshotListener } from 'expo-screen-capture'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrevious } from 'react-native-wagmi-charts'
import { Button, ButtonEmphasis } from 'src/components/buttons/Button'
import { Flex } from 'src/components/layout/Flex'
import {
  DEFAULT_MNEMONIC_DISPLAY_HEIGHT,
  FULL_MNEMONIC_DISPLAY_HEIGHT,
} from 'src/components/mnemonic/constants'
import { HiddenMnemonicWordView } from 'src/components/mnemonic/HiddenMnemonicWordView'
import { MnemonicDisplay } from 'src/components/mnemonic/MnemonicDisplay'
import WarningModal from 'src/components/modals/WarningModal/WarningModal'
import { useBiometricAppSettings, useBiometricPrompt } from 'src/features/biometrics/hooks'
import { ElementName, ModalName } from 'src/features/telemetry/constants'
import { useWalletRestore } from 'src/features/wallet/hooks'

type Props = {
  mnemonicId: string
  onDismiss?: () => void
  walletNeedsRestore?: boolean
}

export function SeedPhraseDisplay({
  mnemonicId,
  onDismiss,
  walletNeedsRestore,
}: Props): JSX.Element {
  const { t } = useTranslation()
  const { isModalOpen: isWalletRestoreModalOpen } = useWalletRestore({ openModalImmediately: true })
  const [showScreenShotWarningModal, setShowScreenShotWarningModal] = useState(false)
  const [showSeedPhrase, setShowSeedPhrase] = useState(false)
  const [showSeedPhraseViewWarningModal, setShowSeedPhraseViewWarningModal] = useState(
    !walletNeedsRestore
  )

  const prevIsWalletRestoreModalOpen = usePrevious(isWalletRestoreModalOpen)
  useEffect(() => {
    if (prevIsWalletRestoreModalOpen && !isWalletRestoreModalOpen) {
      onDismiss?.()
    }
  })

  const onShowSeedPhraseConfirmed = (): void => {
    setShowSeedPhrase(true)
    setShowSeedPhraseViewWarningModal(false)
  }

  const onClose = (): void => {
    if (!showSeedPhrase) onDismiss?.()
  }

  const onConfirmWarning = async (): Promise<void> => {
    if (biometricAuthRequiredForAppAccess || biometricAuthRequiredForTransactions) {
      await biometricTrigger()
    } else {
      onShowSeedPhraseConfirmed()
    }
  }

  const {
    requiredForAppAccess: biometricAuthRequiredForAppAccess,
    requiredForTransactions: biometricAuthRequiredForTransactions,
  } = useBiometricAppSettings()
  const { trigger: biometricTrigger } = useBiometricPrompt(onShowSeedPhraseConfirmed)

  useEffect(() => {
    const listener = addScreenshotListener(() => setShowScreenShotWarningModal(showSeedPhrase))
    return () => listener?.remove()
  }, [showSeedPhrase])

  const mnemonicDisplayHeight = useResponsiveProp({
    xs: DEFAULT_MNEMONIC_DISPLAY_HEIGHT,
    sm: FULL_MNEMONIC_DISPLAY_HEIGHT,
  })

  return (
    <>
      {showSeedPhrase ? (
        <Flex grow alignItems="stretch" justifyContent="space-evenly" mt="spacing16">
          <Flex grow mx="spacing16" my="spacing12">
            <MnemonicDisplay
              height={mnemonicDisplayHeight ?? DEFAULT_MNEMONIC_DISPLAY_HEIGHT}
              mnemonicId={mnemonicId}
            />
          </Flex>
          <Flex justifyContent="center">
            <Button
              emphasis={ButtonEmphasis.Secondary}
              label={t('Hide recovery phrase')}
              testID={ElementName.Next}
              onPress={(): void => {
                setShowSeedPhrase(false)
              }}
            />
          </Flex>
        </Flex>
      ) : (
        <HiddenMnemonicWordView />
      )}

      {showSeedPhraseViewWarningModal && (
        <WarningModal
          hideHandlebar
          caption={t(
            'Please only view your recovery phrase in a private place. Anyone who knows your recovery phrase can access your wallet and funds.'
          )}
          closeText={t('Go back')}
          confirmText={t('View phrase')}
          isDismissible={false}
          modalName={ModalName.ViewSeedPhraseWarning}
          title={t('Be careful')}
          onCancel={(): void => {
            setShowSeedPhraseViewWarningModal(false)
          }}
          onClose={onClose}
          onConfirm={onConfirmWarning}
        />
      )}
      {showScreenShotWarningModal && (
        <WarningModal
          caption={t(
            'Anyone who gains access to your photos can access your wallet. We recommend that you write down your words instead.'
          )}
          confirmText={t('OK')}
          modalName={ModalName.ScreenshotWarning}
          title={t('Screenshots aren’t secure')}
          onConfirm={(): void => setShowScreenShotWarningModal(false)}
        />
      )}
    </>
  )
}
