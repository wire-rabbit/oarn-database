//  The OARN Relief Nursery Database
//  Copyright (C) 2015  Oregon Association of Relief Nurseries
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU Affero General Public License as
//  published by the Free Software Foundation, either version 3 of the
//  License, or (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU Affero General Public License for more details.
//
//  You should have received a copy of the GNU Affero General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

(function (enyo, scope) {

	/**
	 * {@link oarn.SelectItem} defines a single item in a list that draws its value from a select menu.
	 * It initially is displayed as a simple label, showing the selected value. When tapped, it becomes
	 * a select list, its items drawn from a collection.
	 *
	 * @class oarn.SelectItem
	 * @extends enyo.Control
	 * @public
	 * @ui
	 *
	 */
	enyo.kind(
		/** @lends oarn.SelectItem.prototype */{

		/**
		 * @private
		 */
		name: 'oarn.SelectItem',

		/**
		 * @private
		 */
		kind: 'enyo.Control',

		components: [
			{name: 'itemLabel', content: 'foo', ontap: 'toggleVisibility'},
			{name: 'itemSelect', kind: 'enyo.Select', classes: 'oarn-control',
				onblur: 'toggleVisibility', components: [
				{content: 'one'},
				{content: 'two'},
				{content: 'three'}
			]}
		],

		/**
		 * @private
		 */
		create: function () {
			this.inherited(arguments);
			this.$.itemSelect.hide();
		},


		toggleVisibility: function (inSender, inEvent) {
			enyo.log('toggling');
			if (this.get('.$.itemLabel.showing')) {
				this.$.itemLabel.hide();
				this.$.itemSelect.show();
			} else {
				this.$.itemLabel.show();
				this.$.itemSelect.hide();
			}
		}

	});

})(enyo, this);