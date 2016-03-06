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

	enyo.kind({

		name: 'oarn.FamilyRecordCreator',

		kind: 'onyx.Popup',

		autoDismiss: false,

		modal: true,

		centered: true,

		scrim: true,

		floating: true,

		style: 'background-color: #EAEAEA',

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
             * The organization of the logged in user, set to an object in the format:
             * {'organization_id': (number), 'name': 'foo', 'short_name': 'bar'}
             * If a user has rights to multiple organizations, they will be asked to select one
             * for the current session at login. This is bound from the parent.
             *
             * @type {Object}
             * @default null
             * @public
             */
            selectedOrganization: null

		},

		components: [
			{kind: 'onyx.Groupbox', style: 'width: 500px;', components: [
				{kind: 'onyx.GroupboxHeader', content: 'Create New Family Record', class: 'oarn-groupbox-control'}
			]},
			{tag: 'table', style: 'width: 100%', components: [
				{tag: 'tr', components: [
					{tag: 'td', attributes: [{'colspan':'2'}], components: [
						{content: 'Step 1) A primary caregiver is required for all family records:',
							classes: 'oarn-control oarn-groupbox-control'}
					]}
				]},
				{tag: 'tr', components: [
					{tag: 'td', components: [{kind: 'enyo.Checkbox', name: 'chkNewAdult', onchange: 'primaryAdultTypeChanged'}]},
					{tag: 'td', components: [{content: 'Create a new primary caregiver record', classes: 'oarn-control oarn-groupbox-control'}]}
				]},
				{tag: 'tr', components: [
					{tag: 'td', components: [{kind: 'enyo.Checkbox', name: 'chkExistingAdult', onchange: 'primaryAdultTypeChanged'}]},
					{tag: 'td', components: [{content: 'Use an existing adult record for the primary caregiver',
                        classes: 'oarn-control oarn-groupbox-control'}]},
				]}
			]},
			{tag: 'table', name: 'newAdultSetup', showing: false, style: 'width: 100%; max-width: 500px;', components:[
				{tag: 'tr', components:[
					{tag: 'td', components: [
						{name: 'newAdultInstructions', allowHtml: true, classes: 'oarn-control oarn-groupbox-control'}]} // text set in create()
				]},
				{tag: 'tr', components: [
					{tag: 'td', components: [
						{tag: 'table', components: [
							{tag: 'tr', components: [
								{tag: 'td', components: [{tag: 'label', content: 'First Name:',
									attributes:[{'for':'txtFirstName'}], classes: 'oarn-control oarn-groupbox-control'}]},
								{tag: 'td', components: [{name: 'txtFirstName', kind: 'enyo.Input', style: 'width:95%;',
									attributes:[{'maxlength':'35'}], classes: 'oarn-control oarn-groupbox-control'}]}
							]},
							{tag: 'tr', components: [
								{tag: 'td', components: [{tag: 'label', content: 'Last Name:',
									attributes:[{'for':'txtLastName'}], classes: 'oarn-control oarn-groupbox-control'}]},
								{tag: 'td', components: [{name: 'txtLastName', kind: 'enyo.Input', style: 'width:95%;',
									attributes:[{'maxlength':'35'}], classes: 'oarn-control oarn-groupbox-control'}]}
							]},
							{tag: 'tr', components: [
								{tag: 'td', components: [{tag: 'label', content: 'Gender:',
									attributes:[{'for':'selectGender'}], classes: 'oarn-control oarn-groupbox-control'}]},
								{tag: 'td', components: [{name: 'selectGender', kind: 'oarn.DataSelect', style: 'width:95%;',
									classes: 'oarn-control oarn-groupbox-control'}]}
							]},
							{tag: 'tr', components: [
								{tag: 'td', components: [{tag: 'label', content: 'Birth Date:',
									attributes:[{'for':'txtBirthDate'}], classes: 'oarn-control oarn-groupbox-control'}]},
								{tag: 'td', components: [{name: 'txtBirthDate', kind: 'oarn.DatePicker',
									emptyIsValid: true, width: '95%', classes: 'oarn-control oarn-groupbox-control'}]}
							]},
                            {tag: 'tr', components: [
                                {tag: 'td', components: [{tag: 'label', content: 'Relationship:',
                                    attributes:[{'for':'selectRelationship'}], classes: 'oarn-control oarn-groupbox-control'}]},
                                {tag: 'td', components: [{name: 'selectRelationship', kind: 'oarn.DataSelect', style: 'width:95%;',
                                    classes: 'oarn-control oarn-groupbox-control'}]}
                            ]}
						]}
					]}
				]},
				{tag: 'tr', components: [
					{tag: 'td', components: [
						{content: 'Step 2) Check for duplicate adult records:',
						classes: 'oarn-control oarn-groupbox-control'}
					]}
				]},
				{tag: 'tr', components: [
					{tag: 'td', components: [
						{kind: 'onyx.Button', content: 'Duplicates Check', classes: 'onyx-dark',
                            ontap: 'checkDuplicates'}
					]}
				]}
			]},
			{name: 'dupesScroller', showing: false, kind: 'enyo.Scroller',
                maxHeight: '150px', components: [
                {name: 'dupesWarning', classes: 'oarn-control oarn-groupbox-control',
                    style: 'max-width:500px'}, // text set in create
                {name: 'repeater', kind: 'enyo.Repeater', multiSelect: false, onSetupItem: 'setupItem',
                    components: [
                        {name: 'itemWrapper', components: [
                            {tag: 'table', components: [
                                {tag: 'tr', components: [
                                    {tag: 'td', components: [
                                        {kind: 'onyx.Button', content: 'View', ontap:'goView'}
                                    ]},
                                    {tag: 'td', components: [
                                        {name: 'dupeID', kind: 'enyo.Input', style: 'width: 60px',
                                            classes: 'oarn-control oarn-groupbox-control', disabled: true}
                                    ]},
                                    {tag: 'td', components: [
                                        {name: 'dupeFirstName', kind: 'enyo.Input', style: 'width: 125px',
                                            classes: 'oarn-control oarn-groupbox-control', disabled: true}
                                    ]},
                                    {tag: 'td', components: [
                                        {name: 'dupeLastName', kind: 'enyo.Input', style: 'width: 125px',
                                            classes: 'oarn-control oarn-groupbox-control', disabled: true}
                                    ]},
                                    {tag: 'td', components: [
                                        {name: 'dupeDOB', kind: 'enyo.Input', style: 'width: 95px',
                                            classes: 'oarn-control oarn-groupbox-control', disabled: true}
                                    ]}
                                ]}
                            ]}
                        ]}
                    ]
                }
			]},

			{tag: 'table', name: 'existingAdultSetup', showing: false,
                style: 'width: 100%; max-width: 500px;', components:[
                {tag: 'tr', components: [
                    {tag: 'td', components: [{tag: 'label', content: 'Adult ID of Primary Caregiver:',
                        attributes:[{'for':'txtAdultID'}], classes: 'oarn-control oarn-groupbox-control'}]},
                    {tag: 'td', components: [{name: 'txtAdultID', kind: 'enyo.Input', style: 'width:95%;',
                        attributes:[{'maxlength':'20'}, {'type':'number'}],
                        classes: 'oarn-control oarn-groupbox-control'}]}
                ]},
                {tag: 'tr', components: [
                    {tag: 'td', components: [{tag: 'label', content: 'Relationship:',
                        attributes:[{'for':'selectExistingRelationship'}], classes: 'oarn-control oarn-groupbox-control'}]},
                    {tag: 'td', components: [{name: 'selectExistingRelationship', kind: 'oarn.DataSelect',
                        style: 'width:95%;',
                        classes: 'oarn-control oarn-groupbox-control'}]}
                ]},
                {tag: 'tr', components: [
                    {tag: 'td', components: [
                        {kind: 'onyx.Button', content: 'Verify Adult Record', classes: 'onyx-dark',
                            ontap: 'verifyExistingAdult'}
                    ]}
                ]},
                {name: 'rowAdultSummary', tag: 'tr', showing: false, components: [
                    {tag: 'td', attributes:[{'colspan':'2'}], components: [
                        {name: 'lblAdultSummary', classes: 'oarn-control oarn-groupbox-control',
                            allowHtml: true}
                    ]}
                ]},
                {tag: 'tr', showing: false, name: 'rowAdultSummaryInstructions', components: [
                    {tag: 'td', attributes:[{'colspan':'2'}], components: [
                        {classes: 'oarn-control oarn-groupbox-control',
                        content: 'If this is the primary caregiver for the new family, press confirm.'}
                    ]}
                ]}
			]},

            {name: 'confirmCreate', tag: 'table', showing: false, components: [
                {tag: 'tr', components: [
                    {tag: 'td', components: [
                        {kind: 'onyx.Button', content: 'Confirm Family Creation', classes: 'onyx-affirmative',
                            ontap: 'goConfirm'}
                    ]}
                ]}
            ]},


			{name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
				components: [
					{name: 'btnClose', kind: 'onyx.Button', content: 'Close',
						style: 'margin: 5px 5px 5px 5px',	ontap: 'goClose'}
			]},

			{name: 'selectHelper', kind: 'oarn.SelectHelper'},

            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
		],

		bindings: [
			{from: '.token', to: '.$.selectHelper.token'}
		],

        events: {
            onAjaxError: '',

            onAjaxStarted: '',

            onAjaxFinished: '',

            onDuplicateSelected: '',

            onPersonCreated: '',

            onAdultFound: '',

            onFamilyOptionPopupClosed: ''
        },

		handlers: {
			onSelectListsAcquired: 'selectListsAcquiredHandler',

            onPersonCreated: 'personCreatedHandler',

            onAdultFound: 'adultFoundHandler',

            onPopupClosed: 'popupClosedHandler'
		},

		create: function () {
			this.inherited(arguments);
			this.api = new oarn.API();

			this.$.selectHelper.endpoints.push({endpoint: 'api/v1/ref/genders/', name: 'genders',
                parseWith: this.$.selectHelper.parseGenericRefTable});

            this.$.selectHelper.endpoints.push({endpoint: 'api/v1/ref/adult-family-relationship-types/',
                name: 'relationships',parseWith: this.$.selectHelper.parseGenericRefTable});

			this.$.newAdultInstructions.setContent("This will create a <strong>new</strong> adult record as the primary caregiver for the " +
				"newly created family. Although basic duplicates checking will be peformed, it is assumed that you have verified that the " +
				"adult is not already in the system.<br />");

            this.$.dupesWarning.setContent("Potential duplicates found:");

            this.getClientRole(); // start looking for the 'Client' role's ref_role_id number.
            this.$.selectHelper.loadSelectData();
		},

		primaryAdultTypeChanged: function (inSender, inEvent) {

			if (inEvent.originator == undefined) {
				return; // prevents unlimited recursion
			}

			if (inEvent.originator.name == 'chkNewAdult' && this.$.chkNewAdult.getChecked()) {
				this.$.chkExistingAdult.setChecked(false);
				this.set('.primaryAdultType', 'new');

                this.showNewAdultSetup();
			}
			else if (inEvent.originator.name == 'chkExistingAdult' && this.$.chkExistingAdult.getChecked()) {
				this.$.chkNewAdult.setChecked(false);
				this.set('.primaryAdultType', 'existing');
				this.$.newAdultSetup.hide();
				this.$.dupesScroller.hide();
				this.$.existingAdultSetup.show();
			}
			else {
				this.set('.primaryAdultType', 'none');
				this.$.newAdultSetup.hide();
				this.$.dupesScroller.hide();
				this.$.existingAdultSetup.hide();
			}

			return true;
		},

		goClose: function (inSender, inEvent) {
            this.hide();
            this.doFamilyOptionPopupClosed({'sender':'FamilyRecordCreator'});
		},

		showNewAdultSetup: function () {
			this.$.newAdultSetup.show();
			this.$.existingAdultSetup.hide();
			this.redraw();
		},

		selectListsAcquiredHandler: function (inSender, inEvent) {
			this.$.selectGender.options_list.empty();
			this.$.selectGender.options_list.add(this.$.selectHelper.optionsLists['genders_options_list']);

            this.$.selectRelationship.options_list.empty();
            this.$.selectRelationship.options_list.add(this.$.selectHelper.optionsLists['relationships_options_list']);

            this.$.selectExistingRelationship.options_list.empty();
            this.$.selectExistingRelationship.options_list.add(this.$.selectHelper.optionsLists['relationships_options_list']);
		},

		checkDuplicates: function (inSender, inEvent) {
            if (this.$.txtFirstName.getValue().length == 0) {
                this.$.popupFactory.showInfo('Invalid Data', 'A first name for the primary caregiver is required.');
                return;
            }

            if (this.$.txtLastName.getValue().length == 0) {
                this.$.popupFactory.showInfo('Invalid Data', 'A last name for the primary caregiver is required.');
                return;
            }

            if (this.$.txtBirthDate.getValue().length > 0 &&
                Number.isNaN(Date.parse(this.$.txtBirthDate.getValue()))) {
                this.$.popupFactory.showInfo('Invalid Data', 'The birth date does not appear to be a valid date.');
                return;
            }

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var org_id = this.get('.selectedOrganization.organization_id');
            var endpoint = 'api/v1/family/adult-search/?organization_id=' + org_id +
                '&fuzzy_match='+ this.$.txtFirstName.getValue() + ' ' + this.$.txtLastName.getValue();
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));

            this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
		},

        processResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            var details = [];
            for (var i = 0; i < inResponse['results'].length; i++) {
                var detail = {
                    'person_id': inResponse['results'][i]['person_id'],
                    'first_name': inResponse['results'][i]['first_name'],
                    'last_name': inResponse['results'][i]['last_name'],
                    'birth_date': inResponse['results'][i]['birth_date'],
                    'gender': inResponse['results'][i]['gender'],
                    'is_child': inResponse['results'][i]['is_child'],
                    'primary_adult': inResponse['results'][i]['primary_adult']
                };
                details.push(detail);
            }

            this.collection = new enyo.Collection();
            this.collection.add(details);

            this.$.confirmCreate.show();

            if (this.collection.length  > 0) {
                this.$.dupesScroller.show();
                this.$.repeater.setCount(this.collection.length);
                this.redraw();
            }
            else {
                this.$.repeater.setCount(0);
                this.$.dupesScroller.hide();
                this.redraw();
            }
        },

        processError: function (inSender, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            var status = inSender.xhrResponse.status;

            var detail = JSON.parse(inSender.xhrResponse.body);

            var detail_msg = '';
            for (var prop in detail) {
                if (detail.hasOwnProperty(prop)) {
                    detail_msg = prop + ': ' + detail[prop] + '<br>';
                }
            }

            this.$.popupFactory.showInfo('Database Communication Error', 'An error occurred while trying to ' +
                ' communicate with the server. ' +
                'Please provide the following information to your database administrator: ' +
                '<br><br>' + 'status: ' + status + '<br>' + detail_msg);

            this.set('.xhrResponse', inSender.xhrResponse);
            return true;
        },


        setupItem: function (inSender, inEvent) {
            var item = inEvent.item;

            item.$.dupeID.setValue(this.collection.at(inEvent.index).get('person_id'));
            item.$.dupeFirstName.setValue(this.collection.at(inEvent.index).get('first_name'));
            item.$.dupeLastName.setValue(this.collection.at(inEvent.index).get('last_name'));

            var testDate = null;
            if (this.collection.at(inEvent.index).get('birth_date') != null) {
                testDate = moment(this.collection.at(inEvent.index).get(
                    'birth_date'),'YYYY-MM-DD').format('MM/DD/YYYY');
            }
            item.$.dupeDOB.setValue(testDate);

        },

		redraw: function () {
			this.hide();
			this.show();
		},

        goView: function (inSender, inEvent) {
            this.doDuplicateSelected({
                'id': this.collection.at(inEvent.index).get('person_id'),
                'item': this.collection.at(inEvent.index)
            });
            this.hide();
        },

        goConfirm: function (inSender, inEvent) {
            if (this.client_role_id == undefined ||
                this.client_role_id == -1) {
                this.$.popupFactory.showInfo('Error', 'No client role was found. ' +
                    'Please contact your database administrator.');
                return;
            }
            else {
                if (this.primaryAdultType == 'new') {

                    var testDate = null;
                    if (!Number.isNaN(Date.parse(this.$.txtBirthDate.getValue()))) {
                        testDate = new Date(this.$.txtBirthDate.getValue()).toISOString();
                        testDate = moment(testDate).format('YYYY-MM-DD');
                    }

                    var postBody = {
                        "first_name": this.$.txtFirstName.getValue(),
                        "last_name": this.$.txtLastName.getValue(),
                        "birth_date": testDate,
                        "ref_gender": this.$.selectGender.getValue(),
                        "organization_id": this.selectedOrganization.organization_id,
                        "ref_role_id": this.client_role_id
                    };

                    this.set('.api.token', this.get('.token'));
                    this.set('.api.method', 'POST');
                    var endpoint = 'api/v1/family/person/create/';
                    var ajax = this.api.getAjaxObject(endpoint);
                    ajax.postBody = postBody;
                    ajax.go();
                    ajax.response(enyo.bindSafely(this, 'processPersonResponse'));
                    ajax.error(enyo.bindSafely(this, 'processError'));
                }
                else {
                    // if we have an existing primary adult we can go direct to the family creation:
                    var postBody = {
                        "organizations": [ {"organization_id": this.selectedOrganization.organization_id}],
                        "adults": [{
                            "person_id": this.existing_adult_id,
                            "primary_adult": true,
                            "ref_adult_family_relationship_type": this.$.selectExistingRelationship.getValue(),
                            "relationship_begin_date": null,
                            "relationship_end_date": null
                        }],
                        "children": []
                    };

                    this.set('.api.token', this.get('.token'));
                    this.set('.api.method', 'POST');
                    var endpoint = 'api/v1/family/create/';
                    var ajax = this.api.getAjaxObject(endpoint);
                    ajax.postBody = postBody;
                    ajax.go();
                    ajax.response(enyo.bindSafely(this, 'processFamilyResponse'));
                    ajax.error(enyo.bindSafely(this, 'processError'));
                }
            }
        },

        processPersonResponse: function (inRequest, inResponse) {
            //this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            this.new_person_id = -1;
            if (inResponse['person_id'] !== null) {
                this.new_person_id = inResponse['person_id'];

                this.newItem = new enyo.Model({
                    "person_id": inResponse['person_id'],
                    "first_name": inResponse['first_name'],
                    "last_name": inResponse['last_name'],
                    "gender": this.$.selectGender.options_list.at(this.$.selectGender.selected).get('display_text'),
                    "is_child": false,
                    "primary_adult": true
                });
            }

            this.doPersonCreated();
        },

        getClientRole: function () {
            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var endpoint = 'api/v1/ref/roles/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processClientResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));

            this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
        },

        processClientResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            this.client_role_id = -1;
            for (var i = 0; i < inResponse['results'].length; i++) {
                if (inResponse['results'][i]['description'] == 'Client') {
                    this.client_role_id = inResponse['results'][i]['ref_role_id'];
                    break;
                }
            }
        },

        personCreatedHandler: function (inSender, inEvent) {
            // now create an Adult record:
            var postBody = {
                "person": this.new_person_id
            };

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'POST');
            var endpoint = 'api/v1/family/adult/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.postBody = postBody;
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processAdultResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));

            return true;
        },

        processAdultResponse: function () {
            // We already know the Adult primary key is the same as the person_id created earlier.
            // We can now create the family.
            var postBody = {
                "organizations": [ {"organization_id": this.selectedOrganization.organization_id}],
                "adults": [{
                    "person_id": this.new_person_id,
                    "primary_adult": true,
                    "ref_adult_family_relationship_type": this.$.selectRelationship.getValue(),
                    "relationship_begin_date": null,
                    "relationship_end_date": null
                }],
                "children": []
            };

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'POST');
            var endpoint = 'api/v1/family/create/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.postBody = postBody;
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processFamilyResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
        },

        processFamilyResponse: function (inRequest, inResponse) {
            this.doAjaxFinished();
            this.new_family_id = inResponse['family_id'];
            this.clearResults();
            this.set('.family_created_flag', true);
            this.$.popupFactory.showInfo("Family Created", "New Family ID: " + this.new_family_id);
        },

        clearResults: function () {
            this.$.repeater.setCount(0);
            this.collection = new enyo.Collection();
            this.$.txtFirstName.setValue('');
            this.$.txtLastName.setValue('');
            this.$.txtBirthDate.setValue('');
            this.$.newAdultSetup.hide();
            this.$.dupesScroller.hide();
            this.$.confirmCreate.hide();
            this.$.chkNewAdult.setChecked(false);
            this.$.chkExistingAdult.setChecked(false);
            this.$.txtAdultID.setValue('');
            this.$.existingAdultSetup.hide();

            this.hide();
            this.show();
        },

        verifyExistingAdult: function (inSender, inEvent) {
            var pk = -1;

            var testPk = this.$.txtAdultID.getValue();
            if (Number.isNaN(parseInt(testPk))) {
                this.$.popupFactory.showInfo('Invalid Data', 'The Adult ID must be a whole number.');
                return;
            }
            else {
                pk = testPk;
            }

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var org_id = this.get('.selectedOrganization.organization_id');
            var endpoint = 'api/v1/family/adult-search/?organization_id=' + org_id + '&person_id='+ pk;
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processVerifyResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
        },

        processVerifyResponse: function (inRequest, inResponse) {
            this.doAjaxFinished();
            // if it returned at all, an adult with this ID was found.
            if (inResponse['results'].length == 0) {
                this.doAdultFound({status:'not found'});
            }
            else {
                this.doAdultFound({status: 'found'});
            }
        },

        adultFoundHandler: function (inSender, inEvent) {
            if (inEvent.status == 'found') {
                this.set('.api.token', this.get('.token'));
                this.set('.api.method', 'GET');
                var endpoint = 'api/v1/family/person/'+ this.$.txtAdultID.getValue() + '/';
                var ajax = this.api.getAjaxObject(endpoint);
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'processAdultFoundResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));
                return true;
            }
            else {
                this.$.popupFactory.showInfo('Adult Not Found', 'No adult record with this ID was found.');
                return true;
            }
        },

        processAdultFoundResponse: function (inRequest, inResponse) {
            this.$.rowAdultSummary.show();
            this.$.rowAdultSummaryInstructions.show();
            this.$.confirmCreate.show();

            this.existing_adult_id = inResponse['person_id'];

            var testDate = null;
            if (inResponse['birth_date'] != null) {
                testDate = moment(inResponse['birth_date'],'YYYY-MM-DD').format('MM/DD/YYYY');
            }

            if (testDate != null) {
                this.$.lblAdultSummary.setContent('Adult Detail: <em>' + inResponse['first_name'] + ' ' +
                    inResponse['last_name'] + ', ' + testDate + '</em><br /><br />');
            }
            else {
                this.$.lblAdultSummary.setContent('Adult Detail: <em>' + inResponse['first_name'] + ' ' +
                    inResponse['last_name'] + '</em><br /><br />');
            }

            this.newItem = new enyo.Model({
                "person_id": inResponse['person_id'],
                "first_name": inResponse['first_name'],
                "last_name": inResponse['last_name'],
                "gender": null,
                "is_child": false,
                "primary_adult": true
            });
        },

        popupClosedHandler: function (inSender, inEvent) {
            if (this.get('.family_created_flag')) {
                this.hide();
                this.doFamilyOptionPopupClosed({'sender':'FamilyRecordCreator',
                    id:this.newItem.get('person_id'), item: this.newItem});
            }
        }

	});

})(enyo, this);
