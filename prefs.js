/* prefs.js
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

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ShowTouchPointPreferences extends ExtensionPreferences {
    getPreferencesWidget() {
        const settings = this.getSettings('org.gnome.shell.extensions.showtouchpoint');

        // Create the Adw preferences page
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'Display Settings',
            description: 'Configure touchpoint visualization options',
        });
        page.add(group);

        // Toggle for showing mouse cursor
        const mouseRow = new Adw.SwitchRow({
            title: 'Show Mouse Cursor',
            subtitle: 'Display a red circle around the mouse cursor',
        });
        settings.bind('show-mouse', mouseRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        group.add(mouseRow);

        // Toggle for showing touch circles
        const touchRow = new Adw.SwitchRow({
            title: 'Show Touch Circles',
            subtitle: 'Display red circles for touch input',
        });
        settings.bind('show-touch', touchRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        group.add(touchRow);

        return page;
    }
}
