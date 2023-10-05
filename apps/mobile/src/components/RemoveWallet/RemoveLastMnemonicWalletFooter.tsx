import React, { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CheckBox } from 'src/components/buttons/CheckBox'
import { SpinningLoader } from 'src/components/loading/SpinningLoader'
import { ElementName } from 'src/features/telemetry/constants'
import { Button, Flex, Text } from 'ui/src'

export function RemoveLastMnemonicWalletFooter({
  onPress,
  inProgress,
}: {
  onPress: () => void
  inProgress: boolean
}): JSX.Element {
  const { t } = useTranslation()

  const [checkBoxAccepted, setCheckBoxAccepted] = useState(false)
  const onCheckPressed = (): void => setCheckBoxAccepted(!checkBoxAccepted)

  return (
    <>
      <Flex
        backgroundColor="$surface2"
        borderRadius="$rounded16"
        mx="$spacing16"
        px="$spacing8"
        py="$spacing12">
        <CheckBox
          checked={checkBoxAccepted}
          text={
            <Trans t={t}>
              <Text color="$neutral1" variant="subheading2">
                I backed up my recovery phrase
              </Text>
              <Text color="$neutral2" variant="body3">
                I understand that Uniswap Labs can’t help me recover my wallets if I failed to do so
              </Text>
            </Trans>
          }
          onCheckPressed={onCheckPressed}
        />
      </Flex>
      <Flex centered row gap="$spacing12" pt="$spacing12">
        <Button
          fill
          disabled={!checkBoxAccepted}
          icon={inProgress ? <SpinningLoader color="statusCritical" /> : undefined}
          testID={ElementName.Confirm}
          theme="detrimental"
          onPress={onPress}>
          {!inProgress ? t('Remove wallet') : undefined}
        </Button>
      </Flex>
    </>
  )
}
