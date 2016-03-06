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

		name: 'oarn.AdultDetails',

		personDetailsDirty: false,
		personDemographicsDirty: false,
		adultFamilyRelationshipsDirty: false,
		personLanguagesDirty: false,
		personTelephoneDirty: false,
		personEmailDirty: false,

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
			currentOrgAdmin: false
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
					{classes: 'col-sm-12 col-md-6', style: 'width: 470px;', components: [
						// Column 2
						{classes: 'col-xs-12 oarn-widget', components: [
							{name: 'adultFamilyRelationships', kind: 'oarn.AdultFamilyRelationships'}
						]},
						{classes: 'col-xs-12 oarn-widget', components: [
							{name: 'personLanguages', kind: 'oarn.PersonLanguages'}
						]},
						{classes: 'col-xs-12 oarn-widget', components: [
							{name: 'personTelephone', kind: 'oarn.PersonTelephone'}
						]},
						{classes: 'col-xs-12 oarn-widget', components: [
							{name: 'personEmail', kind: 'oarn.PersonEmail'}
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

			{from: '.token', to: '.$.personTelephone.token'},
			{from: '.selectedPersonID', to: '.$.personTelephone.selectedPersonID'},
			{from: '.selectedOrganization', to: '.$.personTelephone.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.personTelephone.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.personTelephone.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.personTelephone.currentOrgAdmin'},

			{from: '.token', to: '.$.personEmail.token'},
			{from: '.selectedPersonID', to: '.$.personEmail.selectedPersonID'},
			{from: '.selectedOrganization', to: '.$.personEmail.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.personEmail.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.personEmail.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.personEmail.currentOrgAdmin'},

			{from: '.token', to: '.$.adultFamilyRelationships.token'},
			{from: '.selectedPersonID', to: '.$.adultFamilyRelationships.selectedPersonID'},
			{from: '.selectedFamilyID', to: '.$.adultFamilyRelationships.selectedFamilyID'},
			{from: '.selectedOrganization', to: '.$.adultFamilyRelationships.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.adultFamilyRelationships.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.adultFamilyRelationships.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.adultFamilyRelationships.currentOrgAdmin'}
		],

		handlers: {
			onDirtyStateChanged: 'dirtyStateChangedHandler'
		},

		/**
		 * @private
		 */
		events: {
			onAdultDetailsDirtyStateChanged: ''
		},

		dirtyStateChangedHandler: function (inSender, inEvent) {
			if (inEvent.originator.name == 'personDetails') {
				this.set('.personDetailsDirty', inEvent.dirty);
			}
			else if (inEvent.originator.name == 'personDemographics') {
				this.set('.personDemographicsDirty', inEvent.dirty);
			}

			if (this.personDetailsDirty || this.personDemographicsDirty ||
				this.adultFamilyRelationshipsDirty || this.personLanguagesDirty ||
				this.personTelephoneDirty || this.personEmailDirty) {
				this.set('dirty', true);
			}
			else {
				this.set('.dirty', false);
			}
		},

		dirtyChanged: function (inOld) {
			this.doAdultDetailsDirtyStateChanged({'dirty': this.get('.dirty')});
		}

	});

})(enyo, this);
