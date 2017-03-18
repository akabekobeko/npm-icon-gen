'use strict'

/**
 * Display the log message for the stdout.
 */
class Logger {
  /**
   * Initialize instance.
   *
   * @param {Boolean} available "true" to display the report, default is "false".
   */
  constructor (available) {
    this._available = available
  }

  /**
   * Display a log message for the stdout.
   *
   * @param {Array.<Object>} message Message arguments.
   */
  log (message) {
    if (this._available) {
      console.log(message)
    }
  }

  /**
   * Display an error message for the stdout.
   *
   * @param {Array.<Object>} message Message arguments.
   */
  error (message) {
    if (this._available) {
      console.error(message)
    }
  }
}

module.exports = Logger
