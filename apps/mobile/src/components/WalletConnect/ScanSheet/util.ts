import { parseUri } from '@walletconnect/utils'
import { isValidWCUrl } from 'src/features/walletConnect/WalletConnect'
import { getValidAddress } from 'wallet/src/utils/addresses'

export enum URIType {
  WalletConnectURL = 'walletconnect',
  WalletConnectV2URL = 'walletconnect-v2',
  Address = 'address',
  EasterEgg = 'easter-egg',
}

export type URIFormat = {
  type: URIType
  value: string
}

const EASTER_EGG_QR_CODE = 'DO_NOT_SCAN_OR_ELSE_YOU_WILL_GO_TO_MOBILE_TEAM_JAIL'
const CUSTOM_UNI_QR_CODE_PREFIX = 'hello_uniwallet:'
const MAX_DAPP_NAME_LENGTH = 60

export function truncateDappName(name: string): string {
  return name.length > MAX_DAPP_NAME_LENGTH ? `${name.slice(0, MAX_DAPP_NAME_LENGTH)}...` : name
}

export async function getSupportedURI(uri: string): Promise<URIFormat | undefined> {
  if (!uri) {
    return undefined
  }

  const maybeAddress = getValidAddress(uri, /*withChecksum=*/ true, /*log=*/ false)
  if (maybeAddress) {
    return { type: URIType.Address, value: maybeAddress }
  }

  const maybeMetamaskAddress = getMetamaskAddress(uri)
  if (maybeMetamaskAddress) {
    return { type: URIType.Address, value: maybeMetamaskAddress }
  }

  // The hello_uniwallet check must be before the parseUri version 2 check because
  // parseUri(hello_uniwallet:[valid_wc_uri]) also returns version 2
  const { uri: maybeCustomWcUri, type } = (await getCustomUniswapWcCode(uri)) || {}
  if (maybeCustomWcUri && type) {
    return { type, value: maybeCustomWcUri }
  }

  if (await isValidWCUrl(uri)) {
    return { type: URIType.WalletConnectURL, value: uri }
  }

  if (parseUri(uri).version === 2) {
    return { type: URIType.WalletConnectV2URL, value: uri }
  }

  if (uri === EASTER_EGG_QR_CODE) {
    return { type: URIType.EasterEgg, value: uri }
  }
}

async function getCustomUniswapWcCode(uri: string): Promise<{ uri: string; type: URIType } | null> {
  if (uri.indexOf(CUSTOM_UNI_QR_CODE_PREFIX) !== 0) {
    return null
  }

  const maybeWcUri = uri.slice(CUSTOM_UNI_QR_CODE_PREFIX.length)

  if (await isValidWCUrl(maybeWcUri)) {
    return { uri: maybeWcUri, type: URIType.WalletConnectURL }
  }

  if (parseUri(maybeWcUri).version === 2) {
    return { uri: maybeWcUri, type: URIType.WalletConnectV2URL }
  }

  return null
}

// metamask QR code values have the format "ethereum:<address>"
function getMetamaskAddress(uri: string): Nullable<string> {
  const uriParts = uri.split(':')
  if (uriParts.length < 2) {
    return null
  }

  return getValidAddress(uriParts[1], /*withChecksum=*/ true, /*log=*/ false)
}
