import {ServiceContainer} from '@e22m4u/js-service';
import {DebuggableService as BaseDebuggableService} from '@e22m4u/js-service';

/**
 * Debugging module name.
 */
export const DEBUGGING_MODULE_NAME = 'jsHttpFileUploader';

/**
 * Debuggable service.
 */
export class DebuggableService extends BaseDebuggableService {
  /**
   * Constructor.
   *
   * @param container
   */
  constructor(container?: ServiceContainer) {
    super(container, {
      namespace: DEBUGGING_MODULE_NAME,
      noEnvironmentNamespace: true,
    });
  }
}
