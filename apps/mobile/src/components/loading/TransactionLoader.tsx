import React from 'react'
import { Flex, Text } from 'ui/src'
import { TXN_HISTORY_ICON_SIZE } from 'wallet/src/features/transactions/SummaryCards/utils'

interface TransactionLoaderProps {
  opacity: number
}

export function TransactionLoader({ opacity }: TransactionLoaderProps): JSX.Element {
  return (
    <Flex opacity={opacity} overflow="hidden" sentry-label="TransactionLoader">
      <Flex
        grow
        row
        alignItems="flex-start"
        gap="$spacing16"
        justifyContent="space-between"
        py="$spacing12">
        <Flex
          row
          shrink
          alignItems="center"
          gap="$spacing12"
          height="100%"
          justifyContent="flex-start">
          <Flex
            centered
            bg="$surface3"
            borderRadius="$roundedFull"
            height={TXN_HISTORY_ICON_SIZE}
            width={TXN_HISTORY_ICON_SIZE}
          />
          <Flex shrink>
            <Flex row alignItems="center" gap="$spacing4">
              <Text
                loading
                loadingPlaceholderText="Contract Interaction"
                numberOfLines={1}
                variant="body1"
              />
            </Flex>
            <Text
              loading
              color="$neutral2"
              loadingPlaceholderText="Caption Text"
              numberOfLines={1}
              variant="subheading2"
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
