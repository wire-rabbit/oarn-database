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
	 * Fires when an ajax call results in an error.
	 *
	 * @event oarn.PersonSearchResults#onAjaxError
	 * @type {object}
	 * @property {string} name - Name of the [PersonSearchResults]{@link oarn.PersonSearchResults} that
	 * generated the event.
	 * @property {object} xhrResponse - The error details
	 * @public
	 */

	/**
	 * Fires when an ajax call is started, to alert parents to display spinners, ec.
	 *
	 * @event oarn.PersonSearchResults#onAjaxStarted
	 * @public
	 */

	/**
	 * Fires when an ajax call has returned, to alert parents to hide spinners, etc.
	 *
	 * @event oarn.PersonSearchResults#onAjaxFinished
	 * @public
	 */

	/**
	 * Fires when the results list selection has changed.
	 *
	 * @event oarn.PersonSearchResults#onSelectedPersonChanged
	 * @type {object}
	 * @property {object} detail - carries 'item' and 'id' properties, carrying the whole item and ID (or -1 if
	 * nothing is selected) of the selected search result.
	 */


	/**
	 * {@link oarn.PersonSearchResults} displays the data returned by a person search.
	 * The parent control sets the <code>searchType</code> and the <code>searchFor</code> properties.
	 * Setting <code>searchFor</code> is what triggers the actual ajax call.
	 *
	 * @class oarn.PersonSearchResults
	 * @extends enyo.Control
	 * @public
	 * @ui
	 */

	enyo.kind(
		/** @lends oarn.PersonSearchResults.prototype */{
		name: 'oarn.PersonSearchResults',

			/**
			 * @public
			 * @lends oarnd.PersonSearchResults.prototype
 			 */
		published: {
			/**
			 * Set by the parent control. May be: 'adult_id', 'adult_first_name',
			 * 'adult_last_name', 'child_id', 'child_first_name', or 'child_last_name'
			 *
			 * @public
			 * @type {string}
			 * @default ''
			 */
			searchType: '',

			/**
			 * Set by the parent control. This is the text passed to the endpoint
			 * as a query parameter. The setting of this value triggers the ajax call.
			 *
			 * @public
			 * @type {string}
			 * @default ''
			 */
			searchFor: '',


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
             * The organization of the logged in user, set to an object in the format:
             * {'organization_id': (number), 'name': 'foo', 'short_name': 'bar'}
             * If a user has rights to multiple organizations, they will be asked to select one
             * for the current session at login. This is bound from the parent.
             *
             * @type {Object}
             * @default null
             * @public
             */
            selectedOrganization: null,

			/**
			 * The currently selected model, or null.
			 *
			 * @type {object}
			 * @readonly
			 * @public
			 */
			selectedPersonItem: null,

			/**
			 * The currently selected person_id, or -1
			 *
			 * @type {number}
			 * @readonly
			 * @public
			 */
			selectedPersonID: -1
		},

		/**
		 * @private
		 */
		components: [

			{name: 'container', kind: 'onyx.Groupbox', style: 'padding-left:5px', components: [
				/* The header */
				{
					kind: 'onyx.GroupboxHeader', components: [
						{content: 'Search Results', classes: 'oarn-header', tag: 'span'},
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
				{name: 'noResultsLabel', content: 'No Results', classes: 'oarn-no-results-text'},
				{name: 'repeater', kind:'enyo.DataRepeater', ontap:'itemSelected', components: [
					{
						classes: 'oarn-search-results',
						components: [
							{name: 'item_wrapper', components: [
								{kind: 'onyx.TooltipDecorator', components: [
									{name: 'person_id', tag: 'span', kind: 'enyo.Control',
                                        classes: 'oarn-popup-control'},
									{tag: 'span', content: ' - ', kind: 'enyo.Control',
                                        classes: 'oarn-popup-control'},
									{name: 'last_name', tag: 'span', kind: 'enyo.Control',
                                        classes: 'oarn-popup-control'},
									{tag: 'span', content: ', ', kind: 'enyo.Control',
                                        classes: 'oarn-popup-control'},
									{name: 'first_name', tag: 'span', kind: 'enyo.Control',
                                        classes: 'oarn-popup-control'},
									{kind: 'onyx.Tooltip', classes: 'oarn-tooltip', components: [
										{components: [
											{content: 'Gender: ', tag: 'span'},
											{name: 'gender', tag: 'span'}
										]},
										{components: [
											{content: 'DOB: ', tag: 'span'},
											{name: 'birth_date', tag: 'span'}
										]},
										{name: 'primary_adult_wrapper', components: [
											{content: 'Primary Adult: ', tag: 'span'},
											{name: 'primary_adult', tag: 'span'}
										]}

									]}
								]}
							]}
						],
						bindings: [
							{from: '.model.person_id', to: '.$.person_id.content'},
							{from: '.model.first_name', to: '$.first_name.content'},
							{from: '.model.last_name', to: '.$.last_name.content'},
							{from: '.model.gender', to: '.$.gender.content'},
							{from: '.model.birth_date', to: '.$.birth_date.content'},
							{from: '.model.primary_adult', to: '.$.primary_adult.content',
								transform: function (val) {
									// This function does not actually transform the incoming value.
									// Instead, it hides the primary adult line of the tooltip if
									// primary adult is false.
									if (!val) {
										this.set('.$.primary_adult_wrapper.showing', false)
									}
									return val;
								}
							}
						]
					}

				]},
				{name: 'infoPopup', kind: 'onyx.Popup', centered: true,
					floating: true, components: [
					{name: 'infoTitle', content:'Search Results', classes: 'oarn-popup-title'},
					{name: 'infoBody', kind: 'Scroller', style: 'width:300px', maxHeight:'200px', components: [
						{name: 'infoDetail', allowHtml:true}
					]}
				]},

				{name: 'popupFactory', kind: 'oarn.PopupFactory'}
			]}
		],

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

			onSelectedPersonChanged: '',

			onConfirmationNeeded: ''
		},

		/**
		 * @private
		 */
		create: function () {
			this.inherited(arguments);
			this.api = new oarn.API();
			this.collection = new enyo.Collection();

			var msg = 'Results of the search for an individual adult or child record appear here. ' +
					'<br /><br />' +
					'Clicking one of these records will pull up families linked to the selected ' +
					'individual, displaying them in the panel to the right.' +
					'<br/><br/>' + 'Hovering your pointer over a record will display additional information,' +
					' including gender, date of birth, and whether this individual is a primary adult.'
			this.set('.$.infoDetail.content', msg);
		},


		getFullNameEncodedUriComponent: function(searchText) {
			var first_name = '';
			var last_name = '';

			var comma_index = searchText.indexOf(',');
			if (comma_index == -1) {
				// No comma, so we split on spaces, treating the first segment as the first name:
				var n = searchText.trim().split(' ');
				if (n.length == 2) {
					// 2 is what's expected:
					first_name = n[0].trim();
					last_name = n[1].trim();
				}
				else if (n.length == 1) {
					// If no last name, we assume it's just a first name:
					return '?first_name=' + encodeURIComponent(n[0]);
				}
				else {
					// we glom all the rest together as the last name, putting back the spaces
					first_name = n[0];
					for (var i = 1; i < n.length; i++) {
						last_name = last_name + n[i] + ' ';
					}
					last_name = last_name.trim(); // remove the trailign space.
				}
			}
			else {
				// We can assume a comma means: last_name, first_name
				var n = searchText.trim().split(',');
				if (n.length == 2) {
					// 2 is what's expected:
					last_name = n[0].trim();
					first_name = n[1].trim();
				}
				else {
					// If no first name, we can assume it's just a last name.
					// (If multiple commas, we can assume bad data, and we'll just use the text up to the first
					// comma.)
					return '?last_name=' + encodeURIComponent(n[0]);
				}
			}
			return '?first_name=' + encodeURIComponent(first_name) + '&' +
					'last_name=' + encodeURIComponent(last_name);
		},

		/**
		 * @private
		 * @param inOldVal
		 */
		searchForChanged: function (inOldVal) {

		},

        goSearch: function () {
            this.collection.empty();

            var org_id = this.get('.selectedOrganization.organization_id');
            var endpoint = '';

            if (this.get('.searchType') == 'family_id') {
                endpoint = 'api/v1/family/adult-search/?organization_id=' + org_id +
                    '&family_id=' + encodeURIComponent(this.get('.searchFor'));
            }
            else if (this.get('.searchType') == 'child_fuzzy') {
                endpoint = 'api/v1/family/child-search/?organization_id=' + org_id +
                    '&fuzzy_match=' + encodeURIComponent(this.get('.searchFor'));
            }
            else if (this.get('.searchType') == 'adult_fuzzy') {
                endpoint = 'api/v1/family/adult-search/?organization_id=' + org_id +
                    '&fuzzy_match=' + encodeURIComponent(this.get('.searchFor'));
            }
            else if (this.get('.searchType') == 'adult_id') {
                endpoint = 'api/v1/family/adult-search/?organization_id=' + org_id +
                    '&person_id=' + encodeURIComponent(this.get('.searchFor'));
            }
            else if (this.get('.searchType') == 'adult_full_name') {
                endpoint = 'api/v1/family/adult-search/' +
                    this.getFullNameEncodedUriComponent(this.get('.searchFor')) + '&organization_id=' + org_id;
            }
            else if (this.get('.searchType') == 'adult_first_name') {
                endpoint = 'api/v1/family/adult-search/?first_name=' +
                    encodeURIComponent(this.get('.searchFor'))  + '&organization_id=' + org_id;
            }
            else if (this.get('.searchType') == 'adult_last_name') {
                endpoint = 'api/v1/family/adult-search/?last_name=' + encodeURIComponent(this.get('.searchFor')) +
                    '&organization_id=' + org_id;
            }
            else if (this.get('.searchType') == 'child_id') {
                endpoint = 'api/v1/family/child-search/?person_id=' + encodeURIComponent(this.get('.searchFor')) +
                    '&organization_id=' + org_id;
            }
            else if (this.get('.searchType') == 'child_full_name') {
                endpoint = 'api/v1/family/child-search/' + this.getFullNameEncodedUriComponent(this.get('.searchFor')) +
                    '&organization_id=' + org_id;
            }
            else if (this.get('.searchType') == 'child_first_name') {
                endpoint = 'api/v1/family/child-search/?first_name=' + encodeURIComponent(this.get('.searchFor')) +
                    '&organization_id=' + org_id;
            }
            else if (this.get('.searchType') == 'child_last_name') {
                endpoint = 'api/v1/family/child-search/?last_name=' + encodeURIComponent(this.get('.searchFor')) +
                    '&organization_id=' + org_id;
            }
            else {
                enyo.log('PersonSearchResults: "'+ this.get('.searchType') + '" is an unknown search type');
            }

            if (endpoint != '') {
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
		 * Processes a successful ajax call.
		 *
		 * @param inRequest
		 * @param inResponse
		 * @private
		 */
		processResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			this.collection.add(inResponse['results']);
			if (this.collection.length == 0) {
				this.set('.$.noResultsLabel.showing', true);
				this.$.popupFactory.showInfo('No Results', 'No individuals matching the search criteria were found.');
			}
			else {
				this.set('.$.noResultsLabel.showing', false);
			}

		},

		/**
		 * Processes an error condition following an ajax call by triggering an onAjaxError event
		 * and sending the xhrResponse object up to the handler.
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
		 * Fires when a search result item is selected or de-selected.
		 *
		 * @param inSender
		 * @param inEvent
		 * @private
		 */
		itemSelected: function (inSender, inEvent) {
            if (inEvent.index >= 0) {
                if (this.$.repeater.selection) {
                    // if this is enabled, we're in a clean state and can just make the change:
                    if (this.$.repeater.selected()) {
                        var item = this.$.repeater.selected();
                        this.set('.selectedPersonItem', item);
                        this.set('.selectedPersonID', this.$.repeater.selected().attributes['person_id']);
                    } else {
                        this.set('.selectedPersonItem', null);
                        this.set('.selectedPersonID', -1);
                    }
                    var detail = {
                        'item': this.get('.selectedPersonItem'),
                        'id': this.get('.selectedPersonID')
                    };
                    this.doSelectedPersonChanged(detail);
                }
                else {
                    // this indicates a dirty state, so we need to pass control to a parent for a
                    // confirmaition popup:
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
		 * Turns the ability to select different elements in the repeater on/off.
		 *
		 * @public
		 * @param enabled {Boolean} Should the repeater respond to select events?
		 */
		setEnabled: function(enabled) {
			this.$.repeater.selection = enabled;
		},

		/**
		 * Allows the manual setting of the repeater selection.
		 *
		 * @public
		 * @param index
		 */
		setSelected: function (index) {
			this.$.repeater.select(index);
			this.set('.selectedFamilyItem', this.$.repeater.selected());
			this.set('.selectedFamilyID', this.$.repeater.selected().attributes['person_id'])
		}
	});

})(enyo, this);