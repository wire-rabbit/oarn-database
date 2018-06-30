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

(function (enyo, scope){

	enyo.kind({
		name: 'oarn.EnrollmentDetails',

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
			selectedFamilyEnrollmentID: 0,
			selectedProgramID: 0,

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
						{name: 'familyPrograms', kind: 'oarn.FamilyEnrollmentRD', style: 'padding: 5px;'}
					]},
				]},
				{classes: 'row', components: [
					{classes: 'col-sm-12 col-md-12', style: 'padding: 2px 2px 2px 2px;', components:[
						{name: 'serviceLevelEnrollment', kind: 'oarn.ServiceLevelEnrollmentRD', style: 'padding: 5px;'}
					]},
				]},
				{classes: 'row', components: [
					{classes: 'col-sm-12 col-md-12', style: 'padding: 2px 2px 2px 2px;', components:[
						{name: 'personEnrollment', kind: 'oarn.PersonEnrollmentRD', style: 'padding: 5px;'}
					]},
				]}
			]}
		],

		bindings: [
			{from: '.selectedFamilyID', to: '.$.familyPrograms.selectedFamilyID'},
			{from: '.token', to: '.$.familyPrograms.token'},
			{from: '.selectedOrganization', to: '.$.familyPrograms.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.familyPrograms.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.familyPrograms.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.familyPrograms.currentOrgAdmin'},

			{from: '.selectedFamilyID', to: '.$.personEnrollment.selectedFamilyID'},
			{from: '.token', to: '.$.personEnrollment.token'},
			{from: '.selectedOrganization', to: '.$.personEnrollment.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.personEnrollment.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.personEnrollment.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.personEnrollment.currentOrgAdmin'},

			{from: '.selectedFamilyID', to: '.$.serviceLevelEnrollment.selectedFamilyID'},
			{from: '.token', to: '.$.serviceLevelEnrollment.token'},
			{from: '.selectedOrganization', to: '.$.serviceLevelEnrollment.selectedOrganization'},
			{from: '.currentOrgReadOnly', to: '.$.serviceLevelEnrollment.currentOrgReadOnly'},
			{from: '.currentOrgReadWrite', to: '.$.serviceLevelEnrollment.currentOrgReadWrite'},
			{from: '.currentOrgAdmin', to: '.$.serviceLevelEnrollment.currentOrgAdmin'},

			{from: '.$.familyPrograms.selectedFamilyEnrollmentID', to: '.selectedFamilyEnrollmentID'},
			{from: '.$.familyPrograms.selectedProgramID', to: '.selectedProgramID'},

			{from: '.selectedFamilyEnrollmentID', to: '.$.personEnrollment.selectedFamilyEnrollmentID'},
			{from: '.selectedFamilyEnrollmentID', to: '.$.serviceLevelEnrollment.selectedFamilyEnrollmentID'},

			{from: '.selectedProgramID', to: '.$.serviceLevelEnrollment.selectedProgramID'}
		]
	})

})(enyo, this);