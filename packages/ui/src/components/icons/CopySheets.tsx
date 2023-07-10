import type { IconProps } from '@tamagui/helpers-icon'
import React, { memo } from 'react'
import { Path, Svg } from 'react-native-svg'
import { getTokenValue, isWeb, useTheme } from 'tamagui'

const Icon: React.FC<IconProps> = (props) => {
  // isWeb currentColor to maintain backwards compat a bit better, on native uses theme color
  const {
    color: colorProp = isWeb ? 'currentColor' : undefined,
    size: sizeProp = '$true',
    strokeWidth: strokeWidthProp,
    ...restProps
  } = props
  const theme = useTheme()

  const size = typeof sizeProp === 'string' ? getTokenValue(sizeProp, 'size') : sizeProp

  const strokeWidth =
    typeof strokeWidthProp === 'string' ? getTokenValue(strokeWidthProp, 'size') : strokeWidthProp

  const color = colorProp ?? theme.color.get()

  const svgProps = {
    ...restProps,
    size,
    strokeWidth,
    color,
  }

  return (
    <Svg fill="none" height={size} stroke={color} viewBox="0 0 20 20" width={size} {...svgProps}>
      <Path
        d="M16.7 7.5H9.2c-1 0-1.7.7-1.7 1.7v7.5c0 .9.7 1.6 1.7 1.6h7.5c.9 0 1.6-.7 1.6-1.6V9.2c0-1-.7-1.7-1.6-1.7Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <Path
        d="M4.2 12.5h-.9a1.7 1.7 0 0 1-1.6-1.7V3.3a1.7 1.7 0 0 1 1.6-1.6h7.5a1.7 1.7 0 0 1 1.7 1.6v.9"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </Svg>
  )
}

Icon.displayName = 'CopySheets'

export const CopySheets = memo<IconProps>(Icon)
