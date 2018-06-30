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
	 * Fires when a new child record is selected.
	 *
	 * @event oarn.FamilyChildren#onSelectedChildChanged
	 * @type {Object}
	 * @property {enyo.Model} item - The model represented by the currently selected list item, or null
	 * @property {number} id - The currently selected ID, or 0
	 * @public
	 */

	/**
	 * {@link oarn.FamilyChildren} retrieves  a list of children linked to the <code>selectedFamilyID</code> which
	 * should be populated by a parent control.
	 *
	 * @class oarn.FamilyChildren
	 * @extends enyo.Control
	 * @ui
	 * @public
	 */

	enyo.kind(
		/** @lends oarn.FamilyChildren.prototype */{

		/**
		 * @private
		 */
		name: 'oarn.FamilyChildren',

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
			 * The ID of the family from which to pull child records. This should usually be populated by
			 * a parent control.
			 *
			 * @type {number}
			 * @default 0
			 * @public
			 */
			selectedFamilyID: 0,

			/**
			 * If a child record in the list is selected, this will contain the model with its details.
			 * If no record is selected, it will be null.
			 *
			 * @type {enyo.Model}
			 * @default null
			 * @public
			 */
			selectedChildItem: null,

			/**
			 * If a child record in the list is selected, this will contain that child's person_id.
			 * If no record is selected, it will be set to 0.
			 *
			 * @type {number}
			 * @default 0
			 * @public
			 */
			selectedChildID: 0,

			/**
			 * The data pulled by the FoundFamilies control (or a similar sibling) contains
			 * all the data needed for this control, and may bind to it. (It is produced by
			 * Defiant.js for optimized xpath searches.)
			 *
			 * @type {object}
			 * @default null
			 * @public
			 */
			jsonSnapshot: null
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
						kind: 'onyx.GroupboxHeader', components: [
						{name: 'childrenHeader', classes: 'oarn-header', content: 'Children Linked to Family:', tag: 'span'},
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
										{content: 'Child ID: ', tag: 'span'},
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
				{name: 'infoTitle', content:'Linked Children', classes: 'oarn-popup-title'},
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
			onSelectedChildChanged: '',

			onConfirmationNeeded: ''
		},

			/**
			 * @private
			 */
		create: function () {
			this.inherited(arguments);

			this.collection = new enyo.Collection();

			var msg = 'Any child linked to the family selected above will appear here. ' +
				'Clicking on a child record will display that individual\'s details ' +
				'in the main panel, located to the right.'
			this.set('.$.infoDetail.content', msg);
		},

		selectedFamilyIDChanged: function(inSender, inEvent) {
			if (this.get('.selectedFamilyID') > 0) {
				this.set('.$.childrenHeader.content', 'Children Linked to Family: ' + this.get('.selectedFamilyID'));
			}
			else {
				this.set('.$.childrenHeader.content', 'Children Linked to Family:');
				this.collection.empty();
				return;
			}

			var xpath_query = '//*[family_id=' + this.get('.selectedFamilyID') + ']/childfamilyrelationship_set';
			var children = JSON.search(this.get('.jsonSnapshot'), xpath_query);

			children_data = [];
			for (var i=0; i < children.length; i++) {
				detail = {
					person_id: children[i]['child']['person']['person_id'],
					last_name: children[i]['child']['person']['last_name'],
					first_name: children[i]['child']['person']['first_name']
				}
				var already_present = false;
				for (var x=0; x < children_data.length; x++) {
					if (children_data[x].person_id == detail.person_id) {
						already_present = true;
						break;
					}
				}

				if (!already_present) {
					children_data.push(detail);
				}
			}

			this.collection.empty();
			this.collection.add(children_data);
		},

		/**
		 * @private
		 */
		itemSelected: function (inSender, inEvent) {
            if (inEvent.index >= 0) {
                if (this.$.repeater.selection) {
                    // the repeater is not locked, so a change can be made directly.
                    if (this.$.repeater.selected()) {
                        // a row is being selected
                        this.set('.selectedChildItem', this.$.repeater.selected());
                        this.set('.selectedChildID', this.$.repeater.selected().attributes['person_id']);

                        var detail = {
                            'item': this.get('.selectedChildItem'),
                            'id': this.get('.selectedChildID')
                        };
                        this.doSelectedChildChanged(detail);
                    }
                    else {
                        // a row is being de-selected
                        this.set('.selectedChildItem', null);
                        this.set('.selectedChildID', 0);

                        var detail = {
                            'item': this.get('.selectedChildItem'),
                            'id': this.get('.selectedChildID')
                        };
                        this.doSelectedChildChanged(detail);
                    }
                }
                else {
                    // the repeater is locked, so a change cannot be made directly.
                    this.doConfirmationNeeded({index: inEvent.index});
                }
            }
		},

		/**
		 * @private
		 */
		goInfo: function (inSender, inEvent) {
			this.$.infoPopup.show();
		},

		/**
		 * Allows a parent control to deselect all items in the list.
		 *
		 * @public
		 * @returns undefined
		 */
		deselectAll: function() {
            // Previously I used: this.$.repeater.deselectAll();
            // but this does not appear to work in all cases, and I'm not sure why.
            for (var i=0; i < this.collection.length; i++) {
                this.$.repeater.deselect(i);
            }


            this.set('.selectedChildItem', null);
            this.set('.selectedChildID', 0);

            var detail = {
                'item': this.get('.selectedChildItem'),
                'id': this.get('.selectedChildID'),
                'noMenuChange': true
            };
            this.doSelectedChildChanged(detail);
		},

		/**
		 * Turns the ability to select different elements in the repeater on/off.
		 *
		 * @public
		 * @param enabled {Boolean} Should the repeater respond to select events?
		 */
		setEnabled: function(enabled) {
			this.$.repeater.selection = enabled;
		},

		/**
		 * Pulls the index in the collection for a given person_id.
		 *
		 * @private
		 * @param item
		 * @returns {number}
		 */
		getIndex: function(id) {
			for (var i = 0; i < this.collection.length; i++ ) {
				if (id === this.collection.at(i).get('person_id')) {
					return i;
				}
			}
			return -1;
		},

		/**
		 * Allows the manual setting of the repeater selection. Use with getIndex() to determine
		 * which index to pass to this function.
		 *
		 * @public
		 * @param index
		 */
		setSelected: function (index) {
			if (index == this.getIndex(this.get('.selectedChildID'))) {
				this.deselectAll();
				this.set('.selectedChildItem', null);
				this.set('.selectedChildID', 0);
			}
			else {
				this.$.repeater.select(index);
				this.set('.selectedChildItem', this.$.repeater.selected());
				this.set('.selectedChildID', this.$.repeater.selected().attributes['person_id']);
			}

			var detail = {
				'item': this.get('.selectedChildItem'),
				'id': this.get('.selectedChildID')
			};
			this.doSelectedChildChanged(detail);

		}

	})

}) (enyo, this);
