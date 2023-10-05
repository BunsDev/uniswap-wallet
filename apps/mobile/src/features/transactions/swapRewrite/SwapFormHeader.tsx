import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { ElementName } from 'src/features/telemetry/constants'
import { SwapSettingsModal } from 'src/features/transactions/swap/modals/SwapSettingsModal'
import { Flex, Text, TouchableArea, useSporeColors } from 'ui/src'
import DollarSign from 'ui/src/assets/icons/dollar.svg'
import EyeIcon from 'ui/src/assets/icons/eye.svg'
import SettingsIcon from 'ui/src/assets/icons/settings.svg'
import { iconSizes } from 'ui/src/theme'
import { formatPercent } from 'utilities/src/format/format'
import { AccountType } from 'wallet/src/features/wallet/accounts/types'
import { useActiveAccountWithThrow } from 'wallet/src/features/wallet/hooks'
import { SwapScreen, useSwapContext } from './SwapContext'

export function SwapFormHeader(): JSX.Element {
  const { t } = useTranslation()
  const colors = useSporeColors()
  const account = useActiveAccountWithThrow()

  const { updateSwapForm, isFiatInput, customSlippageTolerance, screen, derivedSwapInfo } =
    useSwapContext()

  const [showSwapSettingsModal, setShowSettingsModal] = useState(false)

  const onToggleFiatInput = useCallback((): void => {
    // TODO: implement
  }, [])

  const onPressSwapSettings = useCallback((): void => {
    setShowSettingsModal(true)
    Keyboard.dismiss()
  }, [])

  const onPressViewOnlyModal = useCallback((): void => {
    // TODO: implement
  }, [])

  const setCustomSlippageTolerance = useCallback(
    (newCustomeSlippageTolerance: number | undefined): void => {
      updateSwapForm({
        customSlippageTolerance: newCustomeSlippageTolerance,
      })
    },
    [updateSwapForm]
  )

  const onCloseSettingsModal = useCallback(() => setShowSettingsModal(false), [])

  const isViewOnlyWallet = account?.type === AccountType.Readonly

  return (
    <>
      <Flex
        row
        alignItems="center"
        justifyContent="space-between"
        mt="$spacing8"
        pb="$spacing8"
        pl="$spacing12"
        pr={customSlippageTolerance ? '$spacing8' : '$spacing16'}>
        <Text $sm={{ variant: 'subheading1' }} $xs={{ variant: 'subheading2' }}>
          {t('Swap')}
        </Text>

        <Flex row gap="$spacing4">
          {screen === SwapScreen.SwapForm && (
            <TouchableArea
              hapticFeedback
              bg={isFiatInput ? '$accent2' : '$surface2'}
              borderRadius="$rounded16"
              onPress={(): void => onToggleFiatInput()}>
              <Flex row alignItems="center" flex={1} gap="$spacing4" px="$spacing8" py="$spacing4">
                <DollarSign
                  color={isFiatInput ? colors.accent1.val : colors.neutral2.val}
                  height={iconSizes.icon16}
                  width={iconSizes.icon16}
                />
                <Text color={isFiatInput ? '$accent1' : '$neutral2'} variant="buttonLabel3">
                  {t('USD')}
                </Text>
              </Flex>
            </TouchableArea>
          )}

          {isViewOnlyWallet && (
            <TouchableArea
              bg="$surface2"
              borderRadius="$rounded12"
              justifyContent="center"
              px="$spacing8"
              py="$spacing4"
              onPress={onPressViewOnlyModal}>
              <Flex row alignItems="center" gap="$spacing4">
                <EyeIcon
                  color={colors.neutral2.val}
                  height={iconSizes.icon16}
                  width={iconSizes.icon16}
                />
                <Text color="$neutral2" variant="buttonLabel3">
                  {t('View-only')}
                </Text>
              </Flex>
            </TouchableArea>
          )}

          {screen === SwapScreen.SwapForm && !isViewOnlyWallet && (
            <TouchableArea
              hapticFeedback
              testID={ElementName.SwapSettings}
              onPress={onPressSwapSettings}>
              <Flex
                centered
                row
                bg={customSlippageTolerance ? '$surface2' : '$transparent'}
                borderRadius="$roundedFull"
                gap="$spacing4"
                px={customSlippageTolerance ? '$spacing8' : '$none'}
                py="$spacing4">
                {customSlippageTolerance && (
                  <Text color="$neutral2" variant="buttonLabel4">
                    {t('{{slippageTolerancePercent}} slippage', {
                      slippageTolerancePercent: formatPercent(customSlippageTolerance),
                    })}
                  </Text>
                )}
                <SettingsIcon
                  color={colors.neutral3.val}
                  height={iconSizes.icon28}
                  width={iconSizes.icon28}
                />
              </Flex>
            </TouchableArea>
          )}
        </Flex>
      </Flex>

      {showSwapSettingsModal && (
        <SwapSettingsModal
          derivedSwapInfo={derivedSwapInfo}
          setCustomSlippageTolerance={setCustomSlippageTolerance}
          onClose={onCloseSettingsModal}
        />
      )}
    </>
  )
}
