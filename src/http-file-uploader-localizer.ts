import {Localizer} from '@e22m4u/js-localizer';
import {ServiceContainer} from '@e22m4u/js-service';
import {LocalizerOptions} from '@e22m4u/js-localizer';
import en from './locales/en.json' with {type: 'json'};
import ru from './locales/ru.json' with {type: 'json'};

/**
 * Http file uploader localizer.
 */
export class HttpFileUploaderLocalizer extends Localizer {
  /**
   * Constructor.
   *
   * @param container
   * @param options
   */
  constructor(container?: ServiceContainer, options?: LocalizerOptions) {
    super(container, {
      dictionaries: {en, ru},
      ...options,
    });
  }
}
