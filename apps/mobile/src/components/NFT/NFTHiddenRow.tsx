import { ImpactFeedbackStyle } from 'expo-haptics'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { AnimatedBox } from 'src/components/layout'
import { Flex, Icons, Text, TouchableArea } from 'ui/src'
import { iconSizes } from 'ui/src/theme'

export function HiddenNftsRowLeft({ numHidden }: { numHidden: number }): JSX.Element {
  const { t } = useTranslation()

  return (
    <Flex
      grow
      row
      alignItems="center"
      justifyContent="flex-start"
      ml="$spacing12"
      my="$spacing16"
      py="$spacing4">
      <Text color="$neutral2" variant="subheading2">
        {t('Hidden ({{numHidden}})', { numHidden })}
      </Text>
    </Flex>
  )
}

export function HiddenNftsRowRight({
  isExpanded,
  onPress,
}: {
  isExpanded: boolean
  onPress: () => void
}): JSX.Element {
  const { t } = useTranslation()

  const chevronRotate = useSharedValue(isExpanded ? 180 : 0)

  const chevronAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${chevronRotate.value}deg` }],
    }
  })

  const onPressRow = useCallback(() => {
    chevronRotate.value = withTiming(chevronRotate.value === 0 ? 180 : 0, {
      duration: 150,
      easing: Easing.ease,
    })
    onPress()
  }, [chevronRotate, onPress])

  return (
    <TouchableArea
      hapticFeedback
      flexGrow={1}
      hapticStyle={ImpactFeedbackStyle.Light}
      onPress={onPressRow}>
      <Flex row justifyContent="flex-end" mr="$spacing4" my="$spacing16">
        <Flex
          row
          alignItems="center"
          bg="$surface2"
          borderRadius="$roundedFull"
          pl="$spacing12"
          pr="$spacing8"
          py="$spacing4">
          <Text color="$neutral2" variant="buttonLabel3">
            {isExpanded ? t('Hide') : t('Show')}
          </Text>
          <AnimatedBox style={chevronAnimatedStyle}>
            <Icons.RotatableChevron
              color="$neutral2"
              direction="s"
              height={iconSizes.icon20}
              width={iconSizes.icon20}
            />
          </AnimatedBox>
        </Flex>
      </Flex>
    </TouchableArea>
  )
}
