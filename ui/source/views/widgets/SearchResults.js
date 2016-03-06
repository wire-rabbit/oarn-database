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
	 * Fires when a new list record is selected.
	 *
	 * @event oarn.SearchResults#onSelectedPersonChanged
	 * @type {Object}
	 * @property {enyo.Model} item - The model represented by the currently selected list item, or null
	 * @property {number} id - The currently selected ID, or 0
	 * @public
	 */

	/**
	 * {@link oarn.SearchResults} displays a list of adults and children based on its public
	 * <code>collection</code> property. It does not actually perform the Ajax call, relying instead
	 * on a parent control.
	 *
	 * @class oarn.SearcResults
	 * @extends enyo.Control
	 * @ui
	 * @public
	 */

	enyo.kind(
		/** @lends oarn.FamilyChildren.prototype */{

			/**
			 * @private
			 */
			name: 'oarn.SearchResults',

			/**
			 * @private
			 */
			collection: null,

			/**
			 * @private
			 */
			style: 'padding-top: 10px;',


			/**
			 * @lends oarn.FamilyChildren.prototype
			 * @public
			 */
			published: {

				/**
				 * If a person in the list is selected, this will contain the model with its details.
				 * If no record is selected, it will be null.
				 *
				 * @type {enyo.Model}
				 * @default null
				 * @public
				 */
				selectedPersonItem: null,

				/**
				 * If a person in the list is selected, this will contain that individual's person_id.
				 * If no record is selected, it will be set to 0.
				 *
				 * @type {number}
				 * @default 0
				 * @public
				 */
				selectedPersonID: 0

			},

			/**
			 * @private
			 */
			components: [
				{
					name: 'container', kind: 'onyx.Groupbox', style: 'padding-left:5px',
					components: [
						/* The header */
						{
							kind: 'onyx.GroupboxHeader', classes: 'oarn-header', components: [
							{name: 'resultsHeader', content: 'Search Results', tag: 'span'},
							{
								name: 'infoButton',
								kind: 'onyx.IconButton',
								style: 'float:right;',
								classes: 'oarn-icon-button',
								src: 'static/assets/info-small.png',
								ontap: 'goInfo'
							}

						]
						},
						/* The body */
						{
							name: 'repeater', kind: 'enyo.DataRepeater', ontap: 'itemSelected',
							components: [
								{
									classes: 'oarn-search-results enyo-border-box',
									components: [
										{name: 'itemWrapper', components: [
											{content: 'Family ID: ', tag: 'span'},
											{name: 'person_id', tag: 'span'},
											{content: ' - ', tag: 'span'},
											{name: 'last_name', tag: 'span'},
											{content: ', ', tag: 'span'},
											{name: 'first_name', tag: 'span'}
										]}
									],
									bindings: [
										{from: '.model.person_id', to: '.$.person_id.content'},
										{from: '.model.last_name', to: '.$.last_name.content'},
										{from: '.model.first_name', to: '$.first_name.content'}
									]
								}
							]
						}
					]
				},
				{name: 'infoPopup', kind: 'onyx.Popup', centered: true,
					floating: true, components: [
					{name: 'infoTitle', content:'Search Results', classes: 'oarn-popup-title'},
					{name: 'infoBody', kind: 'Scroller', style: 'width:400px', maxHeight:'100px', components: [
						{name: 'infoDetail'}
					]}
				]},
			],

			/**
			 * @private
			 */
			bindings: [
				{from: '.collection', to: '.$.repeater.collection'}
			],

			/**
			 * @private
			 */
			events: {
				onSelectedPersonChanged: ''
			},

			/**
			 * @private
			 */
			create: function () {
				this.inherited(arguments);

				this.collection = new enyo.Collection();
				this.collection.add(this.mockData);

				var msg = 'The individual adults or children returned by your search will appear here. ' +
					'Clicking on a list item will display the families the selected individual is linked to ' +
						'in the panel to the right.'
				this.set('.$.infoDetail.content', msg);
			},

			/**
			 * @private
			 */
			itemSelected: function (inEvent, inSender) {
				if (this.$.repeater.selected()) {
					this.set('.selectedPersonItem', this.$.repeater.selected());
					this.set('.selectedPersonID', this.$.repeater.selected().attributes['person_id'])
				} else {
					this.set('.selectedPersonItem', null);
					this.set('.selectedPersonID', 0);
				}
				var detail = {
					'item': this.get('.selectedPersonItem'),
					'id': this.get('.selectedPersonID')
				};
				this.doSelectedPersonChanged(detail);
			},

			/**
			 * @private
			 */
			goInfo: function (inEvent, inSender) {
				this.$.infoPopup.show();
			},

			/**
			 * Allows a parent control to deselect all items in the list.
			 *
			 * @public
			 * @returns undefined
			 */
			deselectAll: function() {
				this.$.repeater.deselectAll();
			}
		})

}) (enyo, this);
