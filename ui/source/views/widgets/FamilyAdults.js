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
	 * Fires when a new adult record is selected.
	 *
	 * @event oarn.FamilyAdults#onSelectedAdultChanged
	 * @type {Object}
	 * @property {enyo.Model} item - The model represented by the currently selected list item, or null
	 * @property {number} id - The currently selected ID, or 0
	 * @public
	 */

	/**
	 * {@link oarn.FamilyAdults} retrieves a list of adults linked to the <code>selectedFamilyID</code> which
	 * should be populated by a parent control.
	 *
	 * @class oarn.FamilyAdults
	 * @extends enyo.Control
	 * @ui
	 * @public
	 */

	enyo.kind(
		/** @lends oarn.FamilyAdults.prototype */{

		/**
		 * @private
		 */
		name: 'oarn.FamilyAdults',

		/**
		 * @private
		 */
		collection: null,

		/**
		 * @private
		 */
		style: 'padding-top: 10px;',


		/**
		 * @lends oarn.FamilyAdults.prototype
		 * @public
		 */
		published: {

			/**
			 * The ID of the family from which to pull adult records. This should usually be populated by
			 * a parent control.
			 *
			 * @type {number}
			 * @default 0
			 * @public
			 */
			selectedFamilyID: 0,

			/**
			 * If an adult record in the list is selected, this will contain the model with its details.
			 * If no record is selected, it will be null.
			 *
			 * @type {enyo.Model}
			 * @default null
			 * @public
			 */
			selectedAdultItem: null,


			/**
			 * If an adult record in the list is selected, this will contain that adult's person_id.
			 * If no record is selected, it will be set to 0.
			 *
			 * @type {number}
			 * @default 0
			 * @public
			 */
			selectedAdultID: 0,


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
						{name: 'adultsHeader', classes: 'oarn-header', content: 'Adults Linked to Family:', tag: 'span'},
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
										{content: 'Adult ID: ', tag: 'span'},
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
				{name: 'infoTitle', content:'Linked Adults', classes: 'oarn-popup-title'},
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
			onSelectedAdultChanged: '',

			onConfirmationNeeded: ''
		},

		/**
		 * @private
		 */
		create: function () {
			this.inherited(arguments);

			this.collection = new enyo.Collection();

			var msg = 'Any adult linked to the family selected above will appear here. ' +
				'Clicking on an adult record will display that individual\'s details ' +
				'in the main panel, located to the right.'
			this.set('.$.infoDetail.content', msg);
		},

		selectedFamilyIDChanged: function(inSender, inEvent) {

			if (this.get('.selectedFamilyID') > 0) {
				this.set('.$.adultsHeader.content', 'Adults Linked to Family: ' + this.get('.selectedFamilyID'));
			}
			else {
				this.set('.$.adultsHeader.content', 'Adults Linked to Family:');
				this.collection.empty();
				return;
			}

			var xpath_query = '//*[family_id=' + this.get('.selectedFamilyID') + ']/adultfamilyrelationship_set';
			var adults = JSON.search(this.get('.jsonSnapshot'), xpath_query);

			adults_data = [];
			for (var i=0; i < adults.length; i++) {
				detail = {
					person_id: adults[i]['adult']['person']['person_id'],
					last_name: adults[i]['adult']['person']['last_name'],
					first_name: adults[i]['adult']['person']['first_name']
				}
				if (adults_data.indexOf(detail) == -1) {
					adults_data.push(detail);
				}
			}

			this.collection.empty();
			this.collection.add(adults_data);
		},

		/**
		 * @private
		 */
		itemSelected: function (inSender, inEvent) {
            if (inEvent.index >=0) {
                if (this.$.repeater.selection) {
                    // the repeater is not locked, so a change can be made directly.
                    if (this.$.repeater.selected()) {
                        // a row is being selected
                        this.set('.selectedAdultItem', this.$.repeater.selected());
                        this.set('.selectedAdultID', this.$.repeater.selected().get('person_id'));

                        var detail = {
                            'item': this.get('.selectedAdultItem'),
                            'id': this.get('.selectedAdultID')
                        };
                        this.doSelectedAdultChanged(detail);
                    }
                    else {
                        // a row is being de-selected
                        this.set('.selectedAdultItem', null);
                        this.set('.selectedAdultID', 0);

                        var detail = {
                            'item': this.get('.selectedAdultItem'),
                            'id': this.get('.selectedAdultID')
                        };
                        this.doSelectedAdultChanged(detail);
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
            // Previously I used: this.$.repeater.deselectAll();
            // but this does not appear to work in all cases, and I'm not sure why.
            for (var i=0; i < this.collection.length; i++) {
                this.$.repeater.deselect(i);
            }

            this.set('.selectedAdultItem', null);
            this.set('.selectedAdultID', 0);

            var detail = {
                'item': this.get('.selectedAdultItem'),
                'id': this.get('.selectedAdultID'),
                'noMenuChange': true
            };
            this.doSelectedAdultChanged(detail);
		},

		/**
		 * Sets the disabled/enabled state of the repeater, determining whether new values
		 * may be selected.
		 *
		 * @private
		 * @param inOld
		 */
		disabledChanged: function (inOld) {
			this.$.repeater.selection = (!this.get('.disabled'));
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
			if (index == this.getIndex(this.get('selectedAdultID'))) {
				this.deselectAll();
				this.set('.selectedAdultItem', null);
				this.set('.selectedAdultID', 0);
			}
			else {
				this.$.repeater.select(index);
				this.set('.selectedAdultItem', this.$.repeater.selected());
				this.set('.selectedAdultID', this.$.repeater.selected().attributes['person_id']);
			}

			var detail = {
				'item': this.get('.selectedAdultItem'),
				'id': this.get('.selectedAdultID')
			};
			this.doSelectedAdultChanged(detail);

		}
	})

}) (enyo, this);
