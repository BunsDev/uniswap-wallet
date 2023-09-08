import { SpacingProps, SpacingShorthandProps } from '@shopify/restyle'
import React from 'react'
import { Switch as BaseSwitch, SwitchProps, ViewProps } from 'react-native'
import { useAppTheme } from 'src/app/hooks'
import { Box } from 'src/components/layout/Box'
import { Theme } from 'ui/src/theme/restyle'

type RestyleProps = SpacingProps<Theme> & SpacingShorthandProps<Theme>

type Props = {
  value: boolean
  onValueChange: (newValue: boolean) => void
  disabled?: boolean
} & RestyleProps &
  ViewProps &
  SwitchProps

// A themed switch toggle
export function Switch({ value, onValueChange, disabled, ...rest }: Props): JSX.Element {
  const theme = useAppTheme()

  return (
    <Box>
      <BaseSwitch
        ios_backgroundColor="transparent"
        thumbColor={value ? theme.colors.accent1 : theme.colors.surface1}
        trackColor={{
          false: theme.colors.surface4,
          true: theme.colors.surface3,
        }}
        value={value}
        onValueChange={disabled ? undefined : onValueChange}
        {...rest}
      />
    </Box>
  )
}
