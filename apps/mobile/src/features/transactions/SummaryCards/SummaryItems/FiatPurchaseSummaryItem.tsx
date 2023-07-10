import React from 'react'
import { useTranslation } from 'react-i18next'
import { LogoWithTxStatus } from 'src/components/CurrencyLogo/LogoWithTxStatus'
import TransactionSummaryLayout, {
  TXN_HISTORY_ICON_SIZE,
} from 'src/features/transactions/SummaryCards/TransactionSummaryLayout'
import { AssetType } from 'wallet/src/entities/assets'
import { useCurrencyInfo } from 'wallet/src/features/tokens/useCurrencyInfo'
import {
  FiatPurchaseTransactionInfo,
  TransactionDetails,
} from 'wallet/src/features/transactions/types'
import { buildCurrencyId } from 'wallet/src/utils/currencyId'
import { formatFiatPrice, formatNumber } from 'wallet/src/utils/format'

export default function FiatPurchaseSummaryItem({
  transaction,
}: {
  transaction: TransactionDetails & { typeInfo: FiatPurchaseTransactionInfo }
}): JSX.Element {
  const { t } = useTranslation()

  const { chainId, typeInfo } = transaction
  const { inputCurrency, inputCurrencyAmount, outputCurrency, outputCurrencyAmount } = typeInfo

  const outputCurrencyInfo = useCurrencyInfo(
    outputCurrency?.metadata.contractAddress
      ? buildCurrencyId(chainId, outputCurrency?.metadata.contractAddress)
      : undefined
  )

  const fiatPurchaseAmount = formatFiatPrice(
    inputCurrencyAmount && inputCurrencyAmount > 0 ? inputCurrencyAmount : undefined,
    inputCurrency?.code
  )

  const symbol = outputCurrencyInfo?.currency.symbol ?? t('unknown token')

  return (
    <TransactionSummaryLayout
      caption={
        outputCurrencyAmount !== undefined && outputCurrencyAmount !== null
          ? t('{{cryptoAmount}} for {{fiatAmount}}', {
              cryptoAmount: formatNumber(outputCurrencyAmount) + ' ' + symbol,
              fiatAmount: fiatPurchaseAmount,
            })
          : fiatPurchaseAmount
      }
      icon={
        <LogoWithTxStatus
          assetType={AssetType.Currency}
          chainId={transaction.chainId}
          currencyInfo={outputCurrencyInfo}
          size={TXN_HISTORY_ICON_SIZE}
          txStatus={transaction.status}
          txType={transaction.typeInfo.type}
        />
      }
      transaction={transaction}
    />
  )
}
