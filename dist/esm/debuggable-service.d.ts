import { ServiceContainer } from '@e22m4u/js-service';
import { DebuggableService as BaseDebuggableService } from '@e22m4u/js-service';
/**
 * Debugging module name.
 */
export declare const DEBUGGING_MODULE_NAME = "jsHttpFileUploader";
/**
 * Debuggable service.
 */
export declare class DebuggableService extends BaseDebuggableService {
    /**
     * Constructor.
     *
     * @param container
     */
    constructor(container?: ServiceContainer);
}
