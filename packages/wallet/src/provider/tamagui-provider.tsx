import { useColorScheme } from 'react-native'
import { TamaguiProvider, TamaguiProviderProps } from 'ui/src'
import config from 'wallet/src/tamagui.config'

// without <NavigationProvider>
// this exported Provider is useful for tests

export function Provider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>): JSX.Element {
  const scheme = useColorScheme()
  return (
    <TamaguiProvider
      config={config}
      defaultTheme={scheme === 'dark' ? 'dark' : 'light'}
      disableInjectCSS={false /* !process.env.STORYBOOK} */}
      {...rest}>
      {children}
    </TamaguiProvider>
  )
}
