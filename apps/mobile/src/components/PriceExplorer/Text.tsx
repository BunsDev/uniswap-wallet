import React from 'react'
import { SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useLineChartDatetime } from 'react-native-wagmi-charts'
import { useAppTheme } from 'src/app/hooks'
import { AnimatedCaretChange } from 'src/components/icons/Caret'
import { Flex } from 'src/components/layout'
import { Text } from 'src/components/Text'
import { AnimatedText } from 'src/components/text/AnimatedText'
import { AnimatedDecimalNumber } from './AnimatedDecimalNumber'
import { useLineChartPrice, useLineChartRelativeChange } from './usePrice'

export function PriceText({ loading }: { loading: boolean }): JSX.Element {
  const price = useLineChartPrice()

  if (loading) {
    return <Text loading loadingPlaceholderText="$10,000" variant="headlineLarge" />
  }

  return <AnimatedDecimalNumber number={price} testID="price-text" variant="headlineLarge" />
}

export function RelativeChangeText({
  loading,
  spotRelativeChange,
}: {
  loading: boolean
  spotRelativeChange?: SharedValue<number>
}): JSX.Element {
  const theme = useAppTheme()

  const relativeChange = useLineChartRelativeChange({ spotRelativeChange })

  const styles = useAnimatedStyle(() => ({
    color:
      relativeChange.value.value > 0 ? theme.colors.accentSuccess : theme.colors.accentCritical,
  }))
  const caretStyle = useAnimatedStyle(() => ({
    color:
      relativeChange.value.value > 0 ? theme.colors.accentSuccess : theme.colors.accentCritical,
    transform: [{ rotate: relativeChange.value.value > 0 ? '180deg' : '0deg' }],
  }))

  if (loading) {
    return <Text loading loadingPlaceholderText="00.00%" variant="bodyLarge" />
  }

  return (
    <Flex row alignItems="flex-end" gap="spacing2">
      <AnimatedCaretChange
        height={theme.iconSizes.icon16}
        strokeWidth={2}
        style={caretStyle}
        width={theme.iconSizes.icon16}
      />
      <AnimatedText
        style={styles}
        testID="relative-change-text"
        text={relativeChange.formatted}
        variant="bodyLarge"
      />
    </Flex>
  )
}

export function DatetimeText({ loading }: { loading: boolean }): JSX.Element | null {
  // `datetime` when scrubbing the chart
  const datetime = useLineChartDatetime()

  if (loading) return null

  return <AnimatedText color="textSecondary" text={datetime.formatted} variant="bodyLarge" />
}
