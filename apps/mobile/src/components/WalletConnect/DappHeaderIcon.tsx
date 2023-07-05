import { useTheme } from '@shopify/restyle'
import React from 'react'
import { StyleSheet } from 'react-native'
import { CurrencyLogo } from 'src/components/CurrencyLogo'
import { NetworkLogo } from 'src/components/CurrencyLogo/NetworkLogo'
import { ImageUri } from 'src/components/images/ImageUri'
import { Box, Flex } from 'src/components/layout'
import { Text } from 'src/components/Text'
import { borderRadii } from 'ui/src/theme/borderRadii'
import { iconSizes } from 'ui/src/theme/iconSizes'
import { CurrencyInfo } from 'wallet/src/features/dataApi/types'
import { DappInfo } from 'wallet/src/features/walletConnect/types'
import { toSupportedChainId } from 'wallet/src/utils/chainId'

export function DappHeaderIcon({
  dapp,
  permitCurrencyInfo,
  showChain = true,
}: {
  dapp: DappInfo
  permitCurrencyInfo?: CurrencyInfo | null
  showChain?: boolean
}): JSX.Element {
  if (permitCurrencyInfo) {
    return <CurrencyLogo currencyInfo={permitCurrencyInfo} />
  }

  const chainId = dapp.version === '1' ? toSupportedChainId(dapp.chain_id) : null

  const fallback = <DappIconPlaceholder iconSize={iconSizes.icon40} name={dapp.name} />

  return (
    <Box height={iconSizes.icon40} width={iconSizes.icon40}>
      {dapp.icon ? (
        <ImageUri
          fallback={fallback}
          imageStyle={DappIconPlaceholderStyles.icon}
          loadingContainerStyle={{
            ...DappIconPlaceholderStyles.icon,
            ...DappIconPlaceholderStyles.loading,
          }}
          uri={dapp.icon}
        />
      ) : (
        fallback
      )}
      {showChain && chainId && (
        <Box bottom={-4} position="absolute" right={-4}>
          <NetworkLogo chainId={chainId} />
        </Box>
      )}
    </Box>
  )
}

export function DappIconPlaceholder({
  name,
  iconSize,
}: {
  name: string
  iconSize: number
}): JSX.Element {
  const theme = useTheme()

  return (
    <Flex
      centered
      row
      backgroundColor="background3"
      borderRadius="roundedFull"
      flex={1}
      height={iconSize}
      width={iconSize}>
      <Text
        color="textSecondary"
        textAlign="center"
        variant={iconSize >= theme.iconSizes.icon40 ? 'subheadLarge' : 'bodySmall'}>
        {name.length > 0 ? name.charAt(0) : ' '}
      </Text>
    </Flex>
  )
}

const DappIconPlaceholderStyles = StyleSheet.create({
  icon: { borderRadius: borderRadii.rounded4, height: iconSizes.icon40, width: iconSizes.icon40 },
  loading: { borderRadius: borderRadii.roundedFull, overflow: 'hidden' },
})
