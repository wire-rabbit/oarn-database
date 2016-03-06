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

(function (enyo,scope) {
	/**
	 * Fires when an active menu item is selected. All toolbar items fire this event, bubbling it
	 * up to be handled in a central clearninghouse in PrimaryContainer.js.
	 *
	 * @event oarn.FamilyAssessmentMenu#onToolSelected
	 * @type {Object}
	 * @public
	 */

	/**
	 * {@link oarn.FamilyAssessmentMenu} displays a drop-down menu of the assessments available for a
	 * family (as opposed to adult or child assessments).
	 *
	 * @class oarn.FamilyAssessmentMenu
	 * @extends enyo.Control
	 * @ui
	 * @public
	 */
	enyo.kind(
		/** @lends oarn.FamilyAssessmentMenu.prototype */{

		/**
		 * @private
		 */
		name: 'oarn.FamilyAssessmentsMenu',

		/**
		 * @private
		 */
		components: [
			{
				kind: 'onyx.MenuDecorator',
				classes: 'oarn-control',
				onSelect: 'itemSelected',
				components: [
					{content: 'Family Assessments'},
					{kind: 'onyx.Menu', components: [
						{content: 'Family Assessment', classes: 'oarn-control', style: 'width: 150px'},
						{content: 'Risk Factors Assessment', classes: 'oarn-control oarn-deactivated-menu-item',
							style: 'width: 150px'}
					]}

				]
			}
		],

		/**
		 * @private
		 */
		events: {
			onToolSelected: ''
		},

		/**
		 * @private
		 * @param inSender
		 * @param inEvent
		 * @returns {boolean}
		 */
		itemSelected: function (inSender, inEvent) {
			if (!inEvent.originator.hasClass('oarn-deactivated-menu-item')) {
				this.doToolSelected(inEvent);
			}
			else {
				return true; // stop propagation of the event
			}
		}
	})

}) (enyo, this);
