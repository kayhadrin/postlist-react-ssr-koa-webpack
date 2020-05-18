import {
  init as initFbt,
  IntlVariations,
  IntlViewerContext,
} from 'fbt';
import translations from '../../i18n/translatedFbts.json';

import continuationLocalStorage from 'cls-hooked';

const DEFAULT_LOCALE = 'en_US';

export async function loadTranslations(locale: string, isNode?: boolean) {
  initFbt({
    translations,
    hooks: {
      getViewerContext() {
        if (!!isNode) {
          if (continuationLocalStorage == null) {
            throw new Error('continuationLocalStorage library must be defined. '
              + 'Are you running this code in a browser?');
          }
          const sessionLocale = continuationLocalStorage.getNamespace('session').get('locale');
          if (!sessionLocale) {
            throw new Error('Unknown sessionLocale');
          }
          locale = sessionLocale;
        }
        return {
          GENDER: IntlVariations.GENDER_UNKNOWN,
          locale: locale || DEFAULT_LOCALE
        };
      }
    }
  });
}
