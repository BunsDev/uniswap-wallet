import React from 'react'
import { useAppTheme } from 'src/app/hooks'
import { TouchableArea, TouchableAreaProps } from 'ui/src'
import XIcon from 'ui/src/assets/icons/x.svg'
import { Theme } from 'ui/src/theme/restyle'

type Props = {
  onPress: () => void
  size?: number
  strokeWidth?: number
  color?: keyof Theme['colors']
} & TouchableAreaProps

export function CloseButton({ onPress, size, strokeWidth, color, ...rest }: Props): JSX.Element {
  // TODO(MOB-1275): remove this usage of Restyle, change behavior of XIcon to support Tamagui
  const theme = useAppTheme()
  return (
    <TouchableArea onPress={onPress} {...rest}>
      <XIcon
        color={theme.colors[color ?? 'sporeWhite']}
        height={size ?? 20}
        strokeWidth={strokeWidth ?? 2}
        width={size ?? 20}
      />
    </TouchableArea>
  )
}
