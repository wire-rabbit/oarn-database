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
	 * Fires when an ajax call results in an error.
	 *
	 * @event oarn.FoundFamilies#onAjaxError
	 * @type {object}
	 * @property {string} name - Name of the [PersonSearchResults]{@link oarn.PersonSearchResults} that
	 * generated the event.
	 * @property {object} xhrResponse - The error details
	 * @public
	 */

	/**
	 * Fires when an ajax call is started, to alert parents to display spinners, ec.
	 *
	 * @event oarn.FoundFamilies#onAjaxStarted
	 * @public
	 */

	/**
	 * Fires when an ajax call has returned, to alert parents to hide spinners, etc.
	 *
	 * @event oarn.FoundFamilies#onAjaxFinished
	 * @public
	 */

	/**
	 * Fires when a new family record is selected.
	 *
	 * @event oarn.FoundFamilies#onSelectedFamilyChanged
	 * @type {Object}
	 * @property {enyo.Model} item - The model represented by the currently selected list item, or null
	 * @property {number} id - The currently selected ID, or 0
	 * @public
	 */

	/**
	 * {@link oarn.FoundFamilies} retrieves families linked to the <code>selectedPersonID</code> which
	 * should be populated by a parent control.
	 *
	 * @class oarn.FoundFamilies
	 * @extends enyo.Control
	 * @ui
	 * @public
	 */
	enyo.kind(
		/** @lends oarn.FoundFamilies.prototype */{

		/**
		 * @private
		 */
		name: 'oarn.FoundFamilies',

		/**
		 * @private
		 */
		collection: null,

		/**
		 * @private
		 */
		style: 'padding-top: 10px;',


		/**
		 * @lends oarn.FoundFamilies.prototype
		 * @public
		 */
		published: {

			/**
			 * The API auth token, bound to the widget by a parent control.
			 *
			 * @type {string}
			 * @default null
			 * @public
			 */
			token: null,

			/**
			 * The oarn API object, instantiated in create.
			 *
			 * @type {object}
			 * @public
			 */
			api: null,

			/**
			 * The person_id with which to pull family records. This should usually be populated by
			 * a parent control.
			 *
			 * @type {number}
			 * @default 0
			 * @public
			 */
			selectedPersonID: 0,

			selectedPersonItem: null,

			/**
			 * If a family record in the list is selected, this will contain the model with its details.
			 * If no record is selected, it will be null.
			 *
			 * @type {enyo.Model}
			 * @default null
			 * @public
			 */
			selectedFamilyItem: null,


			/**
			 * If a family record in the list is selected, this will contain that record's family_id.
			 * If no record is selected, it will be set to 0.
			 *
			 * @type {number}
			 * @default 0
			 * @public
			 */
			selectedFamilyID: 0,

			/**
			 * A Defiant.js prepared snapshot of the returned data. Since the family endpoint provides
			 * the children and adults as well, this can be bound directly to the sibling controls rather
			 * than having them hit each the database again.
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
						{content: 'Families Found', classes: 'oarn-header', tag: 'span'},
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
							classes: 'oarn-search-results',

							components: [
								{name: 'itemWrapper', components: [
									{content: 'Family ID: ', tag: 'span'},
									{name: 'family_id', tag: 'span'},
									{content: ' - ', tag: 'span'},
									{name: 'last_name', tag: 'span'},
									{content: ', ', tag: 'span'},
									{name: 'first_name', tag: 'span'}
								]}
							],
							bindings: [
								{from: '.model.family_id', to: '.$.family_id.content'},
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
				{name: 'infoTitle', content:'Linked Families', classes: 'oarn-popup-title'},
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
			onAjaxError: '',

			onAjaxStarted: '',

			onAjaxFinished: '',

			onFamilySelected: '',

			onConfirmationNeeded: ''

		},

		/**
		 * @private
		 */
		create: function () {
			this.inherited(arguments);

			this.collection = new enyo.Collection();

			this.api = new oarn.API();

			var msg = 'Any family record linked to the individual selected in the search ' +
					'results will appear here, under the name of the primary adult. ' +
					'Clicking on a family record will display the adults and children below.'
			this.set('.$.infoDetail.content', msg);
		},


		/**
		 * Pulls the index in the collection for a given model instance.
		 *
		 * @private
		 * @param item
		 * @returns {number}
		 */
		getIndex: function(item) {
			for (var i = 0; i < this.collection.length; i++ ) {
				if (item.attributes.family_id === this.collection.at(i).get('family_id')) {
					return i;
				}
			}
			return -1;
		},

		/**
		 * @private
		 */
		itemSelected: function (inSender, inEvent) {
			if (this.$.repeater.selected()) {
				if (this.$.repeater.selection) {
					// if this is enabled, we're in a clean state and can just make the change:
					this.set('.selectedFamilyItem', this.$.repeater.selected());
					this.set('.selectedFamilyID', this.$.repeater.selected().get('family_id'), true);
				}
				else {
					// this indicates a dirty state, so we need to pass control to a parent for a
					// confirmaition popup:
					this.doConfirmationNeeded({index: inEvent.index});
				}
			}
			else {
                this.doAjaxFinished();
				if (this.$.repeater.selection) {
					// if this is enabled, we're in a clean state and can just make the change:
					this.set('.selectedFamilyItem', null);
					this.set('.selectedFamilyID', 0, true);
				}
				else {
					// this indicates a dirty state, so we need to pass control to a parent for a
					// confirmaition popup:
					this.doConfirmationNeeded({index: -1});
				}
			}
		},

		/**
		 * Allows the manual setting of the repeater selection. Use with getIndex() to determine
		 * which index to pass to this function.
		 *
		 * @public
		 * @param index
		 */
		setSelected: function (index) {
			this.$.repeater.select(index);
			if (this.$.repeater.selected() &&
				this.$.repeater.selected().attributes['family_id'] == this.get('.selectedFamilyID')) {
				this.set('.selectedFamilyItem', null);
				this.set('.selectedFamilyID', 0, true);
				this.deselectAll();
				return;
			}
			this.set('.selectedFamilyItem', this.$.repeater.selected());
			this.set('.selectedFamilyID', this.$.repeater.selected().attributes['family_id']);
		},

		/**
		 * Fires when the parent control informs us that a new selected Person has been selected.
		 *
		 * @param oldVal
		 */
		selectedPersonIDChanged: function (oldVal) {
			this.collection.empty();

			if (this.get('.selectedPersonID') > -1) {
				var endpoint = 'api/v1/family/';
				//if (this.get('.selectedPersonItem').attributes['is_child']) {
				if (this.get('.selectedPersonItem').get('is_child')) {
					endpoint = endpoint + '?child_id=' + this.get('.selectedPersonID')
				}
				else {
					endpoint = endpoint + '?adult_id=' + this.get('.selectedPersonID')
				}

				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'GET');
				var ajax = this.api.getAjaxObject(endpoint);
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'processResponse'));
				ajax.error(enyo.bindSafely(this, 'processError'));

				this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
			}
		},

		/**
		 * Handles the Ajax response on success.
		 *
		 * @param inRequest
		 * @param inResponse
		 * @private
		 */
		processResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			this.set('.jsonSnapshot', Defiant.getSnapshot(inResponse['results']));
			adults = JSON.search(this.get('.jsonSnapshot'), '//adultfamilyrelationship_set')

			family_data = [];
			for (var i = 0; i < adults.length; i++) {
				if (adults[i].primary_adult) {
					detail = {
						family_id: adults[i]['family'],
						last_name: adults[i]['adult']['person']['last_name'],
						first_name: adults[i]['adult']['person']['first_name']
					}
					if (family_data.indexOf(detail) == -1) {
						family_data.push(detail);
					}
				}
			}

			this.collection.add(family_data);
		},

		/**
		 * Handles any ajax errors by passing the details up to the parent component.
		 *
		 * @param inSender
		 * @param inResponse
		 * @private
		 */
		processError: function (inSender, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
			this.doAjaxError(inSender.xhrResponse);
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
			this.$.repeater.deselectAll();
		},

		/**
		 * Turns the ability to select different elements in the repeater on/off.
		 *
		 * @public
		 * @param enabled {Boolean} Should the repeater respond to select events?
		 */
		setEnabled: function (enabled) {
			this.$.repeater.selection = enabled;
		},

		selectedFamilyIDChanged: function (oldVal, newVal) {
			this.doFamilySelected({'oldVal':oldVal, 'newVal':newVal});
		}
	})

}) (enyo, this);
