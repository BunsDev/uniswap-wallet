import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, ButtonEmphasis, ButtonSize } from 'src/components/buttons/Button'
import { TouchableArea } from 'src/components/buttons/TouchableArea'
import { getClipboard } from 'src/utils/clipboard'
import { Flex, Icons, Text } from 'ui/src'
import PasteIcon from 'ui/src/assets/icons/paste.svg'
import { iconSizes } from 'ui/src/theme'

export default function PasteButton({
  inline,
  onPress,
  beforePress,
  afterClipboardReceived,
}: {
  inline?: boolean
  onPress: (text: string) => void
  beforePress?: () => void
  afterClipboardReceived?: () => void
}): JSX.Element {
  const { t } = useTranslation()

  const label = t('Paste')

  const onPressButton = async (): Promise<void> => {
    const clipboard = await getClipboard()
    // Since paste may trigger OS permission modal, the following callback is used to control other behavior such as blocking views that need to be shown/hidden.
    afterClipboardReceived?.()
    if (clipboard) {
      onPress(clipboard)
    }
  }

  if (inline) {
    return (
      <TouchableArea p="spacing8" onPress={onPressButton} onPressIn={beforePress}>
        <Flex centered row gap="$spacing4">
          <Icons.ClipboardPaste
            color="$neutral2"
            height={iconSizes.icon16}
            width={iconSizes.icon16}
          />
          <Text color="$neutral2" variant="buttonLabelMicro">
            {label}
          </Text>
        </Flex>
      </TouchableArea>
    )
  }

  return (
    <Button
      IconName={PasteIcon}
      emphasis={ButtonEmphasis.Tertiary}
      label={label}
      size={ButtonSize.Small}
      onPress={onPressButton}
      onPressIn={beforePress}
    />
  )
}
