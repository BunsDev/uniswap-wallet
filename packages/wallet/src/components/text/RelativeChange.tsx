import { ColorTokens, Flex, Text, XStack } from 'ui/src'
import { fonts, iconSizes } from 'ui/src/theme'
import { formatNumber, NumberType } from 'utilities/src/format/format'
import { Caret } from 'wallet/src/components/icons/Caret'

interface RelativeChangeProps {
  change?: number
  absoluteChange?: number
  variant?: keyof typeof fonts
  semanticColor?: boolean // If true, entire % change text will render green or red
  positiveChangeColor?: ColorTokens
  negativeChangeColor?: ColorTokens
  arrowSize?: number
  loading?: boolean
  alignRight?: boolean
}

export function RelativeChange(props: RelativeChangeProps): JSX.Element {
  const {
    absoluteChange,
    change,
    variant = 'subheadSmall',
    semanticColor,
    positiveChangeColor = '$statusSuccess',
    negativeChangeColor = '$statusCritical',
    arrowSize = iconSizes.icon16,
    loading = false,
    alignRight = false,
  } = props

  const isPositiveChange = change !== undefined ? change >= 0 : undefined
  const arrowColor = isPositiveChange ? positiveChangeColor : negativeChangeColor

  const formattedChange = change !== undefined ? `${Math.abs(change).toFixed(2)}%` : '-'
  const formattedAbsChange = absoluteChange
    ? `${formatNumber(Math.abs(absoluteChange), NumberType.PortfolioBalance)}`
    : ''

  return (
    <XStack
      alignItems="center"
      gap="$spacing2"
      justifyContent={alignRight ? 'flex-end' : 'flex-start'}>
      {change !== undefined && (
        <Caret color={arrowColor} direction={isPositiveChange ? 'n' : 's'} size={arrowSize} />
      )}
      <Flex>
        <Text
          color={
            semanticColor ? (isPositiveChange ? '$statusSuccess' : '$statusCritical') : '$neutral2'
          }
          loading={loading}
          loadingPlaceholderText="$0.00 (0.00)%"
          variant={variant}>
          {absoluteChange ? `${formattedAbsChange} (${formattedChange})` : formattedChange}
        </Text>
      </Flex>
    </XStack>
  )
}
