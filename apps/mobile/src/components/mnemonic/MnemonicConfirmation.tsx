import React from 'react'
import { requireNativeComponent, StyleProp, ViewProps } from 'react-native'
import { BoxProps } from 'src/components/layout/Box'
import { dimensions } from 'ui/src/theme'

interface NativeMnemonicConfirmationProps {
  mnemonicId: Address
  shouldShowSmallText: boolean
  onConfirmComplete: () => void
}

const NativeMnemonicConfirmation =
  requireNativeComponent<NativeMnemonicConfirmationProps>('MnemonicConfirmation')

type MnemonicConfirmationProps = ViewProps & {
  mnemonicId: Address
  onConfirmComplete: () => void
}

const mnemonicConfirmationStyle: StyleProp<BoxProps> = {
  flex: 1,
  flexGrow: 1,
}

export function MnemonicConfirmation(props: MnemonicConfirmationProps): JSX.Element {
  const shouldShowSmallText = dimensions.fullHeight < 700

  return (
    <NativeMnemonicConfirmation
      shouldShowSmallText={shouldShowSmallText}
      style={mnemonicConfirmationStyle}
      {...props}
    />
  )
}
