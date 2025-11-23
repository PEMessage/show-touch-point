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
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const CIRCLE_DIAMETER = 50;

export default class RedCircleExtension extends Extension {
    enable() {
        // --- 1. Mouse Cursor Handling (Polling) ---
        this._mouseCircle = this._createCircle();
        this._mouseCircle.set_position(-100, -100);

        this._timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 16, () => {
            if (!this._mouseCircle) return GLib.SOURCE_REMOVE;

            // Hide mouse circle if using touch to avoid duplicates
            if (this._touchCircles && this._touchCircles.size > 0) {
                this._mouseCircle.hide();
            } else {
                this._mouseCircle.show();
                const [x, y] = global.get_pointer();
                this._updateCirclePos(this._mouseCircle, x, y);
            }

            return GLib.SOURCE_CONTINUE;
        });

        // --- 2. Multitouch Handling (Event Listener) ---
        this._touchCircles = new Map(); // Map<number, St.Bin>

        this._eventHandlerId = global.stage.connect('captured-event', (stage, event) => {
            const type = event.type();

            // Only process actual Touch events
            if (type !== Clutter.EventType.TOUCH_BEGIN &&
                type !== Clutter.EventType.TOUCH_UPDATE &&
                type !== Clutter.EventType.TOUCH_END &&
                type !== Clutter.EventType.TOUCH_CANCEL) {
                return Clutter.EVENT_PROPAGATE;
            }

            const sequence = event.get_event_sequence();
            if (!sequence) return Clutter.EVENT_PROPAGATE;

            const slot = sequence.get_slot();

            // Handle different touch event types
            switch (type) {
                case Clutter.EventType.TOUCH_BEGIN:
                    this._handleTouchBegin(slot, event);
                    break;

                case Clutter.EventType.TOUCH_UPDATE:
                    this._handleTouchUpdate(slot, event);
                    break;

                case Clutter.EventType.TOUCH_END:
                case Clutter.EventType.TOUCH_CANCEL:
                    this._handleTouchEnd(slot);
                    break;
            }

            return Clutter.EVENT_PROPAGATE;
        });
    }

    disable() {
        // Clean up mouse timer
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }

        // Clean up mouse circle
        if (this._mouseCircle) {
            this._mouseCircle.destroy();
            this._mouseCircle = null;
        }

        // Clean up event listener
        if (this._eventHandlerId) {
            global.stage.disconnect(this._eventHandlerId);
            this._eventHandlerId = null;
        }

        // Clean up all active touch circles
        this._cleanupAllTouchCircles();
    }

    _handleTouchBegin(slot, event) {
        // CRITICAL FIX: Check if circle already exists for this slot
        if (this._touchCircles.has(slot)) {
            console.warn(`Circle already exists for touch slot ${slot}, cleaning up first`);
            this._handleTouchEnd(slot); // Clean up existing circle first
        }

        const [x, y] = event.get_coords();

        // Create new circle for this finger slot
        const circle = this._createCircle();
        this._updateCirclePos(circle, x, y);

        this._touchCircles.set(slot, circle);
        console.log(`Touch BEGIN - Slot: ${slot}, Active circles: ${this._touchCircles.size}`);
    }

    _handleTouchUpdate(slot, event) {
        const circle = this._touchCircles.get(slot);

        if (circle) {
            const [x, y] = event.get_coords();
            this._updateCirclePos(circle, x, y);
        } else {
            console.warn(`Touch UPDATE - No circle found for slot ${slot}`);
        }
    }

    _handleTouchEnd(slot) {
        const circle = this._touchCircles.get(slot);

        if (circle) {
            circle.destroy();
            this._touchCircles.delete(slot);
            console.log(`Touch END - Slot: ${slot}, Remaining circles: ${this._touchCircles.size}`);
        } else {
            console.warn(`Touch END - No circle found for slot ${slot}`);
        }
    }

    _cleanupAllTouchCircles() {
        if (this._touchCircles) {
            console.log(`Cleaning up ${this._touchCircles.size} orphaned touch circles`);
            for (const circle of this._touchCircles.values()) {
                circle.destroy();
            }
            this._touchCircles.clear();
            this._touchCircles = null;
        }
    }

    _createCircle() {
        const circle = new St.Bin({
            style: 'background-color: rgba(255, 0, 0, 0.3); border: 2px solid red; border-radius: 50%;',
            width: CIRCLE_DIAMETER,
            height: CIRCLE_DIAMETER,
            reactive: false,
        });
        Main.layoutManager.uiGroup.add_child(circle);
        return circle;
    }

    _updateCirclePos(circle, x, y) {
        circle.set_position(
            x - (CIRCLE_DIAMETER / 2),
            y - (CIRCLE_DIAMETER / 2)
        );
    }
}
