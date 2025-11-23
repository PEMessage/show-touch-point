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
            reactive: false, // CRITICAL: Allows clicks to pass through the circle to windows below
        });

        // 2. Add it to the UI group so it sits above standard windows
        Main.layoutManager.uiGroup.add_child(this._circle);

        // 3. Initial positioning (hide it off-screen until mouse moves or set to 0,0)
        this._circle.set_position(-100, -100);

        // 4. Connect to the global stage to track mouse movement
        this._handlerId = global.stage.connect('captured-event', (stage, event) => {
            const type = event.type();

            // Update position on motion or touch update
            if (type === Clutter.EventType.MOTION) {
                const [x, y] = event.get_coords();

                // Center the circle on the cursor
                this._circle.set_position(
                    x - (CIRCLE_DIAMETER / 2),
                    y - (CIRCLE_DIAMETER / 2)
                );
            }

            // Always propagate the event so the OS handles the actual mouse input
            return Clutter.EVENT_PROPAGATE;
        });
    }

    disable() {
        // Clean up the event listener
        if (this._handlerId) {
            global.stage.disconnect(this._handlerId);
            this._handlerId = null;
        }

        // Destroy the circle actor
        if (this._circle) {
            this._circle.destroy();
            this._circle = null;
        }
    }
}
