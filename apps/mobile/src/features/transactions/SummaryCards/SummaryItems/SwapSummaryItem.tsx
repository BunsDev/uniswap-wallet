import { TradeType } from '@uniswap/sdk-core'
import React, { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { SplitLogo } from 'src/components/CurrencyLogo/SplitLogo'
import { openModal } from 'src/features/modals/modalSlice'
import { getFormattedCurrencyAmount } from 'src/features/notifications/utils'
import { ModalName } from 'src/features/telemetry/constants'
import { useCurrencyInfo } from 'src/features/tokens/useCurrencyInfo'
import { useCreateSwapFormState } from 'src/features/transactions/hooks'
import { selectTransactions } from 'src/features/transactions/selectors'
import TransactionSummaryLayout, {
  TXN_HISTORY_ICON_SIZE,
} from 'src/features/transactions/SummaryCards/TransactionSummaryLayout'
import { flattenObjectOfObjects } from 'src/utils/objects'
import {
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  TransactionDetails,
  TransactionType,
} from 'wallet/src/features/transactions/types'
import { ONE_MINUTE_MS } from 'wallet/src/utils/time'

const MAX_SHOW_RETRY_TIME = 15 * ONE_MINUTE_MS

function useMostRecentSwapTx(address: Address): TransactionDetails | undefined {
  const transactions = useAppSelector(selectTransactions)
  const addressTransactions = transactions[address]
  if (addressTransactions) {
    return flattenObjectOfObjects(addressTransactions)
      .filter((tx) => tx.typeInfo.type === TransactionType.Swap)
      .sort((a, b) => b.addedTime - a.addedTime)[0]
  }
}

export default function SwapSummaryItem({
  transaction,
}: {
  transaction: TransactionDetails & {
    typeInfo: ExactOutputSwapTransactionInfo | ExactInputSwapTransactionInfo
  }
}): JSX.Element {
  const dispatch = useAppDispatch()

  const inputCurrencyInfo = useCurrencyInfo(transaction.typeInfo.inputCurrencyId)
  const outputCurrencyInfo = useCurrencyInfo(transaction.typeInfo.outputCurrencyId)

  const caption = useMemo(() => {
    if (!inputCurrencyInfo || !outputCurrencyInfo) {
      return ''
    }

    const [inputAmountRaw, outputAmountRaw] =
      transaction.typeInfo.tradeType === TradeType.EXACT_INPUT
        ? [
            transaction.typeInfo.inputCurrencyAmountRaw,
            transaction.typeInfo.expectedOutputCurrencyAmountRaw,
          ]
        : [
            transaction.typeInfo.expectedInputCurrencyAmountRaw,
            transaction.typeInfo.outputCurrencyAmountRaw,
          ]

    const { currency: inputCurrency } = inputCurrencyInfo
    const { currency: outputCurrency } = outputCurrencyInfo
    const currencyAmount = getFormattedCurrencyAmount(inputCurrency, inputAmountRaw)
    const otherCurrencyAmount = getFormattedCurrencyAmount(outputCurrency, outputAmountRaw)
    return `${currencyAmount}${inputCurrency.symbol} → ${otherCurrencyAmount}${outputCurrency.symbol}`
  }, [inputCurrencyInfo, outputCurrencyInfo, transaction.typeInfo])

  // For retrying failed, locally submitted swaps
  const swapFormState = useCreateSwapFormState(
    transaction.from,
    transaction.chainId,
    transaction.id
  )

  const latestSwapTx = useMostRecentSwapTx(transaction.from)
  const isTheLatestSwap = latestSwapTx && latestSwapTx.id === transaction.id
  // if this is the latest tx or it was added within the last 15 minutes, show the retry button
  const shouldShowRetry =
    isTheLatestSwap || Date.now() - transaction.addedTime < MAX_SHOW_RETRY_TIME

  const onRetry = useCallback(() => {
    dispatch(openModal({ name: ModalName.Swap, initialState: swapFormState }))
  }, [dispatch, swapFormState])

  return (
    <TransactionSummaryLayout
      caption={caption}
      icon={
        <SplitLogo
          chainId={transaction.chainId}
          inputCurrencyInfo={inputCurrencyInfo}
          outputCurrencyInfo={outputCurrencyInfo}
          size={TXN_HISTORY_ICON_SIZE}
        />
      }
      transaction={transaction}
      onRetry={swapFormState && shouldShowRetry ? onRetry : undefined}
    />
  )
}
