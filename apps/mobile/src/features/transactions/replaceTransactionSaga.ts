import { BigNumber, providers } from 'ethers'
import { appSelect } from 'src/app/hooks'
import { i18n } from 'src/app/i18n'
import { signAndSendTransaction } from 'src/features/transactions/sendTransactionSaga'
import { addTransaction, deleteTransaction } from 'src/features/transactions/slice'
import {
  createTransactionId,
  getSerializableTransactionRequest,
} from 'src/features/transactions/utils'
import { call, put } from 'typed-redux-saga'
import { logger } from 'wallet/src/features/logger/logger'
import { pushNotification } from 'wallet/src/features/notifications/slice'
import { AppNotificationType } from 'wallet/src/features/notifications/types'
import { TransactionDetails, TransactionStatus } from 'wallet/src/features/transactions/types'
import { getProvider, getSignerManager } from 'wallet/src/features/wallet/context'
import { selectAccounts } from 'wallet/src/features/wallet/selectors'
import { getValidAddress } from 'wallet/src/utils/addresses'
import serializeError from 'wallet/src/utils/serializeError'

export function* attemptReplaceTransaction(
  transaction: TransactionDetails,
  newTxRequest: providers.TransactionRequest,
  isCancellation = false
) {
  const { chainId, hash, options } = transaction
  logger.debug('replaceTransaction', '', 'Attempting tx replacement', hash)
  const replacementTxnId = createTransactionId()

  try {
    const { from, nonce } = options.request
    if (!from || !nonce || !BigNumber.from(nonce).gte(0)) {
      throw new Error(`Cannot replace invalid transaction: ${hash}`)
    }

    const accounts = yield* appSelect(selectAccounts)
    const checksummedAddress = getValidAddress(from, true, false)
    if (!checksummedAddress) {
      throw new Error(`Cannot replace transaction, address is invalid: ${checksummedAddress}`)
    }
    const account = accounts[checksummedAddress]
    if (!account) {
      throw new Error(`Cannot replace transaction, account missing: ${hash}`)
    }

    const request: providers.TransactionRequest = {
      ...newTxRequest,
      from,
      nonce,
    }

    const provider = yield* call(getProvider, chainId)
    const signerManager = yield* call(getSignerManager)

    const { transactionResponse, populatedRequest } = yield* call(
      signAndSendTransaction,
      request,
      account,
      provider,
      signerManager
    )
    logger.debug('replaceTransaction', '', 'Tx submitted. New hash:', transactionResponse.hash)

    const replacementTransaction: TransactionDetails = {
      ...transaction,
      // Ensure we create a new, unique txn to monitor
      id: replacementTxnId,
      hash: transactionResponse.hash,
      status: isCancellation ? TransactionStatus.Cancelling : TransactionStatus.Pending,
      receipt: undefined,
      addedTime: Date.now(), // update timestamp to now
      options: {
        ...options,
        request: getSerializableTransactionRequest(populatedRequest, chainId),
      },
    }

    // Add new transaction for monitoring after submitting on chain
    yield* put(addTransaction(replacementTransaction))
  } catch (error) {
    logger.error('Unable to replace transaction', {
      tags: {
        file: 'replaceTransactionSaga',
        function: 'attemptReplaceTransaction',
        txHash: hash,
        error: serializeError(error),
      },
    })

    // Unable to submit txn on chain, delete from state. This can sometimes be the case where we
    // attempt to replace a txn that has already been mined. Delete new txn in case it was added
    yield* put(
      deleteTransaction({
        address: transaction.from,
        id: replacementTxnId,
        chainId: transaction.chainId,
      })
    )

    yield* put(
      pushNotification({
        type: AppNotificationType.Error,
        address: transaction.from,
        errorMessage: isCancellation
          ? i18n.t('Unable to cancel transaction')
          : i18n.t('Unable to replace transaction'),
      })
    )
  }
}
