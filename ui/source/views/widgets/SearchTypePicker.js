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
	 * Fires when a new menu item is selected.
	 *
	 * @event oarn.SearchTypePicker#onSelect
	 * @type {object}
	 * @public
	 */

	/**
	 * {@link oarn.SearchTypePicker} is a select list for menu bars that alters its
	 * visible title based on the item selected. (A cross between a picker and a select list.)
	 *
	 * @class oarn.SearchTypePicker
	 * @extends enyo.Control
	 * @ui
	 * @public
	 */
	enyo.kind(
		/** @lends @oarn.SearchTypePicker.prototype */{

		/**
		 * @private
		 */
		name: 'oarn.SearchTypePicker',


		/**
		 * @lends @oarn.SearchTypePicker.prototype
		 * @public
		 */
		published: {
			/**
			 * The initial title of the menu.
			 *
			 * @type {string}
			 * @default ''
			 */
			initialTitle: '',

			/**
			 * The value selected from the menu. May be: 'adult_id', 'adult_first_name',
			 * 'adult_last_name', 'child_id', 'child_first_name', or 'child_last_name'
			 *
			 * @type {string}
			 * @default ''
			 */
			selectedItem: '',

            /**
             * If true, hides options not available in the waitlist.
             */
            waitlist: false
		},

		/**
		 * @private
		 */
		components: [
			{kind: 'onyx.MenuDecorator', onSelect: 'itemSelected', components: [
				{name: 'menuTitle', content: 'Family by ID'},
				{kind: 'onyx.Menu', maxHeight: 400, components: [
					{name: 'familyByID', content: 'Family by ID'},
					{name: 'divider1', classes: 'onyx-menu-divider'},
					{name: 'childByID', content: 'Child by ID'},
					{name: 'childByFullName', content: 'Child by full name'},
					{name: 'childByLastName', content: 'Child by last name'},
					{name: 'childByFirstName', content: 'Child by first name'},
					{name: 'divider2', classes: 'onyx-menu-divider'},
					{content: 'Adult by ID'},
					{content: 'Adult by full name'},
					{content: 'Adult by last name'},
					{content: 'Adult by first name'},
					{name: 'divider3', classes: 'onyx-menu-divider'},
					{name: 'childFuzzySearch', content: 'Child fuzzy search'},
					{content: 'Adult fuzzy search'}
				]}
			]}
		],

		create: function () {
			this.inherited(arguments);

			this.set('.selectedItem', 'family_id');
		},

        rendered: function() {
            this.inherited(arguments);
            if (this.get('.waitlist')) {
                this.set('.selectedItem', 'adult_id');
                this.set('.$.menuTitle.content', 'Adult by ID');
                this.$.familyByID.hide();
                this.$.divider1.hide();
                this.$.childByID.hide();
                this.$.childByFullName.hide();
                this.$.childByLastName.hide();
                this.$.childByFirstName.hide();
                this.$.divider2.hide();
                this.$.divider3.hide();
                this.$.childFuzzySearch.hide();
            }
        },

		/**
		 * @private
		 * @param inSender
		 * @param inEvent
		 * @returns {boolean}
		 */
		itemSelected: function (inSender, inEvent) {
			if (inEvent.originator.content) {
				this.set('.$.menuTitle.content', inEvent.originator.content);

				if (inEvent.originator.content == 'Family by ID') {
					this.set('.selectedItem', 'family_id')
				}
				if (inEvent.originator.content == 'Child fuzzy search') {
					this.set('.selectedItem', 'child_fuzzy')
				}
				if (inEvent.originator.content == 'Adult fuzzy search') {
					this.set('.selectedItem', 'adult_fuzzy')
				}
				if (inEvent.originator.content == 'Child by ID') {
					this.set('.selectedItem', 'child_id');
				}
				else if (inEvent.originator.content == 'Child by full name') {
					this.set('.selectedItem', 'child_full_name');
				}
				else if (inEvent.originator.content == 'Child by last name') {
					this.set('.selectedItem', 'child_last_name');
				}
				else if (inEvent.originator.content == 'Child by first name') {
					this.set('.selectedItem', 'child_first_name');
				}
				else if (inEvent.originator.content == 'Adult by ID') {
					this.set('.selectedItem', 'adult_id');
				}
				else if (inEvent.originator.content == 'Adult by full name') {
					this.set('.selectedItem', 'adult_full_name');
				}
				else if (inEvent.originator.content == 'Adult by first name') {
					this.set('.selectedItem', 'adult_first_name');
				}
				else if (inEvent.originator.content == 'Adult by last name') {
					this.set('.selectedItem', 'adult_last_name');
				}
				else {
					enyo.log('SearchTypePicker.selectedItem == ' + this.get('.selectedItem'));
				}
			}
			return false; // explicitly propagating the event on to the parent control
		}

	})

})(enyo, this);
