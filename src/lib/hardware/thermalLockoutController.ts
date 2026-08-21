// Client-side half of the thermal safety lockout. Wraps an AbortController so
// a WebUSB/WebSerial read loop can be cancelled the instant the server (or a
// local threshold check) reports a 45C lockout, and exposes a hook for
// issuing the hardware kill-signal to cut VBUS.
//
// UNVERIFIED: this has not been tested against physical bench hardware in
// this session — there is no WebUSB/WebSerial device connected here to
// confirm the abort actually reaches the interface in time, or that a real
// power-delivery chip on the other end honors a kill-signal shaped like
// `cutVbus`. Treat this as a contract to implement against, not a verified
// safety system, until it's been run on the bench.

import { THERMAL_LOCKOUT_THRESHOLD_C, isThermalLockoutTriggered } from '../faultTriangulation.ts';

export interface ThermalLockoutOptions {
  /** Called once, synchronously, the moment a lockout is triggered — this is
   * where the caller should invoke its hardware kill-signal (cut VBUS). */
  onLockout: (thermalReading: number) => void | Promise<void>;
}

export class ThermalLockoutController {
  private readonly abortController = new AbortController();
  private readonly onLockout: ThermalLockoutOptions['onLockout'];
  private tripped = false;

  constructor(options: ThermalLockoutOptions) {
    this.onLockout = options.onLockout;
  }

  get signal(): AbortSignal {
    return this.abortController.signal;
  }

  get isTripped(): boolean {
    return this.tripped;
  }

  /** Feed each thermocouple reading through this as it arrives from the
   * WebSerial loop. Aborts the signal and fires onLockout on first trip. */
  async evaluate(thermalReading: number): Promise<boolean> {
    if (this.tripped) return true;
    if (!isThermalLockoutTriggered(thermalReading)) return false;

    this.tripped = true;
    this.abortController.abort(new Error(`Thermal lockout: ${thermalReading}C >= ${THERMAL_LOCKOUT_THRESHOLD_C}C`));
    await this.onLockout(thermalReading);
    return true;
  }
}
