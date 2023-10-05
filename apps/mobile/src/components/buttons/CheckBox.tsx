import { useResponsiveProp } from '@shopify/restyle'
import React from 'react'
import { Flex, Icons, Text, TouchableArea } from 'ui/src'
import { iconSizes } from 'ui/src/theme'
import { useIsDarkMode } from 'wallet/src/features/appearance/hooks'

export type CheckBoxProps = {
  checked: boolean
  text?: string | JSX.Element
  onCheckPressed?: (currentState: boolean) => void
}

export function CheckBox({ text, checked, onCheckPressed }: CheckBoxProps): JSX.Element {
  const isDarkMode = useIsDarkMode()

  const onPress = (): void => {
    onCheckPressed?.(checked)
  }

  const fontSize = useResponsiveProp({
    xs: 'buttonLabel4',
    sm: 'subheading2',
  })

  return (
    <TouchableArea onPress={onPress}>
      <Flex row gap="$spacing12">
        <Flex
          alignItems="center"
          backgroundColor={checked ? '$neutral1' : '$surface2'}
          borderColor={checked ? '$neutral1' : '$neutral3'}
          borderRadius="$roundedFull"
          borderWidth={1.5}
          height={iconSizes.icon24}
          justifyContent="center"
          mt="$spacing4"
          p="$spacing2"
          width={iconSizes.icon24}>
          {checked ? (
            <Icons.Check
              color={isDarkMode ? '$sporeBlack' : '$sporeWhite'}
              height={iconSizes.icon16}
              width={iconSizes.icon16}
            />
          ) : null}
        </Flex>
        <Flex shrink>
          {typeof text === 'string' ? <Text variant={fontSize}>{text}</Text> : text}
        </Flex>
      </Flex>
    </TouchableArea>
  )
}
