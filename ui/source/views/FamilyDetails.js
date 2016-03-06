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
		name: 'oarn.FamilyDetails',

		kind: 'enyo.Control',

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
			{classes: 'container', style:'max-width:750px; margin-left: 5px;', components: [
				{classes: 'row', components: [
					{classes: 'col-sm-12 col-md-12', style: 'padding: 2px 2px 2px 2px;', components:[
						{name: 'caseManagers', kind: 'oarn.CaseManagers', style: 'padding: 5px 5px 5px 5px'}
					]},
				]},
				{classes: 'row', components: [
					{classes: 'col-sm-12 col-md-12', style: 'padding: 2px 2px 2px 2px;', components:[
						{name: 'familyAddresses', kind: 'oarn.Address', style: 'padding: 5px 5px 5px 5px'}
					]},
				]},
				{classes: 'row', components: [
					{classes: 'col-sm-12 col-md-12', style: 'padding: 2px 2px 2px 2px;', components:[
						{name: 'familyNotes', kind: 'oarn.FamilyNotes', style: 'padding: 5px 5px 5px 5px'}
					]},
				]}
			]}
		],

		bindings: [
			{from: '.selectedFamilyID', to: '.$.caseManagers.selectedFamilyID'},
			{from: '.selectedOrganization', to: '.$.caseManagers.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.caseManagers.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.caseManagers.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.caseManagers.currentOrgAdmin'},

			{from: '.selectedFamilyID', to: '.$.familyAddresses.selectedFamilyID'},
			{from: '.selectedOrganization', to: '.$.familyAddresses.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.familyAddresses.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.familyAddresses.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.familyAddresses.currentOrgAdmin'},

			{from: '.selectedFamilyID', to: '.$.familyNotes.selectedFamilyID'},
			{from: '.selectedOrganization', to: '.$.familyNotes.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.familyNotes.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.familyNotes.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.familyNotes.currentOrgAdmin'},
			{from: '.username', to: '.$.familyNotes.username'}
		],

		handlers: {
			onDirtyStateChanged: 'dirtyStateChangedHandler'
		},

		/**
		 * @private
		 */
		events: {
			onFamilyDetailsDirtyStateChanged: ''
		},

		dirtyStateChangedHandler: function (inSender, inEvent) {
			this.set('.dirty', inEvent.dirty);
			return true;
		},

		dirtyChanged: function (inOld) {
			this.doFamilyDetailsDirtyStateChanged({'dirty': this.get('.dirty')});
		}
	});

}) (enyo, this);
