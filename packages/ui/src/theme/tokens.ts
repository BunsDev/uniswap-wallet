import { createTokens } from 'tamagui'
import { borderRadii } from 'ui/src/theme/borderRadii'
import { colors as color } from 'ui/src/theme/color/colors'
import { fonts } from 'ui/src/theme/fonts'
import { iconSizes } from 'ui/src/theme/iconSizes'
import { imageSizes } from 'ui/src/theme/imageSizes'
import { spacing } from 'ui/src/theme/spacing'
import { zIndices } from 'ui/src/theme/zIndices'

const space = { ...spacing, true: spacing.spacing8 }

const size = space

const iconSize = {
  true: iconSizes.icon40,
  8: iconSizes.icon8,
  12: iconSizes.icon12,
  16: iconSizes.icon16,
  20: iconSizes.icon20,
  24: iconSizes.icon24,
  28: iconSizes.icon28,
  36: iconSizes.icon36,
  40: iconSizes.icon40,
  64: iconSizes.icon64,
}

const imageSize = { ...imageSizes, true: imageSizes.image40 }

const fontSize = {
  heading1: fonts.heading1.fontSize,
  heading2: fonts.heading2.fontSize,
  heading3: fonts.heading3.fontSize,
  subheading1: fonts.subheading1.fontSize,
  subheading2: fonts.subheading2.fontSize,
  body1: fonts.body1.fontSize,
  body2: fonts.body2.fontSize,
  body3: fonts.body3.fontSize,
  buttonLabel1: fonts.buttonLabel1.fontSize,
  buttonLabel2: fonts.buttonLabel2.fontSize,
  buttonLabel3: fonts.buttonLabel3.fontSize,
  buttonLabel4: fonts.buttonLabel4.fontSize,
  monospace: fonts.monospace.fontSize,
  true: fonts.body2.fontSize,
}

const radius = { ...borderRadii, true: borderRadii.none }

const zIndex = { ...zIndices, true: zIndices.default }

export const tokens = createTokens({
  color,
  space,
  size,
  font: fontSize,
  icon: iconSize,
  image: imageSize,
  zIndex,
  radius,
})

/**
 * We have enabled allowedStyleValues: 'somewhat-strict-web' on createTamagui
 * which means our Tamagui components only accept valid tokens.
 *
 * But, sometimes we want to accept one-off values that aren't in the design system
 * especially as we migrate over.
 *
 * This basically is an empty function but its nicer than doing @ts-expect-error
 * It signifies we know this value is valid.

 */

// it would be a bit nicer if this was cast to Token
// but we'd need another new Tamagui release to support that (coming soon)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validToken = (value: string): any => value
