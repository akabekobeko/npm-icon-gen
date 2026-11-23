/** Display the log message for the stdout. */
export default class Logger {
  #available: boolean;

  /**
   * Initialize instance.
   * @param available - "true" to display the report, default is "false".
   */
  constructor(available: boolean = false) {
    this.#available = available;
  }

  /**
   * Display a log message for the stdout.
   * @param args - Message arguments.
   */
  log(...args: unknown[]) {
    if (this.#available) {
      console.log(...args);
    }
  }

  /**
   * Display an error message for the stdout.
   * @param args - Message arguments.
   */
  error(...args: unknown[]) {
    if (this.#available) {
      console.error(...args);
    }
  }
}
