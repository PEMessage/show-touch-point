/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import Clutter from 'gi://Clutter';
import St from 'gi://St';
import GLib from 'gi://GLib'; // Import GLib for the timer
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const CIRCLE_DIAMETER = 50;

export default class RedCircleExtension extends Extension {
    enable() {
        // 1. Create the visual actor (the circle)
        this._circle = new St.Bin({
            style: 'background-color: rgba(255, 0, 0, 0.3); border: 2px solid red; border-radius: 50%;',
            width: CIRCLE_DIAMETER,
            height: CIRCLE_DIAMETER,
            reactive: false, // CRITICAL: Allows clicks to pass through
        });

        // 2. Add it to the UI group so it sits above windows
        Main.layoutManager.uiGroup.add_child(this._circle);

        // 3. Initial positioning
        this._circle.set_position(-100, -100);

        // 4. Start a timer to poll the mouse position every 16ms (~60fps)
        // This works better on X11 where event listeners might be blocked by app windows
        this._timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 16, () => {
            if (!this._circle) return GLib.SOURCE_REMOVE;

            // Get global pointer coordinates
            const [x, y] = global.get_pointer();

            // Center the circle
            this._circle.set_position(
                x - (CIRCLE_DIAMETER / 2),
                y - (CIRCLE_DIAMETER / 2)
            );

            return GLib.SOURCE_CONTINUE;
        });
    }

    disable() {
        // Stop the timer
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }

        // Destroy the circle actor
        if (this._circle) {
            this._circle.destroy();
            this._circle = null;
        }
    }
}
