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
	 * {@link oarn.DataSelect} is a simple select list bound to a collection 'options_list'.
	 *
	 * Use setSelected(i) to change which option is selected, where i is the index in the collection.
	 *
	 * @class oarn.DataSelect
	 * @extends enyo.Select
	 * @public
	 * @ui
	 */

	enyo.kind(
		/** @lends oarn.DataSelect.prototype */{

		name: 'oarn.DataSelect',

		kind: 'enyo.Select',

		/**
		 * @public
		 * @lends oarn.DataSelect.prototype
		 */
		published: {
			/**
			 * An enyo collection, initialized in create, that is used to populate the select list.
			 *
			 * @public
			 * @type {object}
			 */
			options_list: null,

			/**
			 * The index in the options_list collection that will be selected initially.
			 * The *MUST* be set prior to setting the options list in order to work.
			 *
			 * @public
			 * @type {number}
			 */
			selectedIndex: 0
		},

		/**
		 * @private
		 */
		handlers: {
			add: 'optionsAdded'
		},

		components: [
			// dynamically populated
		],

		/**
		 * @private
		 */
		create: function () {
			this.inherited(arguments);

			this.options_list = new enyo.Collection();
			this.options_list.addListener('add', enyo.bindSafely(this, 'optionsAdded'));
		},

		/**
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		optionsAdded: function (inSender, inEvent) {
			this.destroyClientControls();
			for (var i = 0; i < this.options_list.length; i++) {
				if (i == this.get('.selectedIndex')) {
					this.createComponent(
						{
							tag:'option',
							content: this.options_list.at(i).get('display_text'),
							value: this.options_list.at(i).get('value'),
							selected: true
						}
					)
				}
				else {
					this.createComponent(
						{
							tag:'option',
							content: this.options_list.at(i).get('display_text'),
							value: this.options_list.at(i).get('value')
						}
					)
				}

			}
			this.render();
		},

		selectedItemChanged: function (inOld) {
			this.setSelected(this.get('.selectedItem'));
		},

		/**
		 *  Enyo 2.5.1 suffers from a bug that prevents retrieval of the current value
		 *  after it is programmatically set. It appears to be fixed in 2.6.0-pre.4, but
		 *  lacking time to port the whole application, this function and the next will
		 *  have to do. See: https://enyojs.atlassian.net/browse/ENYO-4132
		 */
		getSelectedItem: function () {
			return $('#' + this.id).val();
		},

		setSelectedItem: function (val) {
			$('#' + this.id).val(val);
		}

	});

})(enyo, this);