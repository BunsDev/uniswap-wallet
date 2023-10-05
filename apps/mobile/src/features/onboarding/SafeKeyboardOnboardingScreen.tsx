import { useHeaderHeight } from '@react-navigation/elements'
import { useResponsiveProp } from '@shopify/restyle'
import { LinearGradient } from 'expo-linear-gradient'
import React, { PropsWithChildren } from 'react'
import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native'
import { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AnimatedFlex } from 'src/components/layout'
import { Screen } from 'src/components/layout/Screen'
import { IS_IOS } from 'src/constants/globals'
import { useKeyboardLayout } from 'src/utils/useKeyboardLayout'
import { Flex, SpaceTokens, Text, useSporeColors } from 'ui/src'
import { opacify } from 'ui/src/theme'
import { flex } from 'ui/src/theme/restyle'

type OnboardingScreenProps = {
  subtitle?: string
  title: string
  paddingTop?: SpaceTokens
  childrenGap?: SpaceTokens
}

export function SafeKeyboardOnboardingScreen({
  title,
  subtitle,
  children,
  paddingTop = '$none',
}: PropsWithChildren<OnboardingScreenProps>): JSX.Element {
  const headerHeight = useHeaderHeight()
  const colors = useSporeColors()
  const insets = useSafeAreaInsets()
  const keyboard = useKeyboardLayout()

  const titleSize = useResponsiveProp({
    xs: 'body1',
    sm: 'heading3',
  })

  const subtitleSize = useResponsiveProp({
    xs: 'body3',
    sm: 'body2',
  })

  const header = (
    <Flex gap="$spacing12" m="$spacing12">
      <Text pt={paddingTop} textAlign="center" variant={titleSize}>
        {title}
      </Text>
      {subtitle ? (
        <Text color="$neutral2" textAlign="center" variant={subtitleSize}>
          {subtitle}
        </Text>
      ) : null}
    </Flex>
  )

  const page = (
    <Flex grow justifyContent="space-between">
      {children}
    </Flex>
  )

  const normalGradientPadding = 1.5
  const responsiveGradientPadding = useResponsiveProp({
    xs: 1.25,
    sm: normalGradientPadding,
  })

  const topGradient = (
    <LinearGradient
      colors={[colors.surface1.val, opacify(0, colors.surface1.val)]}
      locations={[0.6, 0.8]}
      style={[
        styles.gradient,
        { height: headerHeight * (responsiveGradientPadding ?? normalGradientPadding) },
      ]}
    />
  )

  const compact = keyboard.isVisible && keyboard.containerHeight !== 0
  const containerStyle = compact ? styles.compact : styles.expand

  // This makes sure this component behaves just like `behavior="padding"` when
  // there's enough space on the screen to show all components.
  const minHeight = compact ? keyboard.containerHeight : 0

  const responsiveSpacing = useResponsiveProp({
    xs: 'none',
    sm: 'spacing16',
  })

  const responsiveBottom = useResponsiveProp({
    xs: 10,
    sm: insets.bottom,
  })

  return (
    <Screen edges={['right', 'left']}>
      <KeyboardAvoidingView
        behavior={IS_IOS ? 'padding' : undefined}
        contentContainerStyle={containerStyle}
        style={[styles.base, { marginBottom: responsiveBottom }]}>
        <ScrollView
          bounces={false}
          contentContainerStyle={flex.grow}
          keyboardShouldPersistTaps="handled">
          <AnimatedFlex
            entering={FadeIn}
            exiting={FadeOut}
            gap={responsiveSpacing}
            minHeight={minHeight}
            pb="spacing16"
            px="spacing16"
            style={[containerStyle, { paddingTop: headerHeight }]}>
            {header}
            {page}
          </AnimatedFlex>
        </ScrollView>
      </KeyboardAvoidingView>
      {topGradient}
    </Screen>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  compact: {
    flexGrow: 0,
  },
  expand: {
    flexGrow: 1,
  },
  gradient: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
})
