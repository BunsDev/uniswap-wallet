import React, { PropsWithChildren, ReactNode } from 'react'
import { ColorValue } from 'react-native'
import { BottomSheetModal } from 'src/components/modals/BottomSheetModal'
import { WarningColor, WarningSeverity } from 'src/components/modals/WarningModal/types'
import { useBiometricAppSettings, useBiometricPrompt } from 'src/features/biometrics/hooks'
import { ElementName, ModalName } from 'src/features/telemetry/constants'
import { Button, Flex, Icons, Text, useSporeColors } from 'ui/src'
import { iconSizes, opacify } from 'ui/src/theme'

export type WarningModalProps = {
  onClose?: () => void
  onCancel?: () => void
  onConfirm?: () => void
  modalName: ModalName
  title: string
  caption?: string
  closeText?: string
  confirmText?: string
  useBiometric?: boolean
  severity?: WarningSeverity
  isDismissible?: boolean
  hideHandlebar?: boolean
  icon?: ReactNode
  backgroundIconColor?: ColorValue
}

export default function WarningModal({
  onClose,
  onCancel,
  onConfirm,
  modalName,
  title,
  caption,
  closeText,
  confirmText,
  severity = WarningSeverity.Medium,
  children,
  useBiometric = false,
  isDismissible = true,
  hideHandlebar = false,
  icon,
  backgroundIconColor,
}: PropsWithChildren<WarningModalProps>): JSX.Element {
  const { requiredForTransactions } = useBiometricAppSettings()
  const { trigger } = useBiometricPrompt(onConfirm)

  const onPressConfirm = async (): Promise<void> => {
    if (requiredForTransactions && useBiometric) {
      await trigger()
    } else {
      onConfirm?.()
    }
  }

  const colors = useSporeColors()
  const alertColor = getAlertColor(severity)

  return (
    <BottomSheetModal
      backgroundColor={colors.surface1.val}
      hideHandlebar={hideHandlebar}
      isDismissible={isDismissible}
      name={modalName}
      onClose={onClose}>
      <Flex centered gap="$spacing12" mb="$spacing24" p="$spacing24">
        <Flex
          centered
          borderRadius="$rounded12"
          mb="$spacing8"
          p="$spacing8"
          style={{
            backgroundColor: backgroundIconColor ?? opacify(12, alertColor.text),
          }}>
          {icon ?? (
            <Icons.AlertTriangle
              color={alertColor.text}
              height={iconSizes.icon24}
              width={iconSizes.icon24}
            />
          )}
        </Flex>
        <Text textAlign="center" variant="body1">
          {title}
        </Text>
        {caption && (
          <Text color="$neutral2" textAlign="center" variant="body2">
            {caption}
          </Text>
        )}
        {children}
        <Flex centered row gap="$spacing12" pt={children ? '$spacing12' : '$spacing24'}>
          {closeText && (
            <Button fill theme="secondary" onPress={onCancel ?? onClose}>
              {closeText}
            </Button>
          )}
          {confirmText && (
            <Button
              fill
              testID={ElementName.Confirm}
              theme={alertColor.buttonTheme}
              onPress={onPressConfirm}>
              {confirmText}
            </Button>
          )}
        </Flex>
      </Flex>
    </BottomSheetModal>
  )
}

export const getAlertColor = (severity?: WarningSeverity): WarningColor => {
  switch (severity) {
    case WarningSeverity.None:
      return {
        text: '$neutral2',
        background: '$neutral2',
        buttonTheme: 'secondary',
      }
    case WarningSeverity.Low:
      return {
        text: '$neutral2',
        background: '$surface2',
        buttonTheme: 'tertiary',
      }
    case WarningSeverity.High:
      return {
        text: '$statusCritical',
        background: '$DEP_accentCriticalSoft',
        buttonTheme: 'detrimental',
      }
    case WarningSeverity.Medium:
      return {
        text: '$DEP_accentWarning',
        background: '$DEP_accentWarningSoft',
        buttonTheme: 'warning',
      }
    default:
      return {
        text: '$neutral2',
        background: '$transparent',
        buttonTheme: 'tertiary',
      }
  }
}
