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

		name: 'oarn.ChildDetails',

		personDetailsDirty: false,
		personDemographicsDirty: false,
		childFamilyRelationshipsDirty: false,
		personLanguagesDirty: false,

		published: {
			token: '',

			/**
			 * When the state has changed but not yet saved, this is set to true.
			 * It is used to alert parent controls that we have unsaved changes here.
			 *
			 * @type {Boolean}
			 * @public
			 */
			dirty: false,

			username: 'none',
			selectedFamilyID: 0,
			organizationAccessList: null,

			selectedOrganization: null,
			currentOrgReadOnly: false,
			currentOrgReadWrite: false,
			currentOrgAdmin: false,

            selectedPersonID: -1,
            selectedPersonItem: null //model: person_id, first_name, last_name, gender, birth_date, is_child

		},

		components: [
			{classes: 'container', style: 'margin-left:5px;', components: [
				{classes: 'row no-gutters', components:[
					{classes: 'col-sm-12 col-md-6', style: 'width: 370px;', components: [
						// Column 1
						{classes: 'col-xs-12 oarn-widget', components: [
							{name: 'personDetails', kind: 'oarn.PersonDetails'}
						]},
						{classes: 'col-xs-12 oarn-widget', components: [
							{name: 'personDemographics', kind: 'oarn.PersonDemographics'}
						]}
					]},
					{classes: 'col-sm-12 col-md-6', style: 'width: 750px;', components: [
						// Column 2
						{classes: 'col-xs-12 oarn-widget', components: [
							{name: 'childFamilyRelationships', kind: 'oarn.ChildFamilyRelationships'}
						]},
						{classes: 'col-xs-12 oarn-widget', components: [
							{name: 'personLanguages', kind: 'oarn.PersonLanguages'}
						]},
                        {classes: 'col-xs-12 oarn-widget', components: [
                            {name: 'classroomAssignment', kind: 'oarn.ClassroomAssignment'}
                        ]}
					]}
				]}
			]}

		],

		bindings: [
			{from: '.token', to: '.$.personDetails.token'},
			{from: '.selectedPersonID', to: '.$.personDetails.selectedPersonID'},
			{from: '.selectedOrganization', to: '.$.personDetails.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.personDetails.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.personDetails.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.personDetails.currentOrgAdmin'},

			{from: '.token', to: '.$.personDemographics.token'},
			{from: '.selectedPersonID', to: '.$.personDemographics.selectedPersonID'},
			{from: '.selectedOrganization', to: '.$.personDemographics.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.personDemographics.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.personDemographics.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.personDemographics.currentOrgAdmin'},

			{from: '.token', to: '.$.personLanguages.token'},
			{from: '.selectedPersonID', to: '.$.personLanguages.selectedPersonID'},
			{from: '.selectedOrganization', to: '.$.personLanguages.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.personLanguages.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.personLanguages.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.personLanguages.currentOrgAdmin'},

			{from: '.token', to: '.$.childFamilyRelationships.token'},
			{from: '.selectedPersonID', to: '.$.childFamilyRelationships.selectedPersonID'},
			{from: '.selectedFamilyID', to: '.$.childFamilyRelationships.selectedFamilyID'},
			{from: '.selectedOrganization', to: '.$.childFamilyRelationships.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.childFamilyRelationships.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.childFamilyRelationships.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.childFamilyRelationships.currentOrgAdmin'},

            {from: '.token', to: '.$.classroomAssignment.token'},
            {from: '.selectedPersonID', to: '.$.classroomAssignment.selectedPersonID'},
            {from: '.selectedPersonItem', to: '.$.classroomAssignment.selectedPersonItem'},
            {from: '.selectedOrganization', to: '.$.classroomAssignment.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.classroomAssignment.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.classroomAssignment.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.classroomAssignment.currentOrgAdmin'},
		],

		handlers: {
			onDirtyStateChanged: 'dirtyStateChangedHandler'
		},

		/**
		 * @private
		 */
		events: {
			onChildDetailsDirtyStateChanged: ''
		},

		dirtyStateChangedHandler: function (inSender, inEvent) {
			if (inEvent.originator.name == 'personDetails') {
				this.set('.personDetailsDirty', inEvent.dirty);
			}
			else if (inEvent.originator.name == 'personDemographics') {
				this.set('.personDemographicsDirty', inEvent.dirty);
			}

			if (this.personDetailsDirty || this.personDemographicsDirty ||
				this.childFamilyRelationshipsDirty || this.personLanguagesDirty) {
				this.set('dirty', true);
			}
			else {
				this.set('.dirty', false);
			}
		},

		dirtyChanged: function (inOld) {
			this.doChildDetailsDirtyStateChanged({'dirty': this.get('.dirty')});
		},

        goAssign: function (inSender, inEvent) {
            this.doAssignToClassroom(); // ask the parent to show the widget
        }

	});

})(enyo, this);
