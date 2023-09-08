import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useAppDispatch, useAppTheme } from 'src/app/hooks'
import { OnboardingStackParamList } from 'src/app/navigation/types'
import { TouchableArea } from 'src/components/buttons/TouchableArea'
import { Flex } from 'src/components/layout'
import { Text } from 'src/components/Text'
import Trace from 'src/components/Trace/Trace'
import { IS_ANDROID } from 'src/constants/globals'
import { isCloudStorageAvailable } from 'src/features/CloudBackup/RNCloudStorageBackupsManager'
import { OnboardingScreen } from 'src/features/onboarding/OnboardingScreen'
import { OptionCard } from 'src/features/onboarding/OptionCard'
import { ImportType, OnboardingEntryPoint } from 'src/features/onboarding/utils'
import { ElementName } from 'src/features/telemetry/constants'
import { OnboardingScreens } from 'src/screens/Screens'
import { openSettings } from 'src/utils/linking'
import { useAddBackButton } from 'src/utils/useAddBackButton'
import EyeIcon from 'ui/src/assets/icons/eye.svg'
import ImportIcon from 'ui/src/assets/icons/paper-stack.svg'
import { AppTFunction } from 'ui/src/i18n/types'
import { Theme } from 'ui/src/theme/restyle'
import {
  PendingAccountActions,
  pendingAccountActions,
} from 'wallet/src/features/wallet/create/pendingAccountsSaga'

interface ImportMethodOption {
  title: (t: AppTFunction) => string
  blurb: (t: AppTFunction) => string
  icon: (theme: Theme) => React.ReactNode
  nav: OnboardingScreens
  importType: ImportType
  name: ElementName
  badgeText?: (t: AppTFunction) => string
}

const options: ImportMethodOption[] = [
  {
    title: (t: AppTFunction) => t('Import a wallet'),
    blurb: (t: AppTFunction) => t('Enter your recovery phrase from another crypto wallet'),
    icon: (theme: Theme) => (
      <ImportIcon color={theme.colors.accent1} height={18} strokeWidth="1.5" width={18} />
    ),
    nav: OnboardingScreens.SeedPhraseInput,
    importType: ImportType.SeedPhrase,
    name: ElementName.OnboardingImportSeedPhrase,
    badgeText: (t: AppTFunction) => t('Recommended'),
  },
  {
    title: (t: AppTFunction) => t('Watch a wallet'),
    blurb: (t: AppTFunction) =>
      t('Explore the contents of a wallet by entering any address or ENS name '),
    icon: (theme: Theme) => (
      <EyeIcon color={theme.colors.accent1} height={24} strokeWidth="1.5" width={24} />
    ),
    nav: OnboardingScreens.WatchWallet,
    importType: ImportType.Watch,
    name: ElementName.OnboardingImportWatchedAccount,
  },
]

type Props = NativeStackScreenProps<OnboardingStackParamList, OnboardingScreens.ImportMethod>

export function ImportMethodScreen({ navigation, route: { params } }: Props): JSX.Element {
  const { t } = useTranslation()
  const theme = useAppTheme()
  const dispatch = useAppDispatch()
  const entryPoint = params?.entryPoint

  useAddBackButton(navigation)

  const handleOnPressRestoreBackup = async (): Promise<void> => {
    const cloudStorageAvailable = await isCloudStorageAvailable()

    if (!cloudStorageAvailable) {
      Alert.alert(
        IS_ANDROID ? t('Google Drive not available') : t('iCloud Drive not available'),
        IS_ANDROID
          ? t(
              'Please verify that you are logged in to a Google account with Google Drive enabled on this device and try again.'
            )
          : t(
              'Please verify that you are logged in to an Apple ID with iCloud Drive enabled on this device and try again.'
            ),
        [
          { text: t('Go to settings'), onPress: openSettings, style: 'default' },
          { text: t('Not now'), style: 'cancel' },
        ]
      )
      return
    }

    navigation.navigate({
      name: OnboardingScreens.RestoreCloudBackupLoading,
      params: { importType: ImportType.Restore, entryPoint },
      merge: true,
    })
  }

  const handleOnPress = async (nav: OnboardingScreens, importType: ImportType): Promise<void> => {
    // Delete any pending accounts before entering flow.
    dispatch(pendingAccountActions.trigger(PendingAccountActions.Delete))

    if (importType === ImportType.Restore) {
      await handleOnPressRestoreBackup()
      return
    }

    navigation.navigate({
      name: nav,
      params: { importType, entryPoint },
      merge: true,
    })
  }

  const importOptions =
    entryPoint === OnboardingEntryPoint.Sidebar
      ? options.filter((option) => option.name !== ElementName.OnboardingImportWatchedAccount)
      : options

  return (
    <OnboardingScreen title={t('How do you want to add your wallet?')}>
      <Flex grow gap="spacing12" marginTop="spacing4">
        {importOptions.map(({ title, blurb, icon, nav, importType, name, badgeText }) => (
          <OptionCard
            key={'connection-option-' + title}
            hapticFeedback
            badgeText={badgeText?.(t)}
            blurb={blurb(t)}
            elementName={name}
            icon={icon(theme)}
            title={title(t)}
            onPress={(): Promise<void> => handleOnPress(nav, importType)}
          />
        ))}
      </Flex>
      <Trace logPress element={ElementName.OnboardingImportBackup}>
        <TouchableArea alignItems="center" mb="spacing12">
          <Text
            color="accent1"
            variant="buttonLabelMedium"
            onPress={(): Promise<void> =>
              handleOnPress(OnboardingScreens.RestoreCloudBackup, ImportType.Restore)
            }>
            {IS_ANDROID ? t('Restore from Google Drive') : t('Restore from iCloud')}
          </Text>
        </TouchableArea>
      </Trace>
    </OnboardingScreen>
  )
}
