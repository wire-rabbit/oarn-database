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
	 * Fires when the OK button is tapped.
	 *
	 * @event oarn.OrganizationSelectPopup#onActiveOrganizationChanged
	 * @type {object}
	 * @property {number} organization_id - The organzation_id of the selected organization.
	 * @public
	 */

	/**
	 * {@link oarn.OrganizationSelectPopup} is used to provide the user a set of organizations to select from.
	 * The actual options list must be set by the parent control. When the OK button is tapped, the selected value
	 * is passed up in the event.
	 *
	 * @class oarn.OrganizationSelectPopup
	 * @public
	 * @ui
	 */

	enyo.kind(
		/** @lends oarn.OrganizationSelectPopup.prototype */{

		/**
		 * @private
		 */
		name: 'oarn.OrganizationSelectPopup',

		/**
		 * @private
		 */
		kind: 'onyx.Popup',

		/**
		 * @private
		 */
		autoDismiss: false,

		/**
		 * @private
		 */
		modal: true,

		/**
		 * @private
		 */
		centered: true,

		/**
		 * @private
		 */
		scrim: true,

		/**
		 * @private
		 */
		floating: true,

		/**
		 * @private
		 */
		style: 'background-color: #EAEAEA',

		/**
		 * @public
		 * @lends oarn.OrganizationSelectPopup.protoype
		 */
		published: {
			/**
			 * The set of organizations to be displayed in the select list. Set by the parent.
			 *
			 * @public
			 * @type {object}
			 * @ui
			 */
			options_list: null
		},

		/**
		 * @private
		 */
		events: {
			onActiveOrganizationChanged: ''
		},

		/**
		 * @private
		 */
		components: [
		{kind: 'onyx.Groupbox', style: 'width:325px; height:100%; background-color: #EAEAEA',
			components: [
				{kind: 'onyx.GroupboxHeader', content: 'Set Active Organization'},
				{
					components: [
						{
							style: 'padding: 3px 3px 3px 3px; color: black',
							classes: 'oarn-control',
							allowHtml: true,
							content: 'Access to more than one organization has been configured for ' +
							'this account. Please select the organization to use for this session.' +
                            '<br><br>You can change this selection later through the ' +
							'<em>Options</em> menu.'
						},
						{style: 'text-align:center', components: [
							{name: 'orgSelect', kind: 'oarn.DataSelect', style: 'display: inline',
								classes: 'oarn-control'}
						]},
						{style: 'text-align:center', components: [
							{kind: 'onyx.Button', classes:'onyx-affirmative',
								style: 'margin-top: 5px; margin-botton: 5px',
								content: 'OK', ontap:'orgSelected'}
						]}
					]
				},
			]}
		],

		/**
		 * @private
		 * @param inOldVal
		 */
		options_listChanged: function (inOldVal) {
			this.$.orgSelect.options_list.add(this.get('.options_list'));
		},

		/**
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		orgSelected: function(inSender, inEvent) {
			detail = {'organization_id': this.$.orgSelect.getValue()};
			this.doActiveOrganizationChanged(detail);
		}
	});

}) (enyo, this);