import {
  init as initFbt,
  IntlVariations,
  IntlViewerContext,
} from 'fbt';
import translations from '../../i18n/translatedFbts.json';

// import continuationLocalStorage from 'continuation-local-storage';
import continuationLocalStorage from 'cls-hooked';

const DEFAULT_LOCALE = 'en_US';

export async function loadTranslations(locale: string, isNode?: boolean) {
// export async function loadTranslations(locale: string, ctx?: {state: {locale: string}}) {
  // console.log('init fbt: -- locale=', locale, 'isNode=', isNode);
  // // console.log('init fbt: -- locale=', locale, 'ctx.state.locale=', ctx && ctx.state.locale);
  // if (isNode) {
  //   console.log('init fbt: -- session locale=', continuationLocalStorage.getNamespace('session').get('locale'));
  // }
  //IntlViewerContext.locale = locale || DEFAULT_LOCALE;
  initFbt({
    translations,
    hooks: {
      getViewerContext() {
        console.log('getVC: locale = ', locale);
        // locale = ctx && ctx.state.locale || locale;
        if (!!isNode && continuationLocalStorage != null) {
          const sessionLocale = continuationLocalStorage.getNamespace('session').get('locale');
          console.log('session:sessionLocale = ', sessionLocale);
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
